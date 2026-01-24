

• Here’s how I’d structure this so we ship fast and keep it snappy under load.

  What I Read

  - INSTRUCTIONS: INSTRUCTIONS/Emoji_Research_Integration.md, INSTRUCTIONS.md
  - Microservice analysis code: microservice/src/lambdas/{top_moves,move_analysis,wdl}/* (e.g.,
    top_moves model at microservice/src/lambdas/top_moves/top_moves.py:166)
  - Backend integration points:
      - HTTP analysis: backend/src/controllers/analysis_controller.ts:69 and backend/src/routers/
        analysis_router.ts:1
      - Microservice client: backend/src/services/microservice.ts:87
      - Live loop: backend/src/websockets/game_loop.ts:213 (calls top-moves), emits new_odds at
        backend/src/websockets/game_loop.ts:276
  - Research outputs: research/move_features_v1/outputs/latest/* (summary.txt, summary.json)

  Call: What Lives Where

  - Microservice (Python, engine-adjacent, per-position CPU):
      - Top moves + per-move cp, percentile, is_best (already done)
      - Emoji labels for top moves (single pass, no extra round trips) using:
          - cp deltas: top1 vs top2 for only/initiative
          - move properties: gives check, capture, promotion
          - simple blunder threshold by gap to best
      - Optional: enhanced flags to support “ONLY/SAFE” bootstrap heuristics later
  - Backend (Node, stateful, cross-plies context, UI contract):
      - Opening detection (book lookup by move sequence/FEN prefix)
      - Dominance gating (hide emojis when WDL highly lopsided for N plies)
      - Single “badge resolver” that picks exactly one of: opening | emoji | none
      - Feature flags, thresholds, telemetry, and wire-up to HTTP + WebSocket payloads

  This splits compute next to the engine, and keeps stateful policy + UI decisions in the backend.

  Badge Precedence

  1. dominated_eval → none (or frozen “conversion” tag)
  2. opening_phase + confident match → opening name
  3. else → emoji (confidence gate), fallback to quiet emoji or none

  API Contract (Backend → FE, per move)

  - badge_type: "opening" | "emoji" | "none"
  - badge_text: string (e.g., "Sicilian Defense" or "⚡")
  - badge_detail: string | null (e.g., “Only Move”, “Forcing”)
  - confidence: number (0–1)
  - reason_codes: string[] (e.g., ["check","only_move","gap_>=120cp"])
  - phase: "Opening" | "Midgame" | "Endgame"
  - dominated_eval: boolean

  We’ll attach this to:

  - HTTP analysis responses at backend/src/controllers/analysis_controller.ts:69
  - WebSocket new_odds broadcast at backend/src/websockets/game_loop.ts:276

  Opening Book

  - Backend service: in-memory trie keyed by SAN sequence with family/variation; FEN prefix fallback
    for transpositions
  - Data source: vendor ECO JSON (pre-built file under backend/assets/openings.json)
  - Confidence: exact match > family-only > fallback “Book move”
  - Cache: LRU by game_id + move_index with SAN prefix

  Dominance Gating

  - Inputs: microservice WDL (white_win, draw, black_win)
  - Gate: dominated if max(prob) ≥ 0.95 for ≥ N consecutive plies (configurable)
  - State: per-game ring buffer in memory
  - Output: badge_type “none” or special “conversion” tag if you want a single frozen state

  Emoji Labels (Microservice)

  - Extend top_moves to optionally include:
      - emoji: char
      - emoji_confidence: number
      - reason_codes: string[]
  - Cheap heuristics (no extra engine work):
      - blunder: best_cp - move_cp ≥ blunder_gap_cp
      - only_move: move is best and (best_cp - second_cp) ≥ only_gap_cp
      - initiative: best gap ≥ initiative_gap_cp
      - tactical flags: board.gives_check(m), board.is_capture(m), promotion
  - Wire behind enhanced=true&badges=true to avoid breaking callers first
  - Route: handled by microservice/src/router/router.py:92 → top_moves-container

  Config + Flags

  - One place in backend: config/moveBadges.ts (thresholds, ply limits, WDL gate, feature switches)
  - Feature flags via /api/status (already surfaced elsewhere):
      - enable_opening_badges
      - enable_emoji_badges
      - enable_dominance_gating

  Telemetry (Backend)

  - Per move: move_number, ply, fen_hash, eval_cp (if available), wdl, badge_type, badge_value,
    confidence, gates_hit[]
  - Use existing logger: backend/src/helpers/axiom_logger.ts

  Performance Tactics

  - Microservice caches already present (top_moves, wdl). Keep engine singleton.
  - No extra per-top-move engine calls for emojis; compute from existing analysis + board features.
  - Backend opening lookup O(depth) with in-memory structure and per-game prefix cache.
  - Batch HTTP analysis already uses top-moves first (backend/src/controllers/
    analysis_controller.ts:124)

  Phased Plan

  - Phase 0: Finalize API contract + thresholds file (no code yet)
  - Phase 1: Microservice — add optional emoji fields to top-moves (guarded by badges=true)
  - Phase 2: Backend — opening service + dominance tracker + badge resolver
  - Phase 3: Wire HTTP and WebSocket payloads; add feature flags
  - Phase 4: FE minimal: render badge slot in MoveBubbles; safe fallback if fields absent (frontend/
    src/components/MoveBubbles/component.tsx:1)
  - Phase 5: Telemetry + smoke tests, load test on simulated streams
  - Phase 6: Iterate thresholds from live data; consider “ONLY/SAFE” label bootstrap

  Acceptance Checklist

  - Exactly one badge shown per move (opening or emoji or none)
  - FE degrades gracefully if badge payload missing
  - Feature flags toggle opening/emoji independently
  - Telemetry emitted and greppable; no engine hot path regressions
  - No added round trips; negligible delta to top-moves latency

  If you’re good with this direction, I’ll:

  - Spec the exact JSON field names/threshold defaults in config
  - Draft the microservice badge annotation change in top_moves.py
  - Scaffold the backend opening service + resolver and thread it into analysis + ws emissions
