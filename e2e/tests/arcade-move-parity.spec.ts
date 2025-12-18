import { test, expect, request as playwrightRequest } from '@playwright/test';
import { enableDevFeatures, signup, ensureMode, createSampleGameForUser, createSampleGame, waitForWagerOnGame, fetchLatestWagerOnGame } from './utils';

test.describe('Arcade Move odds parity (FE vs stored wager.odds)', () => {
  test.beforeAll(async () => {
    await enableDevFeatures();
  });

  test('Displayed multiplier ≈ stored odds for seeded option', async ({ page }) => {
    await signup(page);
    const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
    if (!token) test.skip(true, 'No auth token');

    // Seed deterministic options so FE pricing renders multipliers
    const seed = { status: 'in_progress', time: '300+0', options: ['e4','d4','Nf3'] };
    let gameId: string | null = await createSampleGameForUser(token, seed);
    if (!gameId) gameId = await createSampleGame(seed);
    if (!gameId) test.skip(true, 'Unable to create a game');

    await ensureMode(page, 'arcade');
    await page.goto(`/chess/${gameId}`);
    // Ensure move options render
    await expect(page.locator('button.move-option, .move-option').first()).toBeVisible({ timeout: 10000 });
    // Prefer waiting for multiplier element as well
    await page.locator('.move-odds, .move-option__meta').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});

    // Read FE multiplier from one of the first few visible move options
    const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
    const ctx = await playwrightRequest.newContext();

    const readFromUI = async (): Promise<{ feMult: number; san: string } | null> => {
      const count = await page.locator('button.move-option, .move-option').count();
      const max = Math.min(6, count);
      for (let i = 0; i < max; i += 1) {
        const optEl = page.locator('button.move-option, .move-option').nth(i);
        const visible = await optEl.isVisible().catch(() => false);
        if (!visible) continue;
        const oddsEl = optEl.locator('.move-odds, .move-option__meta').first();
        try {
          const text = (await oddsEl.innerText()).trim();
          const m = text.match(/([0-9]+(?:\.[0-9]+)?)x/i);
          const dest = (await optEl.locator('.move-option__dest, [data-testid="move-dest"]').first().textContent() || '').trim();
          if (m && dest) {
            return { feMult: Number(m[1]), san: dest };
          }
        } catch {}
      }
      return null;
    };

    let picked = await readFromUI();
    if (!picked) {
      await page.reload();
      picked = await readFromUI();
    }
    expect(picked !== null).toBeTruthy();
    const feMult = Number((picked as any).feMult);
    const destLabel = String((picked as any).san || '');
    expect(Number.isFinite(feMult)).toBeTruthy();

    // Map the displayed dest label back to a SAN from the backend game state (fallback to dest if mapping fails)
    let san = destLabel;
    try {
      const gameResp = await ctx.get(`${backend}/chess/${gameId}`);
      if (gameResp.ok()) {
        const j = await gameResp.json();
        const offered: string[] = (j?.pool_wagers?.move?.options || []).map((s: any) => String(s));
        const match = offered.find((s) => s.toLowerCase().includes(destLabel.toLowerCase()));
        if (match) san = match;
      }
    } catch {}

    // Place Arcade move bet via API (avoids UI disabled states)
    const resp = await ctx.post(`${backend}/wager/${gameId}`, {
      data: { wdl: false, amount: 10, data: san, odds: feMult, move_number: 0, mode: 'arcade', currency: 'BET' },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!resp.ok()) {
      // Fallback: try UI click after selecting stake to enable controls
      const chip = page.locator('.bottom-toolbar__center .stake-chip').nth(1); // 25
      if (await chip.isVisible().catch(() => false)) await chip.click().catch(() => {});
      const firstOption = page.locator('button.move-option').first();
      if (await firstOption.isVisible().catch(() => false)) await firstOption.click().catch(() => {});
      // If still failing, surface server error to artifacts
      if (!await waitForWagerOnGame(String(gameId), token, 4000)) {
        const status = resp.status();
        let body = '';
        try { body = await resp.text(); } catch {}
        expect(resp.ok(), `Arcade bet API failed: ${status} ${body}`).toBeTruthy();
      }
    }

    // Confirm bet recorded and fetch wager
    expect(await waitForWagerOnGame(String(gameId), token, 8000)).toBeTruthy();
    const wager = (resp.ok() ? (await resp.json()) : (await fetchLatestWagerOnGame(String(gameId), token, 8000)));
    expect(wager).toBeTruthy();
    expect(wager.wdl).toBeFalsy();
    expect(wager.mode).toBe('arcade');
    const stored = Number(wager?.odds || 0);
    expect(Math.abs(stored - feMult)).toBeLessThan(0.03);
  });
});
