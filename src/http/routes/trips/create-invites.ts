import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import nodemailer from 'nodemailer'
import { z } from 'zod'

import { env } from '../../../env'
import { dayjs } from '../../../lib/dayjs'
import { getMailClient } from '../../../lib/mail'
import { prisma } from '../../../lib/prisma'
import { BadRequestError } from '../../_errors/bad-request-error'

export async function createInvites(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/invites',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          emails_to_invite: z.array(z.string().email()).min(1),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params
      const { emails_to_invite } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { participants: true },
      })

      if (!trip) {
        throw new BadRequestError('Trip not found')
      }

      let validatedEmailsToInvite = emails_to_invite

      for (const email of emails_to_invite) {
        if (
          trip.participants.find((participant) => participant.email === email)
        ) {
          validatedEmailsToInvite = emails_to_invite.filter(
            (currentEmail) => currentEmail !== email,
          )
        }
      }

      await prisma.participant.createMany({
        data: [
          ...validatedEmailsToInvite.map((email) => {
            return { email, trip_id: trip.id }
          }),
        ],
      })

      if (!trip.is_confirmed) {
        return { tripId: trip.id }
      }

      const newParticipants = trip.participants.map((participant) => {
        if (participant.is_owner) return null
        if (emails_to_invite.includes(participant.email)) return null

        return participant
      })

      console.log(newParticipants)

      const formatedStartDate = dayjs(trip.starts_at).format('LL')
      const formatedEndDate = dayjs(trip.ends_at).format('LL')

      const mail = await getMailClient()

      await Promise.all(
        newParticipants.map(async (participant) => {
          if (!participant) return

          const confimationLink = `${env.WEB_BASE_URL}/trips/${trip.id}/participants/${participant.id}/confirm?email=${participant.email}`

          const message = await mail.sendMail({
            from: {
              name: 'Equipe Plann.er',
              address: 'oi@plann.er',
            },
            to: participant.email,
            subject: `Confirme sua presença na viagem para ${trip.destination} em ${formatedStartDate}`,
            html: `
              <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formatedStartDate}</strong> até <strong>${formatedEndDate}</strong>.</p>
                <p></p>
                <p>Para confimar sua presença, clique no link abaixo:</p>
                <p></p>
                <p>
                  <a href="${confimationLink}">
                    Confimar presença
                  </a>
                </p>
                <p></p>
                <p>Caso você não saiba do que se trata esse email, apenas ignore esse e-mail.</p>
              </div>
            `.trim(),
          })

          console.log(
            'confirm participation:' + nodemailer.getTestMessageUrl(message),
          )

          return message
        }),
      )

      return { tripId: trip.id }
    },
  )
}
