New UI Migration Plan (Strangler Approach)

Overview
- Goal: Replace the legacy frontend with the new mock‑first application, while keeping production usable throughout the transition.
- Strategy: Build the new UI as the primary surface, progressively wiring real data and actions behind the mock components. The legacy UI remains only as a fallback until parity is reached, then it is removed.

Guiding Principles
- Mock‑first is paramount: The mock UI’s aesthetics, layout, and behavior are the source of truth. Avoid “pulling in” legacy UI patterns unless they match the mock UX.
- Respect the end state: Implement features and wiring in a way that makes the final swap straightforward, not an afterthought.
- Backend‑driven evolution: It’s acceptable (and encouraged) to adjust backend endpoints or add adapters to better support the mock UI’s needs.
- Progressive enhancement: Keep the mock visual fidelity intact; replace mocked data with real wiring behind adapters/contexts without altering the visual composition.
- DRY + refactor: Mocks were generated independently; expect duplicated header/sections/styles. Refactor toward shared components while preserving layout and styling.

Strict Mock‑First Mandate (Clarification)
- Treat mocks as canonical. Do not port legacy UI widgets or flows into mock pages. Only implement UI that exists in the mocks.
- Adapt the backend to the mocks, not vice‑versa. Prefer adapters or backend changes over altering mock layouts/controls.
- Scope guard for “old features”: When a feature exists in the legacy UI but not in the mocks, exclude it unless a mock explicitly calls for it.
- Stake sizing example: Use the mock settings (see `MOCK_SETTINGS.md`, e.g., `defaultStake`) for wager sizing. Do not add legacy stake chips or similar controls unless they appear in the mocks.
- Referencing legacy code is allowed strictly for implementation guidance and data semantics — not for UI parity. Any exceptions must be documented inline with a TODO and rationale.
 - Do not import legacy UI components into mock pages. If a mock needs analogous behavior, re‑implement a minimal, mock‑styled version locally (e.g., under `experimental/`) rather than reusing components from `containers/ChessMatch` or similar.
 - If there’s a conflict between legacy visuals and mocks, the mocks win. Use legacy files for data shape only, not styles or components.

Scope & Priorities
1) Chess Game (new UI) — live first (board, clocks, predictions, betting, receipts), then secondary views.
2) New Dashboard — live snippets (featured match, balances, recent bets) with graceful fallbacks.
3) Onboarding (mock) — route unauthenticated users here when they hit the new app.
4) Settings (mock) — wire minimal profile/environment toggles; expand iteratively.
5) My Bets / Stats — hydrate with real data; keep layout as in mocks.

Routing & Auth
- New routes (examples):
  - /new-dashboard (primary landing)
  - /new-onboarding (mock onboarding flow)
  - /new-settings, /new-my-bets, /new-stats
  - /chess/featured and /chess/:id → new game UI behind feature flag when applicable
- Auth gating policy:
  - If user is not authenticated and visits a new‑app page that requires auth (e.g., new dashboard when placing wagers), redirect to /new-onboarding.
  - Header must reflect auth state (no fake balances or avatar for guests). Provide clear CTAs: “Sign In” and “Get Started”.

Adapters & Data Model
- Introduce boundary/adapters to normalize backend → UI models (e.g., game adapter for FEN, clocks, status). Keep view logic isolated from backend shape.
- Prefer server FEN and authoritative status, with safe fallbacks (reconstruct from move history only as needed).
- Clocks: interpret server ms/s intelligently; tick locally; refresh on snapshots.

Wagering & Sockets
- Use real APIs for creating wagers; prefer server‑priced odds for real WDL.
- Listen to websocket ‘wager_result’ to reconcile tickets immediately (pending → won/lost/cancelled), not just on polling.
- Present concise error microcopy; avoid surfacing raw server messages.

Styling & Theming
- The mock design system is the canonical reference. Any deviation for expedience should be considered temporary and reviewed.
- Consolidate repeated mock styles/components (e.g., headers, cards) into shared building blocks, but do not regress the visual fidelity.

Backend Changes Are In‑Bounds
- It is acceptable to:
  - Add endpoints or fields to better support the mock UX (e.g., richer game stats, viewer counts, pricing metadata).
  - Adjust validation to separate client errors (400) from server errors (500).
  - Introduce environment flags and feature configs for progressive rollout.

Common Pitfalls (Avoid)
- Do not recreate legacy UI behaviors in the new UI unless the mocks call for it.
- Do not force the new UI to adapt to legacy API quirks; insert adapters or evolve the backend instead.
- Do not degrade the mock layout just to squeeze in incomplete real data; use fallbacks and graceful empty states.

Incremental Swap Plan
1) Gate new game and dashboard routes behind feature switches where helpful.
2) Wire data behind mocks via adapters (keep visual exactness).
3) Replace legacy flows page‑by‑page as parity is achieved.
4) Remove legacy pages/components once unused.

Contributor Notes
- When touching code, prefer small, contained changes consistent with the mock’s visual language.
- If a mock shows a feature not yet supported, stub data thoughtfully and document gaps (TODOs) near adapters, not in the view.
- Keep PRs focused (one feature or page shell at a time) and include a brief of what’s real vs. still mocked.
