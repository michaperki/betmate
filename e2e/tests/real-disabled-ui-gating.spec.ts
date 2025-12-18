import { test, expect, request as playwrightRequest } from '@playwright/test';
import { signup, ensureMode, createSampleGameForUser, createSampleGame } from './utils';

test.describe('UI gating when Real mode is disabled', () => {
  test('Disabling Real hides/toggles back to Arcade in UI', async ({ page }) => {
    const adminKey = process.env.E2E_ADMIN_KEY || 'dev-admin-key';
    const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
    const ctx = await playwrightRequest.newContext();

    // Try to disable Real mode; if unauthorized, skip gracefully
    const setOff = await ctx.put(`${backend}/admin/features`, {
      data: { realModeEnabled: false },
      headers: { 'X-Admin-Key': adminKey, 'Content-Type': 'application/json' },
    });
    if (!setOff.ok()) test.skip(true, `Admin features not available (${setOff.status()})`);

    try {
      // Sign up and create a simple game to reach the NavBar + pages
      await signup(page);
      const token = await page.evaluate(() => window.localStorage.getItem('authToken'));
      if (!token) test.skip(true, 'No auth token');
      let gameId: string | null = await createSampleGameForUser(token, { status: 'in_progress', time: '300+0' });
      if (!gameId) gameId = await createSampleGame({ status: 'in_progress', time: '300+0' });
      if (!gameId) test.skip(true, 'Unable to create a game');

      // Attempt to force Real; UI should remain Arcade due to feature flag
      await ensureMode(page, 'real');
      await page.goto(`/chess/${gameId}`);

      const toggle = page.getByTestId('mode-toggle').first();
      await expect(toggle).toBeVisible({ timeout: 10000 });

      // Label should show Arcade token label and resist toggle clicks
      const label = toggle.locator('.mode-label');
      await expect(label).toContainText('KBITZ');

      // Try clicking the toggle; label should remain KBITZ
      await toggle.click();
      await page.waitForTimeout(150);
      await toggle.click();
      await expect(label).toContainText('KBITZ');
    } finally {
      // Restore Real mode to on for the rest of the suite
      await ctx.put(`${backend}/admin/features`, {
        data: { realModeEnabled: true },
        headers: { 'X-Admin-Key': adminKey, 'Content-Type': 'application/json' },
      }).catch(() => {});
    }
  });
});
