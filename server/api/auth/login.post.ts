import { loginSchema } from '#shared/schemas/auth'
import { User } from '../../models/User'

// Verified against when no user matches, so response time doesn't reveal whether an email exists.
let dummyHash: string | undefined

export default defineEventHandler(async (event) => {
  const { email, password } = await validateBody(event, loginSchema)

  const user = await User.findOne({ email }).select('+passwordHash name email active')

  dummyHash ??= await hashPassword('dummy-password-for-timing')
  const passwordValid = await verifyPassword(user?.passwordHash ?? dummyHash, password)

  if (!user || !user.active || !passwordValid) {
    throw apiError(401, 'UNAUTHENTICATED', 'Incorrect email or password.')
  }

  const sessionUser = { id: user.id as string, name: user.name, email: user.email }
  await replaceUserSession(event, { user: sessionUser, loggedInAt: Date.now() })

  return sessionUser
})
