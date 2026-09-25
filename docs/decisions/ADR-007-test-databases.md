# ADR-007: Test databases

## Status

Accepted (2026-09-26)

## Context

ADR-005 deferred how database tests would run. Member management needs tests
for service queries (search, sorting, pagination, archiving) and end-to-end
tests that create and change data. The dev database (`707_dev`) must not fill
up with test records. Members can't be deleted (BR-M2), so test records would
stay forever.

## Decision

- **Integration tests** (`test/integration/`, Vitest project `integration`) use
  **`mongodb-memory-server`**. Each test file gets an isolated in-memory MongoDB,
  and collections are cleared before each test. These tests never touch Atlas.
  The MongoDB binary is downloaded on the first run; the install-time download is
  disabled in `pnpm-workspace.yaml`.
- **End-to-end tests** run against a separate Atlas database, **`707_e2e`**
  (`E2E_MONGODB_URI`), with its own staff account (`E2E_STAFF_EMAIL` / `E2E_STAFF_PASSWORD`).
  - Playwright starts its own dev server on port 3100 with that database.
  - Tests that write data are skipped when `E2E_MONGODB_URI` isn't set.

## Alternatives Considered

- **E2E only, against `707_dev`.** Test members would accumulate in real dev data.
- **A local MongoDB in Docker.** Docker is deferred (ADR-005).

## Consequences

- Positive: service logic is tested quickly and in isolation. Dev data stays clean.
- Negative: one more dev dependency (`mongodb-memory-server`), plus a MongoDB
  binary of about 100 MB cached on first run.
- Negative: e2e data accumulates in `707_e2e`. It's disposable and can be dropped at any time.

## Date

2026-09-26
