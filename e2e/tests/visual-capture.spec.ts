import { test } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { enableDevFeatures, apiAuth, ensureMode, createSampleGameForUser, createSampleGame, getFeaturedMatch, ensureRealBalance, placeRealDrawBet } from './utils';

type Viewport = { name: 'desktop' | 'tablet' | 'mobile'; width: number; height: number };

const VIEWPORTS: Viewport[] = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'tablet',  width: 820,  height: 1180 },
  { name: 'mobile',  width: 375,  height: 812 },
];

function resolveOutDir(tag: string, vp: Viewport) {
  return path.join(process.cwd(), 'captures', tag, vp.name);
}

function computeTag(): string {
  const envTag = process.env.CAPTURE_TAG || process.env.E2E_CAPTURE_TAG;
  if (envTag) return String(envTag);
  const sha = (process.env.GITHUB_SHA || '').slice(0, 7);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `run-${stamp}${sha ? `-${sha}` : ''}`;
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

async function writeManifest(baseDir: string, manifest: any) {
  try {
    ensureDir(baseDir);
    const dest = path.join(baseDir, 'index.json');
    fs.writeFileSync(dest, JSON.stringify(manifest, null, 2), 'utf8');
  } catch {}
}

const MASK_SELECTORS = [
  'time',
  '.timeago',
  '[data-testid="mode-toggle"]',
  '.navbar__account',
  '.ph-clock',
  '.ph-odds',
  '.rg-cell.rg-col-stake',
  '.rg-cell.rg-col-odds',
  '.rg-cell.rg-col-status',
];

async function dismissOnboarding(page: import('@playwright/test').Page) {
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

test.describe('Visual UI Capture (dashboard + game)', () => {
  test.setTimeout(180_000);
  test.beforeAll(async () => {
    try { await enableDevFeatures(); } catch {}
  });

  test('capture dashboard and game at 3 sizes', async ({ page, browser }) => {
    const tag = computeTag();
    const manifest: any = {
      tag,
      generatedAt: new Date().toISOString(),
      baseDir: path.join(process.cwd(), 'captures', tag),
      sizes: VIEWPORTS.map(v => ({ name: v.name, width: v.width, height: v.height })),
      shots: [] as Array<{ file: string; route: string; viewport: string; note?: string }>,
    };

    // Helper to create a masked full-page screenshot
    const fullShot = async (filePath: string) => {
      const masks = MASK_SELECTORS.map(sel => page.locator(sel));
      await page.screenshot({ path: filePath, fullPage: true, animations: 'disabled', mask: masks });
      manifest.shots.push({ file: filePath, route: new URL(page.url()).pathname, viewport: String(await page.viewportSize()?.width) + 'x' + String(await page.viewportSize()?.height) });
    };

    // Helper to capture a specific locator if present
    const sectionShot = async (selector: string, filePath: string, note?: string) => {
      const loc = page.locator(selector).first();
      if (await loc.count()) {
        await loc.screenshot({ path: filePath });
        manifest.shots.push({ file: filePath, route: new URL(page.url()).pathname, viewport: String(await page.viewportSize()?.width) + 'x' + String(await page.viewportSize()?.height), note });
      }
    };

    // Ensure we have an authenticated user for wallet/dashboard personalization and game creation
    // Ensure authenticated state via API for reliability
    await page.goto('/');
    const auth = await apiAuth(page).catch(() => ({ email: '', password: '', token: '' } as any));
    const userEmail = auth?.email || '';

    // Try to create or fetch a game for the Game UI captures
    const token = auth?.token || await page.evaluate(() => window.localStorage.getItem('authToken'));
    let gameId: string | null = null;
    if (token) gameId = await createSampleGameForUser(token);
    if (!gameId) gameId = await createSampleGame();
    if (!gameId) gameId = await getFeaturedMatch();

    // Try to promote user to admin via root script (best-effort)
    if (userEmail) {
      try {
        await new Promise<void>((resolve) => {
          const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
          const child = spawn(npmCmd, ['run', 'admin:promote', '--', '--email', userEmail, '--role', 'admin', '--yes'], {
            cwd: path.resolve(process.cwd(), '..'),
            shell: process.platform === 'win32',
            stdio: 'ignore',
          });
          const t = setTimeout(() => { try { child.kill(); } catch {}; resolve(); }, 8000);
          child.on('exit', () => { clearTimeout(t); resolve(); });
          child.on('error', () => { clearTimeout(t); resolve(); });
        });
        // Reload to refresh auth role on FE
        await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      } catch {}
    }

    for (const vp of VIEWPORTS) {
      const outDir = resolveOutDir(tag, vp);
      ensureDir(outDir);
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // DASHBOARD
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await dismissOnboarding(page);
      await page.waitForSelector('nav.navbar', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(250);
      await fullShot(path.join(outDir, 'dashboard.full.png'));
      await sectionShot('nav.navbar', path.join(outDir, 'dashboard.navbar.png'), 'NavBar');
      await sectionShot('.dashboard', path.join(outDir, 'dashboard.container.png'), 'Dashboard container');
      await sectionShot('.featured-match-container', path.join(outDir, 'dashboard.featured.png'), 'Featured match');
      await sectionShot('.dashboard-matches-section', path.join(outDir, 'dashboard.matches.png'), 'Matches section');

      // Dashboard with match drawer (if match id available)
      if (gameId) {
        await page.goto(`/matches/${gameId}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
        await dismissOnboarding(page);
        await page.waitForTimeout(200);
        await fullShot(path.join(outDir, 'dashboard.matches-drawer.full.png'));
      }

      // WALLET (optional)
      await page.goto('/wallet', { waitUntil: 'domcontentloaded' }).catch(() => {});
      await dismissOnboarding(page);
      await page.waitForTimeout(200);
      await fullShot(path.join(outDir, 'wallet.full.png'));

      // Auth forms (guest context) — open in a fresh context to avoid redirect
      try {
        const ctx = await browser.newContext();
        const p2 = await ctx.newPage();
        await p2.goto('/', { waitUntil: 'domcontentloaded' });
        await p2.goto('/signin', { waitUntil: 'domcontentloaded' });
        await p2.waitForTimeout(200);
        await p2.screenshot({ path: path.join(outDir, 'signin.full.png'), fullPage: true });
        await p2.goto('/signup', { waitUntil: 'domcontentloaded' });
        await p2.waitForTimeout(200);
        await p2.screenshot({ path: path.join(outDir, 'signup.full.png'), fullPage: true });
        await ctx.close();
      } catch {}

      // Protected pages
      await page.goto('/active-bets', { waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(200);
      await fullShot(path.join(outDir, 'active-bets.full.png'));

      await page.goto('/betting-history', { waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(200);
      await fullShot(path.join(outDir, 'betting-history.full.png'));

      await page.goto('/user', { waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(200);
      await fullShot(path.join(outDir, 'user.full.png'));

      // GAME UI (Arcade, then Real) — if we have a game id
      if (gameId) {
        // Arcade
        await ensureMode(page, 'arcade');
        await page.goto(`/chess/${gameId}`, { waitUntil: 'domcontentloaded' });
        await dismissOnboarding(page);
        await page.waitForSelector('.match-layout-grid, .frame--board, .notation-rail', { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(350);
        await fullShot(path.join(outDir, 'game.arcade.full.png'));
        await sectionShot('.frame--board', path.join(outDir, 'game.arcade.board.png'), 'Board frame');
        await sectionShot('[data-tour-id="move-tiles"]', path.join(outDir, 'game.arcade.move-tiles.png'), 'Move tiles');
        await sectionShot('.notation-rail', path.join(outDir, 'game.arcade.notation.png'), 'Notation');
        await sectionShot('.receipts-grid', path.join(outDir, 'game.arcade.receipts.png'), 'Receipts');
        await sectionShot('.match-bottom-bar', path.join(outDir, 'game.arcade.toolbar.png'), 'Bottom toolbar');

        // Real — ensure balance and place a Draw bet for receipts
        await ensureMode(page, 'real');
        if (token) {
          await ensureRealBalance(token, 25).catch(() => {});
        }
        await page.goto(`/chess/${gameId}`, { waitUntil: 'domcontentloaded' });
        await dismissOnboarding(page);
        await page.waitForSelector('.match-layout-grid, .frame--board, .notation-rail', { timeout: 15000 }).catch(() => {});
        if (token) {
          await placeRealDrawBet(page, String(gameId), token).catch(() => {});
          await page.waitForTimeout(500);
        } else {
          await page.waitForTimeout(250);
        }
        await fullShot(path.join(outDir, 'game.real.full.png'));
        await sectionShot('.frame--board', path.join(outDir, 'game.real.board.png'), 'Board frame');
        await sectionShot('.notation-rail', path.join(outDir, 'game.real.notation.png'), 'Notation');
        await sectionShot('.receipts-grid', path.join(outDir, 'game.real.receipts.png'), 'Receipts');
        await sectionShot('.match-bottom-bar', path.join(outDir, 'game.real.toolbar.png'), 'Bottom toolbar');

        // Admin pages (best-effort; require role=admin)
        await page.goto('/admin', { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(250);
        await fullShot(path.join(outDir, 'admin.home.full.png'));

        await page.goto('/admin/wallet', { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(200);
        await fullShot(path.join(outDir, 'admin.wallet.full.png'));

        await page.goto('/admin/ops', { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(200);
        await fullShot(path.join(outDir, 'admin.ops.full.png'));

        await page.goto('/admin/kyc', { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(200);
        await fullShot(path.join(outDir, 'admin.kyc.full.png'));

        await page.goto('/admin/risk', { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(200);
        await fullShot(path.join(outDir, 'admin.risk.full.png'));
      }
    }

    await writeManifest(path.join(process.cwd(), 'captures', tag), manifest);
  });
});
