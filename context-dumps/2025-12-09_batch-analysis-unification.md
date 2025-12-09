BetMate Analysis Burst Fix — Context Dump (2025-12-09)
=====================================================

Overview
- Goal: Eliminate bursty client behavior that trips rate limits on analysis endpoints during quick, consecutive moves.
- Outcome: Frontend now batches candidate move analysis, de-dupes in-flight calls, respects server 429s with cooldowns, and uses a single source for top-moves. Backend exposes a new batch analysis endpoint. Prod traffic stabilized; no more rapid-fire 429s after fast move sequences.

Symptoms Observed
- 429 Too Many Requests on `/analysis/top-moves` and `/analysis/move` during quick successive positions.
- Repeated calls from multiple UI sources (ChessMatch, MoveBubbles, sidebars) issuing overlapping analysis requests.
- Additional polling/WebSocket updates causing frequent re-renders and amplifying effect triggers.

Root Causes
1) Duplicate top-moves fetches per FEN (FEN effect + per-index caching + component-level fetch).
2) Per-candidate analysis issued individually (up to 6 calls) instead of a single batch.
3) Requests persisted during server cooldown (no effect-level bailouts), and different `n` values prevented de-dupe sharing (6 vs 12).
4) Background polling + websocket updates kept effects hot during rapid game changes.

Key Changes (Frontend)
- Central axios instance with 429 cooldowns (5s for `/analysis`, 10s for `/auth/jwt-signin`).
  - File: `frontend/src/store/requests/index.ts`

- In‑flight de‑dupe + caches
  - Single‑move: `getMoveAnalysis(fen, move)`
  - Top‑moves: `getTopMoves(fen, n)` (normalizes lambda-style payloads)
  - New batch: `getBatchMoveAnalysis(fen, moves)`; also hydrates single‑move cache.
  - File: `frontend/src/store/requests/analysisRequests.ts`

- Single source of truth for top‑moves
  - Removed redundant FEN‑based top‑moves effect in ChessMatch; keep one per position index and hydrate both index and global lookup maps.
  - Unified `n = 12` across components (including MoveBubbles) so de‑dupe/caches collapse duplicates.
  - Files: `frontend/src/containers/ChessMatch/component.tsx`, `frontend/src/components/MoveBubbles/component.tsx`

- Batch candidate analysis (4‑in‑1)
  - Candidate effect in ChessMatch now calls `getBatchMoveAnalysis` with up to 4 visible SANs instead of 4 individual requests.
  - Adds effect‑level bailout when `isAnalysisRateLimited()` to avoid scheduling during server cooldown.
  - Throttle retained (~150ms) for candidate effect to reduce burstiness on rapid re-renders.
  - File: `frontend/src/containers/ChessMatch/component.tsx`

Key Changes (Backend)
- New batch endpoint: `POST /analysis/moves`
  - Body: `{ fen: string, moves: string[] }` (min 1, max 16).
  - Uses `getTopMoves` to satisfy covered moves and falls back to `getMoveAnalysis` for missing ones.
  - Returns normalized array of `{ move, score, percentile, is_best_move }` in input order.
  - Files: `backend/src/controllers/analysis_controller.ts`, `backend/src/routers/analysis_router.ts`, `backend/src/validation/analysis.ts`

Behavioral Notes
- Typical per‑position analysis traffic now:
  - 1x `GET /analysis/top-moves?fen=…&n=12`
  - 1x `POST /analysis/moves` with up to 4 candidates
  - 0–1x per‑move analysis from sidebars/hover (only when active)
- Caches and de‑dupe collapse repeated requests across components and re-renders.
- Cooldown guards prevent retry storms after 429s.

Verification
- Observed network panel: per position shows exactly one top‑moves and one batch call (no more four individual `/analysis/move`).
- Rapid move sequences no longer spike 429s; cooldown temporarily pauses effects and they resume cleanly afterward.
- Game snapshot `/chess/:id` still arrives via poll + websocket; expected and independent of analysis.

Release and Branch Details
- Frontend
  - Dev changes committed: batch candidate evaluation, unify top‑moves, cooldown guards.
  - Merged `dev` → `release`.
  - Release bump: `v1.0.12` (root tag: `frontend-v1.0.12`).

- Backend
  - Dev changes committed: add `/analysis/moves` endpoint and schema.
  - Merged `dev` → `release`.
  - Release bump: `v1.1.7` (root tag: `backend-v1.1.7`).

Post‑Release Publish (per RELEASING.md)
- Submodules
  - `git -C frontend push --follow-tags origin release`
  - `git -C backend  push --follow-tags origin release`
- Root
  - `git push --follow-tags origin release`

What Was Hard / Gotchas
- Multiple top‑moves sources (component + index + FEN effect) created duplicates; removing the FEN effect and unifying `n` was essential for de‑dupe to work.
- Side panels can still request single‑move analysis; acceptable but now negligible thanks to caching and batch coverage.
- Polling + websocket interplay: polling can be made conditional on WS health for further quieting during heavy play.

Open Follow‑ups / Ideas
1) WS‑aware polling: pause `/chess/:id` and `/chess/:id/stats` polls while socket is healthy; resume only on disconnect/idle.
2) Stable‑FEN debounce: add a trailing ~300ms debounce before any new analysis to coalesce very fast consecutive moves.
3) Telemetry: add lightweight client counters (suppressed in dev) for “analysis scheduled/skipped due to cooldown/throttle” to validate in prod.

Rollback Strategy
- Frontend: revert batch call usage to individual `getMoveAnalysis` if necessary (retain de‑dupe + cooldown), or revert the commits that removed the FEN‑based effect if tying into older flows.
- Backend: disable `/analysis/moves` route by removing it from the router if compatibility issues arise.

Environment Flags (reference)
- Frontend: `TARGET_ENV`, `DISABLE_GLOBAL_LEADERBOARD` (unchanged here)
- Backend: `ENABLE_RATE_LIMITING` (limiter scoped to `/analysis` + `/auth`), `LOG_ANALYSIS_DEBUG`

Endpoints Summary
- `GET /analysis/top-moves?fen=…&n=12` — single source, cached/de‑duped client‑side.
- `POST /analysis/moves` — batch evaluation of up to 16 SANs; used for candidate set (4).
- `GET /analysis/move?fen=…&move=…` — still supported; now rarely used directly by core flows.

Appendix — File Touch List (key ones)
- Frontend
  - `src/store/requests/index.ts`
  - `src/store/requests/analysisRequests.ts`
  - `src/containers/ChessMatch/component.tsx`
  - `src/components/MoveBubbles/component.tsx`
- Backend
  - `src/controllers/analysis_controller.ts`
  - `src/routers/analysis_router.ts`
  - `src/validation/analysis.ts`

