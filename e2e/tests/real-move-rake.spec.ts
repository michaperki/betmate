import { test, expect } from '@playwright/test';
import { enableDevFeatures, signup, ensureMode, createSampleGameForUser, createSampleGame, getUserBalances, getAppStatus, ensureRealBalance } from './utils';
import { advanceMove } from './utils';

test.describe('Real Move rake assertion (single-winner case)', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('Winning a solo Real move bet nets -stake*rake', async ({ page }) => {
    test.setTimeout(90_000);
    const status = await getAppStatus();
    const rake = Number(status?.limits?.poolRake ?? 0.05);

    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    const funded = await ensureRealBalance(token, 25);
    if (!funded) test.skip(true, 'Unable to fund Real balance');
    const seed = { status: 'in_progress', time: '300+0', options: ['e4','d4','Nf3'] };
    let gameId: string | null = await createSampleGameForUser(token, seed);
    if (!gameId) gameId = await createSampleGame(seed);
    if (!gameId) test.skip(true, 'Unable to create game');

    await ensureMode(page, 'real');
    await page.goto(`/chess/${gameId}`);

    const pre = await getUserBalances(token);
    const preCash = Number((pre as any)?.cash || 0);

    // Robust selection of a visible move option
    const moveButtons = page.locator('button.move-option:not([aria-disabled="true"])');
    await expect(moveButtons.first()).toBeVisible({ timeout: 10000 });
    const first = moveButtons.first();
    const san = (await first.locator('.move-option__dest').first().textContent())?.trim() || '';
    expect(san).toBeTruthy();
    await first.scrollIntoViewIfNeeded().catch(() => {});
    await first.click();

    // Confirm wager recorded via API or UI before resolving the move
    const { waitForWagerOnGame } = await import('./utils');
    let recorded = await waitForWagerOnGame(String(gameId), token, 12000);
    if (!recorded) {
      // UI fallback: look for a receipt containing the SAN
      recorded = await page.waitForFunction((sanText) => {
        const nodes = Array.from(document.querySelectorAll('[data-testid="receipt-card"], section.wager-receipts .wager-receipt')) as HTMLElement[];
        return nodes.some(n => (n.textContent || '').toLowerCase().includes(String(sanText).toLowerCase()));
      }, san, { timeout: 8000 }).then(() => true).catch(() => false);
    }
    expect(recorded).toBeTruthy();

    // Give the backend a moment to commit, then play the same SAN so we are the sole winner
    await page.waitForTimeout(1000);
    const ok = await advanceMove(String(gameId), san, token);
    expect(ok).toBeTruthy();

    // Wait for UI to reflect resolution (non-pending)
    const receiptSettled = await page.waitForFunction((sanText) => {
      const nodes = Array.from(document.querySelectorAll('[data-testid="receipt-card"], section.wager-receipts .wager-receipt')) as HTMLElement[];
      const target = nodes.find(n => (n.textContent || '').toLowerCase().includes(String(sanText).toLowerCase()));
      if (!target) return false;
      const txt = (target.textContent || '').toLowerCase();
      return !txt.includes('pending');
    }, san, { timeout: 20000 }).then(() => true).catch(() => false);
    expect(receiptSettled).toBeTruthy();

    const post = await getUserBalances(token);
    const postCash = Number((post as any)?.cash || 0);
    // With only one winner and rake r, payout = amount*(1-r), net delta = -amount*r (loss of rake)
    // We can’t read amount directly here without another API call; infer by diff and rake rounding.
    const delta = postCash - preCash;
    // The delta should be negative and close to a multiple of common stakes * rake (1,2,3,5 presets).
    // We allow a small tolerance of 0.05 USDT due to rounding.
    expect(delta).toBeLessThan(0);
    const approxR = Math.abs(delta);
    // Sanity: rake should be <= stake * rake for smallest preset (>= $1)
    expect(approxR).toBeGreaterThan(0);
    // And rake fraction shouldn’t exceed the configured rake by more than rounding across a $1–$5 bet.
    expect(approxR).toBeLessThanOrEqual(5 * rake + 0.05);
  });
});
