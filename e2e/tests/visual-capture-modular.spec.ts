/**
 * Modular Visual UI Capture
 * Organizes captures by functional area with detailed metadata
 */
import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { VIEWPORTS, CAPTURE_CONFIG } from '../capture-config';
import {
  computeTag,
  resolveOutDir,
  ensureDir,
  dismissOnboarding,
  promoteToAdmin,
  setAdminApiKey,
  enableAdminUiAccess,
  setupState,
  takeFullPageScreenshot,
  takeElementScreenshot,
  logCapture,
  writeManifest,
} from '../capture-utils';
import { 
  apiAuth, 
  createSampleGameForUser, 
  createSampleGame,
  getFeaturedMatch,
  ensureRealBalance,
  placeRealDrawBet,
  ensureMode,
} from './utils';

test.describe('Modular Visual UI Capture', () => {
  test.setTimeout(240_000);

  test('capture UI components across all categories', async ({ page, browser }) => {
    const tag = computeTag();
    const rootManifest = {
      tag,
      generatedAt: new Date().toISOString(),
      baseDir: path.join(process.cwd(), 'captures', tag),
      viewports: VIEWPORTS,
      categories: Object.keys(CAPTURE_CONFIG),
      categoryManifests: {},
      allShots: [],
    };

    // Ensure we have an authenticated user
    await page.goto('/');
    const auth = await apiAuth(page).catch(() => ({ email: '', password: '', token: '' } as any));
    const userEmail = auth?.email || '';
    const token = auth?.token || await page.evaluate(() => window.localStorage.getItem('authToken'));
    
    // Try to create or fetch a game for captures
    let gameId = null;
    if (token) gameId = await createSampleGameForUser(token);
    if (!gameId) gameId = await createSampleGame();
    if (!gameId) gameId = await getFeaturedMatch();
    
    if (!gameId) {
      logCapture('No game ID available for capture', 'error');
    }
    
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
    
    // Ensure real balance for real mode captures
    if (token) {
      await ensureRealBalance(token, 25).catch(() => {});
    }
    
    // Process each category
    for (const [categoryKey, config] of Object.entries(CAPTURE_CONFIG)) {
      logCapture(`Starting category: ${config.title}`, 'info');
      
      // Skip categories requiring specific prerequisites
      if (config.requiresGameId && !gameId) {
        logCapture(`Skipping ${config.title} - requires game ID`, 'warning');
        continue;
      }
      
      // Don't skip admin pages, we have multiple access methods in place
      if (config.requiresAdmin) {
        if (!isAdmin) {
          logCapture(`Admin role not set, but proceeding with ${config.title} using API key/localStorage approach`, 'warning');
        } else {
          logCapture(`Admin role verified, proceeding with ${config.title}`, 'success');
        }
      }
      
      let categoryShots = [];
      
      // Handle guest context pages (auth forms) in a fresh context
      if (config.requiresGuestContext) {
        try {
          const ctx = await browser.newContext();
          const guestPage = await ctx.newPage();
          
          for (const vp of Object.entries(VIEWPORTS)) {
            const [vpName, vpSize] = vp;
            const outDir = resolveOutDir(tag, vpName, categoryKey);
            ensureDir(outDir);
            
            await guestPage.setViewportSize(vpSize);
            
            for (const capture of config.captures) {
              try {
                await guestPage.goto(capture.route, { waitUntil: 'domcontentloaded' });
                await guestPage.waitForTimeout(250);
                
                if (capture.fullPage) {
                  const filePath = path.join(outDir, `${capture.name}.png`);
                  await guestPage.screenshot({ path: filePath, fullPage: true });
                  
                  categoryShots.push({
                    file: filePath,
                    route: capture.route,
                    viewport: `${vpSize.width}x${vpSize.height}`,
                    description: capture.description,
                    timestamp: new Date().toISOString(),
                  });
                  
                  logCapture(`Captured ${capture.name} at ${vpName}`, 'success');
                }
              } catch (err) {
                logCapture(`Error capturing ${capture.name}: ${err.message}`, 'error');
              }
            }
          }
          
          await ctx.close();
        } catch (err) {
          logCapture(`Error in guest context: ${err.message}`, 'error');
        }
      } else {
        // Regular authenticated context
        for (const vp of Object.entries(VIEWPORTS)) {
          const [vpName, vpSize] = vp;
          const outDir = resolveOutDir(tag, vpName, categoryKey);
          ensureDir(outDir);
          
          await page.setViewportSize(vpSize);
          
          // Setup state if defined for the category
          if (config.setupState) {
            await setupState(page, config.setupState);
          }
          
          // Run pre-capture setup if defined
          if (config.preCapture) {
            await config.preCapture(page, gameId, token);
          } else if (categoryKey === 'gameArcade') {
            await ensureMode(page, 'arcade');
            if (gameId) {
              await page.goto(`/chess/${gameId}`, { waitUntil: 'domcontentloaded' });
              await page.waitForSelector('.match-layout-grid, .frame--board', { timeout: 15000 }).catch(() => {});
            }
          } else if (categoryKey === 'gameReal') {
            await ensureMode(page, 'real');
            if (gameId && token) {
              await page.goto(`/chess/${gameId}`, { waitUntil: 'domcontentloaded' });
              await page.waitForSelector('.match-layout-grid, .frame--board', { timeout: 15000 }).catch(() => {});
              await placeRealDrawBet(page, String(gameId), token).catch(() => {});
            }
          }
          
          // Process each capture in this category
          for (const capture of config.captures) {
            try {
              // Skip if requires gameId but none is available
              if (capture.requiresGameId && !gameId) {
                continue;
              }
              
              // Navigate to the specified route
              if (capture.route) {
                await page.goto(capture.route, { waitUntil: 'domcontentloaded' });
              } else if (capture.routeFactory && gameId) {
                const route = capture.routeFactory(gameId);
                await page.goto(route, { waitUntil: 'domcontentloaded' });
              }
              
              // Only dismiss onboarding if not capturing onboarding itself
              if (categoryKey !== 'onboardingUI') {
                await dismissOnboarding(page);
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
                categoryShots.push({ ...meta, description: capture.description });
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
                  categoryShots.push(meta);
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
      }
      
      // Write category manifest
      if (categoryShots.length > 0) {
        const categoryManifest = {
          tag,
          category: config.title,
          categoryKey,
          generatedAt: new Date().toISOString(),
          viewports: VIEWPORTS,
          gameId: gameId || null,
          shots: categoryShots,
        };

        ensureDir(path.join(process.cwd(), 'captures', tag, 'manifests'));
        const manifestPath = path.join(process.cwd(), 'captures', tag, 'manifests', `${categoryKey}.json`);
        fs.writeFileSync(manifestPath, JSON.stringify(categoryManifest, null, 2));
        
        // Update root manifest
        rootManifest.categoryManifests[categoryKey] = manifestPath;
        rootManifest.allShots = [...rootManifest.allShots, ...categoryShots];
      }
    }
    
    // Write root manifest
    const rootManifestPath = path.join(process.cwd(), 'captures', tag, 'index.json');
    fs.writeFileSync(rootManifestPath, JSON.stringify(rootManifest, null, 2));
    
    // Create a summary report
    const summaryReport = {
      captureTag: tag,
      timestamp: new Date().toISOString(),
      categories: Object.entries(CAPTURE_CONFIG).map(([key, config]) => ({
        key,
        title: config.title,
        shotCount: (rootManifest.allShots || []).filter(s => s.file.includes(`/${key}/`)).length,
      })),
      viewportCounts: Object.keys(VIEWPORTS).map(vp => ({
        name: vp,
        shotCount: (rootManifest.allShots || []).filter(s => s.file.includes(`/${vp}/`)).length,
      })),
      totalShots: rootManifest.allShots.length,
      captureComplete: true,
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'captures', tag, 'summary.json'), 
      JSON.stringify(summaryReport, null, 2)
    );
    
    logCapture(`Capture complete: ${rootManifest.allShots.length} total screenshots`, 'success');
  });
});