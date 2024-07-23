import fastify from 'fastify'
import cors from '@fastify/cors'

import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'

import { router } from './router'
import { errorHandler } from './error-handler'

import dotenv from 'dotenv'
import { env } from './env'

dotenv.config()

const app = fastify()

app.register(cors, {
  origin: '*'
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(router)

app.listen({ port: env.PORT }).then(() => {
  console.log(`Server running ${env.API_BASE_URL}`)
})