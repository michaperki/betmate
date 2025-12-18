import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:8080';
const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:9000';

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  // Allow overriding workers via env (e.g., PW_WORKERS=1)
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : undefined,
  globalSetup: require.resolve('./global-setup'),
  timeout: 60_000,
  expect: { timeout: 4000 },
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    actionTimeout: 4000,
    navigationTimeout: 10000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Expose backend URL to tests via process.env
  metadata: { BACKEND_URL },
});
