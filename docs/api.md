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
- **429 `RATE_LIMITED`:** too many failed attempts for this email or IP. Includes
  a `Retry-After` header (seconds). See `docs/security.md`.

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
  - `status`: optional, one of `active | near-expiry | expired | none`. It filters
    by the current status (calculated in the application, ADR-008).
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

### Memberships

All routes require a staff session. The body is `{ plan: 'monthly' | 'annual', startDate: 'YYYY-MM-DD' }`
(`membershipInputSchema`). The expiry date is never accepted from the client.

| Method & path                                      | Purpose                              | Success |
| -------------------------------------------------- | ------------------------------------ | ------- |
| `GET /api/members/:id/memberships`                 | A member's memberships, newest first | 200 `Membership[]` |
| `POST /api/members/:id/memberships`                | Add a membership (or renewal)        | 201 `Membership` |
| `PATCH /api/members/:id/memberships/:membershipId` | Change plan or start date            | 200 `Membership` |

- **`Membership` response:** `{ id, memberId, plan, startDate, expiryDate, status, createdAt, updatedAt }`.
  `status` is one of `scheduled | active | near-expiry | expired`, calculated for today in Asia/Manila.
- **Errors:**
  - 400 `VALIDATION_ERROR`
  - 404 `NOT_FOUND` for an unknown member or membership, or a membership that belongs to another member
  - 409 `CONFLICT` when the dates overlap another membership of the same member (BR-H2).
    The message names the conflicting dates.
- **Member responses** (list, get, create, update, archive, restore) now include
  `status`: `active | near-expiry | expired | none` (BR-S3).

### Dashboard

`GET /api/dashboard` (staff session required) returns counts of **non-archived**
members by current status (ADR-008):

```json
{ "asOf": "2026-09-26", "totalMembers": 46, "active": 2, "nearExpiry": 0, "expired": 21, "noMembership": 23 }
```

`totalMembers = active + nearExpiry + expired + noMembership`. `asOf` is today's date in Asia/Manila.

## Unknown routes

Any other `/api/*` path returns 404 `NOT_FOUND` in the ADR-003 format.

## Protecting routes

Every route is defined with `defineApiHandler` (ADR-003). Every staff-only route
starts with `await requireStaff(event)` (`server/utils/requireStaff.ts`).

On the client, authenticated calls use `useApi` (instead of `useFetch`) and
`useNuxtApp().$api` (instead of `$fetch`), so a 401 redirects to sign-in. The
login page is the only place that uses plain `$fetch`.
It returns the session user, or throws 401 `UNAUTHENTICATED` when there is no session or the
account is inactive.
