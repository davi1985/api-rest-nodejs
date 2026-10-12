import 'dotenv/config'

import path from 'node:path'
import setupKnex, { Knex } from 'knex'
import { env } from '@/env'

export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: path.resolve(import.meta.dirname, '..', '..', 'db', 'migrations'),
  },
}

export const knex = setupKnex(config)
