import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { knex } from '@/database'
import { httpCodes } from '@/utils/http-code'

export const getTransactionById = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const getTransactionParamsSchema = z.object({
    id: z.uuid(),
  })
  const { id } = getTransactionParamsSchema.parse(request.params)
  const { sessionId } = request.cookies

  const transaction = await knex('transactions')
    .where({ id, session_id: sessionId })
    .first()

  if (!transaction) {
    return reply.status(httpCodes.NOT_FOUND).send({
      error: 'Transaction not found',
    })
  }

  return { transaction }
}
