import { test, expect, request as playwrightRequest } from '@playwright/test';
import { signup, createSampleGameForUser, createSampleGame } from './utils';

test.describe('Admin Real-mode gating (server-side)', () => {
  test('Disabling Real mode rejects Real WDL bets (403)', async ({ page, request }) => {
    const adminKey = process.env.E2E_ADMIN_KEY || 'dev-admin-key';
    const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
    const ctx = await playwrightRequest.newContext();

    // Try to disable Real mode; if unauthorized, skip
    const setOff = await ctx.put(`${backend}/admin/features`, {
      data: { realModeEnabled: false },
      headers: { 'X-Admin-Key': adminKey, 'Content-Type': 'application/json' },
    });
    if (!setOff.ok()) test.skip(true, `Admin features not available (${setOff.status()})`);

    try {
      await signup(page);
      const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
      if (!token) test.skip(true, 'No auth token');
      let gameId: string | null = await createSampleGameForUser(token);
      if (!gameId) gameId = await createSampleGame();
      if (!gameId) test.skip(true, 'Unable to create a game');

      const resp = await request.post(`${backend}/wager/${gameId}`, {
        data: { wdl: true, amount: 5, data: 'white_win', odds: 2.0, move_number: 0, mode: 'real', currency: 'USDT' },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      expect(resp.status()).toBe(403);
      const json = await resp.json();
      expect(String(json?.error || '').toLowerCase()).toContain('disabled');
    } finally {
      await ctx.put(`${backend}/admin/features`, {
        data: { realModeEnabled: true },
        headers: { 'X-Admin-Key': adminKey, 'Content-Type': 'application/json' },
      }).catch(() => {});
    }
  });
});

