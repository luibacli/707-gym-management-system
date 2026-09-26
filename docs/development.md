# Development

## Requirements

- Node.js 24 (see `.nvmrc`; `engines` requires `>=24`)
- pnpm 11 (pinned in `package.json` → `packageManager`)
- A MongoDB Atlas cluster (ADR-005). Docker isn't used yet.

## Setup

```bash
pnpm install
cp .env.example .env    # then fill in the values below
pnpm exec playwright install chromium   # once, for e2e tests
```

pnpm 11 blocks dependency install scripts by default. The dependencies allowed
to run them are listed under `allowBuilds` in `pnpm-workspace.yaml`.

## Environment variables

| Variable                | Required | Purpose                                          |
| ----------------------- | -------- | ------------------------------------------------ |
| `NUXT_MONGODB_URI`      | Yes      | MongoDB connection string. The server won't start without it. |
| `NUXT_SESSION_PASSWORD` | Yes (prod) | Session cookie encryption key, 32+ characters. Generated automatically in dev if empty. |
| `E2E_MONGODB_URI`       | No       | Separate database for e2e tests (ADR-007), e.g. `…/707_e2e` |
| `E2E_STAFF_EMAIL`, `E2E_STAFF_PASSWORD` | No | Staff account in the e2e database, created with `pnpm staff` using `NUXT_MONGODB_URI=<e2e uri>` |

## Staff accounts

Staff accounts are managed from the command line (BR-A2). This uses the database in
`NUXT_MONGODB_URI` from `.env`:

```bash
pnpm staff create --email staff@example.com --name "Full Name"   # prompts for password
pnpm staff set-password --email staff@example.com                 # also signs out existing sessions
pnpm staff deactivate --email staff@example.com
```

## Demo

The client demo runs the **production build** against a separate database. The
walkthrough is in `docs/demo/demo-script.md`.

| Variable              | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `DEMO_MONGODB_URI`    | Demo database. **The name must end in `_demo`**, or the reset refuses to run |
| `DEMO_STAFF_EMAIL`    | Demo sign-in email, created by the reset                         |
| `DEMO_STAFF_PASSWORD` | Demo sign-in password (8+ characters)                            |

```bash
pnpm demo:reset   # wipe the demo DB and reseed 60 members, dates relative to today
pnpm demo:start   # build, then serve on http://localhost:3000 using the demo DB
```

The seed is fixed, so the same names come back on every reset. Emails use
`example.com`. The seed was verified to produce no overlapping memberships.

## Commands

| Task            | Command            |
| --------------- | ------------------ |
| Dev server      | `pnpm dev`         |
| Build           | `pnpm build`       |
| Preview build   | `pnpm preview`     |
| Lint            | `pnpm lint`        |
| Lint + autofix  | `pnpm lint:fix`    |
| Typecheck       | `pnpm typecheck`   |
| Unit/Nuxt tests | `pnpm test`        |
| Tests (watch)   | `pnpm test:watch`  |
| E2E tests       | `pnpm test:e2e`    |

Before each run, a global setup (`test/e2e/global-setup.ts`) clears the
login rate-limit records in the e2e database.

`pnpm test:e2e` starts its own dev server on port 3100. It never reuses a
`pnpm dev` server, so it can't write to the dev database. It loads `.env`, uses
`E2E_MONGODB_URI` when set, and runs in Desktop Chrome and on a mobile viewport
(Pixel 7). Tests that sign in need `E2E_STAFF_*`, and tests that write data also
need `E2E_MONGODB_URI`. Otherwise those tests are skipped.

To create the e2e staff account:

```bash
NUXT_MONGODB_URI="<E2E_MONGODB_URI value>" pnpm staff create --email e2e@707gym.test --name "E2E Test Staff"
```

## Testing layout

- `test/unit/`: plain Vitest in a Node environment, for pure logic
  (e.g. status and date rules).
- `test/nuxt/`: Vitest in the Nuxt environment (`@nuxt/test-utils`), for
  components and composables.
- `test/integration/`: Vitest with an in-memory MongoDB (`mongodb-memory-server`),
  for services and queries. The first run downloads a MongoDB binary (ADR-007).
- `test/e2e/`: Playwright.

## Notes

- PrimeVue is constrained to 4.x (MIT, `^4.5.5`). Don't upgrade to 5.x, which requires a
  license key (ADR-004).
- TypeScript is pinned to `~6.0` because `typescript-eslint` doesn't support
  TypeScript 7 yet.
- Deployment: the hosting target isn't decided yet (ADR-005).
