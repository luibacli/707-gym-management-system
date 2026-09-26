import { describe, expect, it } from 'vitest'
import { describeExpiry, greetingFor } from '../../app/utils/format'

describe('describeExpiry', () => {
  it.each([
    [0, 'Expires today'],
    [1, 'Expires tomorrow'],
    [5, 'Expires in 5 days'],
    [-1, 'Expired yesterday'],
    [-12, 'Expired 12 days ago'],
  ])('%i → %s', (days, text) => {
    expect(describeExpiry(days)).toBe(text)
  })
})

describe('greetingFor (Asia/Manila, UTC+8)', () => {
  it.each([
    ['2026-01-01T23:30:00Z', 'Good morning'], // 07:30 Manila
    ['2026-01-02T03:59:00Z', 'Good morning'], // 11:59
    ['2026-01-02T04:00:00Z', 'Good afternoon'], // 12:00
    ['2026-01-02T09:59:00Z', 'Good afternoon'], // 17:59
    ['2026-01-02T10:00:00Z', 'Good evening'], // 18:00
    ['2026-01-02T15:30:00Z', 'Good evening'], // 23:30
  ])('%s → %s', (iso, text) => {
    expect(greetingFor(new Date(iso))).toBe(text)
  })
})
