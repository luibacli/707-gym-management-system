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
| `active`       | Boolean | Default `true`. Inactive users can't sign in and lose access on their next API request |
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

## Notes

- Mongoose `autoIndex` is on (the default), so indexes are created when the app starts.
  Revisit this for production once the hosting target is decided.
