# api-rest-nodejs

[![Architecture diagram](https://gitdiagram.com/diagram-badge.svg)](https://gitdiagram.com/davi1985/api-rest-nodejs?utm_source=readme&utm_medium=badge)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/davi1985/api-rest-nodejs)

A REST API for managing financial transactions, built with Fastify, Knex and SQLite.
Each client gets an isolated set of transactions through a session cookie: the API
issues or reuses a `sessionId` cookie and uses it to scope every read and write.

## Documentation

- **Full documentation (DeepWiki):** https://deepwiki.com/davi1985/api-rest-nodejs
- **Architecture diagram (GitDiagram):** https://gitdiagram.com/davi1985/api-rest-nodejs

[![Architecture diagram of davi1985/api-rest-nodejs](https://gitdiagram.com/davi1985/api-rest-nodejs/diagram.png)](https://gitdiagram.com/davi1985/api-rest-nodejs?utm_source=readme&utm_medium=picture)

## Tech stack

| Concern            | Choice                                              |
| ------------------ | --------------------------------------------------- |
| Runtime            | Node.js (ESM)                                       |
| Language           | TypeScript (`strict`)                               |
| HTTP framework     | Fastify 5 + `@fastify/cookie`                       |
| Validation         | Zod (environment variables and request payloads)    |
| Database           | SQLite via Knex (query builder + migrations)        |
| Dev runner         | tsx (runs TypeScript directly, no build step)       |
| Lint / formatting  | ESLint (type-aware) + Prettier                      |

## Requirements

- Node.js 20.11+ (the codebase uses `import.meta.dirname`)
- Yarn (the project ships a `yarn.lock`)

## Getting started

```bash
# 1. Install dependencies
yarn install

# 2. Create your environment file
cp .env.example .env

# 3. Run the database migrations
yarn knex migrate:latest

# 4. Start the dev server (watch mode)
yarn dev
```

The server listens on `http://localhost:3333` by default.

## Environment variables

Validated at startup with Zod (`src/env/index.ts`) — the process exits early if any
required variable is missing or invalid.

| Variable       | Required | Default       | Description                                            |
| -------------- | -------- | ------------- | ------------------------------------------------------ |
| `DATABASE_URL` | yes      | —             | Path to the SQLite file (e.g. `./db/app.db`)           |
| `NODE_ENV`     | no       | `production`  | `development`, `test` or `production`                  |
| `PORT`         | no       | `3333`        | HTTP port                                              |

See `.env.example` for a ready-to-use template.

## Scripts

| Script             | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `yarn dev`         | Start the server in watch mode (tsx)                 |
| `yarn start`       | Start the server without watch                       |
| `yarn knex`        | Knex CLI wrapper (migrations, etc.)                  |
| `yarn typecheck`   | Type-check the project with `tsc --noEmit`           |
| `yarn lint`        | Run ESLint                                           |
| `yarn lint:fix`    | Run ESLint and apply automatic fixes                 |

## API

Base path: `/transactions`. All read routes require a valid `sessionId` cookie and
return `401 Unauthorized` when it is missing.

| Method | Route             | Description                             |
| ------ | ----------------- | --------------------------------------- |
| `POST` | `/transactions`   | Create a transaction                    |
| `GET`  | `/transactions`   | List the session's transactions         |
| `GET`  | `/transactions/:id` | Get a single transaction by UUID      |
| `GET`  | `/transactions/summary` | Sum of the session's amounts      |

### Create a transaction

`POST /transactions` — the first call issues the `sessionId` cookie.

```bash
curl -i -X POST http://localhost:3333/transactions \
  -H 'Content-Type: application/json' \
  -d '{"title":"Freelance","amount":5000,"type":"credit"}'
```

Request body:

| Field   | Type                   | Notes                                  |
| ------- | ---------------------- | -------------------------------------- |
| `title` | `string`               |                                        |
| `amount`| `number`               | Always sent positive                   |
| `type`  | `"credit" \| "debit"`  | Debits are stored as negative amounts  |

Responses: `201 Created` with `{ transaction }`, or `400 Bad Request` on invalid input.

### Read the session's data

```bash
# List
curl --cookie 'sessionId=<uuid>' http://localhost:3333/transactions

# Single transaction
curl --cookie 'sessionId=<uuid>' http://localhost:3333/transactions/<uuid>

# Summary
curl --cookie 'sessionId=<uuid>' http://localhost:3333/transactions/summary
```

`GET /transactions/:id` returns `400` for a non-UUID `id` and `404` when the
transaction does not exist. The summary returns `{ "summary": { "amount": <number> } }`.

## Session cookies

The `sessionId` cookie is set on the first `POST /transactions` when no cookie is
present and is reused afterwards. It is configured as:

- `HttpOnly` — not readable from JavaScript
- `SameSite=Lax`
- `Secure` — enabled only when `NODE_ENV=production`
- `Max-Age` — 7 days

## Database and migrations

SQLite is used as an embedded database. Migrations live in `db/migrations` and the
Knex configuration is shared between runtime and the CLI through `knexfile.ts`.

```bash
yarn knex migrate:latest          # apply pending migrations
yarn knex migrate:rollback        # roll back the last batch
yarn knex migrate:make <name>     # create a new migration
yarn knex migrate:list            # list applied / pending migrations
```

## Project structure

```
src/
├── @types/
│   └── knex.d.ts                 # Knex table type augmentation
├── app.ts                        # buildApp(): creates and configures Fastify
├── server.ts                     # entry point: builds the app and listens
├── db/
│   └── index.ts                  # Knex/SQLite config and instance
├── env/
│   └── index.ts                  # environment validation (Zod)
├── middlewares/
│   └── check-session-id-exists.ts
├── routes/
│   ├── index.ts                  # route registration
│   ├── create-transaction.ts
│   ├── get-all-transactions.ts
│   ├── get-transaction-by-id.ts
│   └── summary-transactions.ts
└── utils/
    └── http-code.ts
db/
└── migrations/                   # Knex migrations
knexfile.ts                       # shares the Knex config with the CLI
```

Import paths under `src` can use the `@/*` alias (configured in `tsconfig.json`).

## Error handling

A centralized error handler in `app.ts` translates `ZodError` thrown by request
validation into a structured `400` response and masks any other error as a generic
`500`, so internal details are never leaked to clients.
