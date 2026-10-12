import { FastifyInstance } from 'fastify'
import { checkSessionIdExists } from '@/middlewares/check-session-id-exists'
import { createTransaction } from './create-transaction'
import { getAllTransactions } from './get-all-transactions'
import { getTransactionById } from './get-transaction-by-id'
import { summaryTransactions } from './summary-transactions'

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    getAllTransactions,
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    getTransactionById,
  )

  app.post('/', createTransaction)

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    summaryTransactions,
  )
}
