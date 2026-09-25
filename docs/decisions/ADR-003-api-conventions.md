# ADR-003: API response and error conventions

## Status

Accepted (2026-09-25)

## Context

Consistent API responses make client code predictable and stop internal errors
from leaking. Nuxt and h3 already provide `createError`, and `$fetch` / `useFetch`
expose its fields to the client.

## Decision

Follow Nuxt's own conventions, with no response wrapper.

**Success responses**

- A single resource is returned directly as JSON.
- Lists return `{ items, total, page, pageSize }`.
- `POST` returns `201` with the created resource. `DELETE`/archive actions
  return `204` or the updated resource.

**Error responses**

Errors are thrown with `createError({ statusCode, message, data: { code, fieldErrors? } })`.

| Status | `data.code`        | When                                                   |
| ------ | ------------------ | ------------------------------------------------------ |
| 400    | `VALIDATION_ERROR` | Invalid input; `fieldErrors` maps each field to its messages |
| 401    | `UNAUTHENTICATED`  | No valid session                                       |
| 403    | `FORBIDDEN`        | Authenticated but not allowed                          |
| 404    | `NOT_FOUND`        | The resource doesn't exist, or is outside what the user may see |
| 409    | `CONFLICT`         | A business-rule conflict, e.g. overlapping memberships (BR-H2) |
| 429    | `RATE_LIMITED`     | Too many attempts (sign-in); includes a `Retry-After` header. *Added 2026-09-26* |
| 500    | `INTERNAL_ERROR`   | Unexpected error: generic message to the client, details in server logs |

- `message` is always safe to show to users.
- Database errors, stack traces and internal details are never sent to the client.

### Amendment (2026-09-26)

- Every API route is defined with `defineApiHandler` (`server/utils/errors.ts`),
  never with plain `defineEventHandler`.
  - Errors built with `apiError` pass through unchanged.
  - Anything else is logged and returned as a generic 500 `INTERNAL_ERROR`.
- `apiError` sets a standard `statusMessage` (e.g. "Unauthorized"). Before this,
  h3 reported "Server Error" for every status.
- Unknown `/api/*` routes return 404 `NOT_FOUND` as JSON, via `server/api/[...].ts`.

## Alternatives Considered

- **Wrap every response as `{ success, data, error }`.** Every client sees the
  same shape, but it adds boilerplate everywhere and works against
  `useFetch` / `$fetch` error handling.

## Consequences

- Positive: works with Nuxt's built-in fetch error handling.
- Positive: stable `code` values let the UI react to error types without parsing messages.
- Negative: the list response shape is our own convention and must be applied
  consistently by hand.

## Date

2026-09-25
