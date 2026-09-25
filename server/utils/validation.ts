import type { H3Event } from 'h3'
import { z } from 'zod'

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
  if (!result.success) {
    throw apiError(400, 'VALIDATION_ERROR', 'Please check the highlighted fields.', {
      fieldErrors: z.flattenError(result.error).fieldErrors as Record<string, string[]>,
    })
  }
  return result.data
}
