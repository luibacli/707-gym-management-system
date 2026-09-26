import { expect, test } from '@playwright/test'
import { gotoHydrated, hasE2eDatabase, hasStaffAccount, signIn, uniqueLastName } from './helpers'

test.describe('memberships', () => {
  // Writes data, so it only runs against the separate e2e database (ADR-007).
  test.skip(!hasE2eDatabase || !hasStaffAccount, 'Set E2E_MONGODB_URI, E2E_STAFF_EMAIL and E2E_STAFF_PASSWORD.')

  test('adds, renews, and edits memberships with status and overlap rules', async ({ page }, testInfo) => {
    await signIn(page)
    const lastName = uniqueLastName(testInfo.project.name)
    const response = await page.request.post('/api/members', {
      data: { firstName: 'Maria', lastName, phone: '09171234567' },
    })
    const member = await response.json()

    await gotoHydrated(page, `/members/${member.id}`)
    const heading = page.getByRole('heading', { name: `Maria ${lastName}` })
    await expect(heading).toBeVisible()
    await expect(page.getByText('No membership', { exact: true })).toBeVisible()
    await expect(page.getByText('No memberships yet.')).toBeVisible()

    // Add a monthly membership starting today (default).
    await page.getByRole('button', { name: 'Add membership' }).click()
    const dialog = page.getByRole('dialog', { name: 'Add membership' })
    await expect(dialog).toContainText(/Expires [A-Z][a-z]{2} \d{1,2}, \d{4}/)
    await dialog.getByRole('button', { name: 'Add membership' }).click()
    await expect(dialog).toBeHidden()
    const items = page.getByRole('listitem')
    await expect(items).toHaveCount(1)
    await expect(items.first().getByText('Active', { exact: true })).toBeVisible()

    // Renewal defaults to the day after the current expiry, so it's scheduled.
    await page.getByRole('button', { name: 'Renew' }).click()
    await page.getByRole('dialog', { name: 'Renew membership' }).getByRole('button', { name: 'Renew' }).click()
    await expect(items).toHaveCount(2)
    await expect(items.first().getByText('Scheduled', { exact: true })).toBeVisible()

    // Moving the renewal onto the current membership is rejected (BR-H2).
    await items.first().getByRole('button', { name: /^Edit / }).click()
    const editDialog = page.getByRole('dialog', { name: 'Edit membership' })
    const today = await page.evaluate(() => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'Asia/Manila' }).format(new Date()))
    await editDialog.getByLabel('Start date').fill(today)
    await editDialog.getByLabel('Start date').press('Escape')
    await editDialog.getByRole('button', { name: 'Save changes' }).click()
    await expect(editDialog.getByRole('alert')).toContainText('overlaps an existing membership')
    await editDialog.getByRole('button', { name: 'Cancel' }).click()

    // Moving the current membership into the past makes the member expired (BR-S3).
    await items.last().getByRole('button', { name: /^Edit / }).click()
    await editDialog.getByLabel('Start date').fill('Jan 1, 2020')
    await editDialog.getByLabel('Start date').press('Escape')
    await expect(editDialog).toContainText('Expires Feb 1, 2020')
    await editDialog.getByRole('button', { name: 'Save changes' }).click()
    await expect(editDialog).toBeHidden()
    await expect(items.last()).toContainText('Jan 1, 2020 – Feb 1, 2020')
    // A past period followed by a newer membership is shown as history ("Ended").
    await expect(items.last().getByText('Ended', { exact: true })).toBeVisible()
    await expect(page.locator('h1 + *').getByText('Expired', { exact: true })).toBeVisible()

    // The members list shows the status too.
    await gotoHydrated(page, '/members')
    await page.getByRole('searchbox', { name: 'Search members' }).fill(lastName)
    const row = page.getByRole('row', { name: new RegExp(lastName) })
    await expect(row.getByText('Expired', { exact: true })).toBeVisible()
  })
})
