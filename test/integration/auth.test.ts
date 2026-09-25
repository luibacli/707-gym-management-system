import { describe, expect, it } from 'vitest'
import { User } from '../../server/models/User'
import {
  MAX_FAILURES_PER_EMAIL, MAX_FAILURES_PER_IP, clearLoginFailures, getLoginBlock, recordLoginFailure,
} from '../../server/services/loginThrottle'
import { isValidStaffSession } from '../../server/utils/requireStaff'

const at = (iso: string) => new Date(iso)

describe('login throttle', () => {
  it('blocks an email after the maximum failures within 15 minutes', async () => {
    for (let i = 0; i < MAX_FAILURES_PER_EMAIL - 1; i++) {
      await recordLoginFailure('staff@707gym.com', `10.0.0.${i}`, at('2026-01-01T10:00:00Z'))
    }
    expect(await getLoginBlock('staff@707gym.com', '10.0.0.99', at('2026-01-01T10:01:00Z'))).toBeNull()

    await recordLoginFailure('staff@707gym.com', '10.0.0.50', at('2026-01-01T10:05:00Z'))
    // Oldest counted failure (10:00) leaves the window at 10:15.
    expect(await getLoginBlock('staff@707gym.com', '10.0.0.99', at('2026-01-01T10:06:00Z'))).toBe(9 * 60)
    expect(await getLoginBlock('other@707gym.com', '10.0.0.99', at('2026-01-01T10:06:00Z'))).toBeNull()
  })

  it('unblocks once failures are older than the window', async () => {
    for (let i = 0; i < MAX_FAILURES_PER_EMAIL; i++) {
      await recordLoginFailure('staff@707gym.com', undefined, at('2026-01-01T10:00:00Z'))
    }
    expect(await getLoginBlock('staff@707gym.com', undefined, at('2026-01-01T10:14:59Z'))).toBe(1)
    expect(await getLoginBlock('staff@707gym.com', undefined, at('2026-01-01T10:15:01Z'))).toBeNull()
  })

  it('blocks an IP that fails across many emails', async () => {
    for (let i = 0; i < MAX_FAILURES_PER_IP; i++) {
      await recordLoginFailure(`user${i}@example.com`, '203.0.113.7', at('2026-01-01T10:00:00Z'))
    }
    expect(await getLoginBlock('new@example.com', '203.0.113.7', at('2026-01-01T10:01:00Z'))).not.toBeNull()
    expect(await getLoginBlock('new@example.com', '203.0.113.8', at('2026-01-01T10:01:00Z'))).toBeNull()
  })

  it('clears an email’s failures after a successful sign-in', async () => {
    for (let i = 0; i < MAX_FAILURES_PER_EMAIL; i++) {
      await recordLoginFailure('staff@707gym.com', undefined, at('2026-01-01T10:00:00Z'))
    }
    await clearLoginFailures('staff@707gym.com')
    expect(await getLoginBlock('staff@707gym.com', undefined, at('2026-01-01T10:01:00Z'))).toBeNull()
  })
})

describe('isValidStaffSession', () => {
  async function staff(fields: Partial<{ active: boolean, passwordChangedAt: Date }> = {}) {
    const user = await User.create({ name: 'Staff', email: `s${Math.random()}@707gym.com`, passwordHash: 'x', ...fields })
    return user.id as string
  }

  it('accepts an active account', async () => {
    expect(await isValidStaffSession(await staff(), Date.now())).toBe(true)
  })

  it('rejects deactivated and missing accounts', async () => {
    expect(await isValidStaffSession(await staff({ active: false }), Date.now())).toBe(false)
    expect(await isValidStaffSession('0123456789abcdef01234567', Date.now())).toBe(false)
  })

  it('rejects sessions that started before the password was changed', async () => {
    const id = await staff({ passwordChangedAt: at('2026-01-01T10:00:00Z') })
    expect(await isValidStaffSession(id, at('2026-01-01T09:59:59Z').getTime())).toBe(false)
    expect(await isValidStaffSession(id, at('2026-01-01T10:00:01Z').getTime())).toBe(true)
    expect(await isValidStaffSession(id, undefined)).toBe(false)
  })
})
