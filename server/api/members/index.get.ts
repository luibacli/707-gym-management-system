import { memberListQuerySchema } from '#shared/schemas/member'
import { listMembers } from '../../services/members'

export default defineApiHandler(async (event) => {
  await requireStaff(event)
  const query = validateQuery(event, memberListQuerySchema)
  return listMembers(query)
})
