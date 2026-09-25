import { membershipInputSchema } from '#shared/schemas/membership'
import { updateMembership } from '../../../../services/memberships'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const memberId = getIdParam(event, 'Member not found.')
  const membershipId = getIdParam(event, 'Membership not found.', 'membershipId')
  const input = await validateBody(event, membershipInputSchema)

  const result = await updateMembership(memberId, membershipId, input)
  if (!result.ok) throwMembershipError(result)

  return result.membership
})
