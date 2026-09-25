import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { memberInputSchema, memberListQuerySchema } from '../../shared/schemas/member'
import { todayInGymTimeZone } from '../../shared/utils/date'

const valid = { firstName: ' Juan ', lastName: 'Dela Cruz', phone: '+63 917 123 4567' }

function fieldErrors(values: Record<string, unknown>) {
  const result = memberInputSchema.safeParse(values)
  return result.success ? {} : z.flattenError(result.error).fieldErrors
}

describe('memberInputSchema (BR-M1)', () => {
  it('requires first name, last name, and phone', () => {
    expect(Object.keys(fieldErrors({})).sort()).toEqual(['firstName', 'lastName', 'phone'])
  })

  it('trims text and treats empty optional fields as not set', () => {
    const result = memberInputSchema.parse({ ...valid, email: '', address: '   ', notes: '' })
    expect(result.firstName).toBe('Juan')
    expect(result.email).toBeUndefined()
    expect(result.address).toBeUndefined()
  })

  it('validates phone numbers loosely', () => {
    expect(fieldErrors({ ...valid, phone: '(02) 8123-4567' })).toEqual({})
    expect(fieldErrors({ ...valid, phone: '12345' })).toHaveProperty('phone')
    expect(fieldErrors({ ...valid, phone: '0917-abc-4567' })).toHaveProperty('phone')
    expect(fieldErrors({ ...valid, emergencyContactPhone: 'call me' })).toHaveProperty('emergencyContactPhone')
  })

  it('lowercases a valid email and rejects an invalid one', () => {
    expect(memberInputSchema.parse({ ...valid, email: 'Juan@Example.COM' }).email).toBe('juan@example.com')
    expect(fieldErrors({ ...valid, email: 'juan@' })).toHaveProperty('email')
  })

  it('accepts a real past birth date and rejects invalid or future dates', () => {
    expect(fieldErrors({ ...valid, birthDate: '1990-03-05' })).toEqual({})
    expect(fieldErrors({ ...valid, birthDate: todayInGymTimeZone() })).toEqual({})
    expect(fieldErrors({ ...valid, birthDate: '1990-02-30' })).toHaveProperty('birthDate')
    expect(fieldErrors({ ...valid, birthDate: '2999-01-01' })).toHaveProperty('birthDate')
  })

  it('limits field lengths', () => {
    expect(fieldErrors({ ...valid, notes: 'x'.repeat(1001) })).toHaveProperty('notes')
  })
})

describe('memberListQuerySchema', () => {
  it('defaults to active members, page 1, no search', () => {
    expect(memberListQuerySchema.parse({})).toEqual({ archived: false, page: 1, search: undefined })
  })

  it('parses query-string values', () => {
    expect(memberListQuerySchema.parse({ archived: 'true', page: '3', search: ' juan ' }))
      .toEqual({ archived: true, page: 3, search: 'juan' })
  })

  it('rejects invalid pages', () => {
    expect(memberListQuerySchema.safeParse({ page: '0' }).success).toBe(false)
    expect(memberListQuerySchema.safeParse({ page: 'abc' }).success).toBe(false)
  })
})
