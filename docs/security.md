# Security

> Status: staff sign-in implemented (ADR-001). All member routes require a staff session.

## Authentication

- Staff sign in with a password. Sessions are stored in a sealed cookie using
  `nuxt-auth-utils`, keyed by `NUXT_SESSION_PASSWORD`.
- Passwords are hashed with scrypt (`hashPassword`). They are never stored or
  logged in plain text.
- Staff accounts are created and deactivated with `pnpm staff` (BR-A2). The
  password is prompted for with hidden input, so it never appears in shell history.
  There is no self-registration.
- Minimum password length is 8 characters. This is a security default, not a
  client requirement.
- Login returns the same 401 message for an unknown email, a wrong password, or a
  deactivated account. When no user matches, the server still verifies against a
  dummy hash, so response time doesn't reveal whether an email exists.

## Authorization

- A single staff role with full access (BR-A1).
- Every protected API route calls `requireStaff(event)`. It checks the session, then
  `isValidStaffSession`: the account is active, and the session started after the
  last password change.
- The global client middleware (`app/middleware/auth.global.ts`) only handles
  redirects. It is not a security boundary.
- **Invalid sessions are signed out everywhere** (deactivated account, password
  reset, expired cookie):
  - On a full page load, the session `fetch` hook rejects the session before the
    page renders, and the page shows as signed out.
  - On client-side calls, `useApi` / `$api` handle the 401 by clearing the session
    and redirecting to `/login?reason=session-ended`.

## Sensitive data

- Member records contain personal data (BR-M1). API responses include only the
  fields the UI needs.
- Secrets are only in environment variables. `.env` is gitignored, and
  `.env.example` lists the variable names.
- Server-only config (`mongodbUri`) sits in non-public `runtimeConfig` and is
  never exposed to the client.

## Brute-force protection

- **Limits:** 5 failed sign-ins per email, or 20 per IP, within 15 minutes → 429
  `RATE_LIMITED` with `Retry-After`. These are security defaults, not client
  requirements.
- A successful sign-in resets that email's count.
- **Blocking by email is intentional.** Someone who knows a staff email can lock
  that account out for up to 15 minutes. That's the trade-off for stopping password
  guessing; staff can wait, or have the count cleared.
- **Behind a reverse proxy:** the IP used is the direct connection's
  (`getRequestIP` without trusting `X-Forwarded-For`). Behind a proxy or load
  balancer, every user would share the proxy's IP. Configure trusted forwarding
  when the hosting target is chosen.

## Open items
- The data-protection law that applies to member data hasn't been identified yet.
