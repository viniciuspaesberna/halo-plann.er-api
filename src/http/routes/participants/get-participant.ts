import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from 'zod';

import { prisma } from "../../../lib/prisma";
import { BadRequestError } from "../../_errors/bad-request-error";

export const getParticipant = async (app: FastifyInstance) => {
  app
  .withTypeProvider<ZodTypeProvider>()
  .get(
    '/participants/:participantId', 
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid()
        }),
      }
    }, 
    async (request) => {
      const { participantId } = request.params

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId
        },
        select: {
          id: true,
          name: true,
          email: true,
          is_confirmed: true,
        }
      })

      if(!participant) {
        throw new BadRequestError('Participant not found.')
      }


      return { participant }
    })
}