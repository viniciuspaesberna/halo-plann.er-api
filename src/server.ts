import cors from '@fastify/cors'
import dotenv from 'dotenv'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { env } from './env'
import { errorHandler } from './error-handler'
import { router } from './router'

dotenv.config()

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(router)

app.listen({ port: env.PORT || 3333, host: '0.0.0.0' }).then(() => {
  console.log(`Server running ${env.API_BASE_URL}`)
})
