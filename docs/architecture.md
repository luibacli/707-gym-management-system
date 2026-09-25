# Architecture

Nuxt 4 full-stack application: the Vue frontend and the API run in one Nuxt app.
There is no separate backend.

## Data flow

```text
Component → Composable / Pinia → Nuxt API route (server/api) → Service (server/services)
          → Mongoose model (server/models) → MongoDB
```

Layers are skipped when they add nothing. The boundaries and rules are in `CLAUDE.md`.

## Directory layout

| Path                     | Purpose                                              |
| ------------------------ | ---------------------------------------------------- |
| `app/`                   | Frontend: `app.vue`, pages, components, composables, stores |
| `app/assets/css/main.css`| Tailwind entry and CSS layer order                   |
| `app/theme/`             | PrimeVue theme preset (ADR-004)                      |
| `server/api/`            | API routes (HTTP concerns, validation)               |
| `server/services/`       | Business logic and queries (`members.ts`, `memberships.ts`). Services return `null` or a result union, and routes map those to HTTP errors |
| `server/models/`         | Mongoose models (`User`, `Member`, `Membership`)     |
| `server/plugins/`        | Nitro plugins; `mongoose.ts` opens the DB connection |
| `shared/`                | Code shared by client and server: Zod schemas (ADR-002), API types, date helpers (ADR-006), and membership rules (`shared/utils/membership.ts`: expiry, status, overlap, renewal start) |
| `test/unit/`             | Vitest, Node environment                             |
| `test/nuxt/`             | Vitest, Nuxt runtime environment                     |
| `test/integration/`      | Vitest with in-memory MongoDB, for services (ADR-007) |
| `test/e2e/`              | Playwright                                           |

Folders marked "planned" are created when the first feature needs them.

## Key modules

| Concern       | Choice                                        | Record  |
| ------------- | --------------------------------------------- | ------- |
| Auth          | `nuxt-auth-utils` (sealed cookie sessions)    | ADR-001 |
| Validation    | Zod + h3 validated-input helpers              | ADR-002 |
| API format    | Nuxt `createError` conventions, no wrapper    | ADR-003 |
| UI            | PrimeVue 4.5 styled (Aura) + Tailwind v4      | ADR-004 |
| Dev database  | MongoDB Atlas; Docker deferred                | ADR-005 |
| Dates         | Calendar dates as `YYYY-MM-DD` strings        | ADR-006 |
| Test DBs      | In-memory for integration; `707_e2e` for e2e  | ADR-007 |
| State         | Pinia via `@pinia/nuxt`                       | —       |

## Database connection

`server/plugins/mongoose.ts` connects once when the server starts, using
`runtimeConfig.mongodbUri` (`NUXT_MONGODB_URI`):

- If the variable is missing, the server throws at startup.
- If the connection fails, the error is logged. Database operations then fail
  and return 500 errors.
