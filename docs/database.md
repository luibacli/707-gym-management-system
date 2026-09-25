# Database

MongoDB through Mongoose. The connection is opened in `server/plugins/mongoose.ts`
(see `docs/architecture.md`). In development the database is MongoDB Atlas (ADR-005).

## Collections

### `users` (model `User`, `server/models/User.ts`)

Staff accounts (ADR-001, BR-A1, BR-A2).

| Field          | Type    | Notes                                                    |
| -------------- | ------- | -------------------------------------------------------- |
| `name`         | String  | Required, trimmed                                        |
| `email`        | String  | Required, unique, stored lowercase and trimmed           |
| `passwordHash` | String  | Required. Scrypt hash. `select: false`, so it must be requested explicitly with `+passwordHash` |
| `active`       | Boolean | Default `true`. Inactive users can't sign in and lose access on their next API request or page load |
| `passwordChangedAt` | Date | Set by `pnpm staff set-password`. Sessions that started earlier are invalid |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps                           |

**Indexes:** unique on `email`, used by the login lookup.

**Lifecycle:** accounts are created and deactivated with `pnpm staff` (see
`docs/development.md`). They are never deleted, and there is no in-app management.

### `members` (model `MemberModel`, `server/models/Member.ts`)

Gym members (BR-M1). They are archived, never deleted (BR-M2).

| Field                   | Type    | Notes                                   |
| ----------------------- | ------- | --------------------------------------- |
| `firstName`, `lastName` | String  | Required, trimmed                       |
| `phone`                 | String  | Required                                |
| `email`                 | String  | Optional, lowercase                     |
| `birthDate`             | String  | Optional, `"YYYY-MM-DD"` (ADR-006)      |
| `address`, `emergencyContactName`, `emergencyContactPhone`, `notes` | String | Optional |
| `archived`              | Boolean | Default `false`                         |
| `createdAt`, `updatedAt`| Date    | Mongoose timestamps                     |

Optional fields that are left empty are not stored. Clearing a field in the
edit form removes it.

**Indexes:** `{ archived, lastName, firstName, _id }` with a case-insensitive
collation (`en`, strength 2). This serves the member list: filter by `archived`,
then sort by name, with `_id` as a stable tie-breaker for pagination. The query
plan was verified to use the index with no in-memory sort. List queries must use
the same collation (`MEMBER_COLLATION`) to use this index.

**Search:** each word in the search must match first name, last name, phone or
email (a case-insensitive "contains" match, with regex characters escaped). This
is fine at single-gym volume. A text index isn't used, because it can't do
partial matches on phone numbers.

### `memberships` (model `MembershipModel`, `server/models/Membership.ts`)

A member's membership periods (BR-H1). Renewals are new records (BR-H3).

| Field        | Type     | Notes                                                    |
| ------------ | -------- | -------------------------------------------------------- |
| `memberId`   | ObjectId | Required, refers to `members`                            |
| `plan`       | String   | `monthly` or `annual` (BR-P1)                            |
| `startDate`  | String   | `"YYYY-MM-DD"` (ADR-006)                                 |
| `expiryDate` | String   | `"YYYY-MM-DD"`. Always calculated on the server from start date and plan (BR-P2, BR-P3) |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps                          |

**Status is not stored.** It depends on today's date, so it's calculated on every
read by `shared/utils/membership.ts` (BR-S1–S3). Dashboard counts and the list's
status filter calculate the status of every relevant member in the application
(ADR-008). This is fine at single-gym volume; revisit at around 10,000 members.

**Indexes:** `{ memberId, startDate: -1 }`. It serves a member's history (newest
first), the overlap check, and the status lookup for a page of members
(`memberId: { $in: [...] }`).

**Overlaps (BR-H2):** checked before every create and update. The check and the
write are separate operations, so two simultaneous saves for the same member
could both pass. This is accepted at single-gym volume.

**Deletion:** memberships can't be deleted (see the open questions in `business-rules.md`).

### `loginattempts` (model `LoginAttemptModel`, `server/models/LoginAttempt.ts`)

Failed sign-in attempts, used for rate limiting (ADR-001 amendment).

| Field       | Type   | Notes                                  |
| ----------- | ------ | -------------------------------------- |
| `key`       | String | `email:<address>` or `ip:<address>`    |
| `createdAt` | Date   | When the failure happened              |

**Indexes:**
- `{ key, createdAt: -1 }`: counts recent failures per key.
- TTL on `createdAt` (15 minutes): MongoDB deletes expired records automatically,
  about once a minute. Queries also filter by time, so they stay exact.

The e2e global setup clears this collection in `707_e2e` before each run.

## Notes

- Mongoose `autoIndex` is on (the default), so indexes are created when the app starts.
  Revisit this for production once the hosting target is decided.
