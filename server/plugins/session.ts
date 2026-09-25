// Runs whenever the app loads the session (SSR page loads and useUserSession().fetch()).
// An invalid session is rejected here, so the page renders as signed out and the
// auth middleware redirects to /login.
export default defineNitroPlugin(() => {
  sessionHooks.hook('fetch', async (session, event) => {
    if (session.user && !(await isValidStaffSession(session.user.id, session.loggedInAt))) {
      await clearUserSession(event)
      throw apiError(401, 'UNAUTHENTICATED', 'Please sign in to continue.')
    }
  })
})
