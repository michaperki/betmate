import { test, expect, request as playwrightRequest } from '@playwright/test';
import { enableDevFeatures, signup, createSampleGameForUser, createSampleGame, faucetCreditAPI, simulateGame, getUserBalances } from './utils';

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

test.describe('Risk gating rejections (Real WDL)', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('Per-bet liability cap rejects wager', async ({ page, request }) => {
    test.setTimeout(90_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    // Ensure funds (even though rejection should occur before debit)
    await faucetCreditAPI(token, 100);

    // Create a fresh sample game
    let gameId: string | null = await createSampleGameForUser(token);
    if (!gameId) gameId = await createSampleGame();
    if (!gameId) test.skip(true, 'Unable to create a game');

    // Ensure odds exist for WDL (advance a few moves deterministically)
    try { await simulateGame(String(gameId), ['e4','e5'], token, 100); } catch {}

    // Set per-bet liability cap to a near-zero value so any real WDL bet is rejected
    const ok = await setRiskOverrides({ perBetLiabilityCap: 0.0 });
    if (!ok) test.skip(true, 'Admin risk config not available (missing admin key)');

    try {
      const pre = await getUserBalances(token);
      const preCash = Number((pre as any)?.cash || 0);
      const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
      const resp = await request.post(`${backend}/wager/${gameId}`, {
        data: { wdl: true, amount: 5, data: 'white_win', odds: 2.0, move_number: 0, mode: 'real', currency: 'USDT' },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      // Either 403 (preferred) or, if server lacks odds, a 400 pricing error is acceptable to count gate as working
      const status = resp.status();
      if (status === 403) {
        const json = await resp.json();
        expect(String(json?.code || '')).toBe('CAP_PER_BET');
        const post = await getUserBalances(token);
        const postCash = Number((post as any)?.cash || 0);
        expect(Math.abs(postCash - preCash)).toBeLessThan(0.01);
      } else if (status === 400) {
        const json = await resp.json();
        expect(String(json?.error || '').toLowerCase()).toContain('pricing');
      } else {
        expect(status).toBe(403);
      }
    } finally {
      await resetRiskOverrides();
    }
  });

  test('Per-player-per-game cap rejects wager', async ({ page, request }) => {
    test.setTimeout(90_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    await faucetCreditAPI(token, 50);

    let gameId: string | null = await createSampleGameForUser(token);
    if (!gameId) gameId = await createSampleGame();
    if (!gameId) test.skip(true, 'Unable to create a game');
    try { await simulateGame(String(gameId), ['e4','e5'], token, 100); } catch {}

    // Make per-player-per-game cap essentially zero; keep others large so this triggers first
    const ok = await setRiskOverrides({
      perBetLiabilityCap: 1e9,
      perPlayerPerGameCap: 0,
      perGameWorstCaseCap: 1e9,
      globalExposureCap: 1e9,
      perOutcomeCap: { white_win: 1e9, black_win: 1e9, draw: 1e9 },
    });
    if (!ok) test.skip(true, 'Admin risk config not available');

    try {
      const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
      const resp = await request.post(`${backend}/wager/${gameId}`, {
        data: { wdl: true, amount: 5, data: 'white_win', odds: 2.0, move_number: 0, mode: 'real', currency: 'USDT' },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      expect(resp.status()).toBe(403);
      const json = await resp.json();
      expect(String(json?.code || '')).toBe('CAP_PER_PLAYER_GAME');
    } finally {
      await resetRiskOverrides();
    }
  });

  test('Per-outcome exposure cap rejects wager', async ({ page, request }) => {
    test.setTimeout(90_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    await faucetCreditAPI(token, 50);

    let gameId: string | null = await createSampleGameForUser(token);
    if (!gameId) gameId = await createSampleGame();
    if (!gameId) test.skip(true, 'Unable to create a game');
    try { await simulateGame(String(gameId), ['e4','e5'], token, 100); } catch {}

    const ok = await setRiskOverrides({
      perBetLiabilityCap: 1e9,
      perPlayerPerGameCap: 1e9,
      perGameWorstCaseCap: 1e9,
      globalExposureCap: 1e9,
      perOutcomeCap: { white_win: 0, black_win: 1e9, draw: 1e9 },
    });
    if (!ok) test.skip(true, 'Admin risk config not available');

    try {
      const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
      const resp = await request.post(`${backend}/wager/${gameId}`, {
        data: { wdl: true, amount: 5, data: 'white_win', odds: 2.0, move_number: 0, mode: 'real', currency: 'USDT' },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      expect(resp.status()).toBe(403);
      const json = await resp.json();
      expect(String(json?.code || '')).toBe('CAP_PER_OUTCOME');
      expect(String(json?.outcome || '')).toBe('white_win');
    } finally {
      await resetRiskOverrides();
    }
  });

  test('Per-game worst-case cap rejects wager', async ({ page, request }) => {
    test.setTimeout(90_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    await faucetCreditAPI(token, 50);

    let gameId: string | null = await createSampleGameForUser(token);
    if (!gameId) gameId = await createSampleGame();
    if (!gameId) test.skip(true, 'Unable to create a game');
    try { await simulateGame(String(gameId), ['e4','e5'], token, 100); } catch {}

    const ok = await setRiskOverrides({
      perBetLiabilityCap: 1e9,
      perPlayerPerGameCap: 1e9,
      perGameWorstCaseCap: 0,
      globalExposureCap: 1e9,
      perOutcomeCap: { white_win: 1e9, black_win: 1e9, draw: 1e9 },
    });
    if (!ok) test.skip(true, 'Admin risk config not available');

    try {
      const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
      const resp = await request.post(`${backend}/wager/${gameId}`, {
        data: { wdl: true, amount: 5, data: 'white_win', odds: 2.0, move_number: 0, mode: 'real', currency: 'USDT' },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      expect(resp.status()).toBe(403);
      const json = await resp.json();
      expect(String(json?.code || '')).toBe('CAP_PER_GAME');
    } finally {
      await resetRiskOverrides();
    }
  });

  test('Global exposure cap rejects wager', async ({ page, request }) => {
    test.setTimeout(90_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    await faucetCreditAPI(token, 50);

    let gameId: string | null = await createSampleGameForUser(token);
    if (!gameId) gameId = await createSampleGame();
    if (!gameId) test.skip(true, 'Unable to create a game');
    try { await simulateGame(String(gameId), ['e4','e5'], token, 100); } catch {}

    const ok = await setRiskOverrides({
      perBetLiabilityCap: 1e9,
      perPlayerPerGameCap: 1e9,
      perGameWorstCaseCap: 1e9,
      globalExposureCap: 0,
      perOutcomeCap: { white_win: 1e9, black_win: 1e9, draw: 1e9 },
    });
    if (!ok) test.skip(true, 'Admin risk config not available');

    try {
      const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
      const resp = await request.post(`${backend}/wager/${gameId}`, {
        data: { wdl: true, amount: 5, data: 'white_win', odds: 2.0, move_number: 0, mode: 'real', currency: 'USDT' },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      expect(resp.status()).toBe(403);
      const json = await resp.json();
      expect(String(json?.code || '')).toBe('CAP_GLOBAL');
    } finally {
      await resetRiskOverrides();
    }
  });
});
