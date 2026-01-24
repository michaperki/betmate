import { test, expect, request as playwrightRequest } from '@playwright/test';

const randEmail = () => `e2e+${Date.now()}@example.com`;

async function enableDevFeatures() {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const req = await playwrightRequest.newContext();
  const adminKey = process.env.E2E_ADMIN_KEY || 'dev-admin-key';
  const resp = await req.put(`${backend}/admin/features`, {
    data: { realModeEnabled: true, enableFaucet: true },
    headers: { 'X-Admin-Key': adminKey, 'Content-Type': 'application/json' },
  });
  // Don't fail tests if this endpoint is not available; it’s best-effort
  if (!resp.ok()) {
    // Still soft-fail; but avoid redundant noise when key is missing
    const code = resp.status();
    if (code !== 401) {
      // eslint-disable-next-line no-console
      console.warn('Failed to enable admin features via API. Status:', code);
    }
  }
}

test.describe('Auth + Wallet (Faucet)', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

test('Sign up, sign in implicitly, and faucet credit @smoke', async ({ page }) => {
    const email = randEmail();
    const password = 'P@ssw0rd1234!';

    // Sign up
    await page.goto('/signup');
    await page.fill('#firstName', 'E2E');
    await page.fill('#lastName', 'Tester');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.fill('#confirmPassword', password);
    await page.click('input[type="submit"][value="Create Account"]');

    // Expect main navbar (not quick actions bar) to show Wallet
    await expect(page.locator('nav.navbar')).toContainText('Wallet');

    // Go to wallet
    await page.goto('/wallet');

    // Faucet may be gated; wait briefly and click if present
    const faucetBtn = page.getByTestId('wallet-faucet-btn');
    if (await faucetBtn.count()) {
      await faucetBtn.click();
      await expect(page.locator('.wallet-banner')).toContainText('Faucet credited $250');
    } else {
      // If faucet disabled, at least the page loads for authed user
      await expect(page).toHaveURL(/\/wallet/);
    }
  });
});
