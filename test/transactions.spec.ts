import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { buildApp } from '@/app'
import { knex } from '@/db'
import { httpCodes } from '@/utils/http-code'

let app: Awaited<ReturnType<typeof buildApp>>

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
    app = await buildApp()
    await app.ready()
  })

  after(async () => {
    await app.close()
    await knex.destroy()
  })

  it('should be able to create a new transaction', async () => {
    const { statusCode } = await app.inject({
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
    const { cookies } = await app.inject({
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

    const allTransactionsResponse = await app.inject({
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
})
