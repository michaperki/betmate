BetMate — Agent Onboarding Instructions

Purpose
- Give new contributors and agents a fast path to context: where to look, how to run, key flags, and the core codepaths for modes, wagers, odds, and analysis.

Quick Start
- Read these first (in order):
  - CURRENCIES and betting modes: `CURRENCIES.md`
  - Release process (submodules + tags): `RELEASING.md`
  - Recent operational context: `context-dumps/README.md` and the latest dated files in `context-dumps/`
- Run locally (Docker Compose):
  - Requires Docker. From repo root: `docker-compose up --build`
  - Services: MongoDB, Redis, Postgres, backend (Node), frontend (React), microservice (Python router + lambdas)
  - Backend defaults (docker-compose) wire `MICROSERVICE_URL` and `MICROSERVICE_API_KEY`; see `docker-compose.yml`

Key Concepts (Modes + Settlement)
- Modes:
  - Arcade: token bets vs house for WDL; move bets use house-priced fixed odds (Δ→p heuristic with margin).
  - Real: cash bets parimutuel vs other players; house earns rake.
- Where enforced/visible:
  - UI toggle and status: `frontend/src/context/ModeContext.tsx:51` reads `GET /api/status`, and `frontend/src/components/NavBar/component.tsx:128` displays mode + balances.
  - API status includes feature flags: `backend/src/server.ts:161` (`realModeEnabled`), pricing version: `backend/src/server.ts:163`.
- Settlement split by mode:
  - Core settlement: `backend/src/helpers/resolve_bets.ts:42`
    - WDL: Arcade uses fixed odds stored at bet-time; Real is parimutuel with rake.
    - Move: Arcade uses fixed odds stored at bet-time (no refunds on “no winners”); Real is parimutuel with rake and refunds if no one bet the correct move.
  - Winnings virtual: see model getter: `backend/src/models/wager_model.ts:106`.

Wagers, Odds, and Analysis
- Wager creation (backend): `backend/src/controllers/wager_controller.ts:50`
  - Accepts `mode` (`arcade|real`) and `currency` (`BET|USDT`).
  - Debits Arcade from `account/token_balance`; Real from `cash_balance`.
  - Arcade stake caps: `ARCADE_MAX_STAKE_MOVE`, `ARCADE_MAX_STAKE_WDL`.
- Wager model: `backend/src/models/wager_model.ts:86` (fields include `mode`, `currency`, `pricing_model_version`).
- WDL odds source (per game): `backend/src/models/chess_model.ts` pre-save fetch from microservice.
- Analysis endpoints (backend):
  - Single move: `GET /analysis/move` in `backend/src/routers/analysis_router.ts:16`
  - Top moves: `GET /analysis/top-moves` in `backend/src/routers/analysis_router.ts:26`
  - Batch moves: `POST /analysis/moves` in `backend/src/routers/analysis_router.ts:36` (controller at `backend/src/controllers/analysis_controller.ts`)
- Analysis requests (frontend):
  - Central axios + cooldowns (handles 429): `frontend/src/store/requests/index.ts:6`
  - De-duped requests: `frontend/src/store/requests/analysisRequests.ts:104` (batch), plus `getTopMoves` and `getMoveAnalysis` in same file.

Feature Flags and Environment
- Backend
  - `FEATURE_REAL_MODE`: controls Real mode availability surfaced at `/api/status` (`backend/src/server.ts:161`).
  - `PRICING_MODEL_VERSION`: attached to created wagers and served at `/api/status` (`backend/src/server.ts:163` and `backend/src/controllers/wager_controller.ts:85`).
  - `ENABLE_RATE_LIMITING`: enables selective limiter on `/auth` and `/analysis` (`backend/src/server.ts:112`).
  - `POOL_RAKE`: rake fraction for Real parimutuel settlement (see `resolve_bets.ts`).
  - `ARCADE_MOVE_MARGIN`: house margin (0–0.25) applied to Arcade move odds (default 0.08).
  - `ARCADE_MAX_STAKE_MOVE`, `ARCADE_MAX_STAKE_WDL`: client stake caps enforced server-side.
- Frontend
  - `TARGET_ENV=prod|dev` and `DISABLE_GLOBAL_LEADERBOARD` default: `frontend/src/utils/config.ts`
  - Mode toggle and guard tied to `/api/status`: `frontend/src/context/ModeContext.tsx:51`.

Release Workflow (Submodules)
- Use root scripts:
  - Frontend: `npm run release:frontend:patch|minor|major` (or `npm run release:frontend -- 1.2.3`)
  - Backend: `npm run release:backend:patch|minor|major`
  - Both: `npm run release:app:patch|minor|major`
- What they do: bump/tag inside submodules, commit pointer(s) in root, create root tags. See `RELEASING.md` for push commands.

Validation and Testing
- Backend: Jest config present; run from `backend` with `yarn test`.
- Frontend: run `yarn dev` in `frontend` for local dev if not using Compose.
- Analysis stability:
  - Use the batch endpoint + caches to avoid request storms.
  - Respect 429 cooldowns (already built into request layer).

Common Codepaths by Task
- Add/change Arcade move pricing:
  - Validate/compute move odds at creation for `mode=arcade && !wdl`: `backend/src/controllers/wager_controller.ts` and `backend/src/services/wager_service.ts`.
  - Make Arcade move settlement use fixed odds (mirroring WDL) instead of pool share: `backend/src/helpers/resolve_bets.ts` (Arcade branch in `processCriticalMoveWagers`).
  - Display multipliers in FE move options (Arcade mode): `frontend/src/components/WagerFormComponents/MoveOptions/component.tsx` and BettingSidebar.
- Gate Real mode server-side (defense in depth): reject `mode=real` if `FEATURE_REAL_MODE` is false in `backend/src/controllers/wager_controller.ts:50`.
- Rake visibility: if needed, add a ledger entry when settling Real pools (hook in `resolve_bets.ts`).

Recent Context (Highly Recommended Reads)
- Batch analysis + cooldown unification: `context-dumps/2025-12-09_batch-analysis-unification.md`
- Prod UI/auth/leaderboard hotfixes: `context-dumps/2025-12-09_prod-game-ui-hotfix.md`

Gotchas and Tips
- Analysis endpoints can 429 under load; the FE already backs off. Avoid adding parallel analysis sources.
- Leaderboard global routes may be absent in some envs; FE has a backoff and feature flag.
- “No winners” for a move pool currently refunds stakes (CANCELLED) rather than “house keeps”. Decide policy before changing settlement.
- `account` and `token_balance` coexist for back-compat; prefer `token_balance` going forward. FE reducer still adjusts `account` optimistically.

Open Items (from current plan)
- Implement Arcade move pricing (Δ→p heuristic with house margin) and switch Arcade move settlement from pool share to fixed odds.
- Enforce Real-mode gating on the server, and (optionally) add rake ledger entries for Real settlements.
- Complete FE migration away from `account` toward `token_balance` everywhere balances are shown/adjusted.

Where to Ask/Log
- Enable debug logs when diagnosing:
  - Backend: `LOG_HTTP_DEBUG=true`, `LOG_ANALYSIS_DEBUG=true`, `LOG_GAME_EVENTS=true`
  - Compose routes and env are in `docker-compose.yml`.

Appendix — Useful File Index
- Backend core: `backend/src/server.ts`, `backend/src/controllers/*`, `backend/src/routers/*`, `backend/src/services/*`, `backend/src/helpers/resolve_bets.ts`
- Frontend core: `frontend/src/context/ModeContext.tsx`, `frontend/src/components/*`, `frontend/src/store/requests/*`
- Microservice (for reference): `microservice/src/lambdas/*`, `microservice/src/router`
