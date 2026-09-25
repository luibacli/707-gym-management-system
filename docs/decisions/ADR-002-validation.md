# ADR-002: Server-side validation with Zod

## Status

Accepted (2026-09-25)

## Context

All external input must be validated at the server boundary (CLAUDE.md, Hard Rules).
h3, the HTTP layer under Nuxt, provides `readValidatedBody`, `getValidatedQuery`
and `getValidatedRouterParams`. These accept any validation function.

## Decision

Use **Zod** schemas with the h3 validated-input helpers in every API route.

- Every route validates its body, query and route params before calling a service.
- Schemas that the client also needs (e.g. for form validation) live in `shared/`,
  so both sides use the same definition.
- Mongoose schema validation stays as a last check when saving. It doesn't
  replace request validation.
- Zod errors are converted to the API error format in ADR-003
  (`VALIDATION_ERROR` with `fieldErrors`).

## Alternatives Considered

- **Valibot.** Smaller bundle, same approach, but less widely used.
- **Mongoose validation only.** It runs only when saving, so query and route
  params go unvalidated. Rejected.

## Consequences

- Positive: one schema language on client and server, with inferred TypeScript types.
- Negative: adds Zod to the client bundle where shared schemas are used on the client.

## Date

2026-09-25
