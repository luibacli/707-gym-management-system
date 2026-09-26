import { MemberModel } from '../models/Member'
import { todayInGymTimeZone } from '../../shared/utils/date'
import type { AttentionItem, AttentionList, DashboardSummary } from '../../shared/types/dashboard'
import { addDays, daysBetween } from '../../shared/utils/membership'
import { getMembershipSummaries, type MembershipSummary } from './memberships'

// Display settings for the dashboard, not business rules.
export const ATTENTION_LIST_LIMIT = 8
export const RECENTLY_EXPIRED_DAYS = 30

/**
 * Counts of non-archived members by current status (project-overview §4.4, BR-M2, BR-S3),
 * plus the members who need a renewal follow-up.
 */
export async function getDashboardSummary(today = todayInGymTimeZone()): Promise<DashboardSummary> {
  const members = await MemberModel.find({ archived: false }).select('firstName lastName phone').lean()
  const summaries = await getMembershipSummaries(members.map(m => m._id), today)

  const counts = { 'active': 0, 'near-expiry': 0, 'expired': 0, 'none': 0 }
  for (const summary of summaries.values()) counts[summary.status] += 1

  const needsFollowUp = (summary: MembershipSummary) => !summary.renewedAhead && !!summary.currentExpiryDate
  const expiring: AttentionItem[] = []
  const expired: AttentionItem[] = []
  const recentCutoff = addDays(today, -RECENTLY_EXPIRED_DAYS)

  for (const member of members) {
    const summary = summaries.get(member._id.toString())!
    if (!needsFollowUp(summary)) continue
    const item: AttentionItem = {
      memberId: member._id.toString(),
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      plan: summary.currentPlan!,
      expiryDate: summary.currentExpiryDate!,
      daysLeft: daysBetween(today, summary.currentExpiryDate!),
    }
    if (summary.status === 'near-expiry') expiring.push(item)
    else if (summary.status === 'expired' && item.expiryDate >= recentCutoff) expired.push(item)
  }

  const list = (items: AttentionItem[]): AttentionList => ({ items: items.slice(0, ATTENTION_LIST_LIMIT), total: items.length })

  return {
    asOf: today,
    totalMembers: members.length,
    active: counts.active,
    nearExpiry: counts['near-expiry'],
    expired: counts.expired,
    noMembership: counts.none,
    expiringSoon: list(expiring.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate) || a.lastName.localeCompare(b.lastName))),
    recentlyExpired: list(expired.sort((a, b) => b.expiryDate.localeCompare(a.expiryDate) || a.lastName.localeCompare(b.lastName))),
  }
}
