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

    expect(await getDashboardSummary()).toEqual({
      asOf: today, totalMembers: 4, active: 1, nearExpiry: 1, expired: 1, noMembership: 1,
    })
  })

  it('returns zeros when there are no members', async () => {
    expect(await getDashboardSummary()).toMatchObject({ totalMembers: 0, active: 0, nearExpiry: 0, expired: 0 })
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
