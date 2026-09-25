import { expect, test } from '@playwright/test'
import { gotoHydrated, hasE2eDatabase, hasStaffAccount, signIn, uniqueLastName } from './helpers'

test('member API requires a staff session', async ({ request }) => {
  const response = await request.get('/api/members')
  expect(response.status()).toBe(401)
  expect((await response.json()).data.code).toBe('UNAUTHENTICATED')
})

test.describe('member management', () => {
  // These tests write data, so they only run against the separate e2e database (ADR-007).
  test.skip(!hasE2eDatabase || !hasStaffAccount, 'Set E2E_MONGODB_URI, E2E_STAFF_EMAIL and E2E_STAFF_PASSWORD.')

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('returns 404 NOT_FOUND for malformed and unknown member IDs', async ({ page }) => {
    for (const id of ['not-an-id', '0123456789abcdef01234567']) {
      const response = await page.request.get(`/api/members/${id}`)
      expect(response.status()).toBe(404)
      expect((await response.json()).data.code).toBe('NOT_FOUND')
    }
  })

  test('adds, edits, archives, and restores a member', async ({ page }, testInfo) => {
    const lastName = uniqueLastName(testInfo.project.name)

    // Add: required fields are validated before submitting.
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Members' }).click()
    await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible()
    await page.getByRole('link', { name: 'Add member' }).click()
    await expect(page.getByRole('heading', { name: 'Add member' })).toBeVisible()
    await page.getByRole('button', { name: 'Add member' }).click()
    await expect(page.getByText('Enter a first name.')).toBeVisible()
    await expect(page.getByText('Enter a phone number.')).toBeVisible()

    await page.getByLabel('First name').fill('Juan')
    await page.getByLabel('Last name').fill(lastName)
    await page.getByLabel('Phone', { exact: true }).first().fill('0917 123 4567')
    await page.getByLabel('Email').fill('juan@example.com')
    await page.getByRole('button', { name: 'Add member' }).click()

    // Detail page.
    await expect(page.getByRole('heading', { name: `Juan ${lastName}` })).toBeVisible()
    await expect(page.getByText('0917 123 4567')).toBeVisible()
    await expect(page.getByText('juan@example.com')).toBeVisible()

    // Edit: change the phone and clear the email.
    await page.getByRole('link', { name: 'Edit' }).click()
    await expect(page.getByRole('heading', { name: `Edit Juan ${lastName}` })).toBeVisible()
    await page.getByLabel('Phone', { exact: true }).first().fill('0918 765 4321')
    await page.getByLabel('Email').fill('')
    await page.getByLabel('Birth date').fill('Mar 5, 1990')
    await page.getByLabel('Birth date').press('Escape')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByRole('heading', { name: `Juan ${lastName}` })).toBeVisible()
    await expect(page.getByText('0918 765 4321')).toBeVisible()
    await expect(page.getByText('juan@example.com')).toHaveCount(0)
    // Calendar dates must not shift with the browser's timezone (ADR-006).
    await expect(page.getByText('Mar 5, 1990')).toBeVisible()

    // Archive with confirmation.
    await page.getByRole('button', { name: 'Archive' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Archive' }).click()
    await expect(page.getByText('Archived', { exact: true })).toBeVisible()

    // Hidden from the active list, shown under Archived.
    await gotoHydrated(page, '/members')
    await page.getByRole('searchbox', { name: 'Search members' }).fill(lastName)
    await expect(page.getByText(`No members match “${lastName}”.`)).toBeVisible()
    await page.getByRole('button', { name: 'Archived' }).click()
    await page.getByRole('link', { name: `${lastName}, Juan` }).click()

    // Restore.
    await page.getByRole('button', { name: 'Restore' }).click()
    await expect(page.getByRole('button', { name: 'Archive' })).toBeVisible()
    await expect(page.getByText('Archived', { exact: true })).toHaveCount(0)
  })
})
