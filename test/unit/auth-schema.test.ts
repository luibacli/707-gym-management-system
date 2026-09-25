import { describe, expect, it } from 'vitest'
import { loginSchema, staffPasswordSchema } from '../../shared/schemas/auth'

describe('loginSchema', () => {
  it('trims and lowercases the email', () => {
    const result = loginSchema.parse({ email: '  Staff@707Gym.COM ', password: 'x' })
    expect(result.email).toBe('staff@707gym.com')
  })

  it('rejects an invalid email with a user-facing message', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'x' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('Enter a valid email address.')
  })

  it('requires a password', () => {
    const result = loginSchema.safeParse({ email: 'staff@707gym.com', password: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['password'])
  })
})

describe('staffPasswordSchema', () => {
  it('requires at least 8 characters', () => {
    expect(staffPasswordSchema.safeParse('1234567').success).toBe(false)
    expect(staffPasswordSchema.safeParse('12345678').success).toBe(true)
  })
})
