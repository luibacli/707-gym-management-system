import type { ApiErrorCode, ApiErrorData } from '#shared/types/api'

/** Builds an error in the ADR-003 format. `message` must be safe to show to users. */
export function apiError(
  statusCode: number,
  code: ApiErrorCode,
  message: string,
  extra: Omit<ApiErrorData, 'code'> = {},
) {
  return createError({
    statusCode,
    message,
    data: { code, ...extra } satisfies ApiErrorData,
  })
}
