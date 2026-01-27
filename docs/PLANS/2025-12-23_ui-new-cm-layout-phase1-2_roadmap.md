# UI/New CM Layout Phase 1–2 — Roadmap (Execution Plan)

Branch: `ui/new-cm-layout-phase1-2`
Owner: Eng (agents + core)
Status: Draft (ready to execute)

Goals
- Keep iterating on Test UI under the new layout (no port into real UI yet).
- Ship low-risk backend/infra improvements and FE hygiene that don’t block UI polish:
  - FE balance migration: prefer `token_balance` over legacy `account` everywhere.
  - House rake ledgering for Real move settlements (ops visibility, audit).
  - Microservice router observability for analysis endpoints.
  - Status/limits UX polish (stake caps/tooltips; harmless to current UI).
  - Light calibration hooks/toggles for Arcade move pricing.
  - Targeted E2E additions around the above.

Out of Scope (for now)
- Porting Test UI components (notation, receipts grid, Morph transitions) into the real ChessMatch UI. We’ll hold this behind `NEW_CM_LAYOUT` and tackle after the Test UI layout/game-flow stabilizes.

Plan — Work Items and Sequencing

1) Repo hygiene and branch setup
- Confirm work on `ui/new-cm-layout-phase1-2` (done). Keep changes small and isolated.
- Avoid touching production-only layout; Test UI continues to evolve at `/ui-test`.

2) FE balance migration (account → token_balance)
- Why: unify on `token_balance` for Arcade; keep `account` tolerated for back‑compat only.
- Changes (frontend):
  - Update types/validation to make `token_balance` primary and render it in any user-facing pages.
    - Files: `frontend/src/types/resources/auth.ts`, `frontend/src/validation/user.ts`, `frontend/src/containers/UserPage/component.tsx`.
  - Keep `account` optional and tolerated but stop displaying it.
- No server changes needed (server already debits both `token_balance` and legacy `account` for Arcade during migration).

3) House rake ledger (Real move settlements)
- Why: ops visibility and audit of revenue captured from Real parimutuel move pools.
- Approach: add a dedicated `HouseLedger` collection (not tied to a user) to record rake events.
  - Model fields: `{ game_id, move_number, amount, currency: 'USDT', rake_rate, total_pool_real, note?, created_at }`.
  - Service: `house_ledger_service.recordMoveRake(gameId, moveNumber, totalReal, rakeRate, amount)`.
  - Writer location: `backend/src/helpers/resolve_bets.ts` inside `processCriticalMoveWagers` (only when `mode='real'`, winners exist, and `returnReal=false`). Fire‑and‑forget; non‑blocking for settlement.
- Validation: add a small admin read endpoint later if helpful; E2E can assert presence via direct model query in test env.

4) Microservice router observability
- Why: router currently returns 200 with error payload on upstream failures; need a breadcrumb for ops.
- Changes: `microservice/src/router/router.py`
  - Emit structured logs/counters for upstream non‑200s and exceptions (include route, status, snippet of payload).
  - Optionally expose a simple `/health` or `/stats` (in‑process counters), guarded as needed for dev.

5) Status/limits UX polish
- Why: make caps/toggles surfaced by `/api/status` actionable and visible.
- Changes (frontend):
  - Respect `limits.arcadeMaxStakeMove/Wdl` to clamp stake inputs client‑side and add tooltips when exceeding caps.
  - Show a short hint when Real is disabled via `ModeContext.realEnabled` near the mode toggle.
  - Scope to components that already display stakes (avoid layout churn in real UI): add safe guards/labels; Test UI can mirror for demo.

6) Arcade move pricing — calibration hooks
- Keep existing Δ→p buckets; add env‑driven thresholds to allow quick calibration without code edits.
- Env knobs (server): `ARCADE_DELTA_T1=30`, `T2=80`, `T3=200`, with default current values. Use them in `wager_controller.ts`.
- Document in `INSTRUCTIONS.md`.

7) Tests (targeted)
- Add/extend E2E:
  - Stake cap UI behavior (Arcade): cannot submit > cap; tooltip visible.
  - Analysis router resilience: simulate upstream non‑200 and ensure UI doesn’t crash; optional log assertion if feasible.
  - House rake ledger (Real move): after a settled move with winners, assert a `HouseLedger` entry exists with correct amount (test env direct DB read).
- Unit/integration:
  - `processCriticalMoveWagers` rake math (return/no‑winner path vs winners) — node tests in backend.

Risks and Mitigations
- Changing balance displays: risk of regressions where legacy `account` is assumed. Mitigate by auditing occurrences and keeping validation backward‑compatible.
- Writing in settlement hot path: ledger write must not block settlement. Use best‑effort log + fire‑and‑forget write, avoid throwing.
- Router logs volume: keep logs to warning/info with minimal payload truncation.

Rollout
- Land in `ui/new-cm-layout-phase1-2` behind existing feature flags where applicable.
- No schema migrations that block runtime: adding a new collection is safe; FE changes are additive/tolerant.
- Verify via local Docker Compose and Playwright E2E.

Acceptance Criteria
- FE: User page and any visible balance surfaces show `token_balance` for Arcade, not legacy `account`.
- BE: House rake events recorded for Real move settlements with winners; no change in user settlement outcomes.
- Router: Logs upstream analysis errors; FE remains resilient to 200-with-error payloads.
- Caps: Client prevents stakes above limits and shows helpful hints.

Notes
- Deferring port of Test UI pieces to real UI until Test UI flow stabilizes. This will later be gated by `NEW_CM_LAYOUT`.

