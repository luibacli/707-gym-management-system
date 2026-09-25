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

### Amendment (2026-09-26)

- **Session validity** is checked in one place, `isValidStaffSession`. A session
  is valid only if the account is active **and** the session started after the
  account's last password change (`passwordChangedAt`). The check is used:
  - by `requireStaff` on every protected API call
  - by a `sessionHooks` `fetch` hook (`server/plugins/session.ts`), so a full page
    load with an invalid session renders as signed out and redirects to `/login`
- **Client-side 401 handling:** authenticated calls use `useApi` / `$api`. On a
  401 they clear the session and redirect to `/login?reason=session-ended`.
- **Password reset:** `pnpm staff set-password` sets a new password and
  `passwordChangedAt`, which signs out that account's existing sessions.
- **Login rate limiting:** failed sign-ins are stored in `loginattempts`, which
  MongoDB deletes after 15 minutes (TTL index). The limits are 5 failures per
  email and 20 per IP within 15 minutes, answered with 429 `RATE_LIMITED`. A
  successful sign-in resets that email's count.

## Alternatives Considered

- **Custom JWT (`jose` + bcrypt).** Full control, but more security-sensitive code
  for us to write and maintain.
- **`@sidebase/nuxt-auth` (Auth.js).** Designed around OAuth providers. Too heavy
  for staff password login.

## Consequences

- Positive: little custom security code, and it fits Nuxt's server-route model.
- Positive: no session store to run; the cookie holds the session.
- Negative: the extra database lookup per protected request costs one small query.
- Login rate limiting was added in the 2026-09-26 amendment.
- `NUXT_SESSION_PASSWORD` must be set (32+ characters) in every deployed environment.

## Date

2026-09-25
