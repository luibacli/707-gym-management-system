import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, getApiFieldErrors } from '../../app/utils/apiError'

describe('getApiErrorMessage', () => {
  it('shows the server message for client errors', () => {
    const error = { statusCode: 401, data: { message: 'Incorrect email or password.', data: { code: 'UNAUTHENTICATED' } } }
    expect(getApiErrorMessage(error)).toBe('Incorrect email or password.')
  })

  it('hides server details for 5xx errors', () => {
    const error = { statusCode: 500, data: { message: 'MongoServerError: connection refused' } }
    expect(getApiErrorMessage(error)).toBe('Something went wrong. Please try again.')
  })

  it('reports network failures when there is no status code', () => {
    expect(getApiErrorMessage(new TypeError('fetch failed'))).toMatch(/Unable to reach the server/)
  })
})

describe('getApiFieldErrors', () => {
  it('returns field errors from a validation error response', () => {
    const error = { statusCode: 400, data: { data: { code: 'VALIDATION_ERROR', fieldErrors: { email: ['Enter a valid email address.'] } } } }
    expect(getApiFieldErrors(error)).toEqual({ email: ['Enter a valid email address.'] })
  })

  it('returns an empty object for other errors', () => {
    expect(getApiFieldErrors(null)).toEqual({})
  })
})
