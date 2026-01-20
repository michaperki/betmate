BetMate E2E Tests (Playwright)
==============================

What this is
- A minimal Playwright test suite to validate core user flows:
  - Sign up (auth) and access the Wallet
  - Faucet credit (dev/staging convenience)
  - Arcade WDL bet on a deterministic sample game
  - Arcade Move bet (skips if move options unavailable)
  - Deposit intent + confirm via NOWPayments mock webhook (skips if mock disabled)

Prereqs
- Docker + docker-compose
- Node 18+

Quick start
1) Bring the stack up locally (detached):
   docker-compose up -d

   Notes:
   - docker-compose sets FRONTEND at http://localhost:8080 and BACKEND at http://localhost:9000
   - For E2E convenience, backend is configured with:
     FEATURE_REAL_MODE=true, ENABLE_FAUCET=true, FAUCET_REQUIRE_ADMIN_KEY=false, ADMIN_API_KEY=dev-admin-key
   - Frontend TARGET_ENV=local so it talks to the local backend
    - PAYMENTS_PROVIDER=nowpayments and DEV_WEBHOOK_KEY=test-dev-webhook-key enable the NOWPayments mock webhook route

2) Install e2e deps:
   npm run e2e:install

3) Run tests:
   npm run e2e

   Optional:
   - Headed/debug: npm run e2e:headed
   - Codegen:      npm run e2e:codegen

UI screenshots (capture)
- What it does: loads key routes (Dashboard, Wallet, Game UI) and saves full-page and component crops at three sizes (desktop, tablet, mobile) with dynamic bits masked.

1) Start the stack (or ensure it’s running):
   docker-compose up -d

2) Install e2e deps (once):
   npm run e2e:install

3) Capture screenshots:
   npm run e2e:capture

   Options:
   - Headed: npm run e2e:capture:headed
   - Custom tag for output dir: CAPTURE_TAG=my-branch npm run e2e:capture
   - Zip artifact: (run after a capture) npm run zip:capture --prefix e2e

Outputs
- Saved under e2e/captures/<tag> with per-size folders.
- A manifest JSON is written to e2e/captures/<tag>/index.json.

Notes
- Captures are git-ignored by default (see repo .gitignore).
- The capture spec creates or fetches a sample game automatically.
 - Capture now authenticates via API for reliable NavBar/balance state and, in Real mode, places a small Draw bet (after ensuring balance) so receipts are visible.

   Smoke subset:
   - Tag filtering: npx playwright test -g "@smoke"
   - We tag: auth+wallet, deposit mock, Arcade WDL settlement, Real WDL settlement.

Additional tests
- Real WDL ledger: asserts USDT “Wager placed” and “Wager winnings” entries after settlement (real-wdl-ledger.spec.ts).
- Websocket smoke: loads a game, places a bet, and confirms the frontend receives a wager_result event (websocket-wager-result.spec.ts).
- Admin/risk happy-path: raises caps and verifies a large Real WDL bet is accepted and settles with correct cash delta (admin-exposure-accept.spec.ts).

   Workers:
   - Default parallelism is per-CPU; for stability during local debug:
     - macOS/Linux: PW_WORKERS=1 npm run e2e
     - PowerShell:  $env:PW_WORKERS='1'; npm run e2e

Environment overrides
- Base URLs (default to local):
  - E2E_BASE_URL     (default http://localhost:8080)
  - E2E_BACKEND_URL  (default http://localhost:9000)
 - Admin key (for risk/admin tests):
   - E2E_ADMIN_KEY    (default dev-admin-key). If missing/invalid, these tests skip.
   - Convenience: global-setup auto-loads ADMIN_API_KEY from backend/.env.local (or backend/.env)
     and sets E2E_ADMIN_KEY for this run. So if you run the app via `npm run dev`
     and have ADMIN_API_KEY set in backend/.env.local, admin tests will just work.

Troubleshooting
- If a single test flakes (e.g., waiting on first-render), rerun with one worker:
  - macOS/Linux: PW_WORKERS=1 npm run e2e -- tests/real-wdl-ledger.spec.ts
  - Windows (PowerShell): $env:PW_WORKERS='1'; npm run e2e -- tests/websocket-wager-result.spec.ts
- Ensure the dev simulator and faucet are enabled (compose defaults); global-setup waits for /api/status.

Readiness
- Tests wait briefly for backend /api/status and the FE base URL before running.

Scope & Strategy
- See TESTING_STRATEGY.md for a flows-first plan focusing on money, settlement, risk gating, and deposits.
