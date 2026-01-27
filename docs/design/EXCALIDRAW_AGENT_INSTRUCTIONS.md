Excalidraw agent instructions (multi‑frame, repo‑anchored)

Master Prompt

- Goal: Draw a complete, editable multi‑frame diagram of BetMate using only components, endpoints, data stores, and flows found in this repo. Keep names and labels consistent. For every arrow, add a short label with the HTTP method/path or event name and, where possible, a source anchor to a file path. Use these conventions:
  - Rectangles = services/components
  - Cylinders = databases
  - Rounded rectangles = external providers
  - Sticky notes = assumptions/TODOs
  - Solid arrow = synchronous request/response
  - Dashed arrow = async/webhook/event
  - Include a small legend in each frame
  - Use these canonical names: “BetMate Frontend (React)”, “Backend API (Express)”, “Analysis Router (aiohttp)”, “WDL Lambda”, “Top Moves Lambda”, “Move Analysis Lambda”, “MongoDB”, “Lichess”, “NOWPayments”, “CoinPayments”.
  - Use these boundary labels on frames: “System Context”, “Container Diagram”, “Runtime Flows — Arcade”, “Runtime Flows — Real”, “Runtime Flows — Deposits/Webhooks”, “Runtime Flows — Move Analysis”, “Data Model Snapshot”, “Frontend Architecture”, “Deployment”.
  - Color services in the same vertical: FE (blue), BE (green), Microservice (orange), Datastores (gray), Providers (purple). Use consistent per‑frame color mapping.

Frames and Prompts

1) System Context
- Draw: end‑users (Player, Admin), external providers (NOWPayments, CoinPayments, Lichess), and the BetMate platform boundary containing: Frontend, Backend API, Analysis Router + Lambdas, MongoDB.
- Arrows:
  - Player → Frontend: UI interactions
  - Frontend → Backend API: “HTTPS; `X-Request-Id` header” (frontend/src/store/requests/index.ts)
  - Backend API → Analysis Router: “GET /{wdl|top-moves|move-analysis} (x-api-key, x-trace-id)” (backend/src/services/microservice.ts)
  - Backend API ↔ MongoDB: “Mongoose CRUD” (backend/src/models/*.ts)
  - Backend API → Lichess: “Stream top game” (backend/src/services/lichess_service.ts + websockets/lichess_stream.ts)
  - NOWPayments/CoinPayments → Backend API: “Webhook (HMAC)” (backend/src/routers/billing_router.ts)
- Add a legend; include boundary labels.

2) Container Diagram
- Inside BetMate boundary, place:
  - BetMate Frontend (React) — routes and WS client
  - Backend API (Express + Socket.IO) — routers mounted (auth, chess, wager, leaderboard, analysis, billing, real/markets, admin, matches)
  - Analysis Router (aiohttp)
  - WDL Lambda, Top Moves Lambda, Move Analysis Lambda
  - MongoDB
- Connectors (solid unless webhook/event):
  - Frontend → Backend API: `POST /wager/:id`, `GET /analysis/*`, `GET /matches/*`, `GET /real/markets/:gameId`, etc. (paths from backend/src/routers)
  - Frontend ⇄ Backend API (Socket.IO): `/chessws` events: `start_game`, `new_move`, `new_odds`, `wager_result`, `game_over` (backend/src/websockets; frontend/src/store/sagas/sockets/channels.ts)
  - Backend API → Analysis Router: `GET /dev/{wdl|top-moves|move-analysis}` (docker-compose gives base with `/dev`)
  - Analysis Router → Lambdas: `POST /predict` (JSON body) (microservice/src/router/router.py and lambdas)
  - Backend API ↔ MongoDB: Mongoose models (backend/src/models/*.ts)
  - Backend API ↔ NOWPayments/CoinPayments: create intents (outbound HTTP) and inbound webhooks (dashed)

3) Core Runtime Flows (sequence‑style) — create four sub‑frames
- 3a) Arcade Wager Flow
  1. Frontend → Backend API: `POST /wager/:id { wdl:false, amount, data:<SAN>, odds, move_number, mode:'arcade', currency:'BET' }` (frontend/src/store/requests/wagerRequests.ts)
  2. Backend validates odds and next‑move window; writes Wager in MongoDB (backend/src/services/wager_service.ts)
  3. Lichess move arrives → Backend emits `new_move` and resolves move wagers; updates DB; emits `wager_result` to user room (backend/src/websockets/lichess_stream.ts + backend/src/helpers/resolve_bets.ts)
  4. Frontend WS handles `wager_result` and updates UI (frontend/src/store/sagas/sockets/channels.ts)

- 3b) Real Wager Flow (WDL)
  1. Frontend → Backend API: `GET /real/markets/:gameId` (prices, per‑bet limits) (frontend/src/store/requests/marketRequests.ts)
  2. Frontend → Backend API: `POST /wager/:id { wdl:true, data:'white_win'|'draw'|'black_win', mode:'real', currency:'USDT' }` (frontend/src/containers/ChessMatch/component.tsx)
  3. Backend accepts and writes Wager; settlement at game end uses stored fixed odds (backend/src/services/wager_service.ts + backend/src/helpers/resolve_bets.ts)
  4. Backend emits `wager_result` on `game_over`; FE updates receipts (same WS paths)

- 3c) Deposit/Webhook Flow
  1. FE → BE: `POST /billing/deposit/intent { amount, payCurrency }` (frontend/src/store/requests/billingRequests.ts)
  2. BE → Provider: create invoice/payment (NOWPayments/CoinPayments) (backend/src/controllers/billing_controller.ts)
  3. Provider → BE: webhook (NOWPayments `x-nowpayments-sig`, CoinPayments `HMAC`) (backend/src/routers/billing_router.ts)
  4. BE → MongoDB: mark deposit confirmed; credit `cash_balance`; write ledger (backend/src/controllers/billing_controller.ts, user_service.ts)
  5. FE: `GET /billing/deposits` to reflect status

- 3d) Move Analysis Flow
  1. FE → BE: `GET /analysis/top-moves?fen=&n=` or `GET /analysis/move?fen=&move=` (frontend/src/store/requests/analysisRequests.ts)
  2. BE → Analysis Router: `GET /{top-moves|move-analysis}` (backend/src/services/microservice.ts)
  3. Router → Lambda: `POST /predict` with `queryStringParameters` (microservice/src/router/router.py)
  4. Lambda → Router: JSON `{ statusCode, body:{ message, data } }` (see lambdas). Router unwraps
  5. BE: normalizes/validates; returns `{ message, data }` (backend/src/controllers/analysis_controller.ts)
  6. FE: caches results; renders tiles/emojis (frontend/src/store/requests/analysisRequests.ts)

4) Data Model Snapshot
- Draw cylinders for collections with key fields (one‑liners):
  - Users: `_id, email, password, token_balance, cash_balance, role, kyc_status` (backend/src/models/user_model.ts)
  - Chess: `_id, state(FEN), move_hist[{san}], odds{white_win,draw,black_win}, time_white, time_black, game_status` (backend/src/models/chess_model.ts)
  - Wagers: `game_id, better_id, wdl, amount, odds, data, move_number, mode, currency, status, resolved` (backend/src/models/wager_model.ts)
  - Market: `game_id, type:'wdl', q{white,draw,black}, b, rake, status` (backend/src/models/market_model.ts)
  - Deposits / Withdrawals: `user_id, amount, currency, provider(_ref), status` (backend/src/models/deposit_model.ts, withdrawal_model.ts)
  - BalanceHistory: `user_id, amount, balance, currency, reason, reference_id` (backend/src/models/balance_history_model.ts)
  - SettlementJob: `job_id, game_id, type, move_number, status` (backend/src/models/settlement_job_model.ts)

5) Frontend Architecture
- Show:
  - Routes/pages (Welcome/Dashboard, ChessMatch, Wallet, Admin*) — `frontend/src/components/app.tsx`
  - State: Redux store + Sagas; sockets: `/chessws` — `frontend/src/store/sagas/sockets/index.ts`
  - API client: axios instance with `X-Request-Id` interceptor — `frontend/src/store/requests/index.ts`
  - Auth token storage (`authTokenName`) — `frontend/src/utils/index.ts`
  - Theme tokens (CSS variables) — `frontend/src/styles/themes.scss`; Tailwind config — `frontend/tailwind.config.js`
  - Flows: label arrows “createWager → POST /wager/:id”, “getTopMoves → GET /analysis/top-moves”, “Wallet deposit → /billing/*”

6) Deployment
- Local/dev topology (from compose)
  - Show containers and ports: Frontend:8080, Backend:9000, Router:8000, WDL/TopMoves/MoveAnalysis:8080, Mongo:27017, Redis:6379, Postgres:5432 — `docker-compose.yml`
  - Show env wiring: Backend `MICROSERVICE_URL=http://microservice:8000/dev`, `MONGODB_URI=mongodb://mongo:27017/betmate`
- Production-ish
  - Frontend: Netlify (frontend/netlify.toml)
  - Backend: Heroku‑style (backend/package.json + Procfile); CORS allowlist contains Netlify hosts (backend/src/config/runtime.ts)
  - Analysis: AWS Lambda container images behind API Gateway (microservice/README.md)
  - MongoDB: managed instance via `MONGODB_URI`

Glossary (canonical terms)

- Services/components
  - BetMate Frontend (React): `frontend/`
  - Backend API (Express): `backend/`
  - Analysis Router (aiohttp): `microservice/src/router/router.py`
  - WDL Lambda: `microservice/src/lambdas/wdl/wdl.py`
  - Top Moves Lambda: `microservice/src/lambdas/top_moves/top_moves.py`
  - Move Analysis Lambda: `microservice/src/lambdas/move_analysis/move_analysis.py`
  - MongoDB: `docker-compose.yml: mongo`
  - Lichess: stream provider (backend/src/websockets/lichess_stream.ts)
  - NOWPayments / CoinPayments: billing providers

- Endpoints/events (selected)
  - HTTP FE→BE: `/auth/*`, `/wager/*`, `/analysis/*`, `/billing/*`, `/real/markets/:gameId`, `/matches/*`
  - WS: `/chessws` events `start_game`, `new_move`, `new_odds`, `wager_result`, `game_over`
  - BE→MS: `/{wdl|top-moves|move-analysis}` with headers `x-api-key`, `x-trace-id`, `x-request-id`
  - Webhooks: `/billing/webhook/nowpayments`, `/billing/webhook/coinpayments`

- Data shapes (abbrev)
  - WDL: `{ white_win, draw, black_win }`
  - TopMoves item: `{ move, score, percentile, is_best_move, emoji? }`
  - MoveAnalysis: `{ move, score, percentile, is_best_move }`
  - Wager (response): `_id, game_id, wdl, amount, odds, data, move_number, status, resolved, mode?, currency?`

Don’t Do This

- Don’t invent components or endpoints; only show what exists in repo (use file path labels)
- Don’t use inconsistent names; use the Glossary names exactly
- Don’t omit datastores/providers that appear in compose/routers (MongoDB, NOWPayments, CoinPayments, Lichess)
- Don’t mix Arcade vs Real flows; keep them in separate sub‑frames and label currency (BET vs USDT)

Labeling Guidance (source anchors)

- For each arrow, add a concise label of form “METHOD /path — filePath[:line]”. Examples:
  - “POST /wager/:id — backend/src/routers/wager_router.ts:34”
  - “GET /analysis/top-moves — backend/src/routers/analysis_router.ts:31; frontend/src/store/requests/analysisRequests.ts”
  - “WS wager_result — backend/src/websockets/lichess_stream.ts:513; frontend/src/store/sagas/sockets/channels.ts:37”
  - “Webhook x-nowpayments-sig — backend/src/controllers/billing_controller.ts:200”

Legend (include in each frame or a shared frame)

- Shapes: Rect=service, Cylinder=DB, RoundRect=external, Sticky=note
- Arrows: Solid=sync HTTP/WS call; Dashed=async webhook/event
- Header propagation: label “X-Request-Id” on FE→BE, “x-trace-id” on BE→MS

When to export Excalidraw JSON

- After the structure is stable and labels are verified against the file paths above, export the Excalidraw JSON for versioning. The main deliverable here is the prompt pack + spec.

