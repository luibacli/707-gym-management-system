import { expect, type Page } from '@playwright/test'

export const staffEmail = process.env.E2E_STAFF_EMAIL
export const staffPassword = process.env.E2E_STAFF_PASSWORD
export const hasStaffAccount = !!staffEmail && !!staffPassword
export const hasE2eDatabase = !!process.env.E2E_MONGODB_URI

// Interact only after Vue has hydrated; earlier clicks trigger a native form submit.
export async function gotoHydrated(page: Page, path: string) {
  await page.goto(path)
  await page.waitForFunction(() => !!(document.querySelector('#__nuxt') as { __vue_app__?: unknown } | null)?.__vue_app__)
}

export async function signIn(page: Page) {
  await gotoHydrated(page, '/login')
  await page.getByLabel('Email').fill(staffEmail!)
  await page.getByLabel('Password', { exact: true }).fill(staffPassword!)
  await page.getByRole('button', { name: 'Sign in' }).click()
  // Generous timeout: parallel workers share one dev server, and each login hashes a password.
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 20_000 })
}

/** A unique last name for test data; parallel workers can share a millisecond. */
export function uniqueLastName(projectName: string) {
  return `E2E${Date.now()}${Math.random().toString(36).slice(2, 8)}${projectName}`
}
