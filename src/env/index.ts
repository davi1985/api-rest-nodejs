import { config } from 'dotenv'

import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string().nonempty(),
  PORT: z.coerce.number().default(3333),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.log('Invalid environment variables', z.treeifyError(result.error))

  throw new Error('Invalid environment variables.')
}

export const env = result.data
