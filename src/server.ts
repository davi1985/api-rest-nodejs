import fastify from 'fastify'
import crypto from 'node:crypto'
import { knex } from './database.js'

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

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log(`Server is running at ${address}`)
})
