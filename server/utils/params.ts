import type { H3Event } from 'h3'

const OBJECT_ID = /^[a-f\d]{24}$/i

/** Reads an `:id` route param. A malformed ID can't match a record, so it's a 404. */
export function getIdParam(event: H3Event, notFoundMessage: string): string {
  const id = getRouterParam(event, 'id')
  if (!id || !OBJECT_ID.test(id)) {
    throw apiError(404, 'NOT_FOUND', notFoundMessage)
  }
  return id
}
