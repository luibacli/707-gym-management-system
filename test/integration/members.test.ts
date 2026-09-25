import { describe, expect, it } from 'vitest'
import { MEMBER_PAGE_SIZE, memberInputSchema, type MemberFormValues } from '../../shared/schemas/member'
import {
  createMember, getMember, listMembers, setMemberArchived, updateMember,
} from '../../server/services/members'

function input(values: Partial<MemberFormValues> = {}) {
  return memberInputSchema.parse({ firstName: 'Juan', lastName: 'Dela Cruz', phone: '09171234567', ...values })
}

const firstPage = { archived: false, page: 1 }

describe('member service', () => {
  it('creates and reads a member, omitting empty optional fields', async () => {
    const created = await createMember(input({ email: 'JUAN@Example.com', address: '' }))
    const found = await getMember(created.id)

    expect(found).toMatchObject({ firstName: 'Juan', email: 'juan@example.com', archived: false })
    expect(found).not.toHaveProperty('address', expect.anything())
  })

  it('returns null for a member that does not exist', async () => {
    expect(await getMember('0123456789abcdef01234567')).toBeNull()
  })

  it('clears optional fields that are left empty on update', async () => {
    const created = await createMember(input({ notes: 'Knee injury', email: 'juan@example.com' }))
    const updated = await updateMember(created.id, input({ notes: '', firstName: 'John' }))

    expect(updated?.firstName).toBe('John')
    expect(updated?.notes).toBeUndefined()
    expect(updated?.email).toBeUndefined()
  })

  it('sorts by last name, then first name, ignoring case', async () => {
    await createMember(input({ firstName: 'Ana', lastName: 'santos' }))
    await createMember(input({ firstName: 'Ben', lastName: 'Abad' }))
    await createMember(input({ firstName: 'Carl', lastName: 'Santos' }))

    const { items } = await listMembers(firstPage)
    expect(items.map(m => `${m.firstName} ${m.lastName}`)).toEqual(['Ben Abad', 'Ana santos', 'Carl Santos'])
  })

  it('matches every search word against name, phone or email', async () => {
    await createMember(input({ firstName: 'Juan', lastName: 'Dela Cruz', phone: '0917 111 2222' }))
    await createMember(input({ firstName: 'Juana', lastName: 'Reyes', email: 'juana@example.com' }))
    await createMember(input({ firstName: 'Pedro', lastName: 'Cruz' }))

    const names = async (search: string) =>
      (await listMembers({ ...firstPage, search })).items.map(m => m.firstName)

    expect(await names('juan cruz')).toEqual(['Juan'])
    expect(await names('JUANA@EXAMPLE')).toEqual(['Juana'])
    expect(await names('111 2222')).toEqual(['Juan'])
    // Sorted by last name: "Cruz" before "Dela Cruz".
    expect(await names('cruz')).toEqual(['Pedro', 'Juan'])
  })

  it('treats regex characters in search as plain text', async () => {
    await createMember(input({ firstName: 'Juan' }))
    const result = await listMembers({ ...firstPage, search: '.*' })
    expect(result.total).toBe(0)
  })

  it('separates active and archived members, and restores them', async () => {
    const active = await createMember(input({ firstName: 'Active' }))
    const archived = await createMember(input({ firstName: 'Archived' }))
    await setMemberArchived(archived.id, true)

    expect((await listMembers(firstPage)).items.map(m => m.id)).toEqual([active.id])
    expect((await listMembers({ archived: true, page: 1 })).items.map(m => m.id)).toEqual([archived.id])

    const restored = await setMemberArchived(archived.id, false)
    expect(restored?.archived).toBe(false)
    expect((await listMembers(firstPage)).total).toBe(2)
  })

  it('paginates with a fixed page size and reports the total', async () => {
    for (let i = 0; i < MEMBER_PAGE_SIZE + 5; i++) {
      await createMember(input({ lastName: `Member ${String(i).padStart(2, '0')}` }))
    }

    const page1 = await listMembers(firstPage)
    const page2 = await listMembers({ archived: false, page: 2 })
    expect(page1).toMatchObject({ total: MEMBER_PAGE_SIZE + 5, page: 1, pageSize: MEMBER_PAGE_SIZE })
    expect(page1.items).toHaveLength(MEMBER_PAGE_SIZE)
    expect(page2.items.map(m => m.lastName)).toEqual(['Member 20', 'Member 21', 'Member 22', 'Member 23', 'Member 24'])
  })

  it('returns null when archiving a member that does not exist', async () => {
    expect(await setMemberArchived('0123456789abcdef01234567', true)).toBeNull()
  })
})
