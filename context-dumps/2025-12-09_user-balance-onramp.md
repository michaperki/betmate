BetMate User Balance On‑Ramp — Context Dump (2025-12-09)
======================================================

Overview
- Goal: Enable users to add balances for both Arcade (tokens) and Real (cash/USDT) with a minimal, safe, auditable flow that fits our existing stack and flags.
- Constraints: Keep UX simple, lean on existing BalanceHistory for ledgering, and protect with rate limits and webhooks signature checks. Defer heavy compliance until needed.

Definitions
- Arcade (Tokens vs House): token_balance (BET), fixed‑odds wagers vs house; faucets/bonuses allowed.
- Real (Cash/USDT, Parimutuel): cash_balance (USDT), pool wagers vs players; deposits/withdrawals via provider; rake on settlements.

Feature Flags & Env
- ENABLE_REAL_DEPOSITS=true|false (default false in prod)
- WITHDRAWALS_ENABLED=true|false (default false)
- KYC_REQUIRED=true|false (default false)
- Provider env (per choice):
  - Coinbase Commerce: COINBASE_COMMERCE_KEY, COINBASE_COMMERCE_WEBHOOK_SECRET
  - Circle (USDC): CIRCLE_API_KEY, CIRCLE_WEBHOOK_SECRET

Ledger/Audit (reuse existing)
- Use BalanceHistory for all balance changes with reasons: 'Deposit', 'Withdrawal', 'Wager placed', 'Wager winnings', 'Refund', 'Admin credit', 'Faucet'.
- Add currency field (already supported) and ensure idempotency on webhook events (store provider event IDs, ignore duplicates).

Arcade (Tokens) — Low‑Lift Paths
Phase 0 (Admin Tools)
- Internal credit endpoint (optional, keep BOT_API_KEY‑protected): POST /internal/credit { userId, amount, reason: 'Admin credit' }.

Phase 1 (Faucet + Rewards)
- Daily faucet: POST /arcade/faucet → +N BET per 24h per user.
  - Server cooldowns, optional captcha, per‑IP backoff.
  - Record in BalanceHistory ('Faucet').
- Signup bonus / referral bonus (optional; same ledgering).

Frontend (Arcade)
- “Get Tokens” entry in NavBar/Wallet page.
- Faucet claim modal showing next claim time; uses /arcade/faucet; handle errors/rate limits.

Real (Cash/USDT) — Provider‑Backed
Phase 1 (Deposits)
- Choose provider (fastest to ship): Coinbase Commerce hosted checkout (multi‑asset) or Circle USDC addresses.
- Backend routes:
  - POST /billing/deposit/intent
    - Body: { amount, currency='USDT' | 'USDC' }
    - Response: { hosted_url } (Commerce) or { address, network } (Circle)
    - Persist Deposit doc: status=pending, provider refs.
  - POST /billing/webhook (provider)
    - Verify signature (HMAC); dedupe by event id.
    - On confirmed/settled payment: credit cash_balance; add BalanceHistory('Deposit', currency='USDT'); mark deposit=confirmed.
  - GET /billing/deposits → return user deposit history (recent 20).
- Models (backend/src/models):
  - deposit_model.ts: { user_id, amount, currency, provider, provider_ref, status: 'pending'|'confirmed'|'failed', meta, created_at }
- Jobs
  - Reconcile unsettled deposits daily by polling provider for final state.

Phase 2 (Withdrawals)
- POST /billing/withdraw { amount, address, network }
  - Guardrails: min/max, balance check, cooldown, optional 2FA or email confirm.
  - Workflow: requested → approved (manual/admin) → sent.
  - Ledger: BalanceHistory('Withdrawal', currency='USDT', negative amount).
- Admin review queue (simple list + approve action) to start.

Phase 3 (Optional Fiat On‑Ramp)
- Evaluate a compliant PSP for card/ACH; likely gated behind KYC.
- Introduce fiat_pending → cash_balance after settlement.

Frontend (Real Wallet)
- Wallet page/modal reachable from NavBar:
  - Balance summary (token/cash)
  - “Add USDT” button → opens hosted URL (Commerce) or shows deposit address QR (Circle)
  - “Withdraw” (Phase 2)
  - Deposit/withdraw history list (from /billing/deposits and BalanceHistory)
- Game UI nudges: when Real mode selected with zero balance, show a small inline hint “Add USDT to bet in Real mode”.

Security & Compliance
- Webhook signature verification + replay protection (store event IDs)
- Rate limits on billing endpoints; captcha for faucet when needed
- Optional KYC gating path:
  - user.kyc_status={'unverified'|'pending'|'verified'|'rejected'}
  - KYC_REQUIRED gates withdrawals (and optionally deposits)
  - Stub endpoints now; integrate provider later (Persona/SumSub/Stripe Identity)

Rollout Plan
1) Wallet UI skeleton + ledger display; NavBar entry (FE)
2) Deposit (provider) minimal flow (BE + FE); webhook + ledgering
3) Real‑mode nudge in game UI; flag‑guarded ENABLE_REAL_DEPOSITS
4) Withdrawals stub → manual approval MVP → provider wiring
5) Faucet (Arcade) simple daily claim; optional captcha flag

Acceptance Criteria (Phase 1)
- Users can open Wallet and start a deposit flow
- Successful on‑chain/hosted payments result in credited cash_balance and appear in history
- Webhooks are verified and idempotent; logs show acceptance/rejections
- Feature flags prevent exposure in prod until ready

Suggested Files/Touch List
- Backend
  - src/models/deposit_model.ts
  - src/controllers/billing_controller.ts
  - src/routers/billing_router.ts
  - src/services/providers/coinbase_commerce.ts (or circle.ts)
  - src/middleware/provider_webhook.ts (signature verification)
  - src/services/jobs/reconcile_deposits.ts (optional)
- Frontend
  - src/components/Wallet/{component.tsx, style.scss}
  - src/store/requests/billingRequests.ts
  - NavBar entry → Wallet
  - ChessMatch: Real‑mode zero‑balance hint

Open Questions
- Provider choice: Commerce (hosted, breadth) vs Circle (USDC focus, per‑user address). Default to Commerce for fastest MVP.
- Networks supported and minimum deposit threshold
- KYC gating scope (withdrawals only vs deposits too)

