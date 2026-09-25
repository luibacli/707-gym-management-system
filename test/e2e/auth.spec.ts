import { expect, test, type Page } from '@playwright/test'

// Interact only after Vue has hydrated; earlier clicks trigger a native form submit.
async function gotoHydrated(page: Page, path: string) {
  await page.goto(path)
  await page.waitForFunction(() => !!(document.querySelector('#__nuxt') as { __vue_app__?: unknown } | null)?.__vue_app__)
}

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
    const email = process.env.E2E_STAFF_EMAIL
    const password = process.env.E2E_STAFF_PASSWORD
    test.skip(!email || !password, 'Set E2E_STAFF_EMAIL and E2E_STAFF_PASSWORD to run this test.')

    await gotoHydrated(page, '/login')
    await page.getByLabel('Email').fill(email!)
    await page.getByLabel('Password', { exact: true }).fill(password!)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

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
