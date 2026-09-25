/** Member counts by current status, for non-archived members only. */
export interface DashboardSummary {
  /** The date the statuses were calculated for, "YYYY-MM-DD" in Asia/Manila. */
  asOf: string
  totalMembers: number
  active: number
  nearExpiry: number
  expired: number
  noMembership: number
}
