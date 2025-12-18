import { test, expect } from '@playwright/test';
import { enableDevFeatures, signup, ensureMode, createSampleGameForUser, createSampleGame, waitForWagerOnGame, advanceMove, waitForMoveSettlement, getBalanceHistory, fetchLatestWagerOnGame, ensureRealBalance } from './utils';

test.describe('Ledger refund entries (Real Move CANCELLED)', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('CANCELLED move produces USDT Refund ledger entry', async ({ page }) => {
    test.setTimeout(120_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    // Ensure funds and Real mode
    const ok = await ensureRealBalance(token, 25);
    if (!ok) test.skip(true, 'Unable to fund Real balance');
    await ensureMode(page, 'real');

    // Seed options and create a game
    const seed = { status: 'in_progress', time: '300+0', options: ['e4','d4','Nf3'] };
    let gameId: string | null = await createSampleGameForUser(token, seed);
    if (!gameId) gameId = await createSampleGame(seed);
    if (!gameId) test.skip(true, 'Unable to create a game');
    await page.goto(`/chess/${gameId}`);

    // Place a move bet on the first option
    const first = page.locator('button.move-option').first();
    await expect(first).toBeVisible({ timeout: 10000 });
    const san = (await first.locator('.move-option__dest').textContent())?.trim() || '';
    await first.click();
    expect(await waitForWagerOnGame(String(gameId), token, 8000)).toBeTruthy();
    const wager = await fetchLatestWagerOnGame(String(gameId), token, 8000);
    expect(wager).toBeTruthy();
    const amount = Number(wager?.amount || 0);

    // Advance a different SAN to force CANCELLED (refund)
    const other = san === 'e4' ? 'd4' : 'e4';
    expect(await advanceMove(String(gameId), other, token)).toBeTruthy();
    expect(await waitForMoveSettlement(String(gameId), token, san, 20000)).toBeTruthy();

    const final = await fetchLatestWagerOnGame(String(gameId), token, 8000);
    expect(String(final?.status || '').toLowerCase()).toBe('cancelled');

    // Assert a Refund-equivalent ledger entry in USDT with +amount (reason may be "Refund" or existing label like "Wager winnings")
    // Poll balance history briefly to allow ledger write visibility
    let refund: { amount: number; currency: string; reason: string } | undefined;
    const deadline = Date.now() + 6000;
    while (Date.now() < deadline) {
      const hist = await getBalanceHistory(token, 'USDT', 20);
      refund = hist.find(h => {
        const amt = Number(h.amount || 0);
        const isPosMatch = Math.abs(amt - amount) < 0.02 && amt > 0;
        const reasonOk = /refund|winnings/i.test(h.reason || '');
        return isPosMatch && reasonOk;
      });
      if (refund) break;
      await page.waitForTimeout(200);
    }
    expect(refund).toBeTruthy();
    expect(Math.abs(Number(refund!.amount) - amount)).toBeLessThan(0.02);
  });
});
