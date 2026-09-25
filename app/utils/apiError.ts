import type { ApiErrorData, FieldErrors } from '#shared/types/api'

interface FetchErrorLike {
  statusCode?: number
  data?: { message?: string, data?: ApiErrorData }
}

function asFetchError(error: unknown): FetchErrorLike {
  return typeof error === 'object' && error !== null ? (error as FetchErrorLike) : {}
}

/** User-facing message for a failed API call (ADR-003). Never shows server internals. */
export function getApiErrorMessage(error: unknown): string {
  const { statusCode, data } = asFetchError(error)
  if (!statusCode) {
    return 'Unable to reach the server. Check your connection and try again.'
  }
  if (statusCode >= 500 || !data?.message) {
    return 'Something went wrong. Please try again.'
  }
  return data.message
}

/** Field errors from a VALIDATION_ERROR response, if any. */
export function getApiFieldErrors(error: unknown): FieldErrors {
  return asFetchError(error).data?.data?.fieldErrors ?? {}
}
