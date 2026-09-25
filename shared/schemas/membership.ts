import { z } from 'zod'
import { isCalendarDate } from '../utils/date'
import { MEMBERSHIP_PLANS } from '../utils/membership'

// The expiry date is never accepted from the client; the server calculates it (BR-P2).
export const membershipInputSchema = z.object({
  plan: z.enum(MEMBERSHIP_PLANS, { error: 'Choose a plan.' }),
  startDate: z
    .string({ error: 'Choose a start date.' })
    .refine(isCalendarDate, { error: 'Choose a valid start date.' }),
})

export type MembershipInput = z.output<typeof membershipInputSchema>
