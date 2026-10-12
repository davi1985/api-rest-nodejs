import { FastifyReply, FastifyRequest } from 'fastify'
import { randomUUID } from 'node:crypto'
import z from 'zod'
import { knex } from '../database'
import { httpCodes } from '../utils/http-code'

export const createTransaction = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const createTransactionBodySchema = z.object({
    title: z.string(),
    amount: z.number(),
    type: z.enum(['credit', 'debit']),
  })

  const { title, amount, type } = createTransactionBodySchema.parse(
    request.body,
  )

  let sessionId = request.cookies.sessionId

  if (!sessionId) {
    sessionId = randomUUID()
    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  }

  const transaction = await knex('transactions')
    .insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })
    .returning('*')

  return reply.status(httpCodes.CREATED).send({ transaction })
}
