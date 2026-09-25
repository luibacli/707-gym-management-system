import type { MembershipResult } from '../services/memberships'

/** Maps a failed membership operation to an ADR-003 error. */
export function throwMembershipError(result: Exclude<MembershipResult, { ok: true }>): never {
  if (result.reason === 'not-found') {
    throw apiError(404, 'NOT_FOUND', 'Membership not found.')
  }
  const { startDate, expiryDate } = result.conflict
  throw apiError(
    409,
    'CONFLICT',
    `This overlaps an existing membership (${formatCalendarDate(startDate)} – ${formatCalendarDate(expiryDate)}). Memberships can't overlap.`,
  )
}
