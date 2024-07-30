import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { env } from '../../../env'
import { prisma } from '../../../lib/prisma'
import { BadRequestError } from '../../_errors/bad-request-error'

export const confirmParticipant = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/participants/:participantId/confirm',
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string().min(3).optional(),
          email: z.string().email(),
        }),
      },
    },
    async (request, reply) => {
      const { participantId } = request.params
      const { name, email } = request.body

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
        },
      })

      if (!participant) {
        throw new BadRequestError('Participant not found.')
      }

      if (participant.is_confirmed) {
        return reply.redirect(
          `${env.WEB_BASE_URL}/trips/${participant.trip_id}`,
        )
      }

      await prisma.participant.update({
        where: {
          id: participant.id,
          email,
        },
        data: {
          name,
          is_confirmed: true,
        },
      })

      return { participantId: participant.id }
    },
  )
}
