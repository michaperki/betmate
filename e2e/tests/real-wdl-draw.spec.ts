import { test, expect } from '@playwright/test';
import { enableDevFeatures, signup, ensureMode, createSampleGameForUser, createSampleGame, waitForWagerOnGame, simulateGame, waitForGameComplete, waitForWdlSettlement, getUserBalances, fetchLatestWagerOnGame, ensureRealBalance } from './utils';

test.describe('Real WDL Draw outcome flow', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('Place Draw bet, force draw via simulator, assert balance delta with fixed odds', async ({ page }) => {
    test.setTimeout(120_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    // Create a sample game
    let gameId: string | null = await createSampleGameForUser(token);
    if (!gameId) gameId = await createSampleGame();
    if (!gameId) test.skip(true, 'Unable to create or fetch a game');

    await ensureMode(page, 'real');
    const funded = await ensureRealBalance(token, 25);
    if (!funded) test.skip(true, 'Unable to fund Real balance');
    await page.goto(`/chess/${gameId}`);
    // Ensure bottom toolbar is mounted and select a stake to enable Draw
    await page.locator('.bottom-toolbar').waitFor({ state: 'visible', timeout: 10000 });
    const firstStake = page.locator('.bottom-toolbar__center .stake-chip').first();
    if (await firstStake.isVisible().catch(() => false)) {
      await firstStake.click().catch(() => {});
      // brief delay to allow canDraw to update
      await page.waitForTimeout(150);
    }

    const pre = await getUserBalances(token);
    expect(pre).not.toBeNull();

    // Click the Draw button in the bottom toolbar (bt-draw-btn)
    // Robust selector chain: toolbar button → role/name → legacy rail fallback
    let clicked = false;
    const toolbarDraw = page.locator('.bottom-toolbar__right button.bt-draw-btn:not([disabled])').first();
    if (await toolbarDraw.isVisible({ timeout: 6000 }).catch(() => false)) {
      await toolbarDraw.click({ trial: false }).catch(() => {});
      clicked = true;
    }
    if (!clicked) {
      const roleDraw = page.getByRole('button', { name: /bet on draw|bet draw|draw/i }).first();
      if (await roleDraw.isVisible({ timeout: 2000 }).catch(() => false)) {
        await roleDraw.click().catch(() => {});
        clicked = true;
      }
    }
    if (!clicked) {
      const railDraw = page.locator('button.move-outcome-rail__button:has-text("Draw")').first();
      if (await railDraw.isVisible({ timeout: 1500 }).catch(() => false)) {
        await railDraw.click().catch(() => {});
        clicked = true;
      }
    }
    if (!clicked) test.skip(true, 'No Draw control visible in toolbar or rail');

    // Verify wager recorded via API
    const recorded = await waitForWagerOnGame(String(gameId), token, 8000);
    expect(recorded).toBeTruthy();
    const wager = await fetchLatestWagerOnGame(String(gameId), token, 8000);
    expect(wager).toBeTruthy();
    expect(wager.wdl).toBeTruthy();
    expect(String(wager.data)).toBe('draw');

    // Force a draw result via simulator with a short move sequence
    const started = await simulateGame(String(gameId), ['e4','e5','Nf3','Nc6','Bb5','a6'], token, 200, 'draw');
    expect(started).toBeTruthy();
    expect(await waitForGameComplete(String(gameId), 15000)).toBeTruthy();
    expect(await waitForWdlSettlement(String(gameId), token, 25000)).toBeTruthy();

    // Validate balance delta
    const finalWager = await fetchLatestWagerOnGame(String(gameId), token, 8000);
    expect(finalWager).toBeTruthy();
    const amount = Number(finalWager?.amount || 0);
    const odds = Number(finalWager?.odds || 1);
    const post = await getUserBalances(token);
    const preCash = Number((pre as any)?.cash || 0);
    const postCash = Number((post as any)?.cash || 0);
    const status = String(finalWager?.status || '').toLowerCase();
    expect(status).toBe('won');
    const expected = preCash - amount + (amount * odds);
    expect(Math.abs(postCash - expected)).toBeLessThan(0.02);
  });
});
