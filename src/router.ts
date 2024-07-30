import type { FastifyInstance } from 'fastify'

import { createActivity } from './http/routes/activities/create-activity'
import { getActivities } from './http/routes/activities/get-activities'
import { createLink } from './http/routes/links/create-link'
import { getLinks } from './http/routes/links/get-links'
import { confirmParticipant } from './http/routes/participants/confirm-participant'
import { getParticipant } from './http/routes/participants/get-participant'
import { getParticipants } from './http/routes/participants/get-participants'
import { confirmTrip } from './http/routes/trips/confirm-trip'
import { createInvite } from './http/routes/trips/create-invite'
import { createTrip } from './http/routes/trips/create-trip'
import { getTripDetails } from './http/routes/trips/get-trip-details'
import { getTrips } from './http/routes/trips/get-trips'
import { updateTrip } from './http/routes/trips/update-trip'

export const router = async (app: FastifyInstance) => {
  app.register(getTrips)
  app.register(getTripDetails)
  app.register(createTrip)
  app.register(updateTrip)
  app.register(confirmTrip)
  app.register(createInvite)

  app.register(getParticipant)
  app.register(getParticipants)
  app.register(confirmParticipant)

  app.register(createActivity)
  app.register(getActivities)

  app.register(createLink)
  app.register(getLinks)
}
