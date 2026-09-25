// UX only: redirects based on session state. Authorization is enforced server-side (ADR-001).
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (to.path === '/login') {
    return loggedIn.value ? navigateTo('/') : undefined
  }
  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
