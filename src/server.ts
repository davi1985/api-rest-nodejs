import cookie from '@fastify/cookie'
import fastify from 'fastify'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'

const app = fastify()

app.register(cookie)
app.addHook('preHandler', async (request, _) => {
  console.log(`${new Date().toISOString()} [${request.method}] ${request.url}`)
})

app.register(transactionsRoutes, { prefix: '/transactions' })

app.listen({ port: env.PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log(`Server is running at ${address}`)
})
