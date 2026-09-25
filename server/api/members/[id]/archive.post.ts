import { setMemberArchived } from '../../../services/members'

// BR-M2: members are archived and restored, never deleted.
export default defineApiHandler(async (event) => {
  await requireStaff(event)
  const id = getIdParam(event, 'Member not found.')
  const member = await setMemberArchived(id, true)
  if (!member) throw apiError(404, 'NOT_FOUND', 'Member not found.')
  return member
})
