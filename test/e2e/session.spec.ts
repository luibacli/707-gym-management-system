import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import { expect, test, type Page } from '@playwright/test'
import mongoose from 'mongoose'
import { gotoHydrated, hasE2eDatabase } from './helpers'

test('unknown API routes return a JSON 404 (ADR-003)', async ({ request }) => {
  const response = await request.get('/api/does-not-exist')
  expect(response.status()).toBe(404)
  expect((await response.json()).data.code).toBe('NOT_FOUND')
})

test.describe('session and sign-in protection', () => {
  // Creates staff accounts and login-attempt records, so only against the e2e database (ADR-007).
  test.skip(!hasE2eDatabase, 'Set E2E_MONGODB_URI.')

  let connection: mongoose.Connection
  const users = () => connection.db!.collection('users')

  test.beforeAll(async () => {
    connection = await mongoose.createConnection(process.env.E2E_MONGODB_URI!).asPromise()
  })
  test.afterAll(async () => {
    await connection.close()
  })

  async function createStaff(password: string) {
    const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@707gym.test`
    const passwordHash = await new Hash(new Scrypt({})).make(password)
    await users().insertOne({ name: 'Session Test', email, passwordHash, active: true, createdAt: new Date(), updatedAt: new Date() })
    return email
  }

  async function signInAs(page: Page, email: string, password: string) {
    await gotoHydrated(page, '/login')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 20_000 })
  }

  test('a deactivated account is sent to sign in on its next API call', async ({ page }) => {
    const email = await createStaff('correct-horse-1')
    await signInAs(page, email, 'correct-horse-1')

    await users().updateOne({ email }, { $set: { active: false } })

    // Client-side navigation: the members API returns 401 and the app redirects.
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Members' }).click()
    await expect(page).toHaveURL(/\/login\?reason=session-ended$/)
    await expect(page.getByText('Your session has ended. Please sign in again.')).toBeVisible()
  })

  test('a password change signs out existing sessions on the next page load', async ({ page }) => {
    const email = await createStaff('correct-horse-2')
    await signInAs(page, email, 'correct-horse-2')

    await users().updateOne({ email }, { $set: { passwordChangedAt: new Date() } })

    // Full page load: the session is rejected before rendering.
    await page.goto('/members')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('locks sign-in after repeated failures for one email', async ({ request }) => {
    const email = `locked-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@707gym.test`
    for (let i = 0; i < 5; i++) {
      const response = await request.post('/api/auth/login', { data: { email, password: 'wrong' } })
      expect(response.status()).toBe(401)
    }

    const blocked = await request.post('/api/auth/login', { data: { email, password: 'wrong' } })
    expect(blocked.status()).toBe(429)
    expect(Number(blocked.headers()['retry-after'])).toBeGreaterThan(0)
    const body = await blocked.json()
    expect(body.data.code).toBe('RATE_LIMITED')
    expect(body.message).toMatch(/Too many failed sign-in attempts/)
  })
})
