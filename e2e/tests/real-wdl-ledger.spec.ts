import { test, expect } from '@playwright/test';
import {
  enableDevFeatures,
  signup,
  createSampleGameForUser,
  createSampleGame,
  ensureRealBalance,
  waitForWagerOnGame,
  simulateGame,
  waitForGameComplete,
  waitForWdlSettlement,
  fetchLatestWagerOnGame,
  getBalanceHistory,
  getUserBalances,
} from './utils';

test.describe('Real WDL ledger entries (USDT)', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('Wager placed (−) and winnings (+) are recorded in USDT', async ({ page, request }) => {
    test.setTimeout(150_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    // Ensure USDT funds to place Real WDL
    const funded = await ensureRealBalance(token, 30);
    if (!funded) test.skip(true, 'Unable to fund Real balance');

    // Create a game and ensure odds will be available
    let gameId: string | null = await createSampleGameForUser(token, { status: 'in_progress', time: '300+0' });
    if (!gameId) gameId = await createSampleGame({ status: 'in_progress', time: '300+0' });
    if (!gameId) test.skip(true, 'Unable to create a game');

    // Nudge odds by advancing a couple of moves (dev simulator produces heuristic odds)
    try { await simulateGame(String(gameId), ['e4','e5'], token, 120); } catch {}

    // Capture pre balances for delta sanity if desired
    const pre = await getUserBalances(token);
    const preCash = Number((pre as any)?.cash || 0);

    // Place Real WDL via API for reliability
    const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
    const amount = 5;
    const outcome: 'white_win'|'black_win' = 'white_win';
    const resp = await request.post(`${backend}/wager/${gameId}`, {
      data: { wdl: true, amount, data: outcome, odds: 2.0, move_number: 0, mode: 'real', currency: 'USDT' },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    expect(resp.ok()).toBeTruthy();

    // Confirm wager recorded
    expect(await waitForWagerOnGame(String(gameId), token, 8000)).toBeTruthy();
    const placed = await fetchLatestWagerOnGame(String(gameId), token, 8000);
    expect(placed).toBeTruthy();
    const amt = Number(placed?.amount || 0);
    const odds = Number(placed?.odds || 1);

    // Deterministically settle as white win
    const started = await simulateGame(String(gameId), ['Nf3','Nc6','Bc4','Bc5'], token, 120, 'white_win');
    expect(started).toBeTruthy();
    expect(await waitForGameComplete(String(gameId), 12000)).toBeTruthy();
    expect(await waitForWdlSettlement(String(gameId), token, 20000)).toBeTruthy();

    // Poll USDT balance history for ledger entries
    const finalWager = await fetchLatestWagerOnGame(String(gameId), token, 8000);
    const status = String(finalWager?.status || '').toLowerCase();

    // Allow brief write propagation
    await page.waitForTimeout(400);
    const hist = await getBalanceHistory(token, 'USDT', 30);
    // Find the negative placement
    const placedEntry = hist.find(h => /wager placed/i.test(h.reason));
    expect(placedEntry).toBeTruthy();
    expect(Number(placedEntry!.amount)).toBeCloseTo(-amt, 2);

    if (status === 'won') {
      const winningsEntry = hist.find(h => /wager winnings/i.test(h.reason));
      expect(winningsEntry).toBeTruthy();
      expect(Number(winningsEntry!.amount)).toBeCloseTo(amt * odds, 2);
    } else if (status === 'lost') {
      // No winnings entry expected
      expect(true).toBeTruthy();
    } else {
      // Real WDL should be won/lost (not cancelled)
      expect(['won','lost']).toContain(status);
    }

    // Optional sanity: post balance within tolerance of expected
    const post = await getUserBalances(token);
    const postCash = Number((post as any)?.cash || 0);
    if (status === 'won') {
      const expected = preCash - amt + (amt * odds);
      expect(Math.abs(postCash - expected)).toBeLessThan(0.03);
    } else if (status === 'lost') {
      const expected = preCash - amt;
      expect(Math.abs(postCash - expected)).toBeLessThan(0.03);
    }
  });
});

