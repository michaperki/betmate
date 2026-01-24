/**
 * Visual capture test for Game Experience components
 */
import { test } from '@playwright/test';
import path from 'path';
import { VIEWPORTS, CAPTURE_CONFIG } from '../../capture-config';
import {
  computeTag,
  resolveOutDir,
  ensureDir,
  dismissOnboarding,
  setupState,
  takeFullPageScreenshot,
  takeElementScreenshot,
  logCapture,
} from '../../capture-utils';
import { 
  apiAuth, 
  createSampleGameForUser, 
  createSampleGame,
  getFeaturedMatch,
  ensureRealBalance,
} from '../utils';

test.describe('Game Experience UI Capture', () => {
  test.setTimeout(120_000);

  test('capture game UI in arcade and real modes', async ({ page }) => {
    const tag = computeTag();
    const gameCategories = ['gameArcade', 'gameReal'];
    const shots = [];

    // Ensure we have an authenticated user
    await page.goto('/');
    const auth = await apiAuth(page).catch(() => ({ email: '', password: '', token: '' } as any));
    const token = auth?.token || await page.evaluate(() => window.localStorage.getItem('authToken'));
    
    // Try to create or fetch a game for the Game UI captures
    let gameId = null;
    if (token) gameId = await createSampleGameForUser(token);
    if (!gameId) gameId = await createSampleGame();
    if (!gameId) gameId = await getFeaturedMatch();
    
    if (!gameId) {
      logCapture('No game ID available for capture', 'error');
      return;
    }
    
    // Ensure we have real balance for real mode captures
    if (token) {
      await ensureRealBalance(token, 25).catch(() => {});
    }

    for (const category of gameCategories) {
      const config = CAPTURE_CONFIG[category];
      
      for (const vp of Object.entries(VIEWPORTS)) {
        const [vpName, vpSize] = vp;
        const outDir = resolveOutDir(tag, vpName, category);
        ensureDir(outDir);

        // Set viewport size
        await page.setViewportSize(vpSize);
        
        // Setup state (arcade/real)
        if (config.setupState) {
          await setupState(page, config.setupState);
        }
        
        // Run pre-capture setup if defined
        if (config.preCapture) {
          await config.preCapture(page, gameId, token);
        }
        
        // Dismiss onboarding
        await dismissOnboarding(page);
        
        // Process each capture in this category
        for (const capture of config.captures) {
          try {
            // Navigate if a route is specified
            if (capture.route) {
              await page.goto(capture.route, { waitUntil: 'domcontentloaded' });
            } else if (capture.routeFactory && gameId) {
              const route = capture.routeFactory(gameId);
              await page.goto(route, { waitUntil: 'domcontentloaded' });
            }
            
            await page.waitForTimeout(250);

            // Take the screenshot
            if (capture.fullPage) {
              const filePath = path.join(outDir, `${capture.name}.png`);
              const meta = await takeFullPageScreenshot(
                page, 
                filePath, 
                capture.skipMask ? [capture.selector] : []
              );
              shots.push({ ...meta, description: capture.description, category });
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
                shots.push({ ...meta, category });
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
        gameId,
        shots: shots.filter(s => s.category === category),
      };

      ensureDir(path.join(process.cwd(), 'captures', tag, 'manifests'));
      const manifestPath = path.join(process.cwd(), 'captures', tag, 'manifests', `${category}.json`);
      require('fs').writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }
  });
});