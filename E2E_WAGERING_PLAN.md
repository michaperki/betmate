BetMate — E2E Wagering Plan (Dec 2025)

Objectives
- Validate core money flows deterministically across Arcade (KBITZ) and Real (USDT): deposits, bet placement, settlement, and risk caps.
- Keep tests API-first for reliability, with UI fallbacks for receipts.
- Minimize flake using dev simulator parity (emits wager_result + game_over) and readiness waits.

Current Coverage (Playwright)
- Auth + Wallet (faucet) — smoke
- Deposit via NOWPayments mock webhook — smoke
- Arcade WDL settle (fixed odds) — smoke
- Real WDL settle (fixed odds)
- Real WDL draw (draw UI fragile → may skip)
- Arcade Move settle (fixed odds, FE multiplier display)
- Real Move settle with rake and CANCELLED refund on no-winner
- Insufficient funds + Arcade stake caps
- Admin: Real-mode gating (403), Exposure reads (skips if unauthorized)
- Sample Game Stream (Scholar’s Mate) demo

Recent Improvements
- Backend ledger snapshots use correct wallets:
  - USDT → cash_balance; BET → token_balance (fallback to legacy account)
  - Files: backend/src/services/user_service.ts, backend/src/helpers/resolve_bets.ts
- UI gating test for Real disabled:
  - File: e2e/tests/real-disabled-ui-gating.spec.ts
- E2E convenience: auto-wire E2E_ADMIN_KEY from backend/.env.local or backend/.env in global setup
  - File: e2e/global-setup.ts
- Risk caps E2E expanded (CAP_PER_PLAYER_GAME, CAP_PER_OUTCOME, CAP_PER_GAME, CAP_GLOBAL) + no-debit assertion on 403
  - File: e2e/tests/risk-gating.spec.ts
- Arcade odds parity in FE: FE margin sourced from /api/status.limits.arcadeMoveMargin
  - Files: frontend/src/context/ModeContext.tsx, frontend/src/components/WagerFormComponents/MoveOptions/component.tsx
- token_balance migration finished in FE (removed legacy account reads)
  - Files: NavBar/Wallet/WagerPanel/Dashboard reducer + containers

Plan — Next Steps
1) Odds parity E2E (Arcade moves)
   - Test that FE-displayed move multiplier ≈ stored wager.odds (±0.02) for seeded options.

2) Ledger refinements
   - For CANCELLED (refund) outcomes, record reason as “Refund” instead of “Wager winnings”; add E2E to assert refund entry.
   - Add explicit ledger assertions for Real WDL winnings (USDT) similar to Arcade BET test.

3) Admin feature gating E2E
   - Tests for disableWdl and disableDraw toggles (server and UI behaviors), mirroring the Real-disabled gating test.

4) Harden receipt/websocket parity
   - Optional smoke to assert a wager_result event arrives on settlement (dev simulator path).

5) Docs/runbook
   - Keep e2e/README up-to-date with any new flags and test tags; maintain smoke set list.

How To Run (local)
- Start stack with `npm run dev` at repo root (frontend + backend). Microservice starts via Docker Compose.
- Ensure backend/admin key is set in backend/.env.local, e.g.: `ADMIN_API_KEY=dev-admin`
- Tests auto-load this ADMIN_API_KEY as E2E_ADMIN_KEY via global setup. Simply run:
  - Full: `npm run e2e`
  - Headed: `npm run e2e:headed`
  - Single worker: `PW_WORKERS=1 npm run e2e`
- Optional overrides: `E2E_BASE_URL`, `E2E_BACKEND_URL`, `E2E_ADMIN_KEY` (to override auto-detection).

Policy Mental Model (for assertions)
- Real Move: parimutuel with rake; no winners → CANCELLED (refund). Winnings credited to USDT.
- Arcade Move: fixed odds; no refunds for no-winner pools. Winnings credited to BET.
- WDL (both modes): fixed odds set at bet-time; winners get exact odds payout in respective currency.

File Index (for quick edits)
- Settlement engine: backend/src/helpers/resolve_bets.ts
- Wager creation: backend/src/controllers/wager_controller.ts
- Feature flags: backend/src/utils/features_runtime.ts, backend/src/controllers/admin_features_controller.ts, backend/src/server.ts
- Ledger/history: backend/src/services/user_service.ts, backend/src/models/balance_history_model.ts
- E2E core: e2e/tests/*.spec.ts, e2e/tests/utils.ts, e2e/global-setup.ts, e2e/playwright.config.ts
