/**
 * Utilities for the visual capture system
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { MASK_SELECTORS } = require('./capture-config');

/**
 * Resolve output directory path
 * @param {string} tag Capture tag
 * @param {string} viewport Viewport name
 * @param {string} category Category name
 * @returns {string} Output directory path
 */
function resolveOutDir(tag, viewport, category) {
  return path.join(process.cwd(), 'captures', tag, viewport, category);
}

/**
 * Generate a capture tag based on environment or timestamp
 */
function computeTag() {
  const envTag = process.env.CAPTURE_TAG || process.env.E2E_CAPTURE_TAG;
  if (envTag) return String(envTag);
  const sha = (process.env.GITHUB_SHA || '').slice(0, 7);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `run-${stamp}${sha ? `-${sha}` : ''}`;
}

/**
 * Ensure directory exists
 * @param {string} p Directory path
 */
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

/**
 * Write manifest file
 * @param {string} baseDir Base directory
 * @param {object} manifest Manifest data
 */
async function writeManifest(baseDir, manifest) {
  try {
    ensureDir(baseDir);
    const dest = path.join(baseDir, 'index.json');
    fs.writeFileSync(dest, JSON.stringify(manifest, null, 2), 'utf8');
  } catch {}
}

/**
 * Dismiss onboarding overlays
 * @param {import('@playwright/test').Page} page Playwright page
 */
async function dismissOnboarding(page) {
  try {
    // Try both overlay card and anchored bubble variants
    for (let i = 0; i < 3; i++) {
      const overlay = page.locator('.onboarding-tour-overlay');
      const layer = page.locator('.onboarding-tour-layer');
      const visible = await overlay.isVisible().catch(() => false);
      const visible2 = await layer.isVisible().catch(() => false);
      if (!visible && !visible2) break;
      const skip = page.getByRole('button', { name: 'Skip' }).first();
      if (await skip.isVisible().catch(() => false)) {
        await skip.click({ timeout: 500 });
      } else {
        // Fallback to clicking Next a couple times
        const next = page.getByRole('button', { name: /Next|Finish/i }).first();
        if (await next.isVisible().catch(() => false)) await next.click({ timeout: 500 });
      }
      await page.waitForTimeout(120);
    }
  } catch {}
}

/**
 * Enable onboarding for specific tests
 * @param {import('@playwright/test').Page} page Playwright page
 */
async function enableOnboarding(page) {
  try {
    // Toggle localStorage flag to enable onboarding
    await page.evaluate(() => {
      localStorage.removeItem('betmate.onboarding.complete');
      localStorage.removeItem('betmate.onboarding.dashboard');
      localStorage.removeItem('betmate.onboarding.game');
      localStorage.removeItem('betmate.onboarding.dismissed');
    });
    await page.reload();
  } catch {}
}

/**
 * Set up environment state (arcade/real mode)
 * @param {import('@playwright/test').Page} page Playwright page
 * @param {string} state Desired state
 */
async function setupState(page, state) {
  if (state === "arcade" || state === "real") {
    // Switch to specified mode using utility from main utils
    const { ensureMode } = require('./tests/utils');
    await ensureMode(page, state);
  } else if (state === "showOnboarding") {
    // Enable onboarding overlays
    await enableOnboarding(page);
  }
  await page.waitForTimeout(250);
}

/**
 * Take a full page screenshot with masks
 * @param {import('@playwright/test').Page} page Playwright page
 * @param {string} filePath File path
 * @param {string[]} skipMaskSelectors Selectors to skip masking
 * @returns {object} Capture metadata
 */
async function takeFullPageScreenshot(page, filePath, skipMaskSelectors = []) {
  // Apply masks to dynamic content
  const masksToApply = MASK_SELECTORS
    .filter(sel => !skipMaskSelectors.includes(sel))
    .map(sel => page.locator(sel));
  
  await page.screenshot({ 
    path: filePath, 
    fullPage: true, 
    animations: 'disabled', 
    mask: masksToApply 
  });

  return {
    file: filePath,
    route: new URL(page.url()).pathname,
    viewport: `${page.viewportSize().width}x${page.viewportSize().height}`,
    timestamp: new Date().toISOString()
  };
}

/**
 * Take a screenshot of a specific element
 * @param {import('@playwright/test').Page} page Playwright page
 * @param {string} selector Element selector
 * @param {string} filePath File path
 * @param {string} note Optional note
 * @returns {object|null} Capture metadata or null if element not found
 */
async function takeElementScreenshot(page, selector, filePath, note) {
  try {
    const element = page.locator(selector).first();
    const count = await element.count();
    if (count === 0) return null;
    
    await element.screenshot({ path: filePath });
    
    return {
      file: filePath,
      route: new URL(page.url()).pathname,
      viewport: `${page.viewportSize().width}x${page.viewportSize().height}`,
      selector,
      note,
      timestamp: new Date().toISOString()
    };
  } catch {
    return null;
  }
}

/**
 * Try to promote user to admin
 * @param {string} userEmail User email
 */
async function promoteToAdmin(userEmail) {
  if (!userEmail) return false;

  try {
    return await new Promise((resolve) => {
      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      const child = spawn(npmCmd, ['run', 'admin:promote', '--', '--email', userEmail, '--role', 'admin', '--yes'], {
        cwd: path.resolve(process.cwd(), '..'),
        shell: process.platform === 'win32',
        stdio: 'ignore',
      });
      const t = setTimeout(() => {
        try { child.kill(); } catch {}
        resolve(false);
      }, 8000);
      child.on('exit', (code) => {
        clearTimeout(t);
        resolve(code === 0);
      });
      child.on('error', () => {
        clearTimeout(t);
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}

/**
 * Set admin API key in browser context
 * @param {import('@playwright/test').Page} page Playwright page
 * @returns {Promise<boolean>} Success flag
 */
async function setAdminApiKey(page) {
  try {
    // Get admin key from environment or default
    const adminKey = process.env.E2E_ADMIN_KEY || 'dev-admin-key';

    // Create a script that will intercept fetch/XHR and add the X-Admin-Key header
    await page.addInitScript(`
      (function() {
        const adminKey = '${adminKey}';

        // Intercept fetch requests
        const originalFetch = window.fetch;
        window.fetch = async function(resource, init = {}) {
          const modifiedInit = { ...init };
          if (!modifiedInit.headers) {
            modifiedInit.headers = {};
          }

          // Add the admin key header if not present
          if (modifiedInit.headers instanceof Headers) {
            if (!modifiedInit.headers.has('X-Admin-Key')) {
              modifiedInit.headers.set('X-Admin-Key', adminKey);
            }
          } else {
            modifiedInit.headers = {
              ...modifiedInit.headers,
              'X-Admin-Key': adminKey
            };
          }

          return originalFetch.call(this, resource, modifiedInit);
        };

        // Intercept XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function() {
          this.addEventListener('readystatechange', function() {
            if (this.readyState === 1) {
              this.setRequestHeader('X-Admin-Key', adminKey);
            }
          });
          originalOpen.apply(this, arguments);
        };
      })();
    `);

    // For debugging, log the admin key being used
    logCapture(`Set admin API key interceptor: ${adminKey.slice(0, 3)}...`, 'info');

    return true;
  } catch (error) {
    logCapture(`Failed to set admin API key: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Enable admin access via local storage manipulation
 * @param {import('@playwright/test').Page} page Playwright page
 * @returns {Promise<boolean>} Success flag
 */
async function enableAdminUiAccess(page) {
  try {
    // Manipulate the Redux state in localStorage to include admin role
    await page.evaluate(() => {
      try {
        // Get the current auth state from localStorage
        const persistRoot = localStorage.getItem('persist:root');
        if (persistRoot) {
          const parsed = JSON.parse(persistRoot);
          if (parsed.auth) {
            const auth = JSON.parse(parsed.auth);

            // Only modify if the user is already authenticated
            if (auth.isAuthenticated && auth.user) {
              // Set the user role to admin
              auth.user.role = 'admin';

              // Update the localStorage
              parsed.auth = JSON.stringify(auth);
              localStorage.setItem('persist:root', JSON.stringify(parsed));

              console.log('Admin role set in localStorage');
              return true;
            }
          }
        }
        return false;
      } catch (e) {
        console.error('Error manipulating localStorage:', e);
        return false;
      }
    });

    // Reload the page to apply changes
    await page.reload({ waitUntil: 'domcontentloaded' });

    return true;
  } catch (error) {
    logCapture(`Failed to enable admin UI access: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Log capture activity with timestamp
 * @param {string} message Message to log
 * @param {string} category Category 
 */
function logCapture(message, category = 'info') {
  const timestamp = new Date().toISOString().slice(11, 19);
  const prefix = category === 'error' ? '❌' : 
                 category === 'success' ? '✅' :
                 category === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

module.exports = {
  resolveOutDir,
  computeTag,
  ensureDir,
  writeManifest,
  dismissOnboarding,
  enableOnboarding,
  setupState,
  takeFullPageScreenshot,
  takeElementScreenshot,
  promoteToAdmin,
  setAdminApiKey,
  enableAdminUiAccess,
  logCapture
};