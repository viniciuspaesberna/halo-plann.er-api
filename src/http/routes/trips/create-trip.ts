import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import nodemailer from 'nodemailer';

import { z } from 'zod';

import { dayjs } from "../../../lib/dayjs";
import { getMailClient } from "../../../lib/mail";
import { prisma } from "../../../lib/prisma";
import { BadRequestError } from "../../_errors/bad-request-error";
import { env } from "../../../env";

export const createTrip = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/trips',
      {
        schema: {
          body: z.object({
            destination: z.string().min(4),
            starts_at: z.coerce.date(),
            ends_at: z.coerce.date(),
            owner_name: z.string(),
            owner_email: z.string().email(),
            emails_to_invite: z.array(z.string().email())
          }),
          response: {
            204: z.object({
              tripId: z.string().uuid()
            })
          }
        }
      },
      async (request) => {

        const {
          destination,
          starts_at,
          ends_at,
          owner_name,
          owner_email,
          emails_to_invite
        } = request.body

        // ============ Validate dates =============

        if (dayjs(starts_at).isBefore(new Date())) {
          throw new BadRequestError('Invalid trip start date')
        }

        if (dayjs(ends_at).isBefore(starts_at)) {
          throw new BadRequestError('Invalid trip end date')
        }

        let validatedEmailsToInvite = emails_to_invite

        if(emails_to_invite.includes(owner_email)) {

          if (emails_to_invite.includes(owner_email)) {
            validatedEmailsToInvite = emails_to_invite.filter(
              (email) => email !== owner_email,
            )
          }
        }

        const trip = await prisma.trip.create({
          data: {
            destination,
            starts_at,
            ends_at,
            participants: {
              createMany: {
                data: [
                  {
                    email: owner_email,
                    name: owner_name,
                    is_owner: true,
                  },
                  ...validatedEmailsToInvite.map(email => {
                    return { email }
                  })
                ]
              }
            }
          }
        })

        const formatedStartDate = dayjs(starts_at).format('LL')
        const formatedEndDate = dayjs(ends_at).format('LL')

        const confimationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`

        const mail = await getMailClient()

        const message = await mail.sendMail({
          from: {
            name: 'Equipe Plann.er',
            address: 'oi@plann.er'
          },
          to: {
            name: owner_name,
            address: owner_email
          },
          subject: `Confirme sua viagem para ${destination} em ${formatedStartDate}`,
          html: `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
            <p>Você solicitou a crianção de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formatedStartDate}</strong> até <strong>${formatedEndDate}</strong>.</p>
            <p></p>
            <p>Para confimar sua viagem, clique no link abaixo:</p>
            <p></p>
            <p>
              <a href="${confimationLink}">
                Confimar viagem
              </a>
            </p>
            <p></p>
            <p>Caso você não saiba do que se trata esse email, apenas ignore esse e-mail.</p>
          </div>
        `.trim()
        })

        console.log('confirm trip:' + nodemailer.getTestMessageUrl(message))

        return { tripId: trip.id }
      })
}