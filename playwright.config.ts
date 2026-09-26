import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

if (existsSync('.env')) {
  process.loadEnvFile('.env')
}

// E2E runs its own dev server on a separate port so it never reuses a server
// connected to the dev database. With E2E_MONGODB_URI set, it uses the e2e
// database (ADR-007); otherwise tests that write data are skipped.
const PORT = 3100
const e2eDatabase = process.env.E2E_MONGODB_URI

export default defineConfig({
  testDir: './test/e2e',
  globalSetup: './test/e2e/global-setup.ts',
  // The flow tests make many round-trips to a remote database (Atlas); 30s is too tight in parallel runs.
  timeout: 60_000,
  // Assertions after a save wait for API round-trips to the remote database.
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      // Allow running alongside a normal `pnpm dev` session.
      NUXT_IGNORE_LOCK: '1',
      ...(e2eDatabase ? { NUXT_MONGODB_URI: e2eDatabase } : {}),
    },
  },
})
