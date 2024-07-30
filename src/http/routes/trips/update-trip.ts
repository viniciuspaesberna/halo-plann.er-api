import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { dayjs } from '../../../lib/dayjs'
import { prisma } from '../../../lib/prisma'
import { BadRequestError } from '../../_errors/bad-request-error'

export const updateTrip = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/trips/:tripId',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
        response: {
          204: z.object({
            tripId: z.string().uuid(),
          }),
        },
      },
    },
    async (request) => {
      const { tripId } = request.params

      const { destination, starts_at, ends_at } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        throw new BadRequestError('Trip not found')
      }

      // ============ Validate dates =============

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new BadRequestError('Invalid trip start date')
      }

      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new BadRequestError('Invalid trip end date')
      }

      await prisma.trip.update({
        where: {
          id: tripId,
        },
        data: {
          destination,
          starts_at,
          ends_at,
        },
      })

      return { tripId: trip.id }
    },
  )
}
