# BetMate – Security Review (Critical Lens)

Date: 2026-02-03

This is a lightweight, code-based security assessment of the BetMate monorepo (backend + frontend). It is **not** a full pen-test. Findings are prioritized by expected impact and likelihood.

---

## Executive summary (top risks)

1. **Admin key in browser build is a critical foot-gun**
   - Frontend code can attach `X-Admin-Key` from a build-time env var (`FAUCET_ADMIN_KEY`).
   - If a real admin key is ever shipped in a hosted frontend build, it becomes public and can unlock admin endpoints.

2. **Backend dependencies are severely out of date with known vulnerabilities**
   - `npm audit --omit=dev` on backend reports **41 vulnerabilities** (25 critical / 9 high / 7 moderate).
   - Notably includes old `mongoose` and old `axios`.

3. **Auth model is sensitive to XSS (JWT stored in localStorage) while CSRF protections are disabled/commented**
   - CSRF middleware is currently commented out.
   - JWT is stored in `localStorage`, which is vulnerable to theft if any XSS occurs.

---

## Findings (prioritized)

### 1) Critical – “Admin key in frontend” (secret leakage / privilege escalation)
**What**
- Frontend attaches an admin header when configured:
  - `frontend/src/store/requests/adminRequests.ts` uses `FAUCET_ADMIN_KEY` and sends `X-Admin-Key`.
  - `frontend/src/utils/config.ts` sources `FAUCET_ADMIN_KEY` from build-time env.

**Impact**
- Any secret placed in frontend build env is public to every user’s browser.
- If this header matches backend `ADMIN_API_KEY`, it can grant access to endpoints guarded by `requireAdminAccess`.

**Recommendation**
- Do **not** support admin-key auth from browser clients.
- Restrict `X-Admin-Key` usage to server-to-server tooling (CLI, cron jobs, internal ops).
- If you keep it for staging/dev: hard-gate it on backend (non-prod only, allowlist origins/IPs) and ensure it is never present in public deployments.

---

### 2) Critical/High – Dependency vulnerabilities (backend)
**Evidence**
- Backend `npm audit --omit=dev` reports: **41** prod dependency vulns (25 critical, 9 high, 7 moderate).
- Backend key versions:
  - `backend/package.json`: `mongoose ^5.10.7`, `axios ^0.21.1`, `passport ^0.4.1`.

**Impact**
- Increases risk of known exploit classes (injection, SSRF/CSRF-type issues, ReDoS in transitive deps, etc.).

**Recommendation**
- Plan a dependency upgrade sprint.
- Add CI gating on critical vulnerabilities.

---

### 3) High – Admin endpoints are not rate-limited
**Evidence**
- `backend/src/server.ts` applies rate limits to `/analysis`, `/auth`, and select billing endpoints.
- It explicitly does not rate-limit `/admin`.

**Impact**
- Increased brute-force / abuse exposure on high-value admin endpoints.

**Recommendation**
- Add a rate limiter for `/admin` (even generous limits).
- Add stricter limits for sensitive actions (role changes, deletes, withdrawal approvals).

---

### 4) High – JWT expiry check likely wrong (ms vs seconds)
**Evidence**
- Tokens are created with `exp` in **milliseconds**:
  - `backend/src/helpers/utils.ts` (`tokenForUser`)
- JWT strategy checks `payload.exp < Date.now()`:
  - `backend/src/authentication/requireAuth.ts`

**Impact**
- Standard JWT conventions use `exp` in **seconds**.
- Any token generated/validated elsewhere using seconds could be treated incorrectly.

**Recommendation**
- Standardize `exp` to seconds since epoch everywhere.
- Prefer a library path that enforces standard JWT semantics.

---

### 5) Medium – Token verification bypass used in websocket leave flow
**Evidence**
- `backend/src/websockets/chess_websocket.ts` uses `decodeToken(token, true)` (noVerify) for `leave_auth`.

**Impact**
- Likely limited impact (leave a room), but establishes a dangerous pattern (accepting unverified JWT payloads).

**Recommendation**
- Always verify tokens before trusting payload claims.

---

### 6) Medium – CORS preflight header reflection
**Evidence**
- `backend/src/server.ts` reflects `Access-Control-Allow-Headers` to whatever the client requests on `OPTIONS`.

**Impact**
- Not an origin bypass by itself (origin allowlist still exists), but increases fragility and risk if origin rules are ever loosened.

**Recommendation**
- Keep a fixed allowlist of allowed headers and do not reflect arbitrary requested headers.

---

## Notes / hygiene
- Avoid ever pasting production secrets into chats/logs.
- Rotate keys that have been exposed in any logs.
- Consider adding CSP/helmet hardening in backend + frontend to reduce XSS blast radius.

---

## Suggested next steps
1. Remove browser support for `X-Admin-Key`.
2. Add `/admin` rate limiting.
3. Standardize JWT `exp` to seconds.
4. Dependency upgrades (mongoose, axios, transitive packages) with a staged rollout.
