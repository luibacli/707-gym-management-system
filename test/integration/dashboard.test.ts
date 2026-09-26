import { describe, expect, it } from 'vitest'
import { MEMBER_PAGE_SIZE, memberInputSchema } from '../../shared/schemas/member'
import { createMember, listMembers, setMemberArchived } from '../../server/services/members'
import { createMembership } from '../../server/services/memberships'
import { getDashboardSummary } from '../../server/services/dashboard'
import { todayInGymTimeZone } from '../../shared/utils/date'
import { addDays } from '../../shared/utils/membership'

const today = todayInGymTimeZone()

async function member(lastName: string, startDate?: string) {
  const created = await createMember(memberInputSchema.parse({ firstName: 'Test', lastName, phone: '09171234567' }))
  if (startDate) {
    const result = await createMembership(created.id, { plan: 'monthly', startDate })
    if (!result.ok) throw new Error(result.reason)
  }
  return created
}

describe('dashboard summary', () => {
  it('counts non-archived members by current status', async () => {
    await member('Active', today)
    await member('Near', addDays(today, -28)) // monthly: expires in 0–3 days
    await member('Expired', '2020-01-01')
    await member('None')
    const archived = await member('Archived', today)
    await setMemberArchived(archived.id, true)

    expect(await getDashboardSummary()).toMatchObject({
      asOf: today, totalMembers: 4, active: 1, nearExpiry: 1, expired: 1, noMembership: 1,
    })
  })

  it('returns zeros when there are no members', async () => {
    expect(await getDashboardSummary()).toMatchObject({ totalMembers: 0, active: 0, nearExpiry: 0, expired: 0 })
  })
})

describe('dashboard attention lists', () => {
  async function renew(memberId: string, startDate: string) {
    const result = await createMembership(memberId, { plan: 'monthly', startDate })
    if (!result.ok) throw new Error(result.reason)
  }

  it('lists near-expiry members soonest first, skipping those who renewed ahead', async () => {
    const later = await member('Later', addDays(today, -26)) // expires in ~2–5 days
    const sooner = await member('Sooner', addDays(today, -30)) // expires today or within ~1 day
    const renewed = await member('Renewed', addDays(today, -28))
    const current = (await getDashboardSummary()).expiringSoon.items.find(i => i.memberId === renewed.id)!
    await renew(renewed.id, addDays(current.expiryDate, 1))

    const { expiringSoon } = await getDashboardSummary()
    expect(expiringSoon.items.map(i => i.memberId)).toEqual([sooner.id, later.id])
    expect(expiringSoon.total).toBe(2)
    expect(expiringSoon.items[0]).toMatchObject({ firstName: 'Test', lastName: 'Sooner', plan: 'monthly' })
    expect(expiringSoon.items[0]!.daysLeft).toBeGreaterThanOrEqual(0)
  })

  it('lists recently expired members, most recent first, within 30 days', async () => {
    const recent = await member('Recent', addDays(today, -40)) // expired ~9–12 days ago
    const older = await member('Older', addDays(today, -50)) // expired ~19–22 days ago
    await member('LongAgo', '2020-01-01')

    const { recentlyExpired } = await getDashboardSummary()
    expect(recentlyExpired.items.map(i => i.memberId)).toEqual([recent.id, older.id])
    expect(recentlyExpired.items[0]!.daysLeft).toBeLessThan(0)
  })

  it('excludes archived members', async () => {
    const archived = await member('Archived', addDays(today, -28))
    await setMemberArchived(archived.id, true)
    expect((await getDashboardSummary()).expiringSoon.total).toBe(0)
  })
})

describe('member list status filter (ADR-008)', () => {
  it('returns only members with the requested status, sorted by name', async () => {
    await member('Beta', today)
    await member('Alpha', today)
    await member('Gamma', '2020-01-01')
    await member('Delta')

    const active = await listMembers({ archived: false, page: 1, status: 'active' })
    expect(active.items.map(m => [m.lastName, m.status])).toEqual([['Alpha', 'active'], ['Beta', 'active']])
    expect(active.total).toBe(2)

    const none = await listMembers({ archived: false, page: 1, status: 'none' })
    expect(none.items.map(m => m.lastName)).toEqual(['Delta'])
  })

  it('combines with search and the archived view', async () => {
    await member('Santos', today)
    await member('Reyes', today)
    const archived = await member('Santiago', today)
    await setMemberArchived(archived.id, true)

    const result = await listMembers({ archived: false, page: 1, status: 'active', search: 'san' })
    expect(result.items.map(m => m.lastName)).toEqual(['Santos'])

    const archivedResult = await listMembers({ archived: true, page: 1, status: 'active' })
    expect(archivedResult.items.map(m => m.lastName)).toEqual(['Santiago'])
  })

  it('paginates the filtered results', async () => {
    for (let i = 0; i < MEMBER_PAGE_SIZE + 3; i++) {
      await member(`Expired ${String(i).padStart(2, '0')}`, '2020-01-01')
      await member(`Other ${String(i).padStart(2, '0')}`)
    }

    const page2 = await listMembers({ archived: false, page: 2, status: 'expired' })
    expect(page2.total).toBe(MEMBER_PAGE_SIZE + 3)
    expect(page2.items.map(m => m.lastName)).toEqual(['Expired 20', 'Expired 21', 'Expired 22'])
  })
})
