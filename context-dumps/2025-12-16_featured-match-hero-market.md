Featured Match — Hero Market Implementation (2025‑12‑16)

Summary
- Implemented “Featured Match” hero card and market details per FEATURE_CARD_REDESIGN.
- Added backend endpoints to supply card + details data, and integrated them in the FE.
- Upgraded the card visuals (identity, center instrument, stakes), added desktop flip to market, and ensured mobile drawer fallback.

Backend
- New endpoints mounted at `/matches`:
  - `GET /matches/featured`: featured DTO with status, time control, players, clocks, stakes, source, stats, meta (move_number, phase, side_to_move).
  - `GET /matches/:id/details`: odds + pool, stakes, last move + side to move, etc.
- Files: `backend/src/controllers/matches_controller.ts`, `backend/src/routers/matches_router.ts`, `backend/src/routers/index.ts`, `backend/src/server.ts`.

Frontend
- New components:
  - `FeaturedMatchCard` (hero card with identity chips, ticking clocks, stakes block, View Market flip on desktop).
  - `MatchDetailsDrawer` (mobile/route fallback, `/matches/:id`).
- Requests/Types: `store/requests/matchesRequests.ts`, `types/matches.ts`.
- Dashboard integration: loads featured DTO, shows card or falls back to legacy FeaturedMatch.
- Normal `GameCard`: action row includes “View Market” for consistency.

Key UX Decisions
- Identity: color chips (king icons from `/pieces_w` and `/pieces`) + flags (when available), name > rating hierarchy.
- Center instrument: grouped VS + clocks, pinned to top between players.
- Clocks: show mm:ss; only active side ticks and highlights; urgency tiers (<=60s amber, <=20s red pulse).
- Time control label: read from DB (`time_control`), not inferred from remaining clocks.
- Stakes: uppercase headline + “$min – $max per bet”; “Be the first to bet” when empty.
- Live tag: no blinking dot; motion is the active clock.
- Flip polish: no internal scrollbars, accent back face, smooth 3D flip; actions stay aligned below.

Validation Notes
- Run frontend locally and check Dashboard:
  - Card appears with identity chips, LIVE on live matches, clocks tick for the active side.
  - Header meta shows `10+X · Rapid · Lichess` (from DB) and stakes pill at right.
  - “View Market” flips card (desktop) without scrollbars; mobile opens drawer via `/matches/:id`.
  - Drawer shows odds chips and pool; copy softens when zero.
- Backend endpoints return expected shapes; time control is consistent with game data.

Follow‑ups
- Optionally add flags + chips to normal GameCard for parity.
- Consider websocket-driven clock sync for perfect time (visual tick is client-side only).
- Tweak accent gradient per brand preferences.

Branches & Merges
- Frontend: `feature/featured-match-card-redesign` merged into `dev`.
- Backend: `feature/featured-match-card-redesign` merged into `dev`.
- Root: updated submodule pointers on `dev`.

