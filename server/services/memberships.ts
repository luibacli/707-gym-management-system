import type { HydratedDocument, Types } from 'mongoose'
import { MemberModel } from '../models/Member'
import { MembershipModel, type MembershipFields } from '../models/Membership'
import type { MembershipInput } from '../../shared/schemas/membership'
import type { Membership } from '../../shared/types/member'
import { todayInGymTimeZone } from '../../shared/utils/date'
import {
  calculateExpiryDate, getCurrentMembership, getMemberStatus, getMembershipStatus, hasScheduledMembership,
  type MemberStatus, type MembershipDates, type MembershipPlan,
} from '../../shared/utils/membership'

export interface MembershipSummary {
  status: MemberStatus
  /** Plan and expiry of the membership that determines the status (BR-S3). */
  currentPlan?: MembershipPlan
  currentExpiryDate?: string
  /** Already has a membership starting after today. */
  renewedAhead: boolean
}

export type MembershipResult
  = | { ok: true, membership: Membership }
    | { ok: false, reason: 'not-found' }
    | { ok: false, reason: 'overlap', conflict: MembershipDates }

function toMembership(doc: HydratedDocument<MembershipFields>, today: string): Membership {
  return {
    id: doc.id as string,
    memberId: doc.memberId.toString(),
    plan: doc.plan,
    startDate: doc.startDate,
    expiryDate: doc.expiryDate,
    status: getMembershipStatus(doc, today),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

/** A member's memberships, newest first. */
export async function listMemberships(memberId: string, today = todayInGymTimeZone()): Promise<Membership[]> {
  const docs = await MembershipModel.find({ memberId }).sort({ startDate: -1 })
  return docs.map(doc => toMembership(doc, today))
}

/** Membership summary for each member (BR-S3), using one query for all of them. */
export async function getMembershipSummaries(
  memberIds: (string | Types.ObjectId)[],
  today = todayInGymTimeZone(),
): Promise<Map<string, MembershipSummary>> {
  const rows = await MembershipModel.find({ memberId: { $in: memberIds } })
    .select('memberId plan startDate expiryDate')
    .lean()

  const byMember = new Map<string, (MembershipDates & { plan: MembershipPlan })[]>()
  for (const row of rows) {
    const key = row.memberId.toString()
    byMember.set(key, [...(byMember.get(key) ?? []), row])
  }

  return new Map(memberIds.map((id) => {
    const memberships = byMember.get(id.toString()) ?? []
    const current = getCurrentMembership(memberships, today)
    return [id.toString(), {
      status: getMemberStatus(memberships, today),
      currentPlan: current?.plan,
      currentExpiryDate: current?.expiryDate,
      renewedAhead: hasScheduledMembership(memberships, today),
    }]
  }))
}

/** Current status for each member (BR-S3). */
export async function getMemberStatuses(
  memberIds: (string | Types.ObjectId)[],
  today = todayInGymTimeZone(),
): Promise<Map<string, MemberStatus>> {
  const summaries = await getMembershipSummaries(memberIds, today)
  return new Map([...summaries].map(([id, summary]) => [id, summary.status]))
}

/** Finds a membership of this member that overlaps the given dates (BR-H2). */
async function findOverlap(memberId: string, dates: MembershipDates, excludeId?: string) {
  return MembershipModel.findOne({
    memberId,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    startDate: { $lte: dates.expiryDate },
    expiryDate: { $gte: dates.startDate },
  }).select('startDate expiryDate').lean()
}

// Note: the overlap check and the write are separate operations. Two simultaneous
// requests for the same member could both pass the check; acceptable at single-gym volume.

export async function createMembership(memberId: string, input: MembershipInput): Promise<MembershipResult> {
  if (!(await MemberModel.exists({ _id: memberId }))) return { ok: false, reason: 'not-found' }

  const dates = { startDate: input.startDate, expiryDate: calculateExpiryDate(input.startDate, input.plan) }
  const conflict = await findOverlap(memberId, dates)
  if (conflict) return { ok: false, reason: 'overlap', conflict }

  const doc = await MembershipModel.create({ memberId, plan: input.plan, ...dates })
  return { ok: true, membership: toMembership(doc, todayInGymTimeZone()) }
}

export async function updateMembership(
  memberId: string,
  membershipId: string,
  input: MembershipInput,
): Promise<MembershipResult> {
  const doc = await MembershipModel.findOne({ _id: membershipId, memberId })
  if (!doc) return { ok: false, reason: 'not-found' }

  const dates = { startDate: input.startDate, expiryDate: calculateExpiryDate(input.startDate, input.plan) }
  const conflict = await findOverlap(memberId, dates, membershipId)
  if (conflict) return { ok: false, reason: 'overlap', conflict }

  doc.set({ plan: input.plan, ...dates })
  await doc.save()
  return { ok: true, membership: toMembership(doc, todayInGymTimeZone()) }
}
