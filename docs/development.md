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

## Staff accounts

Staff accounts are managed from the command line (BR-A2). This uses the database in
`NUXT_MONGODB_URI` from `.env`:

```bash
pnpm staff create --email staff@example.com --name "Full Name"   # prompts for password
pnpm staff deactivate --email staff@example.com
```

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

The successful sign-in e2e test runs only when `E2E_STAFF_EMAIL` and
`E2E_STAFF_PASSWORD` are set, for an active staff account in the dev database.
Otherwise it is skipped.

`pnpm test:e2e` starts the dev server itself (or reuses one already running on
port 3000). It runs in Desktop Chrome and on a mobile viewport (Pixel 7).

## Testing layout

- `test/unit/`: plain Vitest in a Node environment, for pure logic
  (e.g. status and date rules).
- `test/nuxt/`: Vitest in the Nuxt environment (`@nuxt/test-utils`), for
  components and composables.
- `test/e2e/`: Playwright.

## Notes

- PrimeVue is constrained to 4.x (MIT, `^4.5.5`). Don't upgrade to 5.x, which requires a
  license key (ADR-004).
- TypeScript is pinned to `~6.0` because `typescript-eslint` doesn't support
  TypeScript 7 yet.
- Deployment: the hosting target isn't decided yet (ADR-005).
