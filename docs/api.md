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

### Members

All member routes require a staff session (`requireStaff`). The body is validated
with `memberInputSchema` (`shared/schemas/member.ts`).

| Method & path                      | Purpose                         | Success |
| ---------------------------------- | ------------------------------- | ------- |
| `GET /api/members`                 | List members                    | 200 `{ items, total, page, pageSize }` |
| `POST /api/members`                | Create a member                 | 201 `Member` |
| `GET /api/members/:id`             | Get one member                  | 200 `Member` |
| `PATCH /api/members/:id`           | Update a member                 | 200 `Member` |
| `POST /api/members/:id/archive`    | Archive (BR-M2)                 | 200 `Member` |
| `POST /api/members/:id/restore`    | Restore (BR-M2)                 | 200 `Member` |

- **List query:**
  - `search`: optional, up to 100 characters. Every word must match name, phone or email.
  - `archived`: `true` or `false`, default `false`.
  - `page`: 1 or higher, default 1.
  - The page size is fixed at 20. Results are sorted by last name, then first name.
- **Member body (POST and PATCH):**
  - Required: `firstName`, `lastName`, `phone`.
  - Optional: `email`, `birthDate` (`YYYY-MM-DD`, not in the future),
    `address`, `emergencyContactName`, `emergencyContactPhone`, `notes`.
  - **PATCH replaces all editable fields.** An optional field that is omitted or
    empty is cleared.
- **`Member` response:** all the fields above, plus `id`, `archived`, and
  `createdAt` / `updatedAt` (ISO timestamps). Optional fields that aren't set are omitted.
- **Errors:**
  - 400 `VALIDATION_ERROR` with `fieldErrors`
  - 401 `UNAUTHENTICATED`
  - 404 `NOT_FOUND` for an unknown ID or a malformed one
- There is no DELETE. Members are archived instead (BR-M2).

## Protecting routes

Every staff-only route starts with `await requireStaff(event)` (`server/utils/requireStaff.ts`).
It returns the session user, or throws 401 `UNAUTHENTICATED` when there is no session or the
account is inactive.
