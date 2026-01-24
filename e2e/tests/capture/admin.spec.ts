/**
 * Visual capture test for Admin UI components
 */
import { test } from '@playwright/test';
import path from 'path';
import { VIEWPORTS, CAPTURE_CONFIG } from '../../capture-config';
import {
  computeTag,
  resolveOutDir,
  ensureDir,
  dismissOnboarding,
  promoteToAdmin,
  setAdminApiKey,
  enableAdminUiAccess,
  takeFullPageScreenshot,
  takeElementScreenshot,
  logCapture,
} from '../../capture-utils';
import { apiAuth } from '../utils';

test.describe('Admin UI Capture', () => {
  test.setTimeout(90_000);

  test('capture admin interfaces', async ({ page }) => {
    const tag = computeTag();
    const category = 'adminUI';
    const config = CAPTURE_CONFIG[category];
    const shots = [];

    // Ensure we have an authenticated user and promote to admin
    await page.goto('/');
    const auth = await apiAuth(page).catch(() => ({ email: '', password: '', token: '' } as any));
    const userEmail = auth?.email || '';

    // Apply multiple admin access methods for redundancy
    let isAdmin = false;

    // 1. First try database update via promote-admin script
    if (userEmail) {
      isAdmin = await promoteToAdmin(userEmail);
      if (isAdmin) {
        // Reload to refresh auth role on FE
        await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
        logCapture(`User ${userEmail} promoted to admin via DB update`, 'success');
      } else {
        logCapture(`Failed to promote user to admin via DB update, trying alternative methods`, 'warning');
      }
    }

    // 2. Set up admin API key injection for server-side admin access
    const apiKeySet = await setAdminApiKey(page);
    if (apiKeySet) {
      logCapture('Admin API key set for server-side admin access', 'success');
    }

    // 3. Manipulate localStorage to make frontend UI think user is admin
    const uiAccessEnabled = await enableAdminUiAccess(page);
    if (uiAccessEnabled) {
      logCapture('Admin UI access enabled via localStorage manipulation', 'success');
      isAdmin = true;
    }
    
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
      isAdmin,
      shots,
    };

    ensureDir(path.join(process.cwd(), 'captures', tag, 'manifests'));
    const manifestPath = path.join(process.cwd(), 'captures', tag, 'manifests', `${category}.json`);
    require('fs').writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  });
});