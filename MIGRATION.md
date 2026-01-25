BetMate — Mock‑First UI Migration Guide

Overview
- Goal: Migrate to the new mock‑first UI while keeping production functionality stable. This guide documents the strangler approach, what’s shipped, what remains, and how to safely extend or port features.

Status Summary (2026‑01‑25)
- Migration complete: all primary routes now use the new UI components
- experimental/ directory has been removed from the bundle; pages have been ported to containers
- "Mock" prefixes removed from component names; header modals are canonical
- Auth + onboarding aligned with token-aware redirects; login reuses backend auth
- Clocks, receipts, and profile dropdown integrated in the header
- Mobile-friendly header design with simplified layout
- Arcade move pricing implemented server‑side; Arcade move settlement uses fixed odds. Real move settlement remains parimutuel with rake + refund if no winners.
- Real‑mode gating is enforced via runtime feature flags.
- Featured‑game selector (smart TV candidates) available behind a flag with admin inspect route.
- Currency display fixes to avoid duplicate symbols
- FE balance migration to `token_balance` still in progress; legacy `account` maintained for back‑compat.

Migration Status
- All new pages have been moved from `frontend/src/experimental/` to proper component directories.
  - `frontend/src/components/app.tsx` routes (canonical):
    - `/` → `containers/Dashboard`
    - `/chess/:id`, `/matches/:id`, `/chess/featured` → `containers/GameContainer`
    - `/bets` → `containers/MyBets`
    - `/stats` → `containers/Stats`
    - `/signin`, `/signup` → `containers/Login`
    - `/user` → `containers/Settings`
    - `/onboarding` → `containers/Onboarding`
  - Auth hydration suppresses guest flicker when a token exists.
- Legacy pages have been removed or are no longer referenced in the codebase.

Auth & Onboarding
- Token‑aware gating for routes (no onboarding redirect when a JWT exists).
  - `frontend/src/containers/Login/hooks/useRequireAuth.ts`
- Login page implements the LOGIN.md UI design and calls existing `signInUser`, honoring `?from` return.
  - `frontend/src/containers/Login/component.tsx`
- Profile dropdown in header exposes My Bets, Settings, Stats, Deposit, Sign Out.
  - `frontend/src/components/Header/ProfileDropdown.tsx`
  - `frontend/src/components/Header/component.tsx`

Game UI & Data Adapters
- Use server FEN where available; derive turn and support ms/s clock parsing; local ticking for stability.
  - `frontend/src/adapters/game.ts`
  - `frontend/src/containers/GameContainer/component.tsx`
- Dashboard hooks provide live games, balances, wagers, and lightweight skeletons/empty states.
  - `frontend/src/hooks/useDashboardData.ts`

Wagering, Pricing, and Settlement
- Server
  - Arcade move odds: computed from engine top‑moves using an exponential decay on Δ centipawns with a house margin and odds clamps.
    - `backend/src/controllers/wager_controller.ts`
  - Settlement:
    - WDL (both modes): fixed odds stored at bet‑time.
    - Move: Arcade → fixed odds; Real → parimutuel with rake and refund when no winners.
    - `backend/src/helpers/resolve_bets.ts`
  - Real‑mode gating via runtime feature flags; currency enforced by mode (Arcade=BET, Real=USDT).
    - `backend/src/controllers/wager_controller.ts`
  - Real move rake ledger entries (best‑effort, non‑blocking) recorded when applicable.
    - `backend/src/services/house_ledger_service.ts`
- Frontend
  - Requests are de‑duplicated and respect 429 cooldowns; receipts reconcile in real‑time via websocket updates.
    - `frontend/src/store/requests/*`
    - `frontend/src/store/reducers/wagerReducer.ts`
  - Hooks naming: canonical hooks are `useDashboardData`, `useMyBetsData`, `useStatsData`. Backwards‑compat named exports (`useNew*`) remain but should not be used in new code.

Balances Migration (`account` → `token_balance`)
- Backend debits Arcade from `token_balance` (initializing from legacy `account` if missing) and keeps `account` in sync during migration.
  - `backend/src/controllers/wager_controller.ts`
- Frontend should prefer displaying/adjusting `token_balance` and treat `account` as a legacy mirror until full cutover.

Feature Flags, Featured Selector, Admin
- Backend status exposes `realModeEnabled` and pricing version.
  - `backend/src/server.ts`
- Smart featured selector prefers suitable TV candidates (time control, stage, players, streamers) under `FEATURED_SELECTOR_ENABLED=true`.
  - `backend/src/services/featured_selector.ts`
  - Admin inspect endpoint: `GET /admin/featured/candidates`.

Dev Examples & Previews
- Design‑reference prototypes are available under dev routes for previewing ideas:
  - `/examples/mobile-dashboard`, `/examples/empty-states`, `/examples/theme-toggle`, `/examples/toasts`
  - Sources: `frontend/src/examples/*`

Pitfalls & Guardrails
- The migration from mock-first components is complete; use canonical containers/components only.
- Imports of `experimental/*`, `Mock*`, and `New*` component paths are blocked by ESLint; examples are allowed under `src/examples/**`.
- Do not introduce duplicate pricing logic in the client; trust server‑side odds.
- Maintain balance consistency: prefer `token_balance`; if updating legacy `account` during transition, mirror precisely.
- Keep analysis requests batched and de‑duplicated; respect cooldowns to avoid 429s.
- Ensure mobile responsiveness is maintained with the new header design.

Checklist for New Features
- Add new components to their proper locations in the component hierarchy.
- Use existing hooks/adapters; avoid duplicating request logic.
- Ensure auth gating and token hydration behavior match expectations.
- Add skeletons/empty states, then verify with the E2E capture flow.
- Confirm accessibility basics (focus, keyboard, labels) and responsive behavior.
- Test on both desktop and mobile form factors.

References
- INSTRUCTIONS: `INSTRUCTIONS.md`
- Context dumps: `context-dumps/2026-01-24_featured-selector_and_new-ui-swap.md`, `context-dumps/2026-01-24_mock-auth-login-dropdown_context-dump.md`

Appendix — Renames for clarity
- NewGameContainer → GameContainer (`frontend/src/containers/GameContainer`)
- NewChessboard → Chessboard (`frontend/src/components/Chessboard`)
