import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import z from 'zod'
import { httpCodes } from '../utils/http-code'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .where({ session_id: sessionId })
        .select()

      return { transactions }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getTransactionParamsSchema = z.object({
        id: z.uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)
      const { sessionId } = request.cookies

      const transaction = await knex('transactions')
        .where({ session_id: sessionId, id })
        .first()

      if (!transaction) {
        return reply.status(httpCodes.NOT_FOUND).send({
          error: 'Transaction not found',
        })
      }

      return { transaction }
    },
  )

  app.post(
    '/',

    async (request, reply) => {
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
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const summary = await knex('transactions')
        .where({ session_id: sessionId })
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )
}
