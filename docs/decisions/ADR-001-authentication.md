# ADR-001: Authentication with nuxt-auth-utils

## Status

Accepted (2026-09-25)

## Context

The MVP needs secure login for gym staff (`project-overview.md` §4.6). There is
one staff role (BR-A1). Accounts are created by a developer script, not in the
app (BR-A2). No OAuth or third-party identity provider is required.

## Decision

Use **`nuxt-auth-utils`** with email + password login.

- **Sessions:** stored in an encrypted, signed cookie (sealed with `NUXT_SESSION_PASSWORD`).
  The session contains only the staff user's ID and display name.
- **Passwords:** hashed with the module's `hashPassword` / `verifyPassword` (scrypt).
  Plain-text passwords are never stored or logged.
- **Staff users:** stored in a MongoDB `User` collection.
- **Server authorization:** every protected API route calls `requireUserSession(event)`.
  The server also checks that the user still exists and is active in the database,
  so deactivating an account takes effect immediately even though the cookie
  itself can't be revoked.
- **Client:** `useUserSession()` plus a route middleware, used only to redirect
  and show or hide UI. It never serves as authorization.
- **Account creation:** a server-side CLI script creates and deactivates accounts (BR-A2).

## Alternatives Considered

- **Custom JWT (`jose` + bcrypt).** Full control, but more security-sensitive code
  for us to write and maintain.
- **`@sidebase/nuxt-auth` (Auth.js).** Designed around OAuth providers. Too heavy
  for staff password login.

## Consequences

- Positive: little custom security code, and it fits Nuxt's server-route model.
- Positive: no session store to run; the cookie holds the session.
- Negative: the extra database lookup per protected request costs one small query.
- Negative: there is no built-in login rate limiting. This needs a separate
  decision before production.
- `NUXT_SESSION_PASSWORD` must be set (32+ characters) in every deployed environment.

## Date

2026-09-25
