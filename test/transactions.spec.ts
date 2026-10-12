import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { app } from '@/app'
import { knex } from '@/db'
import { httpCodes } from '@/utils/http-code'

let server: Awaited<ReturnType<typeof app>>

type Transaction = {
  id: string
  title: string
  amount: number
  type: 'credit' | 'debit'
  session_id: string
}

describe('Transactions', () => {
  before(async () => {
    await knex.migrate.latest()
    server = await app()
    await server.ready()
  })

  after(async () => {
    await server.close()
    await knex.destroy()
  })

  it('should be able to create a new transaction', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: '/transactions',
      payload: {
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      },
    })

    assert.equal(statusCode, httpCodes.CREATED)
  })

  it('should be able to list all transactions', async () => {
    const { cookies } = await server.inject({
      method: 'POST',
      url: '/transactions',
      payload: {
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      },
    })

    const sessionId = cookies.find(({ name }) => name === 'sessionId')?.value

    assert.ok(sessionId)

    const allTransactionsResponse = await server.inject({
      method: 'GET',
      url: '/transactions',
      cookies: { sessionId },
    })

    assert.equal(allTransactionsResponse.statusCode, httpCodes.OK)

    const { transactions } = allTransactionsResponse.json<{
      transactions: Transaction[]
    }>()

    assert.equal(transactions.length, 1)
    assert.equal(transactions[0].title, 'New transaction')
    assert.equal(transactions[0].amount, 5000)
    assert.equal(transactions[0].session_id, sessionId)
  })

  it('should be able to get a specific transaction', async () => {
    const { cookies, json } = await server.inject({
      method: 'POST',
      url: '/transactions',
      payload: {
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      },
    })

    const sessionId = cookies.find(({ name }) => name === 'sessionId')?.value

    assert.ok(sessionId)

    const { transaction: transactionSaved } = json<{
      transaction: Transaction
    }>()

    const specificTransactionResponse = await server.inject({
      method: 'GET',
      url: `/transactions/${transactionSaved.id}`,
      cookies: { sessionId },
    })

    assert.equal(specificTransactionResponse.statusCode, httpCodes.OK)

    const { transaction } = specificTransactionResponse.json<{
      transaction: Transaction
    }>()

    assert.equal(transaction.id, transactionSaved.id)
    assert.equal(transaction.title, 'New transaction')
    assert.equal(transaction.amount, 5000)
    assert.equal(transaction.session_id, sessionId)
  })

  it('should be able to get the summary', async () => {
    const { cookies } = await server.inject({
      method: 'POST',
      url: '/transactions',
      payload: {
        title: 'Credit transaction',
        amount: 5000,
        type: 'credit',
      },
    })

    const sessionId = cookies.find(({ name }) => name === 'sessionId')?.value

    assert.ok(sessionId)

    await server.inject({
      method: 'POST',
      url: '/transactions',
      payload: {
        title: 'Debit transaction',
        amount: 2000,
        type: 'debit',
      },
      cookies: { sessionId },
    })

    const summaryResponse = await server.inject({
      method: 'GET',
      url: '/transactions/summary',
      cookies: { sessionId },
    })

    assert.equal(summaryResponse.statusCode, httpCodes.OK)

    const { summary } = summaryResponse.json<{
      summary: { amount: number }
    }>()

    assert.equal(summary.amount, 3000) // 5000 - 2000 = 3000
  })
})
