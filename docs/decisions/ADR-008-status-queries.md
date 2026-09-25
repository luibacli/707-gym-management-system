# ADR-008: Membership status is calculated in the application for counts and filters

## Status

Accepted (2026-09-26)

## Context

Member status (Active, Near expiry, Expired, No membership; BR-S3) depends on
**today's date** in Asia/Manila. The same data changes status overnight without
any write. The dashboard needs counts by status (project-overview §4.4), and the
member list needs a status filter (§4.5). Both need the status of every
non-archived member, not just one page of them.

## Decision

Calculate status **in the application, at request time**, with the same shared
function the rest of the app uses (`getMemberStatus` in `shared/utils/membership.ts`):

- **Dashboard** (`GET /api/dashboard`): load the IDs of all non-archived members,
  load their membership dates in one query, calculate each status, and count.
- **Status filter** (`GET /api/members?status=…`): load the IDs of the matching
  members (search / archived), sorted by name using the existing index. Calculate
  statuses, keep the ones that match, paginate in memory, then load only that
  page's member documents.
- Without a status filter, the list keeps its database-side pagination.

## Alternatives Considered

- **MongoDB aggregation pipeline** (`$lookup` memberships and derive status from `$$NOW`).
  - Scales further.
  - But it would re-implement the status rules (the inclusive expiry day, the
    7-day window, Manila "today", ignoring scheduled memberships) in a second
    language. The two versions could drift apart.
- **Stored status on each member.** Fast to query, but it goes stale every day.
  It would need a scheduled job and a recalculation on every membership change.

## Consequences

- Positive: one definition of the status rules, and results always correct for today.
- Positive: no new infrastructure (no scheduled jobs, no pipelines).
- Negative: cost grows with the number of members and memberships. This is fine
  for one gym, which will have a few thousand members at most. Revisit if the
  dashboard or a filtered list becomes slow (a rough threshold is ~10,000 members),
  e.g. with an aggregation pipeline covered by the same unit test cases.

## Date

2026-09-26
