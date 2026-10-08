import fastify from 'fastify'
import { knex } from './database.js'

const app = fastify()

app.get('/', async (request, reply) => {
  const tables = await knex('sqlite_schema').select('*')

  return { tables }
})

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log(`Server is running at ${address}`)
})
