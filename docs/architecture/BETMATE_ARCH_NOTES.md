BetMate architecture notes (repo‑grounded)

Overview

- Monorepo components
  - Frontend (React + Redux + Sagas + Tailwind/SCSS) — `frontend/`
  - Backend API (Node 18 + Express + Socket.IO + Mongoose) — `backend/`
  - Analysis microservice (Python, Stockfish/LC0, Lambda-style containers with an aiohttp router) — `microservice/`
  - Dev/infra (Docker Compose for local stack) — `docker-compose.yml`

Component Inventory

- Frontend
  - Tech: React, react-router, redux + redux-saga, axios, socket.io-client, Tailwind + SCSS
  - Entrypoints: `frontend/src/index.tsx`, routes in `frontend/src/components/app.tsx:24`
  - Port: `8080` (compose) — `docker-compose.yml: frontend.ports`
  - Env vars (names): `TARGET_ENV` (selects base URL) — `frontend/src/utils/index.ts:4`
  - External deps: connects to Backend API at `ROOT_URL` — `frontend/src/utils/index.ts`

- Backend API
  - Tech: Node 18, Express, Socket.IO, Mongoose, Passport-JWT, Joi, axios
  - Entrypoint: `backend/src/server.ts` (HTTP + Socket.IO). Routes mounted at `app.use(...)` lines `backend/src/server.ts:198-209`
  - Port: default `9000` — `backend/src/config/runtime.ts:23` and `backend/src/server.ts:214`
  - Env vars (names):
    - Core: `MONGODB_URI`, `PORT`, `NODE_ENV`, `AUTH_SECRET`
    - CORS/logging: `ALLOWED_ORIGINS`, `CORS_DEBUG`, `LOG_HTTP_DEBUG`, `LOG_LEVEL`, `ENABLE_RATE_LIMITING`
    - Microservice: `MICROSERVICE_URL`, `MICROSERVICE_API_KEY`
    - Features: `FEATURE_REAL_MODE`, `ENABLE_FAUCET`, `ENABLE_WITHDRAWALS`, `REQUIRE_KYC`, `PRICING_MODEL_VERSION`
    - Risk/pricing: `ARCADE_MAX_STAKE_MOVE`, `ARCADE_MAX_STAKE_WDL`, `ARCADE_MOVE_MARGIN`, `ARCADE_MOVE_MAX_ODDS`, `ARCADE_DELTA_EXP_K`, `POOL_RAKE`, plus many `REAL_WDL_*` caps/margins — `backend/src/helpers/risk_config.ts`
    - Admin: `ADMIN_API_KEY`
    - Payments: `PAYMENTS_PROVIDER`, `DEV_WEBHOOK_KEY`, `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `NOWPAYMENTS_ALLOWED_CURRENCIES`, `NOWPAYMENTS_SUCCESS_URL`, `NOWPAYMENTS_CANCEL_URL`, `NOWPAYMENTS_CREATE_MODE`, `COINPAYMENTS_PUBLIC_KEY`, `COINPAYMENTS_PRIVATE_KEY`, `COINPAYMENTS_IPN_SECRET`
  - External deps: MongoDB, NOWPayments, CoinPayments, Axiom (optional), Lichess stream

- Analysis microservice
  - Tech: Python 3, Stockfish; optional LC0 (Leela). Flask within Lambda-style entrypoints; aiohttp router for local dev
  - Entrypoint (router): `microservice/src/router/router.py` serving `GET /dev/{wdl|top-moves|move-analysis}` on port `8000`
  - Lambda containers: `microservice/src/lambdas/wdl/wdl.py`, `microservice/src/lambdas/top_moves/top_moves.py`, `microservice/src/lambdas/move_analysis/move_analysis.py`
  - Ports: router `8000`, lambdas `8080` inside their containers
  - Env vars (names): `TIME_LIMIT`, `HASH_SIZE`, `ENGINE_PROVIDER`, `LILA_ENGINE_PATH`, `LILA_WEIGHTS_PATH`, `LILA_BACKEND`, `ENABLE_ENGINE_WDL_BLEND`, `ENGINE_WDL_BASE_WEIGHT`, `ENGINE_WDL_MAX_WEIGHT` — see `microservice/src/lambdas/wdl/wdl.py`
  - External deps: Stockfish, optional LC0 weights; invoked by backend via HTTP with API key header — `backend/src/services/microservice.ts`

- Datastores (compose)
  - MongoDB 6 — `docker-compose.yml: mongo`, `27017:27017`
  - Redis 7 — `docker-compose.yml: redis` (not referenced by backend code)
  - Postgres 15 — `docker-compose.yml: postgres` (not referenced by backend code)

Frontend Deep Dive (data + style)

- API client layer
  - Base URL selection: `ROOT_URL` derived from `TARGET_ENV` — `frontend/src/utils/index.ts:4-10`
  - Axios instance: `createBackendAxiosRequest` with `baseURL: ROOT_URL`, timeout, interceptors — `frontend/src/store/requests/index.ts:15-46`
  - Interceptors add `X-Request-Id` to every request — `frontend/src/store/requests/index.ts:24-33`
  - Auth token storage: localStorage key `authTokenName` — `frontend/src/utils/index.ts:12`; helpers in `frontend/src/store/actionCreators/index.ts`
  - Headers: Authorization `Bearer <token>` — `frontend/src/store/actionCreators/index.ts:11-23`

- Routing (major screens)
  - Declared in `frontend/src/components/app.tsx:33-84`
    - `/` Dashboard — `frontend/src/containers/Dashboard/component.tsx`
    - `/chess/:id` ChessMatch — `frontend/src/containers/ChessMatch/component.tsx`
    - `/wallet` Wallet/Deposits — `frontend/src/components/Wallet/component.tsx`
    - `/active-bets`, `/betting-history` — user wager views
    - Admin: `/admin`, `/admin/wallet`, `/admin/ops`, `/admin/kyc`, `/admin/risk`

- Global state and real-time
  - Redux + Sagas: `frontend/src/store/...`
  - WebSocket: Socket.IO client connects to `${ROOT_URL}/chessws` — `frontend/src/store/sagas/sockets/index.ts:18,27-47`
  - Subscribed events: `start_game`, `new_move`, `new_odds`, `game_over`, `wager_result` — `frontend/src/store/sagas/sockets/channels.ts`

- Theming and styles
  - Theme provider toggles `html.light-mode` vs default dark — `frontend/src/context/ThemeContext.tsx`
  - CSS variables tokens — `frontend/src/styles/themes.scss`
  - Tailwind palette/extensions — `frontend/tailwind.config.js`
  - Core SCSS aggregations — `frontend/src/style.scss`

- Key UI modules (betting/gameplay)
  - Chess board + match: `frontend/src/containers/ChessMatch/component.tsx`
  - Move options (tiles): `frontend/src/components/WagerFormComponents/MoveOptions/component.tsx`
  - WDL outcomes UI: `frontend/src/components/WagerFormComponents/GameOutcomes/component.tsx`
  - Wallet/Deposits UI: `frontend/src/components/Wallet/component.tsx`
  - Admin dashboards: `frontend/src/containers/Admin*/*`

- Screen flows (representative)
  - Move bet (Arcade/Real)
    - User clicks move tile → `createWager(...)` dispatch — `frontend/src/containers/ChessMatch/component.tsx:606-616`
    - Network: `POST /wager/:id` with body `{ wdl:false, amount, data:<SAN>, odds, move_number, mode, currency }` — `frontend/src/store/requests/wagerRequests.ts:14-39`
    - State updates: optimistic tile state → await response; failures surface short reason — `frontend/src/containers/ChessMatch/component.tsx:620-658`
    - Settlement: later via WS `wager_result` — `frontend/src/store/sagas/sockets/channels.ts:37-69`
  - WDL bet (Arcade/Real)
    - User taps outcome in header/toolbar → `createWager(..., wdl:true, data:'white_win'|'draw'|'black_win', mode,currency)` — `frontend/src/containers/ChessMatch/component.tsx:664-706`
    - Backend validates odds/move timing (Arcade) or accepts (Real) — see backend below
    - Game end triggers settlement WS event — `backend/src/websockets/lichess_stream.ts:488-514`
  - Wallet deposit (Real mode)
    - UI calls `POST /billing/deposit/intent` with `{ amount, payCurrency }` — `frontend/src/store/requests/billingRequests.ts:12-21`
    - Response includes `hosted_url` (NOWPayments/CoinPayments) — same path
    - Provider webhook → backend credits `cash_balance` — `backend/src/controllers/billing_controller.ts:196-233`
    - UI polls/list: `GET /billing/deposits` — `frontend/src/store/requests/billingRequests.ts:23-31`

Backend Deep Dive (API + domain)

- Server and routing
  - Entrypoint: `backend/src/server.ts` sets CORS, request context, rate-limits, routes, Socket.IO namespace `/chessws` — `backend/src/server.ts:66-91,141-210`
  - Routers mounted:
    - `/auth` — `backend/src/routers/auth_router.ts`
    - `/chess` — `backend/src/routers/chess_router.ts`
    - `/wager` — `backend/src/routers/wager_router.ts`
    - `/leaderboard` — `backend/src/routers/leaderboard_router.ts`
    - `/analysis` — `backend/src/routers/analysis_router.ts`
    - `/billing` — `backend/src/routers/billing_router.ts`
    - `/real/markets` — `backend/src/routers/real_markets_router.ts`
    - `/admin` — `backend/src/routers/admin_router.ts`
    - `/matches` — `backend/src/routers/matches_router.ts`
    - Lichess stream websocket helper — `backend/src/routers/lichess_router.ts`

- Auth model
  - JWT bearer with Passport-JWT — `backend/src/authentication/requireAuth.ts`
  - Secret: `AUTH_SECRET` — used in `backend/src/helpers/utils.ts:20-36`
  - Admin access via `X-Admin-Key` header or authenticated `role==='admin'` — `backend/src/authentication/requireAdminAccess.ts`

- Domain entities (Mongoose models)
  - Chess game — `backend/src/models/chess_model.ts`
  - Wager — `backend/src/models/wager_model.ts`
  - User (with `token_balance` and `cash_balance`) — `backend/src/models/user_model.ts`
  - Market (Real WDL AMM state) — `backend/src/models/market_model.ts`
  - Settlement job (idempotency) — `backend/src/models/settlement_job_model.ts`
  - Deposit / Withdrawal — `backend/src/models/deposit_model.ts`, `backend/src/models/withdrawal_model.ts`
  - BalanceHistory ledger — `backend/src/models/balance_history_model.ts`
  - Config (feature flags) — `backend/src/models/config_model.ts`

- Databases
  - MongoDB only (Mongoose). Compose includes Redis/Postgres but no code paths reference them

- Payments/deposits
  - Intent: `POST /billing/deposit/intent` — `backend/src/routers/billing_router.ts:7-13`, controller `backend/src/controllers/billing_controller.ts:13-63`
    - Providers: `nowpayments` (default in dev) or `coinpayments` — `backend/src/controllers/billing_controller.ts:25-39`
  - Webhooks:
    - CoinPayments IPN: `POST /billing/webhook/coinpayments` (HMAC `HMAC`) — `backend/src/routers/billing_router.ts:20`, `backend/src/controllers/billing_controller.ts:136-164`
    - NOWPayments IPN: `POST /billing/webhook/nowpayments` (HMAC raw body, header `x-nowpayments-sig`) — `backend/src/routers/billing_router.ts:23`, `backend/src/controllers/billing_controller.ts:196-233`
    - NOWPayments payout: `POST /billing/webhook/nowpayments-payout` — `backend/src/routers/billing_router.ts:25`, `backend/src/controllers/billing_controller.ts:234-289`
  - Admin reconciliations: `/billing/reconcile/*`, reissue invoice — `backend/src/routers/billing_router.ts:34-36`
  - Withdrawals: user list/request/cancel — `backend/src/routers/billing_router.ts:15-17`, `backend/src/controllers/billing_controller.ts:357-520`

- Request tracing/logging
  - FE adds `X-Request-Id`; backend attaches context and echoes header — `frontend/src/store/requests/index.ts:24-33`, `backend/src/helpers/request_context.ts`
  - HTTP logging middleware to Axiom with `trace_id` — `backend/src/middleware/axiom_logger_middleware.ts`
  - Microservice calls propagate `x-request-id`/`x-trace-id` headers — `backend/src/services/microservice.ts`

- API surface summary (selected)
  - Auth
    - `POST /auth/signup` (SignUpPanel) → { user, token, refreshToken, csrfToken } — `backend/src/controllers/auth_controller.ts:14-63`
    - `POST /auth/signin` (SignInPanel) → { user, token, refreshToken, csrfToken } — `backend/src/controllers/auth_controller.ts:65-110`
    - `GET /auth/jwt-signin` with Bearer (app bootstrap) → { user } — `backend/src/controllers/auth_controller.ts:121-127`
    - `GET /auth/balance-history?limit=&currency=` (Dashboard/Wallet) → BalanceHistory[] — `backend/src/controllers/auth_controller.ts:142-168`
  - Chess
    - `GET /chess/:id` (ChessMatch) → ChessDoc — `backend/src/controllers/chess_controller.ts:16-24`
    - `GET /chess?query..` list/filter — `backend/src/controllers/chess_controller.ts:37-50`
    - `GET /chess/:id/stats` (viewer, wager data) — `backend/src/controllers/chess_controller.ts:53-77`
  - Wager
    - `GET /wager` / `/wager/active` / `/wager/history` (user pages) — `backend/src/routers/wager_router.ts`
    - `POST /wager/:id` (ChessMatch wager) body `{ wdl, amount, data, odds, move_number, mode?, currency? }` — `backend/src/routers/wager_router.ts:34-44`, controller `backend/src/controllers/wager_controller.ts`
  - Analysis
    - `GET /analysis/move?fen=&move=` — `backend/src/routers/analysis_router.ts:20-28`
    - `GET /analysis/top-moves?fen=&n=&game_id=&at_move=` — `backend/src/routers/analysis_router.ts:31-41`
    - `POST /analysis/moves` body `{ fen, moves: [] }` — `backend/src/routers/analysis_router.ts:44-54`
  - Real markets
    - `GET /real/markets/:gameId` (FE price/limits) — `backend/src/routers/real_markets_router.ts:6-12`
  - Billing
    - See Payments/deposits above; faucet: `POST /billing/faucet` (dev) — `backend/src/routers/billing_router.ts:31`
  - Matches (dashboard content)
    - `GET /matches/featured`, `GET /matches/:id/details` — `backend/src/routers/matches_router.ts`

Microservice Deep Dive (analysis pipeline)

- Router and routes
  - `microservice/src/router/router.py` exposes:
    - `GET /dev/wdl?fen=&white_time=&black_time=` → proxies to WDL lambda
    - `GET /dev/top-moves?fen=&n=&...` → proxies to Top Moves lambda
    - `GET /dev/move-analysis?fen=&move=&enhanced=true` → proxies to Move Analysis lambda
  - Backend composes base URL as `MICROSERVICE_URL + /{wdl|top-moves|move-analysis}` — `backend/src/services/microservice.ts`

- Engine/handlers
  - WDL: Stockfish (or LC0 blend) converts eval → WDL bins → probabilities — `microservice/src/lambdas/wdl/wdl.py`
  - Top moves: analyses N top root moves with score/percentile and optional emoji/badges — `microservice/src/lambdas/top_moves/top_moves.py`
  - Move analysis: single move score/percentile — `microservice/src/lambdas/move_analysis/move_analysis.py`

- Output schemas (as consumed by backend)
  - WDL: `{ white_win:number, draw:number, black_win:number }` — `backend/src/types/microservice.ts`
  - TopMoves: `[{ move, score, percentile, is_best_move, ...optional }]` — `backend/src/types/microservice.ts`
  - MoveAnalysis: `{ move, score, percentile, is_best_move }` — `backend/src/types/microservice.ts`

- Flow: position → analysis → normalization → FE
  - Backend lichess stream updates on `new_move`; fetches WDL and TopMoves; stores in Chess doc; emits to clients — `backend/src/websockets/lichess_stream.ts:300-340`
  - FE can also request on-demand via `/analysis/*` — `backend/src/controllers/analysis_controller.ts`

Cross‑Cutting Flows

- Arcade mode (tokens, fixed odds)
  - Place bet: FE `POST /wager/:id` with `mode:'arcade', currency:'BET'` — `frontend/src/store/requests/wagerRequests.ts`
  - Backend validates odds vs current snapshot and next move number — `backend/src/services/wager_service.ts:55-120`
  - Move settlement: on next `new_move`, backend resolves move wagers with fixed odds (Arcade path) — `backend/src/helpers/resolve_bets.ts:66-90,118-157`
  - Results via WS `wager_result` → FE updates receipts — `frontend/src/store/sagas/sockets/channels.ts:37-69`

- Real mode (cash, pricing/limits)
  - Prices/limits: FE `GET /real/markets/:gameId` for current AMM state + per-bet caps — `frontend/src/store/requests/marketRequests.ts`, `backend/src/controllers/real_market_controller.ts`
  - Place bet: FE `POST /wager/:id` with `mode:'real', currency:'USDT'` — same request path; backend relaxes odds check for WDL Real — `backend/src/services/wager_service.ts:102-114`
  - Settlement: WDL uses stored fixed odds at bet-time; move bets use pool share with rake — `backend/src/helpers/resolve_bets.ts:26-64,94-157`
  - Risk config (margins, caps, skew) — `backend/src/helpers/risk_config.ts`

- Deposits/withdrawals
  - Create deposit intent → open hosted checkout → provider webhook → credit `cash_balance` — `frontend/src/components/Wallet/component.tsx:75-108`, `backend/src/controllers/billing_controller.ts:13-63,196-233`
  - List deposits/withdrawals: `GET /billing/deposits`, `GET /billing/withdrawals` — `backend/src/routers/billing_router.ts:10-17`
  - Request/cancel withdrawal: `POST /billing/withdrawals/request`, `POST /billing/withdrawals/:id/cancel` — `backend/src/routers/billing_router.ts:16-17`, controller `backend/src/controllers/billing_controller.ts:379-520`

- Game lifecycle
  - Backend streams Lichess top game → creates Chess doc → emits `start_game` — `backend/src/websockets/lichess_stream.ts:20-70,443-455`
  - On each move: updates state, times, computes new odds/top moves, emits `new_move` and `new_odds` — `backend/src/websockets/lichess_stream.ts:383-441,326-342`
  - Game end: emits `game_over`, resolves WDL wagers — `backend/src/websockets/lichess_stream.ts:488-514`

- Observability
  - FE → BE `X-Request-Id`; BE echoes and logs with `axiomLoggerMiddleware` — `frontend/src/store/requests/index.ts:24-33`, `backend/src/middleware/axiom_logger_middleware.ts`
  - BE → microservice forwards `x-request-id`/`x-trace-id` headers — `backend/src/services/microservice.ts`

Deployment Topology

- Local/dev (docker-compose)
  - Containers: `mongo`, `redis`, `postgres`, `backend` (Node 18), `frontend` (Node 18), `microservice` router, plus lambdas `wdl-container`, `top-moves-container`, `move-analysis-container` — `docker-compose.yml`
  - Ports: FE `8080`, BE `9000`, Router `8000`, DBs: Mongo `27017`, Redis `6379`, Postgres `5432`
  - Wiring: backend env `MICROSERVICE_URL=http://microservice:8000/dev`, `MONGODB_URI=mongodb://mongo:27017/betmate` — `docker-compose.yml: backend.environment`

- Production-ish
  - Frontend Netlify (redirect config: `frontend/netlify.toml`)
  - Backend Heroku style (`productionURL` in `backend/package.json`, Procfile); CORS allowlist contains `betmate-prod.netlify.app` — `backend/src/config/runtime.ts:16-22`
  - Analysis on AWS Lambda (container images), invoked via API Gateway; local router emulates prod — `microservice/README.md`
  - MongoDB likely managed (URI via `MONGODB_URI`)

Styling conventions (FE)

- Dark theme default via CSS variables; light toggled on `html.light-mode` — `frontend/src/context/ThemeContext.tsx`, `frontend/src/styles/themes.scss`
- Tailwind tokens keyed to brand palette — `frontend/tailwind.config.js`
- Global utility SCSS and tokens — `frontend/src/styles/*.scss`

Notes

- Compose includes Redis/Postgres for future or optional workloads; current backend code paths use MongoDB only
- Microservice router returns structured error bodies; backend falls back to neutral/fallback values on timeouts to keep UI stable — `backend/src/services/microservice.ts`

