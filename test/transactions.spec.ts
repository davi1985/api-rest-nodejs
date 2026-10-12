import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { buildApp } from '@/app'
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
    app = await buildApp()
    await app.ready()
  })

  after(async () => {
    await app.close()
  })

  it('should be able to create a new transaction', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/transactions',
      payload: {
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      },
    })

    assert.equal(response.statusCode, httpCodes.CREATED)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await app.inject({
      method: 'POST',
      url: '/transactions',
      payload: {
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      },
    })

    const sessionId = createTransactionResponse.cookies.find(
      (cookie) => cookie.name === 'sessionId',
    )?.value

    assert.ok(sessionId)

    const allTransactionsResponse = await app.inject({
      method: 'GET',
      url: '/transactions',
      cookies: { sessionId },
    })

    assert.equal(allTransactionsResponse.statusCode, httpCodes.OK)

    const body = allTransactionsResponse.json<{
      transactions: Transaction[]
    }>()

    assert.equal(body.transactions.length, 1)
    assert.equal(body.transactions[0].title, 'New transaction')
    assert.equal(body.transactions[0].amount, 5000)
    assert.equal(body.transactions[0].session_id, sessionId)
  })
})
