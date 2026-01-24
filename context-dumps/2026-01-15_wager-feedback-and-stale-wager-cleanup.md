Wager Feedback + Orphan Wagers Cleanup

Date: 2026-01-15
Owner: UI/UX feedback + backend startup cleanup

Summary
- Frontend: Added concise, inline feedback for rejected wagers (no toasts). Outcome headers show a brief reason; move rejections surface in the bottom bar. Added dev console logs and aria-live announcements; cleared stale errors; and introduced client-side prechecks for auth, balance, and Arcade caps.
- Backend: Prevent orphaned unresolved wagers from blocking new bets after restarts. Startup now marks lingering games ABORTED instead of deleting, sweeps unresolved Real WDL wagers whose games are missing/complete (refund + CANCELLED), and filters global exposure to active games only. Admin clear-stale endpoint handles orphans too.

Frontend Details
- Outcome headers (WDL/Draw)
  - Inline state: loading, confirmed, rejected.
  - On rejection: “Rejected — <short reason>” next to state chip + title tooltip.
  - a11y: aria-busy on loading; aria-live announces accept/reject.
- Move tiles
  - Visual rejection remains; bottom bar shows “Move bet rejected — <short reason>” (~1.6s), tile tooltip mirrors reason.
  - Debounce: prevent double-firing while loading.
- Client prechecks (no wasted calls)
  - Unauthed: “Sign in to bet” hint and redirect.
  - Balance: blocks stake > balance with reason.
  - Arcade caps: blocks stake > arcadeMaxStakeMove/arcadeMaxStakeWdl (from /api/status).
- Dev logs: Structured console.info for success/failure and last error on window for quick inspection.
- Files: frontend/src/containers/ChessMatch/component.tsx, frontend/src/store/sagas/wager/watchers.ts, frontend/src/store/reducers/wagerReducer.ts, frontend/src/types/resources/wager.ts, frontend/src/utils/error.ts, frontend/src/utils/wagerErrorText.ts

Backend Details
- Startup purge behavior
  - Mark lingering/in-progress games as ABORTED (complete: true) instead of deleting.
  - After purge, sweep unresolved Real WDL wagers whose games are missing or complete; refund stake, mark CANCELLED/resolved.
  - Logs: purge_stale_games_* and wager_orphan_sweep_*.
- Exposure hardening
  - Global exposure includes only wagers from active (complete: false) games.
  - Per-game exposure returns zero if game doc missing.
- Admin cleanup
  - POST /admin/dev/clear-stale-wagers now also cancels orphaned wagers (no Chess doc) older than cutoff.
- Files: backend/src/services/chess_service.ts, backend/src/services/wager_cleanup_service.ts (new), backend/src/services/exposure_service.ts, backend/src/controllers/admin_wager_controller.ts, backend/src/server.ts

Validation Checklist
- UI: Off-live shows “Go Live” tooltip; rejections show inline reasons; aria-live announces; console logs contain context.
- Client precheck: unauth, insufficient funds, and cap exceed never hit the network.
- Restart scenario: unresolved wagers from prior session get cancelled/refunded on startup; placing new wagers is unblocked.
- Admin: /admin/dev/clear-stale-wagers with { olderThanMinutes: 1 } clears old unresolved wagers; logs counts.

Notes
- No toasts added by design; feedback is inline and minimal.
- Release/tagging not performed; local commits are on the current submodule branches (release).

