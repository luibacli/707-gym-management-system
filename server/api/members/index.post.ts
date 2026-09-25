import { memberInputSchema } from '#shared/schemas/member'
import { createMember } from '../../services/members'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const input = await validateBody(event, memberInputSchema)
  const member = await createMember(input)
  setResponseStatus(event, 201)
  return member
})
