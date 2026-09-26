import type { MembershipPlan } from '../utils/membership'

/** A member who needs follow-up (renewal) on the dashboard. */
export interface AttentionItem {
  memberId: string
  firstName: string
  lastName: string
  phone: string
  plan: MembershipPlan
  expiryDate: string
  /** Days from today to the expiry date; negative once expired. */
  daysLeft: number
}

export interface AttentionList {
  items: AttentionItem[]
  total: number
}

/** Member counts by current status, for non-archived members only. */
export interface DashboardSummary {
  /** The date the statuses were calculated for, "YYYY-MM-DD" in Asia/Manila. */
  asOf: string
  totalMembers: number
  active: number
  nearExpiry: number
  expired: number
  noMembership: number
  /** Near-expiry members who haven't renewed ahead, soonest first. */
  expiringSoon: AttentionList
  /** Members whose membership expired recently and who haven't renewed, most recent first. */
  recentlyExpired: AttentionList
}
