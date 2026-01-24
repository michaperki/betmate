import { test, expect } from '@playwright/test';
import { enableDevFeatures, signup, ensureMode, createSampleGameForUser, createSampleGame, simulateGame, simulateGameSequence, waitForGameComplete, waitForWagerOnGame, waitForMoveSettlement, waitForWdlSettlement } from './utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sequences = require('../assets/sample_sequences.json');

test.describe('Sample Game Stream (Scholar\'s Mate)', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('Play Scholar\'s Mate at human speed; move + WDL settlements', async ({ page }) => {
    // Sign up and create a sample game with seeded initial options so move buttons show immediately
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    let gameId: string | null = null;
    const seed = { status: 'in_progress', time: '300+0', options: ['e4','d4','Nf3','c4'] };
    if (token) gameId = await createSampleGameForUser(token, seed);
    if (!gameId) gameId = await createSampleGame(seed);
    if (!gameId) test.skip(true, 'Unable to create sample game');

    // Ensure Arcade mode and open the game page
    await ensureMode(page, 'arcade');
    await page.goto(`/chess/${gameId}`);

    // Place a move bet: prefer 'e4' if present, otherwise click the first visible option
    const moveButtons = page.locator('button.move-option');
    await expect(moveButtons.first()).toBeVisible({ timeout: 10000 });
    let san = 'e4';
    let placedMoveBet = false;
    const e4Btn = moveButtons.filter({ has: page.locator('.move-option__dest', { hasText: 'e4' }) }).first();
    if (await e4Btn.count()) {
      await e4Btn.click();
      san = 'e4';
      placedMoveBet = true;
    } else {
      // Skip move bet if e4 not available to keep the stream deterministic
      placedMoveBet = false;
    }

    // Also place a small WDL bet in Real mode (server accepts regardless of current odds)
    // Force Real via storage for reliability, faucet if available, then return to game and click an outcome
    await page.goto('/wallet');
    await page.evaluate(() => window.localStorage.setItem('betmate.mode', 'real'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    const faucetBtn = page.getByTestId('wallet-faucet-btn').first();
    if (await faucetBtn.count()) {
      await faucetBtn.scrollIntoViewIfNeeded().catch(() => {});
      await faucetBtn.click({ timeout: 2000 }).catch(() => {});
      await page.locator('.wallet-banner').waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
    }
    await page.goto(`/chess/${gameId}`);
    let placedWdl = false;
    const whiteBtn = page.locator('button.move-outcome-rail__button--white:not([disabled])').first();
    const blackBtn = page.locator('button.move-outcome-rail__button--black:not([disabled])').first();
    if (await whiteBtn.count()) {
      await whiteBtn.click();
      placedWdl = true;
    } else if (await blackBtn.count()) {
      await blackBtn.click();
      placedWdl = true;
    }
    await page.locator('button.move-outcome-rail__button.state-success').first().waitFor({ state: 'visible', timeout: 1200 }).catch(() => {});

    // Best-effort: confirm wager recorded via API or fallback to a quick UI receipt check
    if (token && placedMoveBet) {
      const recorded = await waitForWagerOnGame(gameId, token, 3000);
      if (!recorded) {
        const receiptNew = page.getByTestId('receipt-card').first();
        const receiptLegacy = page.locator('section.wager-receipts .wager-receipt').first();
        await Promise.race([
          receiptNew.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {}),
          receiptLegacy.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {}),
        ]);
      }
    }

    // Start a short simulation at ~400ms per move, then finalize white win
    // Ensure the first simulated SAN matches the wagered move for deterministic settlement
    const replyMap: Record<string, string> = { e4: 'e5', d4: 'd5', Nf3: 'Nf6', c4: 'c5' };
    const reply = replyMap[san] || 'e5';
    // Use full Scholar's Mate at human speed; if first SAN isn't e4, splice it in and follow with early sequence
    const baseSeq: string[] = (sequences?.scholars_mate as string[]) || ["e4","e5","Qh5","Nc6","Bc4","Nf6","Qxf7#"];
    const moves = (san === 'e4') ? baseSeq : [san, reply, ...baseSeq.slice(2)];
    if (token) {
      const started = await simulateGame(gameId, moves, token, 550, 'white_win');
      expect(started).toBeTruthy();
    }

    // Wait for the first move settlement (e4)
    if (token && placedMoveBet) {
      const moveSettled = await waitForMoveSettlement(gameId, token, san, 20000);
      expect(moveSettled).toBeTruthy();
    }

    // Wait for game to complete and WDL settlement
    const completed = await waitForGameComplete(gameId, 20000);
    expect(completed).toBeTruthy();
    if (token && placedWdl) {
      const wdlSettled = await waitForWdlSettlement(gameId, token, 30000);
      expect(wdlSettled).toBeTruthy();
    }
  });
});
