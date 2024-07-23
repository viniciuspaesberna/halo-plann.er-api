import type { FastifyInstance } from "fastify"
import { BadRequestError } from "./http/_errors/bad-request-error"
import { ZodError } from "zod"

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  console.log(error)

  if(error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Input validation error',
      errors: error.flatten().fieldErrors
    })
  }

  if(error instanceof BadRequestError) {
    return reply.status(400).send({
      message: error.message
    })
  }

  return reply.status(500).send({ message: 'Internal server error'})
}