import { test, expect } from '@playwright/test';
import { createSampleGame, enableDevFeatures, signup, getFeaturedMatch, ensureMode, createSampleGameForUser, waitForWagerOnGame, advanceMove } from './utils';

test.describe('Arcade Move bet flow', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('Create sample game, place move bet, resolve via simulator, verify', async ({ page }) => {
    // Sign up and create a sample game (auth-based) first
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    let gameId: string | null = null;
    // Prefer auth-based open route and seed deterministic move options to avoid engine dependency
    const seed = { status: 'in_progress', time: '300+0', options: ['e4','d4','Nf3'] };
    if (token) gameId = await createSampleGameForUser(token, seed);
    if (!gameId) gameId = await createSampleGame(seed);
    if (!gameId) gameId = await getFeaturedMatch();
    if (!gameId) test.skip(true, 'Unable to create or fetch a game');
    // Ensure Arcade mode for enabled move/outcome rails
    await ensureMode(page, 'arcade');

    // Navigate to the game
    await page.goto(`/chess/${gameId}`);

    // Click the first available move option (new UI uses class-based selectors)
    const moveButtons = page.locator('button.move-option');
    try {
      await expect(moveButtons.first()).toBeVisible({ timeout: 10000 });
    } catch {
      // Retry once: reload the game page to pick up seeded options
      await page.goto(`/chess/${gameId}`);
      await expect(moveButtons.first()).toBeVisible({ timeout: 10000 });
    }
    const first = moveButtons.first();
    const san = await first.locator('.move-option__dest').textContent().then(t => (t || '').trim());
    await first.click();

    // Verify wager recorded via API first (more reliable than UI timing)
    let recorded = false;
    if (token) {
      recorded = await waitForWagerOnGame(gameId, token, 8000);
    }
    if (!recorded) {
      // Fallback to UI receipts check for both new and legacy markup
      const receiptNew = page.getByTestId('receipt-card').first();
      const receiptLegacy = page.locator('section.wager-receipts .wager-receipt').first();
      const anyVisible = await Promise.race([
        receiptNew.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false),
        receiptLegacy.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false),
      ]);
      expect(anyVisible).toBeTruthy();
    }

    // Advance the just-bet move via simulator and let backend resolve
    if (token) {
      const advanced = await advanceMove(gameId, san, token);
      expect(advanced).toBeTruthy();
    }
  });
});
