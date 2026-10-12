import { bootstrap } from './bootstrap'
import { env } from './env'

bootstrap()
  .listen({ port: env.PORT })
  .then(() => {
    console.log(`Server is running on port ${env.PORT}`)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
