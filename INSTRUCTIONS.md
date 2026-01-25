BetMate — Agent Onboarding Instructions

Purpose
- Give new contributors and agents a fast path to context: where to look, how to run, key flags, and the core codepaths for modes, wagers, odds, and analysis.

Quick Start
- Read these first (in order):
  - CURRENCIES and betting modes: `CURRENCIES.md`
  - Release process (submodules + tags): `RELEASING.md`
  - Migration guide (mock‑first strangler plan, now complete): `MIGRATION.md`
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
  - UI toggle and status: `frontend/src/context/ModeContext.tsx` reads `GET /api/status`, and the mode is displayed in the header (`frontend/src/components/Header/component.tsx`).
  - API status includes feature flags: `backend/src/server.ts:161` (`realModeEnabled`), pricing version: `backend/src/server.ts:163`.
- Settlement split by mode:
  - Core settlement: `backend/src/helpers/resolve_bets.ts:42`
    - WDL: Arcade uses fixed odds stored at bet-time; Real is parimutuel with rake.
    - Move: Arcade uses fixed odds stored at bet-time (no refunds on “no winners”); Real is parimutuel with rake and refunds if no one bet the correct move.
  - Winnings virtual: see model getter: `backend/src/models/wager_model.ts:106`.
  - House rake ledger (Real move settlements): per-move rake recorded to `backend/src/models/house_ledger_model.ts` via service from `resolve_bets.ts` (best-effort, non-blocking).

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
  - `ARCADE_DELTA_T1|ARCADE_DELTA_T2|ARCADE_DELTA_T3`: optional thresholds (centipawns) for Arcade Δ→p buckets (defaults 30/80/200).
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

Admin Access — Promote a User
- Quick command (run from repo root):
  - Ensure Mongo is reachable. For local docker-compose, set `backend/.env.local` with `MONGODB_URI=mongodb://localhost:27017/betmate`.
  - Promote to admin:
    - `npm run admin:promote -- --email "you@example.com" --role admin --yes`
  - Demote to user:
    - `npm run admin:promote -- --email "you@example.com" --role user --yes`
- Notes
  - The script loads `backend/.env.local` first, then `backend/.env` (same as the server).
  - For SRV clusters, export `MONGODB_URI`, `MONGODB_USERNAME`, `MONGODB_PASSWORD` in your shell, then run the command.
  - Admin UI routes also require the user’s role to be `admin`. As an ops fallback for API-only access, set `ADMIN_API_KEY` and pass `X-Admin-Key`, but the FE still checks `user.role`.

Dev Simulator (Deterministic Streams)
- Endpoints (NODE_ENV!=production; gated by `DEV_SIMULATOR`, default true):
  - `POST /admin/dev/advance-move` — Body: `{ game_id, san, white_time?, black_time? }`
  - `POST /admin/dev/simulate-game` — Body: `{ game_id, san_moves: string[], interval_ms?: number, final_result?: 'white_win'|'black_win'|'draw' }`
  - `POST /admin/dev/stop-simulate` — Body: `{ game_id }`
- Behavior:
  - Applies moves using chess.js, emits `new_move` and a lightweight `new_odds` (material-heuristic WDL + top 3 moves), and on completion sets `game_over` and resolves WDL.
  - Use `DEV_SIMULATOR=false` to disable these in dev/staging as needed.

E2E (Playwright)
- Run locally (headed): `npm run e2e:headed -- --workers=1 --debug`
- Run locally (CI-like): `npm run e2e`
- Tests live under `e2e/tests/` and include:
  - Auth + Wallet (faucet), Arcade WDL, Arcade Move, Real WDL, Deposit mock, and a sample stream demo.
- Dev deposit mock: provider defaults to NOWPayments in dev; mock webhook key defaults to `test-dev-webhook-key` if `DEV_WEBHOOK_KEY` is unset.
- Sample sequences: `e2e/assets/sample_sequences.json` (e.g., Scholar’s Mate). Demo uses these sequences with ~400ms move spacing.

UI Screenshot Capture (Playwright)
- Purpose: deterministically capture full‑page and component crops at desktop, tablet, and mobile sizes for rapid UI review and visual checks.
- Scripts:
  - Install deps once: `npm run e2e:install`
  - Set backend URL (if not default `http://localhost:9000`):
    - PowerShell: `$env:E2E_BACKEND_URL='http://localhost:9000'`
    - bash/zsh: `export E2E_BACKEND_URL=http://localhost:9000`
  - Choose a tag to organize outputs: `$env:CAPTURE_TAG='baseline'`
  - Run capture: `npm run e2e:capture`
  - Zip artifact (capture + zip): `npm run e2e:capture:zip`
- What the spec does (e2e/tests/visual-capture.spec.ts):
  - Authenticates a fresh test user via API (no UI flakiness).
  - Best‑effort admin promotion using the root script so admin routes render.
  - Ensures Real balance (faucet or deposit mock) and places a small Real Draw bet to populate receipts.
  - Auto‑dismisses onboarding overlays and masks dynamic bits (timestamps, balances, odds, etc.).
  - Captures scenes at three sizes: desktop (1280×900), tablet (820×1180), mobile (375×812).
- Scenes captured out‑of‑the‑box:
  - Dashboard (home), Featured drawer (`/matches/:id`), Wallet, Active Bets, Betting History, User.
  - Chess (Arcade + Real): full page, board frame, move tiles, notation rail, receipts, bottom toolbar.
  - Auth forms (guest context): Sign In, Sign Up.
  - Admin (best effort): Admin Home, Wallet, Ops, KYC, Risk.
- Outputs:
  - Images: `e2e/captures/<tag>/{desktop,tablet,mobile}/*.png`
  - Manifest: `e2e/captures/<tag>/index.json`
  - Zip: `e2e/captures/<tag>.zip`
  - Note: `e2e/captures/` is git‑ignored.
- Env knobs:
  - `E2E_BACKEND_URL` (backend base URL; default `http://localhost:9000`)
  - `E2E_BASE_URL` (frontend base URL; default `http://localhost:8080`)
  - `E2E_ADMIN_KEY` (admin key for feature/admin endpoints; defaults to `dev-admin-key`; also auto‑loaded from `backend/.env.local` when present)
  - `CAPTURE_TAG` (output folder/zip tag)
- CI: `.github/workflows/e2e.yml` runs the capture spec after tests and uploads `ui-captures` artifacts on every run.
- Troubleshooting:
  - “socket hang up” to `/admin/features`: set `E2E_BACKEND_URL` and/or `E2E_ADMIN_KEY` correctly; the capture will continue without admin toggles.
  - Mode toggle not found: the spec falls back to proceeding; ensure dashboard `/` is reachable so the toggle exists.
  - If Real mode is disabled, Real receipts may be empty; this is expected.

Using the Capture Tool in the AI workflow
- When proposing or implementing a UI change:
  - Make a focused patch in FE/BE as needed.
  - Run captures with a descriptive tag (e.g., `CAPTURE_TAG='move-tiles-contrast'`).
  - Review key outputs: `dashboard.full.png`, `game.arcade.full.png`, `game.real.full.png`, `wallet.full.png`, and relevant admin pages.
  - Iterate until visuals match intent; keep changes minimal and aligned with existing styles.
- Adding scenes or crops:
  - Edit `e2e/tests/visual-capture.spec.ts` and use `sectionShot('<selector>', 'path.png', 'Note')` with stable selectors (prefer `data-testid`/`data-tour-id`).
  - Update `MASK_SELECTORS` if new dynamic elements appear (timestamps, balances, counts).
- Safety:
  - Do not commit images; rely on local/CI artifacts.
  - Keep viewport list small (3 sizes) to balance coverage and runtime.

CI
- A GitHub Actions workflow (`.github/workflows/e2e.yml`) starts the stack with Docker Compose, installs Playwright + browsers, runs the E2E suite, and uploads artifacts on failure.

Gotchas and Tips
- Analysis endpoints can 429 under load; the FE already backs off. Avoid adding parallel analysis sources.
- Leaderboard global routes may be absent in some envs; FE has a backoff and feature flag.
- “No winners” for a move pool currently refunds stakes (CANCELLED) rather than “house keeps”. Decide policy before changing settlement.
- `account` and `token_balance` coexist for back-compat; prefer `token_balance` going forward. FE reducer still adjusts `account` optimistically.
 - UI migration is complete and the `experimental/` directory has been removed from the bundle. Do not import from `experimental/*`, `Mock*`, or `/New*` component paths (ESLint enforces this outside `src/examples/**`).

Open Items (from current plan)
- Validate Arcade move pricing + fixed‑odds settlement in production telemetry; tune K/margin/clamps as needed.
- Monitor Real move rake ledger entries and add any operator views/reporting if required.
- Complete FE migration away from `account` toward `token_balance` everywhere balances are shown/adjusted.

Developer Examples
- Preview design‑reference prototypes at:
  - `/examples/mobile-dashboard`, `/examples/empty-states`, `/examples/theme-toggle`, `/examples/toasts`
  - Source: `frontend/src/examples/*`

Where to Ask/Log
- Enable debug logs when diagnosing:
  - Backend: `LOG_HTTP_DEBUG=true`, `LOG_ANALYSIS_DEBUG=true`, `LOG_GAME_EVENTS=true`
  - Compose routes and env are in `docker-compose.yml`.

Appendix — Useful File Index
- Backend core: `backend/src/server.ts`, `backend/src/controllers/*`, `backend/src/routers/*`, `backend/src/services/*`, `backend/src/helpers/resolve_bets.ts`
- Frontend core: `frontend/src/context/ModeContext.tsx`, `frontend/src/components/*`, `frontend/src/store/requests/*`
- Microservice (for reference): `microservice/src/lambdas/*`, `microservice/src/router`
