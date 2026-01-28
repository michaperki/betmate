Frontend Cleanup — Reality Check (2026‑01‑28)

How this was verified
- Read the migration guide (docs/migration/MIGRATION.md) and recent commits.
- Searched the codebase for actual imports/usages with ripgrep to confirm whether each item is referenced by active routes/containers (not relying on guesses).

Keep (active in new UI)
- components/AdminRoute.tsx — used by app routes: frontend/src/components/app.tsx:127
- components/Header — canonical header for new pages: frontend/src/components/app.tsx:37, :113
- components/BottomTabBar — used on Dashboard/MyBets for mobile: frontend/src/containers/Dashboard/component.tsx:11, frontend/src/containers/MyBets/component.tsx:10
- components/Chessboard + components/ChessgroundWrapper — used by GameContainer: frontend/src/containers/GameContainer/component.tsx:9, frontend/src/components/Chessboard/component.tsx:2
- components/MoveConfirmChip — used by GameContainer: frontend/src/containers/GameContainer/component.tsx:18
- components/MovePredictions — used by GameContainer: frontend/src/containers/GameContainer/component.tsx:13
- components/PlayerHeader — used by GameContainer: frontend/src/containers/GameContainer/component.tsx:11
- components/EmptyState — used in pages: frontend/src/containers/Dashboard/component.tsx:14, frontend/src/containers/MyBets/component.tsx:13
- components/CoinBalance — used by NavBar: frontend/src/components/NavBar/component.tsx:4
- components/ProtectedRoute.tsx — used by app routes: frontend/src/components/app.tsx:121
- components/StarRating — used by move UI: frontend/src/components/MovePredictions/component.tsx:3
- components/ThemeToggle — used by NavBar: frontend/src/components/NavBar/component.tsx:9
- components/VersionFooter.tsx — used in admin + wallet: e.g. frontend/src/containers/AdminHome/component.tsx:4, frontend/src/components/Wallet/component.tsx:6
- components/VersionTag.tsx — used by NavBar: frontend/src/components/NavBar/component.tsx:7
- components/BettingPanel — used by GameContainer: frontend/src/containers/GameContainer/component.tsx:15
- components/Wallet — routed under /wallet: frontend/src/components/app.tsx:133
- components/app.tsx — canonical router

Transitional (still used; migrate later)
- components/NavBar — still used by admin pages and Wallet; plan to unify on Header later: e.g. frontend/src/containers/AdminHome/component.tsx:2, frontend/src/components/Wallet/component.tsx:5
- components/NotificationCenter (context/Bridge) — actively used for toasts, not a legacy UI widget: frontend/src/components/app.tsx:87, :92
- components/OnboardingTour — used in app to show guided overlay when wide screens: frontend/src/components/app.tsx:98

Legacy/unused (safe to remove when ready)
- components/AuthenticatedLayout — no external usage: ripgrep finds no imports.
- components/BetConfirmationModal — unused (no imports).
- components/BettingSidebar — unused; BettingPanel supersedes it.
- components/BotIndicator — only referenced by unused wager UIs (WagerPanel/MoveOptions).
- components/Button and components/Card — used only in examples/admin-local, not in new pages. Keep if desired for UI library; otherwise removable.
- components/ButtonDemo — example‑only.
- components/ChatBox — only used inside GameCommunication (itself unused).
- components/CollapsibleSection — unused.
- components/ConnectionStatus — only referenced by unused AuthenticatedLayout.
- components/DragWagerSidebar — unused.
- components/DrawBetBubble — unused.
- components/GameCard — unused (old dashboard tile).
- components/GameCommunication — unused.
- components/GameInfoPanel — unused.
- components/IntegratedBettingSidebar — unused.
- components/Leaderboard — no usages in new UI (stats/dashboard render their own views).
- components/LichessModal — unused.
- components/Loading and components/LoadingIcon — unused.
- components/MoveBubbles — unused; replaced by MovePredictions.
- components/NewChessboard — unused; migration doc says NewChessboard → Chessboard.
- components/PostgameModal — unused.
- components/PregameModal — unused.
- components/TabPanel — only used by GameCommunication (unused).
- components/WagerFormComponents/* — unused; superseded by BettingPanel flows.
- components/WagerPanel and components/WagerSubPanel — unused now; helpers only referenced by other legacy components above.
- components/WagerReceipts — only used by GameCommunication (unused).
- containers/ChessMatch — docs only; not routed.
- containers/UserPage — not routed (only has a style stub).
- containers/authentication/signInPanel + signUpPanel — unused; Login container supersedes. SignOutPanel is still routed in app.tsx.

Notes about Header vs NavBar
- New pages (Dashboard, Markets/Game, My Bets, Stats, Settings) use the new Header component.
- Admin and Wallet still import NavBar. After replacing NavBar with Header across those routes, we can remove NavBar and VersionTag.

Where a few items are rendered (for traceability)
- BettingPanel → GameContainer: frontend/src/containers/GameContainer/component.tsx:754
- DrawOutcomeCard → GameContainer: frontend/src/containers/GameContainer/component.tsx:16, :754
- BottomTabBar → Dashboard/MyBets/Stats: see imports in those containers.

Backend — prune candidates to track (later)
- Bots system (feature flagged; likely deprecated)
  - Initialization guarded in backend/src/server.ts:383–390
  - Supporting code in backend/src/agents/* and backend/src/services/agent_service.ts
  - Websocket bot triggers in backend/src/websockets/lichess_stream.ts:216
  - If bots are no longer desired, these can be removed with server.ts gating and any model usages.
- Raffle feature (unused in new UI, uses legacy account field)
  - Routers/controllers: backend/src/routers/raffle_router.ts, backend/src/controllers/raffle_controller.ts
  - Lambda: backend/src/lambdas/runRaffleDraw.ts (selects users by legacy account balance)
  - Model: backend/src/models/raffle_model.ts
  - Unless on the roadmap, this entire surface can likely be retired.
- Legacy balance mirror (account ↔ token_balance)
  - Still present to support migration: backend/src/controllers/wager_controller.ts:66–67, :247–254; backend/src/controllers/auth_controller.ts:87–88; backend/src/helpers/resolve_bets.ts:175; backend/src/controllers/billing_controller.ts:363
  - Once FE is fully cut over and data backfills complete, remove the account mirror logic and field updates.

Proposed next cleanup passes (non‑breaking)
- Remove clearly unused FE artifacts: NewChessboard, BettingSidebar, AuthenticatedLayout, ConnectionStatus, DragWagerSidebar, DrawBetBubble, GameCard, GameCommunication, GameInfoPanel, IntegratedBettingSidebar, Leaderboard (component), LichessModal, Loading/LoadingIcon, MoveBubbles, PostgameModal, PregameModal, TabPanel, WagerFormComponents, WagerPanel, WagerSubPanel, WagerReceipts, ChatBox; containers/ChessMatch; containers/authentication/signInPanel & signUpPanel; containers/UserPage.
- Migrate Wallet/Admin to use Header; then delete NavBar and VersionTag.
- After FE balance cutover validation, remove backend account mirrors.

If you want, I can start by deleting the zero‑reference FE components above and raise a PR with a focused diff.
