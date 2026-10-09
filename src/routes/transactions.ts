import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import z from 'zod'
import { HTTP_CODES } from '../utils/http-code'

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get('/', async (_, reply) => {
    const transactions = await knex('transactions').select()

    return { transactions }
  })

  app.get('/:id', async (request, reply) => {
    const getTransactionParamsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await knex('transactions').where({ id }).first()

    if (!transaction) {
      return reply.status(HTTP_CODES.NOT_FOUND).send({
        error: 'Transaction not found',
      })
    }

    return { transaction }
  })

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    const transaction = await knex('transactions')
      .insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
      })
      .returning('*')

    return reply.status(HTTP_CODES.CREATED).send({ transaction })
  })
}
