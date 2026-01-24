import { test, expect, request as playwrightRequest } from '@playwright/test';
import { signup, createSampleGameForUser, createSampleGame } from './utils';

test.describe('Insufficient funds and stake caps', () => {
  test('Real WDL via API returns 401 when funds are insufficient', async ({ page, request }) => {
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    let gameId: string | null = await createSampleGameForUser(token);
    if (!gameId) gameId = await createSampleGame();
    if (!gameId) test.skip(true, 'Unable to create a game');

    const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
    const resp = await request.post(`${backend}/wager/${gameId}`, {
      data: { wdl: true, amount: 10, data: 'white_win', odds: 2.0, move_number: 0, mode: 'real', currency: 'USDT' },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    expect(resp.status(), await resp.text()).toBe(401);
    const json = await resp.json().catch(() => ({}));
    expect(String(json?.error || '').toLowerCase()).toContain('insufficient');
  });

  test('Arcade move stake cap enforced (400) before pricing', async ({ page, request }) => {
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    // Seed options to include a known SAN
    const seed = { status: 'in_progress', time: '300+0', options: ['e4','d4','Nf3'] };
    let gameId: string | null = await createSampleGameForUser(token, seed);
    if (!gameId) gameId = await createSampleGame(seed);
    if (!gameId) test.skip(true, 'Unable to create a game');

    const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
    const resp = await request.post(`${backend}/wager/${gameId}`, {
      data: { wdl: false, amount: 100, data: 'e4', odds: 1.5, move_number: 0, mode: 'arcade', currency: 'BET' },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    expect(resp.status(), await resp.text()).toBe(400);
    const json = await resp.json().catch(() => ({}));
    expect(String(json?.error || '').toLowerCase()).toContain('stake exceeds');
  });
});

