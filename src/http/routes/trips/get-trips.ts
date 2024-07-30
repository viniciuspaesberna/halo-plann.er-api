import type { FastifyInstance } from 'fastify'

import { prisma } from '../../../lib/prisma'

export const getTrips = async (app: FastifyInstance) => {
  app.get('/trips', async () => {
    const trips = await prisma.trip.findMany({
      include: {
        participants: true,
        activities: true,
        links: true,
      },
    })

    return trips
  })
}
