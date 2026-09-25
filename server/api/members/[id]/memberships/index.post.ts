import { membershipInputSchema } from '#shared/schemas/membership'
import { createMembership } from '../../../../services/memberships'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const memberId = getIdParam(event, 'Member not found.')
  const input = await validateBody(event, membershipInputSchema)

  const result = await createMembership(memberId, input)
  if (!result.ok) throwMembershipError(result)

  setResponseStatus(event, 201)
  return result.membership
})
