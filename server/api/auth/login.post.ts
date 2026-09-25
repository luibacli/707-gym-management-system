import { loginSchema } from '#shared/schemas/auth'
import { User } from '../../models/User'
import { clearLoginFailures, getLoginBlock, recordLoginFailure } from '../../services/loginThrottle'

// Verified against when no user matches, so response time doesn't reveal whether an email exists.
let dummyHash: string | undefined

export default defineApiHandler(async (event) => {
  const { email, password } = await validateBody(event, loginSchema)
  // Direct connection IP only. Behind a proxy, configure trusted X-Forwarded-For first (docs/security.md).
  const ip = getRequestIP(event)

  const retryAfter = await getLoginBlock(email, ip)
  if (retryAfter !== null) {
    setResponseHeader(event, 'Retry-After', retryAfter)
    const minutes = Math.ceil(retryAfter / 60)
    throw apiError(
      429,
      'RATE_LIMITED',
      `Too many failed sign-in attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
    )
  }

  const user = await User.findOne({ email }).select('+passwordHash name email active')

  dummyHash ??= await hashPassword('dummy-password-for-timing')
  const passwordValid = await verifyPassword(user?.passwordHash ?? dummyHash, password)

  if (!user || !user.active || !passwordValid) {
    await recordLoginFailure(email, ip)
    throw apiError(401, 'UNAUTHENTICATED', 'Incorrect email or password.')
  }

  await clearLoginFailures(email)
  const sessionUser = { id: user.id as string, name: user.name, email: user.email }
  await replaceUserSession(event, { user: sessionUser, loggedInAt: Date.now() })

  return sessionUser
})
