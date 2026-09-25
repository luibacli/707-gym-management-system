import { getMember } from '../../../services/members'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getIdParam(event, 'Member not found.')
  const member = await getMember(id)
  if (!member) throw apiError(404, 'NOT_FOUND', 'Member not found.')
  return member
})
