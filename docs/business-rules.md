# Business Rules

> **Status: mostly PROVISIONAL.** Rules marked **Provisional** are defaults chosen
> by the developer on 2026-09-25 so the foundation can proceed. They aren't
> confirmed by the client yet. Rules marked **Confirmed** have been approved.
> Each rule has an ID. When the client confirms or changes a rule, update it here
> and mark it **Confirmed**.
>
> Source: open questions in `docs/project-overview.md` §11.

## Members

**BR-M1: Member fields** (Provisional)

| Field                      | Required |
| -------------------------- | -------- |
| First name                 | Yes      |
| Last name                  | Yes      |
| Phone number               | Yes      |
| Email                      | No       |
| Birth date                 | No       |
| Address                    | No       |
| Emergency contact name     | No       |
| Emergency contact phone    | No       |
| Notes                      | No       |

No photo upload in the MVP.

**BR-M2: Archiving** (Provisional)

- Members are archived, never deleted.
- Archived members can be restored.
- Archived members are excluded from dashboard counts and from the default
  member list and search. Staff can still view them through an "Archived" filter.
- Archiving a member keeps their membership history.

## Plans and Dates

**BR-P1: Plans** (Provisional)

Two plans: **Monthly** (1 month) and **Annual** (1 year).

**BR-P2: Expiry date calculation** (Provisional)

- Expiry date = start date + plan duration, landing on the same day of the month.
  Example: a monthly plan starting Jan 15 expires Feb 15.
- Staff cannot enter or override the expiry date. To change it, edit the start
  date or the plan.

**BR-P3: Month-end handling** (Provisional)

If the target month has no matching day, the expiry date is the last day of that month.
Examples: Jan 31 + 1 month = Feb 28 (or Feb 29 in a leap year).
Feb 29 + 1 year = Feb 28.

**BR-P4: Expiry day is active** (Provisional)

The membership is active up to and including its expiry date. It becomes expired
the following day.

**BR-P5: Timezone** (Confirmed 2026-09-25)

The gym is in the Philippines. "Today" is determined in the `Asia/Manila` timezone.
All membership dates are calendar dates, with no time of day.

**BR-P6: No price or payment data** (Provisional)

Membership records don't store prices or amounts paid. Payments and accounting
are out of scope for the MVP (`project-overview.md` §8).

## Status

**BR-S1: Status is derived from dates** (Provisional)

Status is always calculated from the membership dates and the current date.
Staff can't set it manually. There are no "frozen" or "cancelled" states in the MVP.

**BR-S2: Membership statuses** (Confirmed 2026-09-25, including the 7-day near-expiry window)

These statuses are mutually exclusive:

| Status          | Condition                                                  |
| --------------- | ---------------------------------------------------------- |
| **Near-expiry** | Today is within 7 days of the expiry date (0–7 days left)  |
| **Active**      | Start date ≤ today ≤ expiry date, and not near-expiry      |
| **Expired**     | Today > expiry date                                        |

A membership whose start date is in the future is **scheduled**. It doesn't
determine the member's current status until its start date.

**BR-S3: Member's current status** (Provisional)

A member's status is taken from:

1. the membership that covers today, if any; otherwise
2. their most recent past membership (which is Expired); otherwise
3. **No membership**, if they have never had one.

Dashboard counts use this per-member status. The counts include only
non-archived members.

**BR-S4: No automatic action on expiry** (Provisional)

When a membership expires, nothing happens automatically. The system only
shows the Expired status.

## Membership History and Renewals

**BR-H1: Membership history** (Provisional)

A member can have many memberships over time. The history is kept.

**BR-H2: No overlapping memberships** (Provisional)

A member's memberships can't overlap. Creating or editing a membership that
overlaps an existing one is rejected.

**BR-H3: Renewals** (Provisional)

A renewal creates a new membership record. By default, its start date is the
day after the current membership's expiry date. Staff can choose a later start
date, but not an overlapping one (BR-H2).

## Staff Access

**BR-A1: Single staff role** (Provisional)

All staff accounts have the same full access. There is no admin/staff split in the MVP.

**BR-A2: Staff accounts are managed outside the app UI** (Provisional)

Staff management is out of scope (`project-overview.md` §8). Staff accounts are
created and deactivated by the developer with a server-side command-line
script. There is no in-app staff management screen and no self-registration.

## Implementation Notes

- **"No membership" for scheduled-only members.** A member whose only membership
  hasn't started yet shows "No membership" (BR-S3 as written). Their scheduled
  membership is still listed on their page.

## Open Questions

These came up during implementation. They aren't business rules yet, so the
current behavior is the simplest option, not a decision.

- **Deleting a membership entered by mistake.** It currently can't be deleted,
  only edited.
- **Memberships for archived members.** Staff can currently still add or edit them.
