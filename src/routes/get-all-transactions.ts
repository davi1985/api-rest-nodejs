import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { knex } from '../database'

export const getAllTransactionsRoute = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { sessionId } = request.cookies

  const transactions = await knex('transactions')
    .where({ session_id: sessionId })
    .select()

  return { transactions }
}
