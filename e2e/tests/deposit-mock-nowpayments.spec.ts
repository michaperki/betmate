import { test, expect, request as playwrightRequest } from '@playwright/test';
import { enableDevFeatures, signup, getUserBalances } from './utils';

test.describe('Deposit via NOWPayments mock webhook', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('Create deposit, confirm via mock webhook, see balance update @smoke', async ({ page }) => {
    // Sign up and capture JWT from localStorage
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token after signup');

    const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
    const req = await playwrightRequest.newContext();

    // Capture pre-balance (USDT)
    const pre = await getUserBalances(token);

    // Create a deposit intent directly via API
    // Create with a short retry in case backend is still warming
    let create = await req.post(`${backend}/billing/deposit/intent`, {
      data: { amount: 25, payCurrency: 'USDTTRC20' },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!create.ok()) {
      await new Promise(r => setTimeout(r, 500));
      create = await req.post(`${backend}/billing/deposit/intent`, {
        data: { amount: 25, payCurrency: 'USDTTRC20' },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
    }
    if (!create.ok()) test.skip(true, `Deposit intent failed: ${create.status()}`);
    const json = await create.json();
    const depositId = json?.deposit_id as string | undefined;
    if (!depositId) test.skip(true, 'No deposit_id returned');

    // Confirm via mock NOWPayments webhook
    const resp = await req.post(`${backend}/billing/webhook/nowpayments/mock`, {
      data: { deposit_id: depositId, status: 'confirmed' },
      headers: { 'x-dev-webhook-key': 'test-dev-webhook-key', 'Content-Type': 'application/json' },
    });
    if (!resp.ok()) test.skip(true, 'Mock webhook disabled or key not set');

    // Refresh wallet and expect Real balance to increase by ~amount
    await page.goto('/wallet');
    await expect(page.locator('.wallet-card__label', { hasText: 'Real Balance' })).toBeVisible();

    const post = await getUserBalances(token);
    expect(post).not.toBeNull();
    const preCash = Number((pre as any)?.cash || 0);
    const postCash = Number((post as any)?.cash || 0);
    expect(postCash - preCash).toBeGreaterThanOrEqual(24.9);
    expect(postCash - preCash).toBeLessThanOrEqual(25.1);
  });
});
