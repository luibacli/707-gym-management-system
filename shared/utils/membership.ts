// Membership date and status rules (docs/business-rules.md). Dates are "YYYY-MM-DD" (ADR-006).

export const MEMBERSHIP_PLANS = ['monthly', 'annual'] as const // BR-P1
export type MembershipPlan = (typeof MEMBERSHIP_PLANS)[number]

export const PLAN_LABELS: Record<MembershipPlan, string> = {
  monthly: 'Monthly',
  annual: 'Annual',
}

export const NEAR_EXPIRY_DAYS = 7 // BR-S2

export type MembershipStatus = 'scheduled' | 'active' | 'near-expiry' | 'expired'
export const MEMBER_STATUSES = ['active', 'near-expiry', 'expired', 'none'] as const
export type MemberStatus = (typeof MEMBER_STATUSES)[number]

export const STATUS_LABELS: Record<MembershipStatus | MemberStatus, string> = {
  'scheduled': 'Scheduled',
  'active': 'Active',
  'near-expiry': 'Near expiry',
  'expired': 'Expired',
  'none': 'No membership',
}

function parts(date: string): [number, number, number] {
  return date.split('-').map(Number) as [number, number, number]
}

function format(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/** Days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = parts(from)
  const [ty, tm, td] = parts(to)
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000)
}

/** Adds whole days to a calendar date. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = parts(date)
  const result = new Date(Date.UTC(y, m - 1, d + days))
  return format(result.getUTCFullYear(), result.getUTCMonth() + 1, result.getUTCDate())
}

/**
 * Expiry = start + plan duration on the same day of the month (BR-P2).
 * If that day doesn't exist, use the last day of the month (BR-P3).
 */
export function calculateExpiryDate(startDate: string, plan: MembershipPlan): string {
  const [year, month, day] = parts(startDate)
  let targetYear = plan === 'annual' ? year + 1 : year
  let targetMonth = plan === 'monthly' ? month + 1 : month
  if (targetMonth > 12) {
    targetMonth = 1
    targetYear += 1
  }
  return format(targetYear, targetMonth, Math.min(day, daysInMonth(targetYear, targetMonth)))
}

export interface MembershipDates {
  startDate: string
  expiryDate: string
}

/** Status of one membership on `today` (BR-P4, BR-S2). The expiry day is still active. */
export function getMembershipStatus({ startDate, expiryDate }: MembershipDates, today: string): MembershipStatus {
  if (startDate > today) return 'scheduled'
  if (today > expiryDate) return 'expired'
  return daysBetween(today, expiryDate) <= NEAR_EXPIRY_DAYS ? 'near-expiry' : 'active'
}

/**
 * The membership that determines a member's status (BR-S3): the one covering today,
 * else the most recent past one. Scheduled (future) memberships don't count yet.
 */
export function getCurrentMembership<T extends MembershipDates>(memberships: T[], today: string): T | undefined {
  const covering = memberships.find(m => m.startDate <= today && today <= m.expiryDate)
  if (covering) return covering
  return memberships
    .filter(m => m.expiryDate < today)
    .reduce<T | undefined>((latest, m) => (!latest || m.expiryDate > latest.expiryDate ? m : latest), undefined)
}

/** A member's current status (BR-S3), or "No membership" when there's no current membership. */
export function getMemberStatus(memberships: MembershipDates[], today: string): MemberStatus {
  const current = getCurrentMembership(memberships, today)
  return current ? (getMembershipStatus(current, today) as MemberStatus) : 'none'
}

/** True when the member already has a membership starting after today (renewed ahead). */
export function hasScheduledMembership(memberships: MembershipDates[], today: string): boolean {
  return memberships.some(m => m.startDate > today)
}

/** True when two inclusive date ranges share at least one day (BR-H2). */
export function datesOverlap(a: MembershipDates, b: MembershipDates): boolean {
  return a.startDate <= b.expiryDate && b.startDate <= a.expiryDate
}

/**
 * Default start date for a new membership (BR-H3): the day after the latest expiry if
 * that membership hasn't ended yet, otherwise today.
 */
export function suggestStartDate(memberships: MembershipDates[], today: string): string {
  const latestExpiry = memberships.reduce<string | undefined>(
    (latest, m) => (!latest || m.expiryDate > latest ? m.expiryDate : latest),
    undefined,
  )
  return latestExpiry && latestExpiry >= today ? addDays(latestExpiry, 1) : today
}
