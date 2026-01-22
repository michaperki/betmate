/**
 * Visual capture test for Dashboard components
 */
import { test } from '@playwright/test';
import path from 'path';
import { VIEWPORTS, CAPTURE_CONFIG } from '../../capture-config';
import {
  computeTag,
  resolveOutDir,
  ensureDir,
  dismissOnboarding,
  takeFullPageScreenshot,
  takeElementScreenshot,
  logCapture,
} from '../../capture-utils';
import { 
  apiAuth, 
  createSampleGame,
  getFeaturedMatch,
} from '../utils';

test.describe('Dashboard UI Capture', () => {
  test.setTimeout(90_000);

  test('capture dashboard and match discovery UI', async ({ page }) => {
    const tag = computeTag();
    const category = 'dashboard';
    const config = CAPTURE_CONFIG[category];
    const shots = [];

    // Ensure we have an authenticated user
    await page.goto('/');
    const auth = await apiAuth(page).catch(() => ({ email: '', password: '', token: '' } as any));
    
    // Get a game ID for match details
    let gameId = await getFeaturedMatch();
    if (!gameId) gameId = await createSampleGame();
    
    for (const vp of Object.entries(VIEWPORTS)) {
      const [vpName, vpSize] = vp;
      const outDir = resolveOutDir(tag, vpName, category);
      ensureDir(outDir);

      // Set viewport size
      await page.setViewportSize(vpSize);
      
      // Process each capture in this category
      for (const capture of config.captures) {
        try {
          // Skip if requires gameId but none is available
          if (capture.requiresGameId && !gameId) {
            logCapture(`Skipping ${capture.name} - requires game ID`, 'warning');
            continue;
          }
          
          // Navigate to the specified route
          if (capture.route) {
            await page.goto(capture.route, { waitUntil: 'domcontentloaded' });
          } else if (capture.routeFactory && gameId) {
            const route = capture.routeFactory(gameId);
            await page.goto(route, { waitUntil: 'domcontentloaded' });
          }
          
          await dismissOnboarding(page);
          await page.waitForTimeout(250);

          // Take the screenshot
          if (capture.fullPage) {
            const filePath = path.join(outDir, `${capture.name}.png`);
            const meta = await takeFullPageScreenshot(
              page, 
              filePath, 
              capture.skipMask ? [capture.selector] : []
            );
            shots.push({ ...meta, description: capture.description });
            logCapture(`Captured ${capture.name} at ${vpName}`, 'success');
          } else if (capture.selector) {
            const filePath = path.join(outDir, `${capture.name}.png`);
            const meta = await takeElementScreenshot(
              page,
              capture.selector,
              filePath,
              capture.description
            );
            if (meta) {
              shots.push(meta);
              logCapture(`Captured ${capture.name} at ${vpName}`, 'success');
            } else {
              logCapture(`Element not found for ${capture.name} at ${vpName}`, 'warning');
            }
          }
        } catch (err) {
          logCapture(`Error capturing ${capture.name}: ${err.message}`, 'error');
        }
      }
    }

    // Write category manifest
    const manifest = {
      tag,
      category: config.title,
      generatedAt: new Date().toISOString(),
      viewports: VIEWPORTS,
      gameId: gameId || null,
      shots,
    };

    ensureDir(path.join(process.cwd(), 'captures', tag, 'manifests'));
    const manifestPath = path.join(process.cwd(), 'captures', tag, 'manifests', `${category}.json`);
    require('fs').writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  });
});