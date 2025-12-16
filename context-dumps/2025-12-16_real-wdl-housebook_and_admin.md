Context Dump — 2025-12-16 — Real WDL House‑Booked + Admin Risk Panel

Summary
- Migrated Real WDL settlement to house‑booked fixed odds (no parimutuel share), while leaving Move bets parimutuel.
- Implemented server‑side risk gating with caps: per‑bet, per‑player per‑game, per‑outcome per‑game, per‑game worst‑case, and global exposure. Confidence gating scales caps early.
- Added Admin Risk panel (UI) with live exposure display, editable config (bankroll, margins, max odds, absolute caps), auto‑refresh on save, and a danger‑zone “clear all wagers” (dev only).
- Clamped Real WDL multipliers shown in UI (house margin + max odds) so display matches backend constraints.
- Adjusted Real‑mode stake presets to avoid CAP_PER_BET errors; presets adapt based on backend per‑bet limits.
- Fixed microservice base path for dev (`MICROSERVICE_URL=http://localhost:8000/dev`) and allowed `X-Admin-Key` in CORS.

Key Backend Changes
- WDL settlement: fixed odds for Real and Arcade (backend/src/helpers/resolve_bets.ts); winnings use odds.
- Risk config + gating: backend/src/helpers/risk_config.ts; oddsFromP, scaleCapsForConfidence, env‑backed defaults.
- Exposure service: backend/src/services/exposure_service.ts; computes game/global/per‑user liabilities.
- Wager create gates for Real WDL: backend/src/controllers/wager_controller.ts; computes server odds, checks caps, returns 403 on violations with code + cap.
- Admin Risk API: backend/src/routers/admin_router.ts, backend/src/controllers/admin_risk_controller.ts.
- Dev: POST /admin/dev/clear-wagers to purge wagers (gated): backend/src/controllers/admin_dev_controller.ts.
- Real markets (read‑only) now return house odds and per‑bet limits: backend/src/controllers/real_market_controller.ts.
- CORS: allow `X-Admin-Key`; server mounts /admin routes.
- Microservice base path: backend/.env.local sets `MICROSERVICE_URL=http://localhost:8000/dev` for local Docker router.

Key Frontend Changes
- Admin Risk UI: frontend/src/containers/AdminRiskPage/component.tsx; auto‑refresh after save, game exposure inspector, absolute caps fields, danger‑zone clear wagers, improved visuals.
- Real stake presets: dynamic to backend per‑bet limits; fallback early [1,2,3,5] then [2,5,10,20].
- WDL odds clamping in UI: frontend/src/utils/realOdds.ts + outcomes component; uses margin + max odds; no raw 1/p in Real mode display.
- Receipts/history reflect fixed odds for WDL (both modes); consistent xN handling.
- ProtectedRoute: avoids bounce by treating presence of token as tentatively authenticated before Redux hydration.
- Notation list: fixed height scroll region to avoid pushing receipts off screen.

Dev/Env Notes
- Local Admin access: backend/.env.local (ADMIN_API_KEY=dev-admin); FE sends FAUCET_ADMIN_KEY=dev-admin from frontend/.env.
- Production Admin: omit ADMIN_API_KEY; rely on JWT role=admin via requireAdminAccess.
- Microservice 404s were due to missing /dev prefix; resolved.

Next Considerations
- Add public read‑only caps endpoint or surface safe max stake via /api/status for non‑admin FE stake hints.
- Pause/resume per game/outcome in Admin panel.
- Alerts (70%/90%) with webhook + audit for config changes.

