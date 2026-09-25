# Security

> Status: staff sign-in implemented (ADR-001). No data routes exist yet.

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
  checks that the user is still active in the database.
- The global client middleware (`app/middleware/auth.global.ts`) only handles
  redirects. It is not a security boundary.
- Known gap: the client-side session state (`useUserSession`) of a deactivated user
  still shows them as signed in until an API call returns 401. Once data routes exist,
  the client should sign out and redirect when it gets a 401.

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
