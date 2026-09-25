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

Document each endpoint here when it's added: method, path, auth, params/body,
response, and errors.

### `POST /api/auth/login`

Signs in a staff member and sets the session cookie.

- **Auth:** none.
- **Body:** `{ email: string, password: string }`. The email is trimmed and lowercased.
  Schema: `loginSchema` in `shared/schemas/auth.ts`.
- **200:** `{ id, name, email }`, the session user.
- **400 `VALIDATION_ERROR`:** invalid body, with `fieldErrors.email` / `fieldErrors.password`.
- **401 `UNAUTHENTICATED`:** "Incorrect email or password." Returned for an unknown email,
  a wrong password, or a deactivated account; the response doesn't reveal which.

### Session endpoints (provided by `nuxt-auth-utils`)

- `GET /api/_auth/session`: the current session (used by `useUserSession()`).
- `DELETE /api/_auth/session`: signs out (used by `useUserSession().clear()`).

These come from the module; they are not defined in `server/api/`.

## Protecting routes

Every staff-only route starts with `await requireStaff(event)` (`server/utils/requireStaff.ts`).
It returns the session user, or throws 401 `UNAUTHENTICATED` when there is no session or the
account is inactive.
