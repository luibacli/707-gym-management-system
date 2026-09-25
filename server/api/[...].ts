// Unknown API routes return JSON in the ADR-003 format instead of an HTML page.
export default defineApiHandler(() => {
  throw apiError(404, 'NOT_FOUND', 'Not found.')
})
