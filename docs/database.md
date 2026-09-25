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

## Notes

- Mongoose `autoIndex` is on (the default), so indexes are created when the app starts.
  Revisit this for production once the hosting target is decided.
