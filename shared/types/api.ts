// Error contract for all API routes (ADR-003).
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'

export type FieldErrors = Record<string, string[]>

export interface ApiErrorData {
  code: ApiErrorCode
  fieldErrors?: FieldErrors
}
