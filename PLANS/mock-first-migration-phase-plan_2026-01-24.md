Mock‑First Migration — Tasks & Phased Plan (2026‑01‑24)

Context
- Mock‑first is the mandate. Do not import legacy UI into mock pages. Adapt data and backend to the mocks as needed.
- This plan tracks remaining work and a pragmatic phase order to raise fidelity across the new pages while keeping visuals aligned to the mocks.

Remaining Tasks
- Routing & Auth
  - Add a tiny auth guard hook to DRY guest → "/new-onboarding?from=…" across new pages (frontend/src/experimental/*).
  - Gate /new-game/:id for guests (disable CTAs, show sign‑in nudge) (frontend/src/containers/NewGameContainer/component.tsx).
  - Normalize token hydration to suppress header flicker until jwtSignIn resolves (frontend/src/components/app.tsx).

- Header, Dropdown, Wallet
  - Make Profile dropdown "Deposit" open the mock modal (not /wallet) (frontend/src/experimental/ProfileDropdown.tsx, MockDepositModal).
  - Add a lightweight "Withdraw" mock using the same visual language (frontend/src/experimental/).

- Dashboard
  - Add skeletons for live matches/leaders while fetching (frontend/src/experimental/NewDashboard.tsx).
  - Add empty states (no matches, no bets) (frontend/src/experimental/NewDashboard.tsx).
  - Minimal Match Details Drawer: open on card click with odds summary; route to /new-game/:id on "View Game".

- Game UI
  - Move Predictions: robust SAN hover parsing; stable loading/empty states (frontend/src/components/MovePredictions/component.tsx).
  - Outcome card: integrate min/max stake hints per mode/limits; clear disabled copy (frontend/src/experimental/DrawOutcomeCard.tsx).
  - Eval bar: normalize odds (handle zeros/NaN) and keep end‑state collapse stable; verify mobile spacing (frontend/src/containers/NewGameContainer/component.tsx).
  - Ensure end overlay always sits above chessground on all breakpoints (frontend/src/components/NewChessboard/style.scss).

- My Bets / Stats / Settings
  - My Bets: add sort/filter (time/result); link rows to games; graceful empties (frontend/src/experimental/NewMyBets.tsx).
  - Stats: keep placeholders or add tiny charts (no new libs); verify store‑derived metrics (frontend/src/experimental/NewStats.tsx).
  - Settings: persist mock prefs locally (username, defaultStake, prefs) and leave clear TODOs for server writes (frontend/src/experimental/NewSettings.tsx).

- Mobile & Responsiveness
  - Audit narrow breakpoints for header, dropdown, right column growth; refine gaps and stickiness (frontend/src/experimental/*.tsx, frontend/src/components/NewChessboard/style.scss).

- Accessibility
  - Ensure buttons/links have roles, focus order, keyboard handlers, and title/aria text (frontend/src/experimental/*.tsx, frontend/src/components/*).

- Theming & Tokens
  - Centralize recurring rgba/border values into tokens; verify contrast in light mode (frontend/src/style.scss, frontend/src/styles/*).

- Data & Sockets
  - Viewer count + featured match stability via polling/stats adapters (frontend/src/experimental/hooks/useNewDashboardData.ts).
  - Optional: optical balance hint after bet create; reconcile on real updates (frontend/src/store/reducers/wagerReducer.ts).

- Backend Adapters (client‑facing)
  - Keep adapters isolating backend shapes from views; extend game adapter as needed (frontend/src/adapters/game.ts).

- QA & E2E
  - Add 1–2 e2e "happy path" captures for new flows (no CI push yet) (e2e/tests/visual-capture.spec.ts).

- Cleanup
  - Re‑scan new pages to ensure no legacy UI imports remain; remove dead code and unused styles (frontend/src/experimental/*).


Phased Implementation Plan
- Phase 0 — Stabilize Shells (short)
  - Add DRY useRequireAuthForNew() hook for onboarding redirects.
  - Normalize token hydration in app.tsx to avoid header flicker.
  - Profile dropdown “Deposit” → mock modal; add placeholder "Withdraw" modal.

- Phase 1 — Dashboard Parity (mock‑first data)
  - Skeletons + empty states for live/leader/recent lists.
  - Minimal Match Details drawer; card → drawer → game route.
  - Verify clock/viewer count cadence and error handling.

- Phase 2 — Game UX Core
  - Finalize Move Predictions loading/empty/hover behavior.
  - Outcome card: min/max stake hints, limit messages per mode.
  - Eval bar: odds normalization + end collapse; mobile spacing.
  - Confirm end overlay z‑index across devices.

- Phase 3 — My Bets, Stats, Settings
  - My Bets: sorting/filtering, link to games, empties.
  - Stats: tiny charts/skeletons; confirm stat math from store.
  - Settings: local persistence; TODOs for server write.

- Phase 4 — Mobile + A11y Sweep
  - Header/dropdown small‑screen behavior; right column growth.
  - Roles, focus, keyboard activation across new components.

- Phase 5 — Data Hygiene & Feedback
  - Featured match stability; viewer counts.
  - Optional optical balance hint; clean error microcopy.

- Phase 6 — QA & Checkpoint
  - E2E captures: guest → onboarding/login → dashboard → game → place bet → receipts.
  - Visual sanity; checkpoint branch.

- Phase 7 — Progressive Roll‑in
  - Gate legacy routes behind new pages as parity is reached.
  - Mocks remain the UI source of truth; no legacy UI imports.

Notes
- All new UI lives under experimental/ or dedicated mock components. Backend shape differences are handled via adapters; visual composition follows mocks exactly.

