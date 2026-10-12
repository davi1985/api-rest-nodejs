import cookie from '@fastify/cookie'
import fastify from 'fastify'
import { z } from 'zod'
import { transactionsRoutes } from '@/routes'
import { httpCodes } from '@/utils/http-code'

export const buildApp = () => {
  const app = fastify()

  app.register(cookie)

  app.addHook('preHandler', async (request) => {
    console.log(
      `${new Date().toISOString()} [${request.method}] ${request.url}`,
    )
  })

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof z.ZodError) {
      return reply.status(httpCodes.BAD_REQUEST).send({
        error: 'Validation error',
        issues: error.issues,
      })
    }

    console.error(error)

    return reply
      .status(httpCodes.INTERNAL_SERVER_ERROR)
      .send({ error: 'Internal server error' })
  })

  app.register(transactionsRoutes, { prefix: '/transactions' })

  return app
}
