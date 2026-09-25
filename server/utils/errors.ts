import type { EventHandler, EventHandlerRequest, H3Event } from 'h3'
import type { ApiErrorCode, ApiErrorData } from '#shared/types/api'

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
}

/** Builds an error in the ADR-003 format. `message` must be safe to show to users. */
export function apiError(
  statusCode: number,
  code: ApiErrorCode,
  message: string,
  extra: Omit<ApiErrorData, 'code'> = {},
) {
  return createError({
    statusCode,
    statusMessage: STATUS_MESSAGES[statusCode],
    message,
    data: { code, ...extra } satisfies ApiErrorData,
  })
}

function isApiError(error: unknown): boolean {
  if (!isError(error)) return false
  const data = error.data as Partial<ApiErrorData> | undefined
  return typeof data?.code === 'string'
}

/**
 * Wraps an API route so every error follows ADR-003. Errors already built with
 * `apiError` pass through; anything unexpected is logged and returned as a
 * generic 500 INTERNAL_ERROR without internal details.
 */
export function defineApiHandler<Req extends EventHandlerRequest, Res>(
  handler: (event: H3Event<Req>) => Res | Promise<Res>,
): EventHandler<Req, Promise<Res>> {
  return defineEventHandler<Req>(async (event) => {
    try {
      return await handler(event)
    }
    catch (error) {
      if (isApiError(error)) throw error
      console.error(`[api] ${event.method} ${event.path} failed`, error)
      throw apiError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.')
    }
  })
}
