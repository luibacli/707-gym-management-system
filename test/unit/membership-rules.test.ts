import { describe, expect, it } from 'vitest'
import {
  addDays, calculateExpiryDate, datesOverlap, daysBetween, getCurrentMembership, getMemberStatus, getMembershipStatus,
  suggestStartDate,
} from '../../shared/utils/membership'

describe('calculateExpiryDate (BR-P2, BR-P3)', () => {
  it.each([
    ['2026-01-15', 'monthly', '2026-02-15'],
    ['2026-12-15', 'monthly', '2027-01-15'],
    ['2026-01-31', 'monthly', '2026-02-28'],
    ['2028-01-31', 'monthly', '2028-02-29'],
    ['2026-03-31', 'monthly', '2026-04-30'],
    ['2026-01-15', 'annual', '2027-01-15'],
    ['2028-02-29', 'annual', '2029-02-28'],
  ] as const)('%s + %s = %s', (start, plan, expected) => {
    expect(calculateExpiryDate(start, plan)).toBe(expected)
  })
})

describe('date helpers', () => {
  it('counts days across month and year boundaries', () => {
    expect(daysBetween('2026-02-25', '2026-03-04')).toBe(7)
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1)
    expect(daysBetween('2026-01-02', '2026-01-01')).toBe(-1)
  })

  it('adds days', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('getMembershipStatus (BR-P4, BR-S2)', () => {
  const membership = { startDate: '2026-03-01', expiryDate: '2026-04-01' }

  it.each([
    ['2026-02-28', 'scheduled'],
    ['2026-03-01', 'active'],
    ['2026-03-24', 'active'], // 8 days left
    ['2026-03-25', 'near-expiry'], // 7 days left
    ['2026-04-01', 'near-expiry'], // expiry day is still active
    ['2026-04-02', 'expired'],
  ] as const)('on %s is %s', (today, expected) => {
    expect(getMembershipStatus(membership, today)).toBe(expected)
  })
})

describe('getMemberStatus (BR-S3)', () => {
  const past = { startDate: '2026-01-01', expiryDate: '2026-02-01' }
  const current = { startDate: '2026-02-02', expiryDate: '2026-03-02' }
  const future = { startDate: '2026-06-01', expiryDate: '2026-07-01' }

  it('uses the membership covering today', () => {
    expect(getMemberStatus([past, current, future], '2026-02-10')).toBe('active')
    expect(getMemberStatus([past, current], '2026-03-01')).toBe('near-expiry')
  })

  it('is expired when only past memberships cover nothing today', () => {
    expect(getMemberStatus([past], '2026-02-10')).toBe('expired')
  })

  it('ignores scheduled memberships until they start', () => {
    expect(getMemberStatus([past, future], '2026-05-01')).toBe('expired')
    expect(getMemberStatus([future], '2026-05-01')).toBe('none')
  })

  it('is "none" without memberships', () => {
    expect(getMemberStatus([], '2026-05-01')).toBe('none')
  })
})

describe('datesOverlap (BR-H2)', () => {
  const a = { startDate: '2026-01-15', expiryDate: '2026-02-15' }

  it('detects shared days, including a shared single day', () => {
    expect(datesOverlap(a, { startDate: '2026-02-01', expiryDate: '2026-03-01' })).toBe(true)
    expect(datesOverlap(a, { startDate: '2026-02-15', expiryDate: '2026-03-15' })).toBe(true)
  })

  it('allows back-to-back memberships', () => {
    expect(datesOverlap(a, { startDate: '2026-02-16', expiryDate: '2026-03-16' })).toBe(false)
  })
})

describe('suggestStartDate (BR-H3)', () => {
  it('starts the day after a membership that has not ended', () => {
    expect(suggestStartDate([{ startDate: '2026-03-01', expiryDate: '2026-04-01' }], '2026-03-20')).toBe('2026-04-02')
    expect(suggestStartDate([{ startDate: '2026-03-01', expiryDate: '2026-04-01' }], '2026-04-01')).toBe('2026-04-02')
  })

  it('starts today when the latest membership has ended or none exist', () => {
    expect(suggestStartDate([{ startDate: '2026-01-01', expiryDate: '2026-02-01' }], '2026-03-20')).toBe('2026-03-20')
    expect(suggestStartDate([], '2026-03-20')).toBe('2026-03-20')
  })
})

describe('getCurrentMembership', () => {
  const past = { startDate: '2026-01-01', expiryDate: '2026-02-01' }
  const older = { startDate: '2025-01-01', expiryDate: '2025-02-01' }
  const current = { startDate: '2026-02-02', expiryDate: '2026-03-02' }
  const future = { startDate: '2026-06-01', expiryDate: '2026-07-01' }

  it('prefers the membership covering today, else the latest past one', () => {
    expect(getCurrentMembership([future, past, current], '2026-02-10')).toBe(current)
    expect(getCurrentMembership([older, future, past], '2026-05-01')).toBe(past)
    expect(getCurrentMembership([future], '2026-05-01')).toBeUndefined()
  })
})
