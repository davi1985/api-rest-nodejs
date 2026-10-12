import cookie from '@fastify/cookie'
import fastify from 'fastify'
import { transactionsRoutes } from './routes'

export const bootstrap = () => {
  const app = fastify()

  app.register(cookie)
  app.addHook('preHandler', async (request, _) => {
    console.log(
      `${new Date().toISOString()} [${request.method}] ${request.url}`,
    )
  })
  app.register(transactionsRoutes, { prefix: '/transactions' })

  return app
}
