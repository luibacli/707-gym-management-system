import { GYM_TIME_ZONE } from '../../shared/utils/date'

/** Relative expiry wording for follow-up lists, e.g. "Expires in 3 days", "Expired yesterday". */
export function describeExpiry(daysLeft: number): string {
  if (daysLeft === 0) return 'Expires today'
  if (daysLeft === 1) return 'Expires tomorrow'
  if (daysLeft > 1) return `Expires in ${daysLeft} days`
  if (daysLeft === -1) return 'Expired yesterday'
  return `Expired ${-daysLeft} days ago`
}

/** Time-of-day greeting in the gym's timezone (BR-P5). */
export function greetingFor(date: Date): string {
  const hour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: GYM_TIME_ZONE }).format(date))
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
