import { expect, test } from '@playwright/test'
import { gotoHydrated, hasStaffAccount, signIn } from './helpers'

test.describe('staff sign-in', () => {
  test('redirects signed-out visitors to the login page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Staff sign in' })).toBeVisible()
  })

  test('shows an error for incorrect credentials', async ({ page }) => {
    await gotoHydrated(page, '/login')
    await page.getByLabel('Email').fill('nobody@example.com')
    await page.getByLabel('Password', { exact: true }).fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toHaveText('Incorrect email or password.')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('signs in and out with a valid staff account', async ({ page }) => {
    test.skip(!hasStaffAccount, 'Set E2E_STAFF_EMAIL and E2E_STAFF_PASSWORD to run this test.')

    await signIn(page)
    await expect(page).toHaveURL(/\/$/)

    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/login$/)
  })
})

test.describe('POST /api/auth/login contract (ADR-003)', () => {
  test('returns 400 VALIDATION_ERROR with field errors for invalid input', async ({ request }) => {
    const response = await request.post('/api/auth/login', { data: { email: 'bad', password: '' } })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.data.code).toBe('VALIDATION_ERROR')
    expect(Object.keys(body.data.fieldErrors).sort()).toEqual(['email', 'password'])
  })

  test('returns 401 UNAUTHENTICATED for unknown credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', { data: { email: 'nobody@example.com', password: 'wrong' } })
    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.data.code).toBe('UNAUTHENTICATED')
    expect(body.message).toBe('Incorrect email or password.')
  })
})
