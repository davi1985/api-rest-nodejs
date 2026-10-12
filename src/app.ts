import cookie from '@fastify/cookie'
import fastify from 'fastify'
import { z } from 'zod'
import { transactionsRoutes } from '@/routes'
import { httpCodes } from '@/utils/http-code'

export const app = () => {
  const logger = {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        singleLine: true,
        ignore: 'pid,hostname',
      },
    },
  }

  const app = fastify({
    logger,
  })

  app.register(cookie)

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof z.ZodError) {
      return reply.status(httpCodes.BAD_REQUEST).send({
        error: 'Validation error',
        issues: error.issues,
      })
    }

    request.log.error({ err: error }, 'Unhandled request error')

    return reply
      .status(httpCodes.INTERNAL_SERVER_ERROR)
      .send({ error: 'Internal server error' })
  })

  app.register(transactionsRoutes, { prefix: '/transactions' })

  return app
}
