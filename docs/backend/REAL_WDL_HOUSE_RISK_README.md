BetMate — Real WDL House-Booked Risk Plan + Admin Panel Spec

Purpose
- Migrate Real WDL from parimutuel to house-booked fixed odds while keeping Move bets parimutuel.
- Cap worst‑case liability at bankroll‑safe levels with simple, transparent controls.
- Preserve current gameplay UX; add back‑office control via an Admin Panel.

Scope and Assumptions
- Applies to Real mode WDL (white_win, draw, black_win) only. Move bets remain parimutuel with rake.
- Odds are computed from engine probabilities plus margin; winners are paid stake × odds, losers lose stake.
- Tokens (“Arcade”) remain as-is (already house‑booked fixed odds for WDL and move bets).

Key Concepts
- Per-bet liability (L): stake × (odds − 1). Treat stake as already in the house wallet.
- Outcome liability (game, side): sum of L for that outcome across all unresolved Real WDL bets in the game.
- Game worst-case liability: max(outcome liabilities) across white/draw/black for that game.
- Global live exposure: sum of each live game’s worst-case liability.
- Per-player live liability: sum of a player’s liabilities across open Real WDL bets.

Caps to Enforce (Launch Defaults)
- Define a dedicated booking bankroll for Real WDL (B). Caps scale off B.
- Per-game worst-case cap: 0.25%–0.75% of B (start 0.5%).
- Per-outcome per-game cap: 30%–50% of the per-game cap; draw at the low end.
- Per-bet liability cap: 5%–15% of the per-game cap (start 10%).
- Per-player per-game cap: 15%–30% of the per-game cap (bounded by remaining outcome room).
- Global live exposure cap: 10%–20% of B (start 15%).
- Draw odds clamp: cap max multiplier (e.g., 5–6x). White/Black: 3.5–4.5x in fast time controls.
- Confidence gating: during early/volatile positions, scale down caps (e.g., ×0.5) and/or increase margin.

Pricing and Margin (Simple, Robust)
- Compute odds from engine probability p with house margin m: odds = (1 − m) / p.
- Baseline margins: white/black m_base = 3%–6%; draw m_draw = m_base + 5%–10% (start +7%).
- Confidence gating adds temporary margin (+3%–5%) and/or reduces max odds during low confidence.

Bet Acceptance Rules (Algorithm)
- Inputs: proposed bet (game, outcome, stake), offered odds, current exposures, configured caps.
- Compute projected deltas if accepted:
  - betLiability = stake × max(1, odds) − stake = stake × (odds − 1)
  - outcomeLiability' = outcomeLiability + betLiability
  - gameWorst' = max(outcomeLiabilities' for white/draw/black)
  - playerPerGame' = playerPerGame + betLiability
  - globalExposure' = globalExposure + max(0, gameWorst' − gameWorst)
- Accept IFF all are true:
  - betLiability ≤ per-bet cap
  - playerPerGame' ≤ per-player per-game cap
  - outcomeLiability' ≤ per-outcome cap (tighter for draw)
  - gameWorst' ≤ per-game cap
  - globalExposure' ≤ global cap
- Otherwise: reject (market temporarily paused or limit reached).

Operational Controls
- Kill-switches: disable Real WDL globally; disable draw globally; disable draw per game.
- Alerts: notify at 70% and 90% thresholds (outcome, game, global). Expose test hooks.
- Logging & audit: persist bet decisions (accepted/rejected) with exposures and cap causing decision; config changes with actor and diff; kill-switch activations.
- Rollovers: reset per-player daily caps at UTC midnight; respect KYC/AML provider limits separately.

Backtesting & Stress Testing
- Replay historical games with caps to quantify pauses and P&L volatility.
- Sweep margins and caps to calibrate draw odds and exposure comfort.
- Start conservative; increase caps as data accrues.

Environment & Config (Proposed Names)
- Enable/Mode
  - REAL_WDL_HOUSE_ENABLED=true
- Bankroll and Global
  - REAL_WDL_BANKROLL=100000        # reference bankroll B (USDT)
  - REAL_WDL_GLOBAL_EXPOSURE_CAP_PCT=0.15
- Per-Game & Outcome Caps
  - REAL_WDL_PER_GAME_CAP_PCT_OF_B=0.005
  - REAL_WDL_PER_OUTCOME_CAP_PCT_OF_GAME_WHITE=0.5
  - REAL_WDL_PER_OUTCOME_CAP_PCT_OF_GAME_BLACK=0.5
  - REAL_WDL_PER_OUTCOME_CAP_PCT_OF_GAME_DRAW=0.35
- Per-Bet / Per-Player
  - REAL_WDL_PER_BET_LIABILITY_CAP_PCT_OF_GAME=0.10
  - REAL_WDL_PER_PLAYER_PER_GAME_CAP_PCT_OF_GAME=0.25
- Pricing & Odds
  - REAL_WDL_MARGIN_BASE=0.04
  - REAL_WDL_MARGIN_DRAW_EXTRA=0.07
  - REAL_WDL_MAX_ODDS_WHITE=4.0
  - REAL_WDL_MAX_ODDS_BLACK=4.0
  - REAL_WDL_MAX_ODDS_DRAW=6.0
- Confidence Gating
  - REAL_WDL_CONF_MIN_DEPTH=14        # engine depth threshold to consider “confident”
  - REAL_WDL_CONF_EARLY_MOVE_NUM=20   # treat <= this as early game
  - REAL_WDL_CONF_CAP_MULT_EARLY=0.5  # scale caps in early/low-confidence
  - REAL_WDL_CONF_MARGIN_EXTRA=0.03   # add to margin in low-confidence
- Feature Flags / Kill Switches
  - REAL_WDL_DISABLE_DRAW=false
  - REAL_WDL_DISABLE_WDL=false
- Alerts
  - ALERTS_WEBHOOK_URL=...
  - ALERTS_THRESHOLD_WARN=0.7
  - ALERTS_THRESHOLD_CRIT=0.9

Acceptance Flow (Pseudocode)
1) Validate game status allows betting; feature flags OK.
2) Compute engine p; apply margin and odds clamps → offeredOdds.
3) Compute betLiability = stake × (offeredOdds − 1).
4) Compute exposure projections and compare vs caps (per-bet, per-player per-game, per-outcome, per-game, global).
5) If any violated → reject with reason tag; else persist bet, update exposure tracking, audit log.

Best Practices
- Cap draw more aggressively; require stronger confidence for draw odds > 4–5x.
- Favor pauses over dynamic repricing at launch; fewer UX surprises.
- Start conservative (lower caps); loosen as data supports.
- Separate WDL booking bankroll from other products; review weekly.

Admin Panel Spec (Manage Risk and Markets)

MVP Goals
- Give ops the ability to view exposure, pause markets, and adjust caps/margins with audit.
- Secure, minimal UI built into existing frontend behind admin auth.

Roles & Access
- Roles: admin (full), ops (change caps/kill switches), readonly (view only).
- Gate via JWT roles on backend and route-guarded admin UI on frontend.

Pages (MVP)
- Dashboard
  - Global exposure: current, warn/crit status, sparkline.
  - Active games table: worst-case liability, side pauses, draw flag, time control, move number.
  - Quick actions: kill-switch toggles, resume, edit caps.
- Game Detail
  - Outcome liabilities (white/draw/black), caps vs current, near‑cap indicators.
  - Controls: pause/resume per outcome; set per-game caps; set draw-only caps.
  - Recent bet decisions (accepted/rejected) with reasons.
- Risk Config
  - Global settings: bankroll B, global cap, per-game cap pct, per-outcome cap pcts, per-bet/per-player cap pcts.
  - Pricing: base margin, draw extra margin, max odds per outcome.
  - Confidence: depth thresholds, early-game move number, cap multiplier, extra margin.
  - Persistence: save versioned configs; preview impact; rollback.
- Users & Limits
  - Search user, see current limits and recent rejections; set per-user caps or flags.
- Audit & Alerts
  - Audit log with filters (actor, action, entity, time). Export.
  - Alerts configuration and test webhook.

APIs (Sketch)
- GET /admin/exposure/global → { globalExposure, cap, warn, crit }
- GET /admin/exposure/games → list of { gameId, worstCase, perOutcome, caps, paused }
- GET /admin/exposure/games/:id → detail exposure for a game
- POST /admin/markets/:id/pause { outcome? } → pause game or specific outcome
- POST /admin/markets/:id/resume { outcome? }
- GET /admin/config/risk → current config (merged env + DB)
- PUT /admin/config/risk → update (DB-stored), return version
- GET /admin/users/:id/limits → read per-user overrides
- PUT /admin/users/:id/limits → set per-user overrides
- GET /admin/audit?type=...&limit=&cursor=
- POST /admin/alerts/test → trigger test alert

Data Model (Mongo, Proposed)
- RiskConfig
  - _id, version, created_at, created_by
  - scope: 'global' | 'time_control:<id>' | 'game:<gameId>' | 'user:<userId>'
  - values: { bankroll, caps, margins, oddsCaps, confidence, flags }
- ExposureSnapshot (optional caching)
  - at, globalExposure, perGame: [{ gameId, worstCase, perOutcome }]
- UserLimits
  - userId, caps: { perBetLiability, perGameLiability }, flags
- AuditLog
  - at, actor, action, entityType, entityId, before, after, reason

Implementation Notes
- For MVP, compute exposure from unresolved Real WDL wagers on read; cache short‑lived (e.g., 1–2s) if needed.
- Config precedence: per-game > time_control > global > env defaults. If DB missing, fall back to env only (safe defaults).
- All admin mutations are logged to AuditLog with diff.

Rollout Plan
- Phase 0 (Docs Only): finalize caps and defaults; socialize ops playbooks.
- Phase 1 (Server Acceptance): implement bet acceptance gating + pricing (no admin UI yet); expose read‑only exposure endpoints.
- Phase 2 (Admin MVP): ship dashboard, game detail, risk config edit, audit, kill‑switches.
- Phase 3 (Enhancements): per-user overrides UI, alerts configuration, backtesting tools.

Operational Playbooks
- On repeated draw pauses: increase draw margin (+2–3%) or lower draw max odds; review engine confidence gating.
- On global nearing cap: pause lowest‑confidence games first; reduce per-bet caps temporarily.
- Weekly review: realized EV vs expected, variance, near‑cap events; tune caps.

Testing Checklist (Pre-Go‑Live)
- Unit: acceptance decision logic across boundary conditions; config precedence.
- Integration: exposure computations with concurrent wager placements.
- Load: many small bets vs large capped bets; ensure pause behavior is responsive.
- DRY‑run: replay historical games with proposed caps to confirm acceptable pause frequency and P&L band.

Notes
- This document is implementation‑ready for backend acceptance rules and admin API scaffolding.
- No code changes are included here; values are suggested starting points and should be tuned with live/experimental data.

