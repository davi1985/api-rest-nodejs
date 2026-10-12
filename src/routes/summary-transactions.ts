import { FastifyRequest } from 'fastify'
import { knex } from '@/db'

export const summaryTransactions = async (request: FastifyRequest) => {
  const { sessionId } = request.cookies

  const summary = await knex('transactions')
    .where({ session_id: sessionId })
    .sum('amount', { as: 'amount' })
    .first()

  return { summary }
}
