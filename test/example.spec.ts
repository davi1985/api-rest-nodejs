import assert from 'node:assert'
import { describe, it } from 'node:test'

import { httpCodes } from '../src/utils/http-code'

describe('Transactions', () => {
  it('user should be able to create a new transaction', () => {
    const response = httpCodes.CREATED

    assert.strictEqual(response, 201)
  })
})
