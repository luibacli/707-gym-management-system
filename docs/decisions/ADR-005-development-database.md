# ADR-005: MongoDB Atlas for development; Docker deferred

## Status

Accepted (2026-09-25)

## Context

The stack lists Docker, but Docker isn't installed on the development machine.
The production hosting target hasn't been decided.

## Decision

- Development uses a **MongoDB Atlas** cluster (free tier), connected through
  `NUXT_MONGODB_URI`.
- **Docker is deferred.** No Docker files are added until the hosting target is
  chosen. Then, if the host needs a container, a production `Dockerfile` for the
  app will be added.

## Alternatives Considered

- **Local MongoDB in Docker Compose.** This works offline and gives everyone the
  same database, but it requires installing Docker first.

## Consequences

- Positive: no local database to install or run.
- Negative: development needs an internet connection and an Atlas account.
- Automated tests that need a database: see ADR-007.

## Date

2026-09-25
