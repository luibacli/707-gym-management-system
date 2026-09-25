import { getDashboardSummary } from '../services/dashboard'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  return getDashboardSummary()
})
