// Calendar dates are "YYYY-MM-DD" strings with no time or timezone (ADR-006).

export const GYM_TIME_ZONE = 'Asia/Manila' // BR-P5

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** True when `value` is a real calendar date in YYYY-MM-DD form (e.g. rejects 2025-02-30). */
export function isCalendarDate(value: string): boolean {
  const match = CALENDAR_DATE.exec(value)
  if (!match) return false
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

/** Today's date in the gym's timezone (BR-P5). */
export function todayInGymTimeZone(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: GYM_TIME_ZONE }).format(now)
}

/** Converts a date picked in the UI (local midnight) to a calendar date. */
export function toCalendarDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Converts a calendar date to a local-midnight Date for the date picker. */
export function fromCalendarDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number) as [number, number, number]
  return new Date(year, month - 1, day)
}

/** Formats a calendar date for display, e.g. "Mar 5, 1990". */
export function formatCalendarDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number) as [number, number, number]
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, day)))
}

/** Formats a timestamp (ISO string) as a date in the gym's timezone. */
export function formatTimestampDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: GYM_TIME_ZONE })
    .format(new Date(iso))
}
