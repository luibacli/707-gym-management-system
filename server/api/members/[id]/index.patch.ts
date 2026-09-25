import { memberInputSchema } from '#shared/schemas/member'
import { updateMember } from '../../../services/members'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getIdParam(event, 'Member not found.')
  const input = await validateBody(event, memberInputSchema)
  const member = await updateMember(id, input)
  if (!member) throw apiError(404, 'NOT_FOUND', 'Member not found.')
  return member
})
