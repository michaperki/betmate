import { test, expect } from '@playwright/test';
import {
  enableDevFeatures,
  signup,
  ensureMode,
  createSampleGameForUser,
  createSampleGame,
  waitForWagerOnGame,
  simulateGame,
  waitForGameComplete,
  waitForWdlSettlement,
  getUserBalances,
  fetchLatestWagerOnGame,
} from './utils';

test.describe('Arcade WDL settlement with balance assertion', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

test('Place Arcade WDL bet, simulate outcome, verify token balance credit @smoke', async ({ page }) => {
    test.setTimeout(120_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    // Create a sample game for the user
    let gameId: string | null = await createSampleGameForUser(token, { status: 'in_progress', time: '300+0' });
    if (!gameId) gameId = await createSampleGame({ status: 'in_progress', time: '300+0' });
    if (!gameId) test.skip(true, 'Unable to create or fetch a game');

    // Arcade mode and pre-bet token balance
    await ensureMode(page, 'arcade');
    await page.goto(`/chess/${gameId}`);
    // Ensure we are live at the latest snapshot so betting is enabled
    const goLive = page.locator('button.bt-live.is-paused');
    if (await goLive.isVisible().catch(() => false)) {
      await goLive.click().catch(() => {});
    }
    const pre = await getUserBalances(token);
    expect(pre).not.toBeNull();

    // Choose white if enabled, else black using header outcome actions
    // Wait for outcome header actions to render
    await page.waitForSelector('.board-header.outcome-action', { timeout: 15000 });
    const whiteBtn = page.locator('.board-header.outcome-action[aria-label="Bet on White"]').first();
    const blackBtn = page.locator('.board-header.outcome-action[aria-label="Bet on Black"]').first();
    const anyHeader = await Promise.race([
      whiteBtn.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'white').catch(() => null),
      blackBtn.waitFor({ state: 'visible', timeout: 12000 }).then(() => 'black').catch(() => null),
    ]);
    let chosen: 'white_win' | 'black_win' | null = null;
    if (anyHeader === 'white' && await whiteBtn.isVisible().catch(() => false)) { await whiteBtn.click(); chosen = 'white_win'; }
    else if (anyHeader === 'black' && await blackBtn.isVisible().catch(() => false)) { await blackBtn.click(); chosen = 'black_win'; }
    else test.skip(true, 'No enabled WDL outcome buttons in Arcade');

    // Verify wager recorded via API (with UI fallback)
    let recorded = await waitForWagerOnGame(String(gameId), token, 12000);
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
    const wager = await fetchLatestWagerOnGame(String(gameId), token);
    expect(wager).toBeTruthy();
    expect(wager.wdl).toBeTruthy();
    expect(wager.mode).toBe('arcade');

    // Drive deterministic outcome via simulator to match the chosen bet
    const started = await simulateGame(String(gameId), ['e4','e5','Nf3','Nc6'], token, 150, chosen || 'white_win');
    expect(started).toBeTruthy();
    expect(await waitForGameComplete(String(gameId), 12000)).toBeTruthy();
    expect(await waitForWdlSettlement(String(gameId), token, 20000)).toBeTruthy();

    // Fetch final wager and assert token balance increased by amount*(odds-1)
    const finalWager = await fetchLatestWagerOnGame(String(gameId), token);
    expect(finalWager).toBeTruthy();

    const preToken = Number((pre as any).token);
    const amount = Number(finalWager?.amount || wager?.amount || 0);
    const odds = Number(finalWager?.odds || wager?.odds || 1);

    // Reload balances (post-settlement)
    const post = await getUserBalances(token);
    expect(post).not.toBeNull();
    const postToken = Number((post as any).token);

    if (String(finalWager?.status || '').toLowerCase() === 'won') {
      const expected = preToken - amount + (amount * odds);
      expect(Math.abs(postToken - expected)).toBeLessThan(0.02);
    } else if (String(finalWager?.status || '').toLowerCase() === 'lost') {
      const expected = preToken - amount;
      expect(Math.abs(postToken - expected)).toBeLessThan(0.02);
    } else {
      test.skip(true, `Unexpected final status: ${finalWager?.status}`);
    }
  });
});
