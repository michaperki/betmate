import { APIRequestContext, Page, request as playwrightRequest, test } from '@playwright/test';

export const randEmail = () => {
  const rand = Math.random().toString(36).slice(2, 8);
  return `e2e+${Date.now()}_${rand}@example.com`;
};

export async function enableDevFeatures() {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const req = await playwrightRequest.newContext();
  const adminKey = process.env.E2E_ADMIN_KEY || 'dev-admin-key';
  const resp = await req.put(`${backend}/admin/features`, {
    data: { realModeEnabled: true, enableFaucet: true },
    headers: { 'X-Admin-Key': adminKey, 'Content-Type': 'application/json' },
  });
  return resp.ok();
}

export async function createSampleGame(body?: any): Promise<string | null> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const req: APIRequestContext = await playwrightRequest.newContext();
  const resp = await req.post(`${backend}/admin/dev/create-sample-game`, {
    data: body || { status: 'in_progress', time: '300+0' },
    headers: { 'X-Admin-Key': 'dev-admin-key', 'Content-Type': 'application/json' },
  });
  if (!resp.ok()) return null;
  const json = await resp.json();
  return json?.game_id || null;
}

export async function getFeaturedMatch(): Promise<string | null> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const req: APIRequestContext = await playwrightRequest.newContext();
  const resp = await req.get(`${backend}/matches/featured`);
  if (!resp.ok()) return null;
  const json = await resp.json();
  return json?.match_id || null;
}

export async function signup(page: Page, email?: string, password = 'P@ssw0rd1234!') {
  const e = email || randEmail();
  await page.goto('/signup');
  await page.fill('#firstName', 'E2E');
  await page.fill('#lastName', 'Tester');
  await page.fill('#email', e);
  await page.fill('#password', password);
  await page.fill('#confirmPassword', password);
  await page.click('input[type="submit"][value="Create Account"]');
  
  // Wait for auth token or fall back to signing in (handles duplicate email or UI lag)
  const gotToken = await page.waitForFunction(() => !!window.localStorage.getItem('authToken'), { timeout: 6000 }).then(() => true).catch(() => false);
  if (!gotToken) {
    // Try Sign In with same credentials
    await page.goto('/signin');
    await page.fill('#email', e);
    await page.fill('#password', password);
    await page.click('input[type="submit"][value="Sign In"]');
    await page.waitForFunction(() => !!window.localStorage.getItem('authToken'));
  }
  // Navigate to home to ensure NavBar mounts with authenticated state
  await page.goto('/');
  return { email: e, password };
}

export async function getAuthToken(page: Page): Promise<string | null> {
  try {
    return await page.evaluate(() => window.localStorage.getItem('authToken'));
  } catch {
    return null;
  }
}

export async function waitForWagerOnGame(gameId: string, token: string, timeoutMs = 6000): Promise<boolean> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  const start = Date.now();
  const hasGame = (arr: any[]) => Array.isArray(arr) && arr.some((w: any) => String(w?.game_id) === String(gameId));
  while (Date.now() - start < timeoutMs) {
    try {
      // Check all wagers filtered by game_id (includes pending)
      const rAll = await ctx.get(`${backend}/wager?game_id=${encodeURIComponent(gameId)}`, { headers: { Authorization: `Bearer ${token}` } });
      if (rAll.ok()) {
        const j = await rAll.json();
        const arr = Array.isArray(j) ? j : (Array.isArray(j?.data) ? j.data : (Array.isArray(j?.wagers) ? j.wagers : []));
        if (hasGame(arr)) return true;
      }
    } catch {}
    try {
      // Check active (pending) wagers
      const rAct = await ctx.get(`${backend}/wager/active`, { headers: { Authorization: `Bearer ${token}` } });
      if (rAct.ok()) {
        const j = await rAct.json();
        if (hasGame(Array.isArray(j) ? j : [])) return true;
      }
    } catch {}
    try {
      // Finally check history (resolved only)
      const rHist = await ctx.get(`${backend}/wager/history?limit=20`, { headers: { Authorization: `Bearer ${token}` } });
      if (rHist.ok()) {
        const j = await rHist.json();
        const arr = Array.isArray(j) ? j : (Array.isArray(j?.data) ? j.data : (Array.isArray(j?.wagers) ? j.wagers : []));
        if (hasGame(arr)) return true;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 350));
  }
  return false;
}

export async function waitForWdlSettlement(gameId: string, token: string, timeoutMs = 15000): Promise<boolean> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const tryCheck = async (url: string) => {
        const resp = await ctx.get(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!resp.ok()) return false;
        const json = await resp.json();
        const arr = Array.isArray(json)
          ? json
          : (Array.isArray(json?.data) ? json.data : (Array.isArray(json?.wagers) ? json.wagers : []));
        const isWdl = (w: any) => {
          if (w?.wdl === true) return true;
          const d = String(w?.data || '').toLowerCase();
          return d === 'white_win' || d === 'black_win' || d === 'draw';
        };
        const forGame = (arr || []).filter((w: any) => String(w?.game_id) === String(gameId) && isWdl(w));
        const isResolved = (w: any) => {
          if (w?.resolved) return true;
          const s = String(w?.status || '').toLowerCase();
          return s === 'won' || s === 'lost' || s === 'cancelled';
        };
        return forGame.length > 0 && forGame.some(isResolved);
      };

      // First check history (resolved only); if not found, fall back to full list filtered by game_id
      const okHistory = await tryCheck(`${backend}/wager/history?limit=20`);
      if (okHistory) return true;
      const okAll = await tryCheck(`${backend}/wager?game_id=${encodeURIComponent(gameId)}`);
      if (okAll) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

export async function waitForMoveSettlement(gameId: string, token: string, expectedSan?: string, timeoutMs = 12000): Promise<boolean> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  const start = Date.now();
  const matchSan = (s: string) => {
    if (!expectedSan) return true;
    return String(s || '').toLowerCase() === expectedSan.toLowerCase();
  };
  while (Date.now() - start < timeoutMs) {
    try {
      const resp = await ctx.get(`${backend}/wager/history?limit=20`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok()) {
        const json = await resp.json();
        const arr = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : (Array.isArray(json?.wagers) ? json.wagers : []));
        const forGame = (arr || []).filter((w: any) => String(w?.game_id) === String(gameId) && !w?.wdl && matchSan(String(w?.data || '')));
        const isResolved = (w: any) => {
          if (w?.resolved) return true;
          const s = String(w?.status || '').toLowerCase();
          return s === 'won' || s === 'lost' || s === 'cancelled';
        };
        if (forGame.length > 0 && forGame.some(isResolved)) return true;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 400));
  }
  return false;
}

export async function createSampleGameForUser(token: string, body?: any): Promise<string | null> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  try {
    const resp = await ctx.post(`${backend}/admin/dev/create-sample-game-open`, {
      data: body || { status: 'in_progress', time: '300+0' },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!resp.ok()) return null;
    const json = await resp.json();
    return json?.game_id || null;
  } catch {
    return null;
  }
}

export async function advanceMove(gameId: string, san: string, token: string, whiteTime?: number, blackTime?: number): Promise<boolean> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  try {
    const resp = await ctx.post(`${backend}/admin/dev/advance-move`, {
      data: { game_id: gameId, san, white_time: whiteTime, black_time: blackTime },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return resp.ok();
  } catch {
    return false;
  }
}

export async function simulateGame(gameId: string, sanMoves: string[], token: string, intervalMs = 250, finalResult?: 'white_win'|'black_win'|'draw'): Promise<boolean> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  try {
    const resp = await ctx.post(`${backend}/admin/dev/simulate-game`, {
      data: { game_id: gameId, san_moves: sanMoves, interval_ms: intervalMs, final_result: finalResult },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return resp.ok();
  } catch {
    return false;
  }
}

export async function simulateGameSequence(gameId: string, sequence: 'scholars_mate'|'four_knights'|'mini_endgame', token: string, speed: 'slow'|'medium'|'fast' = 'slow', finalResult?: 'white_win'|'black_win'|'draw'): Promise<boolean> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  try {
    const resp = await ctx.post(`${backend}/admin/dev/simulate-game`, {
      data: { game_id: gameId, sequence, speed, final_result: finalResult },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return resp.ok();
  } catch {
    return false;
  }
}

export async function stopSimulation(gameId: string, token: string): Promise<boolean> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  try {
    const resp = await ctx.post(`${backend}/admin/dev/stop-simulate`, {
      data: { game_id: gameId },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return resp.ok();
  } catch {
    return false;
  }
}

export async function waitForGameComplete(gameId: string, timeoutMs = 10000): Promise<boolean> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const resp = await ctx.get(`${backend}/chess/${gameId}`);
      if (resp.ok()) {
        const json = await resp.json();
        if (json?.complete === true || (json?.game_status && json.game_status !== 'in_progress' && json.game_status !== 'not_started')) {
          return true;
        }
      }
    } catch {}
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}

export async function ensureMode(page: Page, desired: 'arcade' | 'real') {
  // Always force desired mode via storage for reliability
  await page.evaluate((m) => window.localStorage.setItem('betmate.mode', m as any), desired);

  // Navigate to a route where the mode toggle is visible to confirm
  if (!/\/wallet$|\/$/.test(page.url())) {
    await page.goto('/wallet', { waitUntil: 'domcontentloaded' }).catch(async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
    });
  } else {
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  }

  const expected = (desired === 'real' ? 'USDT' : 'KBITZ');
  const toggle = page.getByTestId('mode-toggle').first();
  await toggle.waitFor({ state: 'visible', timeout: 10000 });

  // Poll the displayed label/chip until it matches expected or timeout
  const deadline = Date.now() + 7000;
  while (Date.now() < deadline) {
    try {
      const label = await page.locator('[data-testid="mode-toggle"] .mode-label, [data-testid="mode-toggle"] .mode-chip').first().textContent({ timeout: 500 });
      const txt = (label || '').toUpperCase();
      if (txt.includes(expected)) return;
    } catch {}
    await page.waitForTimeout(150);
  }
  // As a last resort, attempt one UI double-tap
  try {
    await toggle.click();
    await page.waitForTimeout(140);
    await toggle.click();
  } catch {}
}

// ----- Balances and History helpers -----
export type UserBalances = { cash: number; token: number };

export async function getUserBalances(token: string): Promise<UserBalances | null> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  try {
    const resp = await ctx.get(`${backend}/auth/jwt-signin`, { headers: { Authorization: `Bearer ${token}` } });
    if (!resp.ok()) return null;
    const json = await resp.json();
    const user = json?.user || {};
    return { cash: Number(user.cash_balance || 0), token: Number(user.token_balance != null ? user.token_balance : user.account || 0) };
  } catch {
    return null;
  }
}

export async function getBalanceHistory(token: string, currency?: 'BET' | 'USDT', limit = 20): Promise<Array<{ amount: number; currency: string; reason: string }>> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  try {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (currency) params.set('currency', currency);
    const resp = await ctx.get(`${backend}/auth/balance-history?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!resp.ok()) return [];
    const json = await resp.json();
    return (Array.isArray(json) ? json : []).map((x: any) => ({ amount: Number(x?.amount || 0), currency: String(x?.currency || ''), reason: String(x?.reason || '') }));
  } catch {
    return [];
  }
}

export async function faucetCreditAPI(token: string, amount = 250): Promise<boolean> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  try {
    const resp = await ctx.post(`${backend}/billing/faucet`, {
      data: { amount },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return resp.ok();
  } catch {
    return false;
  }
}

// App status (public) — includes pool rake and risk summary
export async function getAppStatus(): Promise<any | null> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  try {
    const resp = await ctx.get(`${backend}/api/status`);
    if (!resp.ok()) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export async function fetchLatestWagerOnGame(gameId: string, token: string, timeoutMs = 8000): Promise<any | null> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const ctx = await playwrightRequest.newContext();
  try {
    const start = Date.now();
    const tryFetch = async () => {
      const urls = [
        `${backend}/wager?game_id=${encodeURIComponent(gameId)}`,
        `${backend}/wager/history?limit=50`,
      ];
      for (const url of urls) {
        try {
          const resp = await ctx.get(url, { headers: { Authorization: `Bearer ${token}` } });
          if (!resp.ok()) continue;
          const json = await resp.json();
          const arr = Array.isArray(json)
            ? json
            : (Array.isArray(json?.data) ? json.data : (Array.isArray(json?.wagers) ? json.wagers : []));
          const filtered = (arr || []).filter((w: any) => String(w?.game_id) === String(gameId));
          if (filtered.length) {
            const withTime = filtered.map((w: any) => ({ w, t: new Date(w?.created_at || 0).getTime() })).sort((a, b) => b.t - a.t);
            return withTime[0].w;
          }
        } catch {}
      }
      return null;
    };
    while (Date.now() - start < timeoutMs) {
      const found = await tryFetch();
      if (found) return found;
      await new Promise(r => setTimeout(r, 300));
    }
    return null;
  } catch {
    return null;
  }
}

// Ensure Real USDT balance is available by trying faucet first, then deposit mock
export async function ensureRealBalance(token: string, minUsd = 20): Promise<boolean> {
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  const req = await playwrightRequest.newContext();
  try {
    // 1) Check current balance
    const start = await getUserBalances(token);
    const startCash = Number((start as any)?.cash || 0);
    if (startCash >= minUsd) return true;

    // 2) Try faucet via API (best effort)
    try {
      const ok = await faucetCreditAPI(token, Math.max(minUsd, 25));
      if (ok) {
        const after = await getUserBalances(token);
        const cash = Number((after as any)?.cash || 0);
        if (cash >= minUsd) return true;
      }
    } catch {}

    // 3) Fallback to deposit mock: create intent + confirm via mock webhook
    try {
      const create = await req.post(`${backend}/billing/deposit/intent`, {
        data: { amount: Math.max(minUsd, 25), payCurrency: 'USDTTRC20' },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (create.ok()) {
        const json = await create.json();
        const depositId = json?.deposit_id as string | undefined;
        if (depositId) {
          const key = process.env.E2E_DEV_WEBHOOK_KEY || 'test-dev-webhook-key';
          const resp = await req.post(`${backend}/billing/webhook/nowpayments/mock`, {
            data: { deposit_id: depositId, status: 'confirmed' },
            headers: { 'x-dev-webhook-key': key, 'Content-Type': 'application/json' },
          });
          if (resp.ok()) {
            const after = await getUserBalances(token);
            const cash = Number((after as any)?.cash || 0);
            if (cash >= minUsd) return true;
          }
        }
      }
    } catch {}
  } catch {}
  return false;
}
