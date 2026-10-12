import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export const summaryTransactions = async (
  request: FastifyRequest,
  _: FastifyReply,
) => {
  const { sessionId } = request.cookies

  const summary = await knex('transactions')
    .where({ session_id: sessionId })
    .sum('amount', { as: 'amount' })
    .first()

  return { summary }
}
