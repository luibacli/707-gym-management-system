/**
 * useFetch for authenticated API calls. On the client it uses `$api` (401 → /login).
 * During SSR it uses useRequestFetch so the session cookie is forwarded; an invalid
 * session is already rejected before the page renders (server/plugins/session.ts).
 *
 * Built with createUseFetch so each call site keeps its own cache key.
 */
export const useApi = createUseFetch(() => ({
  $fetch: (import.meta.server ? useRequestFetch() : useNuxtApp().$api) as typeof $fetch,
}))
