import { describe, expect, it } from 'vitest'
import { memberInputSchema } from '../../shared/schemas/member'
import { createMember, getMember, listMembers } from '../../server/services/members'
import {
  createMembership, getMemberStatuses, listMemberships, updateMembership,
} from '../../server/services/memberships'
import { addDays } from '../../shared/utils/membership'
import { todayInGymTimeZone } from '../../shared/utils/date'

async function newMember(firstName = 'Juan') {
  return createMember(memberInputSchema.parse({ firstName, lastName: 'Dela Cruz', phone: '09171234567' }))
}

async function create(memberId: string, startDate: string, plan: 'monthly' | 'annual' = 'monthly') {
  const result = await createMembership(memberId, { plan, startDate })
  if (!result.ok) throw new Error(`Expected success, got ${result.reason}`)
  return result.membership
}

describe('membership service', () => {
  it('calculates the expiry date on the server', async () => {
    const member = await newMember()
    const membership = await create(member.id, '2026-01-31')
    expect(membership).toMatchObject({ plan: 'monthly', startDate: '2026-01-31', expiryDate: '2026-02-28' })
  })

  it('rejects memberships for an unknown member', async () => {
    const result = await createMembership('0123456789abcdef01234567', { plan: 'monthly', startDate: '2026-01-01' })
    expect(result).toEqual({ ok: false, reason: 'not-found' })
  })

  it('rejects overlaps but allows back-to-back memberships (BR-H2)', async () => {
    const member = await newMember()
    await create(member.id, '2026-01-15') // to 2026-02-15

    const overlap = await createMembership(member.id, { plan: 'monthly', startDate: '2026-02-15' })
    expect(overlap).toEqual({
      ok: false, reason: 'overlap', conflict: expect.objectContaining({ startDate: '2026-01-15', expiryDate: '2026-02-15' }),
    })

    const next = await createMembership(member.id, { plan: 'monthly', startDate: '2026-02-16' })
    expect(next.ok).toBe(true)
  })

  it('checks overlaps per member only', async () => {
    const juan = await newMember('Juan')
    const ana = await newMember('Ana')
    await create(juan.id, '2026-01-15')
    expect((await createMembership(ana.id, { plan: 'monthly', startDate: '2026-01-15' })).ok).toBe(true)
  })

  it('recalculates expiry on update and ignores the membership itself in the overlap check', async () => {
    const member = await newMember()
    const membership = await create(member.id, '2026-01-15')

    const result = await updateMembership(member.id, membership.id, { plan: 'annual', startDate: '2026-01-20' })
    expect(result).toMatchObject({ ok: true, membership: { plan: 'annual', expiryDate: '2027-01-20' } })
  })

  it('rejects an update that would overlap another membership', async () => {
    const member = await newMember()
    await create(member.id, '2026-01-15') // to 2026-02-15
    const later = await create(member.id, '2026-03-01')

    const result = await updateMembership(member.id, later.id, { plan: 'monthly', startDate: '2026-02-10' })
    expect(result.ok).toBe(false)
  })

  it('does not update a membership through another member', async () => {
    const juan = await newMember('Juan')
    const ana = await newMember('Ana')
    const membership = await create(juan.id, '2026-01-15')

    const result = await updateMembership(ana.id, membership.id, { plan: 'monthly', startDate: '2026-05-01' })
    expect(result).toEqual({ ok: false, reason: 'not-found' })
  })

  it('lists a member’s memberships newest first, with statuses', async () => {
    const member = await newMember()
    await create(member.id, '2026-01-01')
    await create(member.id, '2026-03-01')

    const memberships = await listMemberships(member.id, '2026-03-10')
    expect(memberships.map(m => [m.startDate, m.status])).toEqual([
      ['2026-03-01', 'active'],
      ['2026-01-01', 'expired'],
    ])
  })

  it('computes statuses for many members in one call (BR-S3)', async () => {
    const active = await newMember('Active')
    const expired = await newMember('Expired')
    const none = await newMember('None')
    await create(active.id, '2026-03-01')
    await create(expired.id, '2025-01-01')

    const statuses = await getMemberStatuses([active.id, expired.id, none.id], '2026-03-10')
    expect(Object.fromEntries(statuses)).toEqual({ [active.id]: 'active', [expired.id]: 'expired', [none.id]: 'none' })
  })

  it('includes the current status in member responses', async () => {
    const member = await newMember()
    const today = todayInGymTimeZone()
    await create(member.id, addDays(today, -5))

    expect((await getMember(member.id))?.status).toBe('active')
    expect((await listMembers({ archived: false, page: 1 })).items[0]?.status).toBe('active')
  })
})

describe('current expiry in member responses', () => {
  it('uses the membership that determines the status, not a scheduled renewal', async () => {
    const member = await newMember()
    const today = todayInGymTimeZone()
    const current = await create(member.id, addDays(today, -5))
    await create(member.id, addDays(current.expiryDate, 1))

    const found = await getMember(member.id)
    expect(found?.currentExpiryDate).toBe(current.expiryDate)
  })

  it('is not set for members without memberships', async () => {
    const member = await newMember()
    expect((await getMember(member.id))?.currentExpiryDate).toBeUndefined()
  })
})
