import { MemberModel } from '../models/Member'
import { todayInGymTimeZone } from '../../shared/utils/date'
import type { DashboardSummary } from '../../shared/types/dashboard'
import { getMemberStatuses } from './memberships'

/** Counts of non-archived members by current status (project-overview §4.4, BR-M2, BR-S3). */
export async function getDashboardSummary(today = todayInGymTimeZone()): Promise<DashboardSummary> {
  const ids = await MemberModel.find({ archived: false }).select('_id').lean()
  const statuses = await getMemberStatuses(ids.map(doc => doc._id), today)

  const counts = { 'active': 0, 'near-expiry': 0, 'expired': 0, 'none': 0 }
  for (const status of statuses.values()) counts[status] += 1

  return {
    asOf: today,
    totalMembers: ids.length,
    active: counts.active,
    nearExpiry: counts['near-expiry'],
    expired: counts.expired,
    noMembership: counts.none,
  }
}
