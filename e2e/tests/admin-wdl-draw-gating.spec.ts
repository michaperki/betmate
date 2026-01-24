import { test, expect, request as playwrightRequest } from '@playwright/test';
import { signup, createSampleGameForUser, createSampleGame, ensureRealBalance } from './utils';

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

test.describe('Admin toggles: disableWdl and disableDraw', () => {
  test('disableWdl rejects any Real WDL bet', async ({ page, request }) => {
    const adminKey = process.env.E2E_ADMIN_KEY || 'dev-admin-key';
    const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
    const ok = await setRiskOverrides({ disableWdl: true });
    if (!ok) test.skip(true, 'Admin risk config not available');
    try {
      await signup(page);
      const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
      if (!token) test.skip(true, 'No auth token');
      // Create a simple game
      let gameId: string | null = await createSampleGameForUser(token, { status: 'in_progress', time: '300+0' });
      if (!gameId) gameId = await createSampleGame({ status: 'in_progress', time: '300+0' });
      if (!gameId) test.skip(true, 'Unable to create a game');
      await ensureRealBalance(token, 25);
      const resp = await request.post(`${backend}/wager/${gameId}`, {
        data: { wdl: true, amount: 5, data: 'white_win', odds: 2.0, move_number: 0, mode: 'real', currency: 'USDT' },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      expect(resp.status()).toBe(403);
      const json = await resp.json();
      expect(String(json?.error || '').toLowerCase()).toContain('disabled');
    } finally {
      await resetRiskOverrides();
    }
  });

  test('disableDraw rejects Real WDL draw bet', async ({ page, request }) => {
    const ok = await setRiskOverrides({ disableDraw: true });
    if (!ok) test.skip(true, 'Admin risk config not available');
    try {
      await signup(page);
      const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
      if (!token) test.skip(true, 'No auth token');
      let gameId: string | null = await createSampleGameForUser(token, { status: 'in_progress', time: '300+0' });
      if (!gameId) gameId = await createSampleGame({ status: 'in_progress', time: '300+0' });
      if (!gameId) test.skip(true, 'Unable to create a game');
      await ensureRealBalance(token, 25);

      const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
      const resp = await request.post(`${backend}/wager/${gameId}`, {
        data: { wdl: true, amount: 5, data: 'draw', odds: 2.5, move_number: 0, mode: 'real', currency: 'USDT' },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      expect(resp.status()).toBe(403);
      const json = await resp.json();
      expect(String(json?.error || '').toLowerCase()).toContain('draw');
    } finally {
      await resetRiskOverrides();
    }
  });
});

