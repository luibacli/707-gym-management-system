# API

Conventions are defined in **ADR-003**. In summary:

- REST-style Nuxt filesystem routes under `server/api/`
  (e.g. `server/api/members/index.get.ts` → `GET /api/members`).
- Successful responses return the resource directly. Lists return
  `{ items, total, page, pageSize }`.
- Errors use `createError({ statusCode, message, data: { code, fieldErrors? } })`
  with the codes `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401),
  `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409) and `INTERNAL_ERROR` (500).
- All input is validated with Zod (ADR-002).
- All routes except login require an authenticated session (ADR-001).

## Endpoints

None implemented yet. Document each endpoint here when it's added: method, path,
auth, params/body, response, and errors.
