# Security

> Status: decided (ADR-001), **not implemented yet**.

## Authentication

- Staff sign in with a password. Sessions are stored in a sealed cookie using
  `nuxt-auth-utils`, keyed by `NUXT_SESSION_PASSWORD`.
- Passwords are hashed with scrypt (`hashPassword`). They are never stored or
  logged in plain text.
- Staff accounts are created and deactivated with a server-side CLI script (BR-A2).
  There is no self-registration.

## Authorization

- A single staff role with full access (BR-A1).
- Every protected API route calls `requireUserSession(event)`, then checks that
  the user is still active in the database.
- Client-side route middleware only handles redirects. It is not a security boundary.

## Sensitive data

- Member records contain personal data (BR-M1). API responses include only the
  fields the UI needs.
- Secrets are only in environment variables. `.env` is gitignored, and
  `.env.example` lists the variable names.
- Server-only config (`mongodbUri`) sits in non-public `runtimeConfig` and is
  never exposed to the client.

## Open items

- Login rate limiting / brute-force protection: not decided yet (ADR-001).
- The data-protection law that applies to member data hasn't been identified yet.
