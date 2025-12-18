import { test, expect } from '@playwright/test';
import { createSampleGame, enableDevFeatures, signup, getFeaturedMatch, createSampleGameForUser, simulateGame, waitForWdlSettlement, waitForGameComplete, getUserBalances, fetchLatestWagerOnGame } from './utils';

async function toggleToReal(page) {
  const toggle = page.getByTestId('mode-toggle');
  await toggle.waitFor({ state: 'visible' });
  // Two-tap arming logic in NavBar: click twice within 1.5s
  await toggle.click();
  await toggle.click();
}

test.describe('Real WDL bet flow', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

test('Toggle to Real, faucet credit, place WDL bet, settle deterministically @smoke', async ({ page }) => {
    test.setTimeout(120_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    let gameId: string | null = null;
    if (token) gameId = await createSampleGameForUser(token);
    if (!gameId) gameId = await createSampleGame();
    if (!gameId) gameId = await getFeaturedMatch();
    if (!gameId) test.skip(true, 'Unable to create or fetch a game');

    // Go to wallet and ensure Real mode (USDT) using the header toggle only (no reloads)
    await page.goto('/wallet');
    const toggle = page.getByTestId('mode-toggle');
    await toggle.first().waitFor({ state: 'visible', timeout: 5000 });
    const label = page.locator('[data-testid="mode-toggle"] .mode-label, [data-testid="mode-toggle"] .mode-chip').first();
    const text = ((await label.textContent()) || '').toUpperCase();
    if (!text.includes('USDT')) {
      await toggle.first().click();
      await page.waitForTimeout(120);
      await toggle.first().click();
    }
    // Faucet credit (best-effort) so Real buttons are enabled
    const faucetBtn = page.getByTestId('wallet-faucet-btn').first();
    if (await faucetBtn.count()) {
      await faucetBtn.scrollIntoViewIfNeeded().catch(() => {});
      await faucetBtn.click({ timeout: 2000 }).catch(() => {});
      await page.locator('.wallet-banner').waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
    }

    // Place a Real WDL bet
    const token2 = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token2) test.skip(true, 'No auth token');
    const pre = await getUserBalances(token2);
    await page.goto(`/chess/${gameId}`);
    await page.waitForSelector('.move-outcome-rail-column', { timeout: 5000 });
    let whiteBtn = page.locator('button.move-outcome-rail__button--white:not([disabled])');
    let blackBtn = page.locator('button.move-outcome-rail__button--black:not([disabled])');
    if ((await whiteBtn.count()) === 0 && (await blackBtn.count()) === 0) {
      // If both disabled (insufficient balance or wrong mode), faucet again and retry once
      await page.goto('/wallet');
      const faucetBtn2 = page.getByTestId('wallet-faucet-btn');
      if (await faucetBtn2.count()) { await faucetBtn2.click().catch(() => {}); }
      await page.goto(`/chess/${gameId}`);
      await page.waitForSelector('.move-outcome-rail-column', { timeout: 15000 });
      whiteBtn = page.locator('button.move-outcome-rail__button--white:not([disabled])');
      blackBtn = page.locator('button.move-outcome-rail__button--black:not([disabled])');
    }
    let chosen: 'white_win' | 'black_win' | null = null;
    if (await whiteBtn.count()) { await whiteBtn.first().click(); chosen = 'white_win'; }
    else if (await blackBtn.count()) { await blackBtn.first().click(); chosen = 'black_win'; }
    else test.skip(true, 'No enabled outcome buttons');
    const successEither = page.locator('button.move-outcome-rail__button.state-success');
    await successEither.first().waitFor({ state: 'visible', timeout: 1500 }).catch(() => {});

    // Verify wager recorded via API (more reliable than UI timing)
    // token2 already obtained above
    // Confirm that the bet is recorded via API (or fallback to UI receipt)
    const { waitForWagerOnGame } = await import('./utils');
    let recorded = await waitForWagerOnGame(String(gameId), token2, 8000);
    if (!recorded) {
      const receiptNew = page.getByTestId('receipt-card').first();
      const receiptLegacy = page.locator('section.wager-receipts .wager-receipt').first();
      const anyVisible = await Promise.race([
        receiptNew.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false),
        receiptLegacy.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false),
      ]);
      recorded = anyVisible;
    }
    expect(recorded).toBeTruthy();

    // Deterministically complete the game via simulator; choose a fixed outcome (white win)
    // Provide a short SAN sequence to advance clocks/position
    const started = await simulateGame(String(gameId), ['e4','e5','Nf3','Nc6'], token2, 150, 'white_win');
    expect(started).toBeTruthy();

    // Wait for game to complete (dev simulator broadcasts game_over)
    const completed = await waitForGameComplete(String(gameId), 8000);
    expect(completed).toBeTruthy();

    // Wait for settlement to appear in wager history (case-insensitive status)
    const settled = await waitForWdlSettlement(String(gameId), token2, 20000);
    expect(settled).toBeTruthy();

    // Assert balance delta equals expectation based on odds and outcome
    const finalWager = await fetchLatestWagerOnGame(String(gameId), token2!, 8000);
    expect(finalWager).toBeTruthy();
    const amount = Number(finalWager?.amount || 0);
    const odds = Number(finalWager?.odds || 1);
    const status = String(finalWager?.status || '').toLowerCase();
    const post = await getUserBalances(token2!);
    expect(post).not.toBeNull();
    const preCash = Number((pre as any)?.cash || 0);
    const postCash = Number((post as any)?.cash || 0);
    if (status === 'won') {
      const expected = preCash - amount + (amount * odds);
      expect(Math.abs(postCash - expected)).toBeLessThan(0.02);
    } else if (status === 'lost') {
      const expected = preCash - amount;
      expect(Math.abs(postCash - expected)).toBeLessThan(0.02);
    } else {
      // WDL in Real should not be CANCELLED
      expect(['won','lost']).toContain(status);
    }
  });
});
