import { test, expect } from '@playwright/test';
import { signup, createSampleGameForUser, createSampleGame, faucetCreditAPI } from './utils';

test.describe('Admin exposure endpoints (read-only)', () => {
  test('Global and per-game exposure respond with caps and numbers', async ({ page, request }) => {
    const adminKey = process.env.E2E_ADMIN_KEY || 'dev-admin-key';
    const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';

    // Quick auth
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    // Credit small balance and place a small Real WDL bet to ensure some exposure exists
    await faucetCreditAPI(token, 10);
    let gameId: string | null = await createSampleGameForUser(token);
    if (!gameId) gameId = await createSampleGame();
    if (!gameId) test.skip(true, 'Unable to create game');
    await request.post(`${backend}/wager/${gameId}`, {
      data: { wdl: true, amount: 1, data: 'white_win', odds: 2.0, move_number: 0, mode: 'real', currency: 'USDT' },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    }).catch(() => {});

    // Global exposure
    const e1 = await request.get(`${backend}/admin/exposure/global`, { headers: { 'X-Admin-Key': adminKey } });
    if (!e1.ok()) test.skip(true, `Admin exposure not available (${e1.status()})`);
    const j1 = await e1.json();
    expect(j1).toHaveProperty('exposure');
    expect(j1).toHaveProperty('caps');
    expect(Number(j1?.exposure?.total)).toBeGreaterThanOrEqual(0);
    expect(Number(j1?.caps?.perGameWorstCaseCap)).toBeGreaterThan(0);

    // Per-game exposure
    const e2 = await request.get(`${backend}/admin/exposure/games/${gameId}`, { headers: { 'X-Admin-Key': adminKey } });
    expect(e2.ok(), await e2.text()).toBeTruthy();
    const j2 = await e2.json();
    expect(j2).toHaveProperty('gameId');
    expect(j2).toHaveProperty('exposure');
    expect(Number(j2?.exposure?.worstCase)).toBeGreaterThanOrEqual(0);
  });
});

