/** Relative expiry wording for follow-up lists, e.g. "Expires in 3 days", "Expired yesterday". */
export function describeExpiry(daysLeft: number): string {
  if (daysLeft === 0) return 'Expires today'
  if (daysLeft === 1) return 'Expires tomorrow'
  if (daysLeft > 1) return `Expires in ${daysLeft} days`
  if (daysLeft === -1) return 'Expired yesterday'
  return `Expired ${-daysLeft} days ago`
}
