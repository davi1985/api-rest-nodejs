import { app } from '@/app'
import { env } from '@/env'

const server = app()

server
  .listen({ port: env.PORT })
  .then((address) => {
    server.log.info({ address }, 'Server listening')
  })
  .catch((err) => {
    server.log.error({ err }, 'Failed to start server')
    process.exit(1)
  })
