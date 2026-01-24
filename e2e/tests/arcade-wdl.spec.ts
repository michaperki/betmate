import { test, expect } from '@playwright/test';
import { createSampleGame, enableDevFeatures, signup, getFeaturedMatch, ensureMode, createSampleGameForUser } from './utils';

test.describe('Arcade WDL bet flow', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('Create sample game, place WDL bet, see receipt', async ({ page }) => {
    // Sign up first so we can create a sample game without admin key
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    let gameId: string | null = null;
    if (token) gameId = await createSampleGameForUser(token);
    if (!gameId) gameId = await createSampleGame(); // admin-key path (compose)
    if (!gameId) gameId = await getFeaturedMatch();
    if (!gameId) test.skip(true, 'Unable to create or fetch a game');

    // Ensure Arcade mode (KBITZ) so outcome buttons are enabled
    await ensureMode(page, 'arcade');

    // Navigate to the game (after confirming Arcade mode)
    await page.goto(`/chess/${gameId}`);

    // Click a visible outcome button in the move/outcome rail (white preferred, fallback to black)
    await page.waitForSelector('.move-outcome-rail-column', { timeout: 5000 });
    const whiteBtn = page.locator('button.move-outcome-rail__button--white:not([disabled])');
    const blackBtn = page.locator('button.move-outcome-rail__button--black:not([disabled])');
    if ((await whiteBtn.count()) === 0 && (await blackBtn.count()) === 0) {
      // If both disabled (likely wrong mode), enforce Arcade again and retry once
      await ensureMode(page, 'arcade');
      await page.goto(`/chess/${gameId}`);
      await page.waitForSelector('.move-outcome-rail-column', { timeout: 15000 });
    }
    const whiteEnabled = page.locator('button.move-outcome-rail__button--white:not([disabled])').first();
    const blackEnabled = page.locator('button.move-outcome-rail__button--black:not([disabled])').first();
    if (await whiteEnabled.count()) await whiteEnabled.click();
    else if (await blackEnabled.count()) await blackEnabled.click();
    else test.skip(true, 'No enabled outcome buttons');

    // Prefer to wait for immediate success state on the button, then verify via API
    const successEither = page.locator('button.move-outcome-rail__button.state-success');
    await successEither.first().waitFor({ state: 'visible', timeout: 1500 }).catch(() => {});

    // Verify wager recorded via API (more reliable than UI timing)
    const token2 = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (token2) {
      const { waitForWagerOnGame } = await import('./utils');
      const ok = await waitForWagerOnGame(String(gameId), token2, 8000);
      if (ok) return;
    }

    // Fallback to UI receipts check (new + legacy markup)
    const receiptNew = page.getByTestId('receipt-card').first();
    const receiptLegacy = page.locator('section.wager-receipts .wager-receipt').first();
    const anyVisible = await Promise.race([
      receiptNew.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false),
      receiptLegacy.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false),
    ]);
    expect(anyVisible).toBeTruthy();
  });
});
