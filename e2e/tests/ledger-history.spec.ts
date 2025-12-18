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
  getBalanceHistory,
} from './utils';

async function depositViaMock(token: string, usd = 25): Promise<boolean> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const key = process.env.E2E_DEV_WEBHOOK_KEY || 'test-dev-webhook-key';
  const ctx = await (await import('@playwright/test')).request.newContext();
  // Create intent
  const intent = await ctx.post(`${backend}/billing/deposit/intent`, {
    data: { amount: usd, payCurrency: 'USDTTRC20' },
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!intent.ok()) return false;
  const j = await intent.json();
  const depId = j?.deposit_id as string | undefined;
  if (!depId) return false;
  // Confirm via mock webhook
  const confirm = await ctx.post(`${backend}/billing/webhook/nowpayments/mock`, {
    data: { deposit_id: depId, status: 'confirmed' },
    headers: { 'x-dev-webhook-key': key, 'Content-Type': 'application/json' },
  });
  return confirm.ok();
}

test.describe('Ledger entries for deposits and wagers', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('Deposit (USDT) and Arcade WDL settlement (BET) create correct ledger entries', async ({ page }) => {
    test.setTimeout(120_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    // 1) Deposit USDT via mock and assert ledger "Deposit"
    const ok = await depositViaMock(token, 25);
    expect(ok).toBeTruthy();
    // Allow brief processing time
    await page.waitForTimeout(400);
    const histUSDT = await getBalanceHistory(token, 'USDT', 10);
    const dep = histUSDT.find(h => /deposit/i.test(h.reason));
    expect(dep).toBeTruthy();
    expect(Number(dep!.amount)).toBeGreaterThanOrEqual(25);

    // 2) Arcade WDL bet and settlement → assert "Wager placed" and "Wager winnings" in BET
    let gameId: string | null = await createSampleGameForUser(token, { status: 'in_progress', time: '300+0' });
    if (!gameId) gameId = await createSampleGame({ status: 'in_progress', time: '300+0' });
    if (!gameId) test.skip(true, 'Unable to create game');

    await ensureMode(page, 'arcade');
    await page.goto(`/chess/${gameId}`);

    // Choose white if available else black in Arcade
    await page.waitForSelector('.move-outcome-rail-column', { timeout: 10000 });
    const whiteBtn = page.locator('button.move-outcome-rail__button--white:not([disabled])').first();
    const blackBtn = page.locator('button.move-outcome-rail__button--black:not([disabled])').first();
    let chosen: 'white_win' | 'black_win' | null = null;
    if (await whiteBtn.count()) { await whiteBtn.click(); chosen = 'white_win'; }
    else if (await blackBtn.count()) { await blackBtn.click(); chosen = 'black_win'; }
    else test.skip(true, 'No enabled WDL outcome buttons in Arcade');

    // Confirm wager recorded and capture values
    expect(await waitForWagerOnGame(String(gameId), token, 8000)).toBeTruthy();
    const wager = await fetchLatestWagerOnGame(String(gameId), token, 8000);
    expect(wager).toBeTruthy();
    const amount = Number(wager?.amount || 0);
    const odds = Number(wager?.odds || 1);

    // Drive outcome to match chosen
    const simOk = await simulateGame(String(gameId), ['e4','e5','Nf3','Nc6'], token, 150, chosen || 'white_win');
    expect(simOk).toBeTruthy();
    expect(await waitForGameComplete(String(gameId), 12000)).toBeTruthy();
    expect(await waitForWdlSettlement(String(gameId), token, 20000)).toBeTruthy();

    // Inspect BET history for both entries
    await page.waitForTimeout(300);
    const histBET = await getBalanceHistory(token, 'BET', 20);
    const placed = histBET.find(h => /wager placed/i.test(h.reason));
    const winnings = histBET.find(h => /wager winnings/i.test(h.reason));
    expect(placed).toBeTruthy();
    expect(winnings).toBeTruthy();
    expect(Number(placed!.amount)).toBeCloseTo(-amount, 2);
    // Winnings only when win; if lost, we still assert placed existed
    const finalWager = await fetchLatestWagerOnGame(String(gameId), token, 8000);
    const status = String(finalWager?.status || '').toLowerCase();
    if (status === 'won') {
      expect(Number(winnings!.amount)).toBeCloseTo(amount * odds, 2);
    }
  });
});

