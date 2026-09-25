import type { H3Event } from 'h3'
import { User } from '../models/User'

/**
 * Authorizes a request as an active staff member (ADR-001).
 * Rechecks the database so deactivated accounts lose access immediately.
 */
export async function requireStaff(event: H3Event) {
  const session = await getUserSession(event)
  if (!session.user) {
    throw apiError(401, 'UNAUTHENTICATED', 'Please sign in to continue.')
  }

  const user = await User.findById(session.user.id).select('active').lean()
  if (!user?.active) {
    await clearUserSession(event)
    throw apiError(401, 'UNAUTHENTICATED', 'Please sign in to continue.')
  }

  return session.user
}
