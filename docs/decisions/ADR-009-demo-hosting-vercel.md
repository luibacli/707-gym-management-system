# ADR-009: Vercel for the client demo

## Status

Accepted (2026-09-26). Scope: **the client demo only.** The production hosting
decision (ADR-005) is still open.

## Context

The client demo should be a live link the client can open on their own devices,
not only a laptop screen share. The app is a standard Nuxt 4 / Nitro app, and
Nitro's `vercel` preset deploys it to Vercel's serverless functions without
changing any code. A custom domain isn't needed for the demo.

## Decision

- Deploy the app to **Vercel** from the GitHub repository (`main`). Use the
  **Production** URL (`*.vercel.app`) for the demo.
- The Vercel deployment uses the **demo database** (`707_demo`) through its own
  `NUXT_MONGODB_URI`, with a MongoDB user that can only read and write `707_demo`.
- Atlas allows `0.0.0.0/0`, because Vercel functions have no fixed IPs. The
  demo-only database user limits what that exposes to fake data.
- `NUXT_TRUST_PROXY=true` on Vercel, so login rate limiting uses the real client IP
  from `X-Forwarded-For`. Vercel overwrites that header, so clients can't spoof it.
- All pages are `noindex` (header and `robots.txt`). This is a staff-only app.

## Alternatives Considered

- **Laptop demo only** (`pnpm demo:start`). No hosting needed, but the client
  can't try it on their own phone.
- **A container host** (Render, Fly.io, Railway). This would suit production if
  Docker is chosen later (ADR-005), but it's more setup than a demo needs.

## Consequences

- Positive: a shareable HTTPS link with no infrastructure work. Every push to
  `main` redeploys.
- Negative: serverless cold starts can add about a second to the first request
  after the app has been idle. Open the link a minute before the demo to warm it up.
- Negative: allowing `0.0.0.0/0` on Atlas relies on database credentials alone.
  That's acceptable for demo data. Revisit it (Atlas private networking, or a host
  with static IPs) before any real member data goes in.
- Choosing Vercel for production would be a separate decision.

## Date

2026-09-26
