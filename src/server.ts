import fastify from 'fastify'
import { knex } from './database'
import { env } from './env'

const app = fastify()

app.get('/', async (request, reply) => {
  // const transaction = await knex('transactions')
  //   .insert({
  //     id: crypto.randomUUID(),
  //     title: 'Test Transaction',
  //     amount: 100,
  //   })
  //   .returning('*')
  const transactions = await knex('transactions')
    .where('amount', '>', 101)
    .select('*')
  return { transactions }
})

app.listen({ port: env.PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log(`Server is running at ${address}`)
})
