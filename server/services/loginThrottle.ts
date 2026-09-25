import { LOGIN_ATTEMPT_WINDOW_SECONDS, LoginAttemptModel } from '../models/LoginAttempt'

// Security defaults, not client requirements (docs/security.md).
export const MAX_FAILURES_PER_EMAIL = 5
export const MAX_FAILURES_PER_IP = 20

const emailKey = (email: string) => `email:${email}`
const ipKey = (ip: string) => `ip:${ip}`

async function secondsUntilAllowed(key: string, limit: number, now: Date): Promise<number | null> {
  const windowStart = new Date(now.getTime() - LOGIN_ATTEMPT_WINDOW_SECONDS * 1000)
  const recent = await LoginAttemptModel.find({ key, createdAt: { $gt: windowStart } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('createdAt')
    .lean()
  if (recent.length < limit) return null

  // Blocked until the oldest of the last `limit` failures leaves the window.
  const oldest = recent[recent.length - 1]!.createdAt.getTime()
  return Math.max(1, Math.ceil((oldest + LOGIN_ATTEMPT_WINDOW_SECONDS * 1000 - now.getTime()) / 1000))
}

/** Seconds until sign-in is allowed again, or null when not blocked. */
export async function getLoginBlock(email: string, ip: string | undefined, now = new Date()): Promise<number | null> {
  const [byEmail, byIp] = await Promise.all([
    secondsUntilAllowed(emailKey(email), MAX_FAILURES_PER_EMAIL, now),
    ip ? secondsUntilAllowed(ipKey(ip), MAX_FAILURES_PER_IP, now) : null,
  ])
  if (byEmail === null && byIp === null) return null
  return Math.max(byEmail ?? 0, byIp ?? 0)
}

export async function recordLoginFailure(email: string, ip: string | undefined, now = new Date()) {
  const docs = [{ key: emailKey(email), createdAt: now }]
  if (ip) docs.push({ key: ipKey(ip), createdAt: now })
  await LoginAttemptModel.insertMany(docs)
}

/** A successful sign-in resets the count for that email (not for the IP). */
export async function clearLoginFailures(email: string) {
  await LoginAttemptModel.deleteMany({ key: emailKey(email) })
}
