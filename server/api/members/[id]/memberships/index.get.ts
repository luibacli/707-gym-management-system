import { MemberModel } from '../../../../models/Member'
import { listMemberships } from '../../../../services/memberships'

export default defineApiHandler(async (event) => {
  await requireStaff(event)
  const memberId = getIdParam(event, 'Member not found.')
  if (!(await MemberModel.exists({ _id: memberId }))) {
    throw apiError(404, 'NOT_FOUND', 'Member not found.')
  }
  return listMemberships(memberId)
})
