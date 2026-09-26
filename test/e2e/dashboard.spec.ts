import { expect, test } from '@playwright/test'
import { hasE2eDatabase, hasStaffAccount, signIn, uniqueLastName } from './helpers'

test('dashboard API requires a staff session', async ({ request }) => {
  const response = await request.get('/api/dashboard')
  expect(response.status()).toBe(401)
})

test.describe('dashboard', () => {
  test.skip(!hasE2eDatabase || !hasStaffAccount, 'Set E2E_MONGODB_URI, E2E_STAFF_EMAIL and E2E_STAFF_PASSWORD.')

  test('shows status counts that link to the filtered member list', async ({ page }, testInfo) => {
    await signIn(page)

    // Ensure at least one expired member exists.
    const lastName = uniqueLastName(testInfo.project.name)
    const member = await (await page.request.post('/api/members', {
      data: { firstName: 'Old', lastName, phone: '09171234567' },
    })).json()
    await page.request.post(`/api/members/${member.id}/memberships`, { data: { plan: 'monthly', startDate: '2020-01-01' } })

    await page.reload()
    const summary = page.getByRole('list', { name: 'Membership summary' })
    for (const label of ['Total members', 'Active', 'Near expiry', 'Expired']) {
      await expect(summary.getByRole('link', { name: new RegExp(`^${label}`) })).toBeVisible()
    }

    const counts = await (await page.request.get('/api/dashboard')).json()
    await expect(summary.getByRole('link', { name: /^Expired/ })).toContainText(String(counts.expired))

    await summary.getByRole('link', { name: /^Expired/ }).click()
    await expect(page).toHaveURL(/\/members\?status=expired$/)
    await expect(page.getByRole('combobox', { name: 'Filter by status' })).toContainText('Expired')

    await page.getByRole('searchbox', { name: 'Search members' }).fill(lastName)
    const row = page.getByRole('row', { name: new RegExp(lastName) })
    await expect(row.getByText('Expired', { exact: true })).toBeVisible()

    // Other statuses are filtered out.
    const statusCells = page.locator('tbody tr').getByText(/^(Active|Near expiry|No membership)$/)
    await expect(statusCells).toHaveCount(0)
  })

  test('"Renew" on an expiring member opens the renewal dialog', async ({ page }, testInfo) => {
    await signIn(page)
    const lastName = uniqueLastName(testInfo.project.name)
    const member = await (await page.request.post('/api/members', {
      data: { firstName: 'Soon', lastName, phone: '09171234567' },
    })).json()
    const today = await page.evaluate(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date()))
    // A monthly membership that started 28 days ago expires within the next 3 days.
    const start = new Date(`${today}T00:00:00Z`)
    start.setUTCDate(start.getUTCDate() - 28)
    await page.request.post(`/api/members/${member.id}/memberships`, {
      data: { plan: 'monthly', startDate: start.toISOString().slice(0, 10) },
    })

    await page.reload()
    await page.getByRole('link', { name: `Renew Soon ${lastName}` }).click()
    const dialog = page.getByRole('dialog', { name: 'Renew membership' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Monthly' })).toHaveAttribute('aria-pressed', 'true')
    await dialog.getByRole('button', { name: 'Renew' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('listitem').filter({ hasText: 'Scheduled' })).toHaveCount(1)
  })
})
