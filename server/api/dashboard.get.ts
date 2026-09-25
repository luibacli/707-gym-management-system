import { getDashboardSummary } from '../services/dashboard'

export default defineApiHandler(async (event) => {
  await requireStaff(event)
  return getDashboardSummary()
})
