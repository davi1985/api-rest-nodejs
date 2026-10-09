import { FastifyInstance } from 'fastify'
import { knex } from '../database'

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get('/transactions', async (request, _) => {
    const transactions = await knex('transactions').select('*')

    return { transactions }
  })
}
