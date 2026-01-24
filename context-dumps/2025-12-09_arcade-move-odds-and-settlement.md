BetMate Arcade Move Odds + Settlement — Context Dump (2025-12-09)
================================================================

Overview
- Goal: Implement fixed-odds pricing for Arcade move bets, surface those odds in the UI, enforce server-side Real-mode gating, and ensure Arcade move bets are win/lose (no refunds when no one is correct). Keep Real mode parimutuel with rake and refund on “no winners”.

Key Changes (Backend)
- Wager creation
  - Real-mode gating: reject `mode=real` unless `FEATURE_REAL_MODE=true`.
  - Arcade move odds (Level-0 heuristic): compute odds from top-move engine scores using Δ from best → bucketed raw p → normalized → odds = (1 - margin)/p, margin via `ARCADE_MOVE_MARGIN` (default 0.08). Stored as `odds` on the wager.
  - Currency by mode enforced: Arcade=BET, Real=USDT.
  - File: `backend/src/controllers/wager_controller.ts`

- Settlement logic
  - Arcade move bets: always win or lose; no refund if “no winners”. Winners paid by stored odds.
  - Real move bets: parimutuel share with rake; refunds when “no winners”.
  - Implementation: `processCriticalMoveWagers` uses fixed-odds for Arcade and only returns for Real; `getWagerResults` routes Arcade “cancelled” to `lost` defensively.
  - File: `backend/src/helpers/resolve_bets.ts`

Key Changes (Frontend)
- Outcome rail rename
  - Renamed “Outcome Rail” to “Move/Outcome Rail” in markup and styles (class names prefixed `move-outcome-rail-*`).
  - Files: `frontend/src/containers/ChessMatch/component.tsx`, `frontend/src/styles/chessmatch-layout.scss`

- Surface Arcade move odds in UI
  - Outcome rail (center move chips): shows odds multipliers in Arcade; shows “wagered” only in Real.
  - BettingSidebar + MoveOptions: compute/display odds only in Arcade; Real hides odds.
  - Added `frontend/src/utils/pricing.ts` to share Δ→p odds computation.

- “process is not defined” fix
  - Removed `process.env` access in browser-only pricing util; used a safe default margin.

Verification
- Arcade mode
  - Move chips show odds (e.g., 1.85x). Placing a bet uses those odds client-side and backend recomputes defensively.
  - After a move resolves with no Arcade winners, wagers are LOST (not refunded). Winners are paid amount × stored odds.

- Real mode
  - Move chips show pool context (wagered amount), no odds.
  - Refunds occur when “no winners” (unchanged), rake applied to winners.

Flags/Env
- Backend
  - `FEATURE_REAL_MODE` (Real-mode gating)
  - `PRICING_MODEL_VERSION` (tag attached to wagers)
  - `ARCADE_MOVE_MARGIN` (0–0.25, default 0.08)
  - `POOL_RAKE` (Real parimutuel rake)

Open Follow-ups
1) Optional: add a ledger entry for rake collected in Real mode for observability.
2) Clean up legacy `account` in FE reducers in favor of `token_balance` only.
3) Consider toggling mobile chips to show both odds and percentiles in Arcade for clarity.

Files Touched (high-level)
- Backend
  - `src/controllers/wager_controller.ts`
  - `src/helpers/resolve_bets.ts`
- Frontend
  - `src/containers/ChessMatch/component.tsx`
  - `src/styles/chessmatch-layout.scss`
  - `src/components/BettingSidebar/index.tsx`
  - `src/components/WagerFormComponents/MoveOptions/component.tsx`
  - `src/utils/pricing.ts` (new)
- Root
  - `INSTRUCTIONS.md`

