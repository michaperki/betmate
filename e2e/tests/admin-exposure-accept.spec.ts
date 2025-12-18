import { test, expect, request as playwrightRequest } from '@playwright/test';
import {
  enableDevFeatures,
  signup,
  createSampleGameForUser,
  createSampleGame,
  ensureRealBalance,
  getUserBalances,
  waitForWagerOnGame,
  simulateGame,
  waitForGameComplete,
  waitForWdlSettlement,
  fetchLatestWagerOnGame,
} from './utils';

async function setRiskOverrides(patch: any) {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  const adminKey = process.env.E2E_ADMIN_KEY || 'dev-admin-key';
  const resp = await ctx.put(`${backend}/admin/risk/config`, {
    data: patch,
    headers: { 'X-Admin-Key': adminKey, 'Content-Type': 'application/json' },
  });
  return resp.ok();
}

async function resetRiskOverrides() {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  const adminKey = process.env.E2E_ADMIN_KEY || 'dev-admin-key';
  await ctx.post(`${backend}/admin/risk/reset`, { headers: { 'X-Admin-Key': adminKey } });
}

test.describe('Admin/risk happy-path — large Real WDL bet accepted', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('Raises caps, accepts large bet, settles correctly', async ({ page, request }) => {
    test.setTimeout(150_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    // Ensure Real balance sufficient to place a larger bet
    const funded = await ensureRealBalance(token, 80);
    if (!funded) test.skip(true, 'Unable to fund Real balance');

    // Create a fresh game and nudge odds
    let gameId: string | null = await createSampleGameForUser(token, { status: 'in_progress', time: '300+0' });
    if (!gameId) gameId = await createSampleGame({ status: 'in_progress', time: '300+0' });
    if (!gameId) test.skip(true, 'Unable to create game');
    try { await simulateGame(String(gameId), ['e4','e5'], token, 120); } catch {}

    // Loosen caps dramatically
    const ok = await setRiskOverrides({
      perBetLiabilityCap: 1e9,
      perPlayerPerGameCap: 1e9,
      perGameWorstCaseCap: 1e9,
      globalExposureCap: 1e12,
      perOutcomeCap: { white_win: 1e9, black_win: 1e9, draw: 1e9 },
      disableWdl: false,
      disableDraw: false,
    });
    if (!ok) test.skip(true, 'Admin risk config not available (missing/invalid admin key)');

    try {
      const pre = await getUserBalances(token);
      const preCash = Number((pre as any)?.cash || 0);

      const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
      const amount = 50; // large but within ensured balance
      const outcome: 'white_win'|'black_win' = 'white_win';
      const resp = await request.post(`${backend}/wager/${gameId}`, {
        data: { wdl: true, amount, data: outcome, odds: 2.0, move_number: 0, mode: 'real', currency: 'USDT' },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      expect(resp.status()).toBe(200);

      // Confirm recorded and capture odds
      expect(await waitForWagerOnGame(String(gameId), token, 8000)).toBeTruthy();
      const w0 = await fetchLatestWagerOnGame(String(gameId), token, 8000);
      expect(w0).toBeTruthy();
      const odds = Number(w0?.odds || 0);
      expect(odds).toBeGreaterThan(1);

      // Settle deterministically to chosen outcome
      const started = await simulateGame(String(gameId), ['Nf3','Nc6','Bc4','Bc5'], token, 150, 'white_win');
      expect(started).toBeTruthy();
      expect(await waitForGameComplete(String(gameId), 12000)).toBeTruthy();
      expect(await waitForWdlSettlement(String(gameId), token, 20000)).toBeTruthy();

      const wf = await fetchLatestWagerOnGame(String(gameId), token, 8000);
      const status = String(wf?.status || '').toLowerCase();
      const post = await getUserBalances(token);
      const postCash = Number((post as any)?.cash || 0);
      if (status === 'won') {
        const expected = preCash - amount + (amount * odds);
        expect(Math.abs(postCash - expected)).toBeLessThan(0.05);
      } else if (status === 'lost') {
        const expected = preCash - amount;
        expect(Math.abs(postCash - expected)).toBeLessThan(0.05);
      } else {
        expect(['won','lost']).toContain(status);
      }
    } finally {
      await resetRiskOverrides();
    }
  });
});

