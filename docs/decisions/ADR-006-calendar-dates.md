# ADR-006: Calendar dates stored as "YYYY-MM-DD" strings

## Status

Accepted (2026-09-26)

## Context

Birth dates and membership dates (start and expiry) are calendar dates with no
time of day. The business rules depend on exact days: an inclusive expiry day
(BR-P4) and "today" in `Asia/Manila` (BR-P5).

A JavaScript `Date` or a MongoDB `Date` is a point in time, so converting between
the browser, the server and UTC can move a date to the previous or next day
(e.g. Mar 5 saved as Mar 4).

## Decision

- Calendar dates are stored, sent over the API and validated as `"YYYY-MM-DD"` strings.
- Helpers live in `shared/utils/date.ts`:
  - `isCalendarDate`: checks the format and that the date really exists
  - `todayInGymTimeZone`: today in Asia/Manila
  - `toCalendarDate` / `fromCalendarDate`: convert to and from the date picker's `Date`
  - `formatCalendarDate`: display formatting
- Date comparisons use plain string comparison, which is correct for `YYYY-MM-DD`.
- Timestamps (`createdAt`, `updatedAt`) remain real `Date` values and are displayed
  in the gym timezone (`formatTimestampDate`).

## Alternatives Considered

- **MongoDB `Date` at UTC midnight.** This works only if every conversion point
  is handled carefully, which is easy to get wrong in the UI.
- **Separate year/month/day numbers.** Unambiguous, but awkward to query, sort
  and validate.

## Consequences

- Positive: a date means the same day everywhere. This is verified by e2e tests
  run with the browser in both America/Los_Angeles and Asia/Manila.
- Positive: string ordering equals date ordering, so range queries and sorting work directly.
- Negative: date arithmetic (e.g. expiry = start + 1 month, BR-P2/BR-P3) needs
  explicit helpers. It must not rely on `Date` defaults.

## Date

2026-09-26
