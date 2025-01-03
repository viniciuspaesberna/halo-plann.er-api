import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import nodemailer from 'nodemailer'
import { z } from 'zod'

import { env } from '../../../env'
import { dayjs } from '../../../lib/dayjs'
import { getMailClient } from '../../../lib/mail'
import { prisma } from '../../../lib/prisma'
import { BadRequestError } from '../../_errors/bad-request-error'

export const confirmTrip = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/confirm',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          participants: true,
        },
      })

      if (!trip) {
        throw new BadRequestError('Trip not found.')
      }

      if (trip.is_confirmed) {
        return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
      }

      const owner = trip.participants.find(
        (participant) => participant.is_owner === true,
      )

      if (!owner) {
        throw new BadRequestError('Owner not found')
      }

      await prisma.$transaction([
        prisma.trip.update({
          where: {
            id: tripId,
          },
          data: {
            is_confirmed: true,
          },
        }),
        prisma.participant.update({
          where: {
            id: owner.id,
            trip_id: tripId,
            is_owner: true,
          },
          data: {
            is_confirmed: true,
          },
        }),
      ])

      const formatedStartDate = dayjs(trip.starts_at).format('LL')
      const formatedEndDate = dayjs(trip.ends_at).format('LL')

      const mail = await getMailClient()

      await Promise.all(
        trip.participants.map(async (participant) => {
          if (participant.is_owner === true) return

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

      return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
    },
  )
}
