import { describe, expect, it } from 'vitest'
import {
  formatCalendarDate, fromCalendarDate, isCalendarDate, toCalendarDate, todayInGymTimeZone,
} from '../../shared/utils/date'

describe('calendar dates (ADR-006)', () => {
  it('accepts real dates only', () => {
    expect(isCalendarDate('2024-02-29')).toBe(true)
    expect(isCalendarDate('2025-02-29')).toBe(false)
    expect(isCalendarDate('2025-13-01')).toBe(false)
    expect(isCalendarDate('2025-1-01')).toBe(false)
    expect(isCalendarDate('')).toBe(false)
  })

  it('round-trips between picker dates and calendar dates', () => {
    expect(toCalendarDate(fromCalendarDate('1990-03-05'))).toBe('1990-03-05')
    expect(toCalendarDate(new Date(2025, 0, 9))).toBe('2025-01-09')
  })

  it('formats without shifting the day', () => {
    expect(formatCalendarDate('1990-03-05')).toBe('Mar 5, 1990')
    expect(formatCalendarDate('2025-12-31')).toBe('Dec 31, 2025')
  })

  it('uses the Manila date for "today" (BR-P5)', () => {
    // 2025-06-30 17:00 UTC is already July 1 in Manila (UTC+8).
    expect(todayInGymTimeZone(new Date('2025-06-30T17:00:00Z'))).toBe('2025-07-01')
    expect(todayInGymTimeZone(new Date('2025-06-30T15:59:00Z'))).toBe('2025-06-30')
  })
})
