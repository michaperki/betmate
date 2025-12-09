BetMate Prod Game UI Hotfix — Context Dump (2025-12-09)
======================================================

Overview
- Goal: Eliminate repeated 401/404/429 errors in the Game UI, stabilize
  leaderboard/auth flows, and make releases clean and observable.
- Outcome: Console noise greatly reduced, rate limiting no longer blocks core
  dashboard flows, per-game leaderboard and engine analysis are healthy. Global
  leaderboard calls are feature-flagged and handled gracefully until backend
  parity is confirmed in prod.

Symptoms Observed
- Frontend console repeatedly showed:
  - 401 Unauthorized: `/auth/jwt-signin`, `/wager/history`, `/auth/balance-history`.
  - 404 Not Found: `/leaderboard?start=0&end=12`, `/leaderboard/userrank`.
  - 429 Too Many Requests: `/analysis/move`, `/leaderboard/game/:id`, `/chess/:id`.
  - Joi validation complaint: "refreshToken" and "csrfToken" not allowed.

Root Causes
1) Auth schema noise
   - Frontend validation schema rejected extra fields (`refreshToken`, `csrfToken`).
   - Result: noisy logs on otherwise valid responses.

2) Unauthenticated polling
   - Dashboard components were polling auth-gated endpoints for unauthenticated
     users (balance/wager history), causing persistent 401s.

3) Global rate limiter too broad
   - Backend applied a global limiter to all routes, throttling frequent
     dashboard requests and causing 429s (especially during bursty periods).

4) Global leaderboard endpoints missing in prod
   - Frontend expected `/leaderboard` and `/leaderboard/userrank`, but prod was
     returning 404. Per-game leaderboard was fine.

5) Chatty polling patterns
   - Frequent polling across multiple endpoints in parallel; not directly
     broken, but it amplified limiter impact and console noise.

Changes Implemented

Frontend
- Validation
  - `frontend/src/validation/auth.ts`: Keep schema typed to `{ user, token }`
    and set `.unknown(true)` to allow extra fields without logging errors.

- Auth watchers
  - `frontend/src/store/sagas/auth/watchers.ts`:
    - Clear stale token on JWT 401 (prevents repeated 401 loops).
    - Short-circuit `GET_BALANCE_HISTORY` to `[]` if no token (prevents 401 spam
      and stuck loading states for logged-out users).

- Wager watchers
  - `frontend/src/store/sagas/wager/watchers.ts`:
    - Short-circuit stats/active/history to default/empty if not authenticated.

- Leaderboard requests + sagas
  - `frontend/src/store/requests/leaderboardRequests.ts`:
    - Gracefully handle 404 for `/leaderboard` and `/leaderboard/userrank`
      (return empty/no-rank without console errors).
    - Add a 5-minute in-memory backoff after a 404 to avoid hammering missing
      routes in current environment.
  - `frontend/src/store/sagas/leaderboard/handlers.ts`:
    - Honor feature flag to skip global leaderboard calls entirely.

- Feature flag (defaulted for prod)
  - `frontend/src/utils/config.ts`:
    - `DISABLE_GLOBAL_LEADERBOARD` defaults to true when TARGET_ENV=prod or
      NODE_ENV=production, unless explicitly overridden via env var.

- Component guards
  - `frontend/src/containers/Dashboard/components/HeroSection/component.tsx` and
    `frontend/src/containers/Dashboard/components/StatsTiles/component.tsx`:
    - Call balance/wager history only when `isAuthenticated`.

Backend
- Selective rate limiting
  - `backend/src/server.ts`:
    - Remove global limiter application.
    - Apply limiter only to `/auth` and `/analysis` (keeps protections where it
      matters, avoids throttling `/leaderboard` and `/wager`).

Release and Branch Details
- Frontend
  - dev commits:
    - 323f41c feat(leaderboard): graceful 404 handling + optional disable flag
    - 9262b06 chore: reduce unauth 401s + add 404 backoff for leaderboard
    - 70b770c feat(config): default DISABLE_GLOBAL_LEADERBOARD to true in prod
    - c913fd6 fix: reduce auth/validation noise and unauthorized calls
  - Cherry-picked dev -> release and bumped:
    - release(frontend): v1.0.9
    - Root tag: `frontend-v1.0.9`
  - Root submodule pointer updated.

- Backend
  - dev contains limiter change: c5c3ece.
  - release contains merge of dev and a release bump: v1.1.5.
  - Confirmed dev commit c5c3ece is ancestor of release.

Verification Performed
- After Heroku dyno restart:
  - 429s no longer observed for dashboard endpoints.
  - Per-game flow healthy: `/chess/:id` 200, `/chess/:id/stats` 200/304,
    `/leaderboard/game/:id` 200/304.
  - Engine analysis stable: `/analysis/move` / `/analysis/top-moves` 200 with
    expected latencies (~700–900ms in sample window).
  - Global leaderboard calls now quiet: 404 handled gracefully or disabled by
    default in prod.
  - Auth 401 spam removed for logged-out users.

What Was Hard / Gotchas
- Submodules + release branches
  - Keeping frontend/backend submodules synchronized with root pointers required
    explicit commits in the root repo; the release scripts only bump/tag inside
    submodules, so we still need to commit the pointer updates.

- Type-safe validation vs. runtime payloads
  - Extending a typed Joi schema with fields not in the TS type causes TS to
    fail; the correct compromise was `.unknown(true)` while preserving the
    typed shape for the core fields we rely on (`user`, `token`).

- Rate limiting scope
  - A global limiter felt safer, but it throttled high-churn reads. Scoping it
    to `/auth` and `/analysis` hits a better balance.

Open Follow-ups / Ideas
1) Global leaderboard endpoints in prod
   - Implement/confirm `/leaderboard` and `/leaderboard/userrank` in the prod
     slug to match FE contract, or permanently hide/remove the widget in prod.

2) Reduce polling / consolidate requests
   - Slightly increase poll intervals (e.g., 10–15s) and/or push more updates
     over the existing socket to reduce parallel request spikes.
   - Option: single “dashboard snapshot” endpoint to bundle game, stats,
     (optional) leaderboard in one hit per interval.

3) Client-side dedup/backoff for analysis
   - Add simple de-bounce/dedup across consecutive analysis calls for similar
     moves/positions to reduce engine bursts.

4) Observability
   - Keep filtering CORS preflights and 304s from structured logs; promote
     slow or error responses for quick triage.

Environment Flags (for reference)
- Frontend:
  - `TARGET_ENV=prod|dev` (used in URL and default flags)
  - `DISABLE_GLOBAL_LEADERBOARD=true|false` (defaults to true in prod)
- Backend:
  - `ENABLE_RATE_LIMITING=true|false` (applies only to `/auth`, `/analysis`)
  - `FEATURE_REAL_MODE`, `PRICING_MODEL_VERSION` (unrelated but present)

Rollback Strategy
- Frontend: flip `DISABLE_GLOBAL_LEADERBOARD=false` if backend routes become
  available and we want to re-enable immediately; otherwise revert commit
  70b770c. For auth/wager watcher short-circuits, revert 9262b06.
- Backend: change limiter application back to global only if needed (not
  recommended), or adjust thresholds per-route.

Appendix — File Touch List (key ones)
- Frontend
  - src/validation/auth.ts
  - src/store/sagas/auth/watchers.ts
  - src/store/sagas/wager/watchers.ts
  - src/store/requests/leaderboardRequests.ts
  - src/store/sagas/leaderboard/handlers.ts
  - src/utils/config.ts
  - containers/Dashboard/components/{HeroSection,StatsTiles}/component.tsx
- Backend
  - src/server.ts

