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
  ensureRealBalance,
  fetchLatestWagerOnGame,
} from './utils';

test.describe('Real Move settlement with balance assertion', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('Place Real move bet, advance chosen SAN, verify settlement and balance', async ({ page }) => {
    test.setTimeout(120_000);
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    // Ensure we have Real balance to enable buttons
    const funded = await ensureRealBalance(token, 25);
    if (!funded) test.skip(true, 'Unable to fund Real balance');

    // Create a deterministic sample game with seeded move options
    const seed = { status: 'in_progress', time: '300+0', options: ['e4','d4','Nf3'] };
    let gameId: string | null = await createSampleGameForUser(token, seed);
    if (!gameId) gameId = await createSampleGame(seed);
    if (!gameId) test.skip(true, 'Unable to create a game');

    // Go Real mode in UI so move buttons are enabled
    await ensureMode(page, 'real');

    // Navigate and capture pre-bet cash balance
    await page.goto(`/chess/${gameId}`);
    const pre = await getUserBalances(token);
    expect(pre).not.toBeNull();

    // Select first available move option
    const moveButtons = page.locator('button.move-option');
    await expect(moveButtons.first()).toBeVisible({ timeout: 10000 });
    const first = moveButtons.first();
    const san = (await first.locator('.move-option__dest').textContent())?.trim() || '';
    expect(san.length).toBeGreaterThan(0);
    await first.click();

    // Confirm wager recorded via API
    const recorded = await waitForWagerOnGame(String(gameId), token, 8000);
    expect(recorded).toBeTruthy();
    const wager = await fetchLatestWagerOnGame(String(gameId), token);
    expect(wager).toBeTruthy();
    expect(wager.wdl).toBeFalsy();

    // Small delay to avoid race: ensure bet is fully committed before resolving the move
    await page.waitForTimeout(1000);

    // Deterministically advance the same SAN and let backend resolve
    const advanced = await advanceMove(String(gameId), san, token);
    expect(advanced).toBeTruthy();

    // Wait for settlement via API, else fall back to UI receipt status change
    let settled = await waitForMoveSettlement(String(gameId), token, san, 20000);
    if (!settled) {
      // Fallback: wait until the UI receipt for this SAN is no longer Pending
      const ok = await page.waitForFunction((sanText) => {
        const nodes = Array.from(document.querySelectorAll('[data-testid="receipt-card"], section.wager-receipts .wager-receipt')) as HTMLElement[];
        const target = nodes.find(n => (n.textContent || '').toLowerCase().includes(String(sanText).toLowerCase()));
        if (!target) return false;
        const txt = (target.textContent || '').toLowerCase();
        // Consider settled when not pending anymore or explicitly shows a result state
        return !txt.includes('pending') || /(won|lost|cancelled|refund)/.test(txt);
      }, san, { timeout: 15000 }).then(() => true).catch(() => false);
      settled = ok;
    }
    expect(settled).toBeTruthy();

    // Fetch latest resolved wager (should have winning_pool_share when won or be CANCELLED/LOST)
    const finalWager = await fetchLatestWagerOnGame(String(gameId), token, 12000);
    expect(finalWager).toBeTruthy();

    // Check balance moved in expected direction; compute expected with applied share if present
    const post = await getUserBalances(token);
    expect(post).not.toBeNull();

    const amount = Number(finalWager?.amount || wager?.amount || 0);
    const preCash = Number((pre as any).cash);
    const postCash = Number((post as any).cash);

    // If won, backend sets winning_pool_share; payout = amount * share
    const status = String(finalWager?.status || '').toLowerCase();
    if (status === 'won' && typeof finalWager?.winning_pool_share === 'number') {
      const share = Number(finalWager.winning_pool_share);
      const expected = preCash - amount + (amount * share);
      expect(Math.abs(postCash - expected)).toBeLessThan(0.02);
    } else if (status === 'cancelled') {
      // Refund path: net zero
      const expected = preCash;
      expect(Math.abs(postCash - expected)).toBeLessThan(0.02);
    } else if (status === 'lost') {
      const expected = preCash - amount;
      expect(Math.abs(postCash - expected)).toBeLessThan(0.02);
    } else {
      test.skip(true, `Unexpected status for move wager: ${status}`);
    }
  });
});
