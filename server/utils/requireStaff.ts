import type { H3Event } from 'h3'
import { User } from '../models/User'

/**
 * True when the session still belongs to an active staff account whose password
 * hasn't changed since the session started (ADR-001).
 */
export async function isValidStaffSession(userId: string, loggedInAt: number | undefined): Promise<boolean> {
  const user = await User.findById(userId).select('active passwordChangedAt').lean()
  if (!user?.active) return false
  if (user.passwordChangedAt && (!loggedInAt || loggedInAt < user.passwordChangedAt.getTime())) return false
  return true
}

/**
 * Authorizes a request as an active staff member (ADR-001).
 * Rechecks the database so deactivated accounts and reset passwords take effect immediately.
 */
export async function requireStaff(event: H3Event) {
  const session = await getUserSession(event)
  if (!session.user) {
    throw apiError(401, 'UNAUTHENTICATED', 'Please sign in to continue.')
  }

  if (!(await isValidStaffSession(session.user.id, session.loggedInAt))) {
    await clearUserSession(event)
    throw apiError(401, 'UNAUTHENTICATED', 'Please sign in to continue.')
  }

  return session.user
}
