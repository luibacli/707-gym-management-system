// `$api`: $fetch for authenticated API calls. On 401 (session expired, account
// deactivated, or password reset) it clears the session and sends staff to /login.
// The login page uses plain $fetch, where 401 means wrong credentials.
export default defineNuxtPlugin((nuxtApp) => {
  let redirecting = false

  const api = $fetch.create({
    async onResponseError({ response }) {
      if (response.status !== 401 || !import.meta.client || redirecting) return
      redirecting = true
      await nuxtApp.runWithContext(async () => {
        try {
          await useUserSession().clear()
        }
        finally {
          await navigateTo({ path: '/login', query: { reason: 'session-ended' } })
          redirecting = false
        }
      })
    },
  })

  return { provide: { api } }
})
