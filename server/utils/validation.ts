import type { H3Event } from 'h3'
import { z } from 'zod'

function validationError(error: z.ZodError) {
  return apiError(400, 'VALIDATION_ERROR', 'Please check the highlighted fields.', {
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
  })
}

/**
 * Reads and validates the request body. Throws a 400 VALIDATION_ERROR (ADR-003)
 * instead of h3's default validation error format.
 */
export async function validateBody<T extends z.ZodType>(event: H3Event, schema: T): Promise<z.output<T>> {
  let body: unknown
  try {
    body = await readBody(event)
  }
  catch {
    throw apiError(400, 'VALIDATION_ERROR', 'The request body is not valid JSON.')
  }

  const result = schema.safeParse(body)
  if (!result.success) throw validationError(result.error)
  return result.data
}

/** Validates the query string. Throws a 400 VALIDATION_ERROR (ADR-003). */
export function validateQuery<T extends z.ZodType>(event: H3Event, schema: T): z.output<T> {
  const result = schema.safeParse(getQuery(event))
  if (!result.success) throw validationError(result.error)
  return result.data
}
