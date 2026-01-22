/**
 * Visual capture test for Core UI components
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
import { apiAuth } from '../utils';

test.describe('Core UI Components Capture', () => {
  test.setTimeout(60_000);

  test('capture core UI components at multiple viewport sizes', async ({ page }) => {
    const tag = computeTag();
    const category = 'coreUI';
    const config = CAPTURE_CONFIG[category];
    const shots = [];

    // Ensure we have an authenticated user
    await page.goto('/');
    const auth = await apiAuth(page).catch(() => ({ email: '', password: '', token: '' } as any));

    for (const vp of Object.entries(VIEWPORTS)) {
      const [vpName, vpSize] = vp;
      const outDir = resolveOutDir(tag, vpName, category);
      ensureDir(outDir);

      // Set viewport size
      await page.setViewportSize(vpSize);

      // Process each capture in this category
      for (const capture of config.captures) {
        try {
          // Navigate to the specified route
          await page.goto(capture.route, { waitUntil: 'domcontentloaded' });
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
      shots,
    };

    ensureDir(path.join(process.cwd(), 'captures', tag, 'manifests'));
    const manifestPath = path.join(process.cwd(), 'captures', tag, 'manifests', `${category}.json`);
    require('fs').writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  });
});