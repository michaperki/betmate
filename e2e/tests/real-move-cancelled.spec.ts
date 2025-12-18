import { test, expect } from '@playwright/test';
import {
  enableDevFeatures,
  signup,
  ensureMode,
  createSampleGameForUser,
  createSampleGame,
  waitForWagerOnGame,
  advanceMove,
  waitForMoveSettlement,
  getUserBalances,
  fetchLatestWagerOnGame,
  faucetCreditAPI,
} from './utils';

test.describe('Real Move CANCELLED (no winners) refund', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('Bet on move A, play move B, expect CANCELLED and refund', async ({ page }) => {
    test.setTimeout(90_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    await faucetCreditAPI(token, 100);

    // Seed a game with known move options so we can pick two different SANs
    const seed = { status: 'in_progress', time: '300+0', options: ['e4','d4','Nf3','c4'] };
    let gameId: string | null = await createSampleGameForUser(token, seed);
    if (!gameId) gameId = await createSampleGame(seed);
    if (!gameId) test.skip(true, 'Unable to create a game');

    await ensureMode(page, 'real');
    await page.goto(`/chess/${gameId}`);

    const pre = await getUserBalances(token);
    expect(pre).not.toBeNull();
    const preCash = Number((pre as any).cash);

    // Pick first available move option for the bet, and a different SAN to advance later
    const moveButtons = page.locator('button.move-option');
    await expect(moveButtons.first()).toBeVisible({ timeout: 10000 });
    const first = moveButtons.first();
    const sanBet = (await first.locator('.move-option__dest').textContent())?.trim() || '';
    await first.click();

    // Choose a different move from any visible option
    const all = await moveButtons.elementHandles();
    let sanAdvance = '';
    for (let i = 0; i < all.length; i += 1) {
      const el = moveButtons.nth(i);
      const txt = (await el.locator('.move-option__dest').textContent() || '').trim();
      if (txt && txt !== sanBet) { sanAdvance = txt; break; }
    }
    if (!sanAdvance) test.skip(true, 'Only one move option visible');

    // Confirm wager recorded (pending)
    const recorded = await waitForWagerOnGame(String(gameId), token, 8000);
    expect(recorded).toBeTruthy();

    // Advance a different SAN; since no one bet the played move, refund should occur
    const ok = await advanceMove(String(gameId), sanAdvance, token);
    expect(ok).toBeTruthy();

    // Wait for move settlement; then fetch final wager and assert CANCELLED
    const settled = await waitForMoveSettlement(String(gameId), token, undefined, 20000);
    expect(settled).toBeTruthy();
    const finalWager = await fetchLatestWagerOnGame(String(gameId), token, 8000);
    expect(finalWager).toBeTruthy();
    expect(String(finalWager?.status || '').toLowerCase()).toBe('cancelled');

    const post = await getUserBalances(token);
    const postCash = Number((post as any).cash);
    // Net zero: stake refunded
    expect(Math.abs(postCash - preCash)).toBeLessThan(0.02);
  });
});

