import { request as playwrightRequest } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function waitFor(url: string, timeoutMs: number) {
  const ctx = await playwrightRequest.newContext();
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await ctx.get(url, { timeout: 3000 });
      if (res.ok()) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

export default async function globalSetup() {
  // Auto-wire E2E admin key from backend env files for convenience
  try {
    const tryLoadEnv = (p: string) => {
      if (!fs.existsSync(p)) return {} as Record<string, string>;
      const text = fs.readFileSync(p, 'utf8');
      const out: Record<string, string> = {};
      for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        const val = line.slice(eq + 1).trim();
        out[key] = val;
      }
      return out;
    };
    const backendDir = path.resolve(process.cwd(), '..');
    const localPath = path.resolve(backendDir, 'backend', '.env.local');
    const envPath = path.resolve(backendDir, 'backend', '.env');
    const envLocal = tryLoadEnv(localPath);
    const envMain = tryLoadEnv(envPath);
    const merged = { ...envMain, ...envLocal } as Record<string, string>;
    if (!process.env.E2E_ADMIN_KEY && merged.ADMIN_API_KEY) {
      process.env.E2E_ADMIN_KEY = merged.ADMIN_API_KEY;
    }
  } catch {}

  const base = process.env.E2E_BASE_URL || 'http://localhost:8080';
  const backend = process.env.E2E_BACKEND_URL || 'http://localhost:9000';
  // Wait for backend API and FE to be online; keep it tight to avoid slowing local runs
  await waitFor(`${backend}/api/status`, 10_000).catch(() => {});
  await waitFor(`${base}`, 10_000).catch(() => {});
}
