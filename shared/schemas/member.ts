import { z } from 'zod'
import { isCalendarDate, todayInGymTimeZone } from '../utils/date'

// BR-M1. The same schema validates the form (client) and the request body (server).

const PHONE = /^[\d\s()+-]{7,20}$/
const PHONE_MESSAGE = 'Enter a valid phone number (7–20 digits, spaces, +, - or parentheses).'

/** Optional text: empty input is stored as "not set". */
function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, { error: `Must be ${max} characters or fewer.` })
    .optional()
    .transform(value => value || undefined)
}

function requiredText(label: string, max: number) {
  return z
    .string({ error: `Enter ${label}.` })
    .trim()
    .min(1, { error: `Enter ${label}.` })
    .max(max, { error: `Must be ${max} characters or fewer.` })
}

export const memberInputSchema = z.object({
  firstName: requiredText('a first name', 100),
  lastName: requiredText('a last name', 100),
  phone: z
    .string({ error: 'Enter a phone number.' })
    .trim()
    .min(1, { error: 'Enter a phone number.' })
    .regex(PHONE, { error: PHONE_MESSAGE }),
  email: optionalText(254).refine(
    value => value === undefined || z.email().safeParse(value).success,
    { error: 'Enter a valid email address.' },
  ).transform(value => value?.toLowerCase()),
  birthDate: optionalText(10)
    .refine(value => value === undefined || isCalendarDate(value), { error: 'Enter a valid date.' })
    .refine(value => value === undefined || value <= todayInGymTimeZone(), { error: 'Birth date can’t be in the future.' }),
  address: optionalText(300),
  emergencyContactName: optionalText(100),
  emergencyContactPhone: optionalText(20)
    .refine(value => value === undefined || PHONE.test(value), { error: PHONE_MESSAGE }),
  notes: optionalText(1000),
})

export type MemberInput = z.output<typeof memberInputSchema>
export type MemberFormValues = z.input<typeof memberInputSchema>

export const memberListQuerySchema = z.object({
  search: z.string().trim().max(100).optional().transform(value => value || undefined),
  archived: z.enum(['true', 'false']).optional().transform(value => value === 'true'),
  page: z.coerce.number().int().min(1).optional().default(1),
})

export type MemberListQuery = z.output<typeof memberListQuerySchema>

export const MEMBER_PAGE_SIZE = 20
