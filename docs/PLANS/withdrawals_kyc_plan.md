# Withdrawal + KYC Implementation Plan

This document proposes a pragmatic, incremental rollout for user withdrawals gated by a mock KYC state machine and an admin approval workflow.

## Goals
- Enable users to request fiat‑equivalent crypto withdrawals from their Real balance (`cash_balance`).
- Enforce KYC gating via a simple state machine: `none → required → pending → approved → rejected`.
- Provide an Admin review queue to approve/reject/mark‑paid withdrawals.
- Keep accounting safe: holds, refunds, and audit trail via `BalanceHistory`.
- Ship a mock KYC UX now; integrate a provider later with minimal refactor.

## Scope (Phase 1)
- Backend
  - Add `kyc_status` and metadata fields to `User`.
  - New `Withdrawal` model (user, amount, currency, address, status, refs, notes).
  - User routes: request withdrawal, list withdrawals.
  - Admin routes: list, approve, reject (refund), mark processing, mark paid (final), mark failed (refund).
  - Accounting: on request → create hold (debit `cash_balance` + BalanceHistory). On reject/failed → refund. On paid → finalize.
  - Limits: min/max per request; simple velocity caps (e.g., one open withdrawal per user).
  - Feature flags: `enableWithdrawals` and `requireKyc` surfaced through `/api/status`.

- Frontend
  - Wallet: add Withdraw tab/section (amount + address + currency), KYC gate with “Mock verification” flow.
  - List my withdrawals with statuses.
  - Admin: add Withdrawals page/tab with filters + actions.

## Non‑Goals (Phase 1)
- No live payouts API calls. Mark as paid manually in Admin. (Phase 2 will integrate a provider.)
- No real document upload; KYC is mocked and explicitly labeled as such.

## Data Model
- User additions
  - `kyc_status: 'none'|'required'|'pending'|'approved'|'rejected'`
  - `kyc_meta?: Record<string, any>`
  - `kyc_updated_at?: Date`

- Withdrawal (new)
  - `user_id: ObjectId`
  - `amount: number` (USD‑equiv)
  - `currency: string` (e.g., `USDTTRC20`)
  - `address: string`
  - `status: 'requested'|'approved'|'rejected'|'processing'|'paid'|'failed'|'cancelled'`
  - `provider?: 'nowpayments'|'manual'|string`
  - `provider_ref?: string`
  - `admin_notes?: string`
  - `metadata?: Record<string, any>`
  - `created_at`, `updated_at`

## Backend Endpoints
- User
  - `POST /billing/withdrawals/request` — Requires auth, KYC approved, positive amount, valid address, sufficient balance; creates Withdrawal (`requested`), debits `cash_balance` (hold), records BalanceHistory (`Withdrawal hold`, `USDT`).
  - `GET /billing/withdrawals` — List current user’s withdrawals.
  - `POST /auth/kyc/start` — Mock: set `kyc_status='pending'`.

- Admin
  - `GET /admin/wallet/withdrawals?status=&since=&limit=` — List with filters.
  - `POST /admin/wallet/withdrawals/:id/approve` — Set status `approved`.
  - `POST /admin/wallet/withdrawals/:id/reject` — Set `rejected`, refund hold (+ BalanceHistory `Withdrawal refund`).
  - `POST /admin/wallet/withdrawals/:id/mark-processing` — Set `processing`.
  - `POST /admin/wallet/withdrawals/:id/mark-paid` — Set `paid` (final). Optionally add BalanceHistory `Withdrawal paid` snapshot.
  - `POST /admin/wallet/withdrawals/:id/mark-failed` — Set `failed`, refund hold.

## Accounting Rules
- On request: decrement `cash_balance` by `amount` immediately (hold) and record BalanceHistory with currency `USDT`.
- On reject/failed: increment `cash_balance` by `amount` and record BalanceHistory refund.
- On paid: no refund; optionally record a snapshot entry for auditing.
- Ensure idempotency guards on admin actions.

## Validation & Limits
- Env/flags: `WITHDRAW_MIN_USD` (e.g., 10), `WITHDRAW_MAX_USD` (e.g., 5000), `ENABLE_WITHDRAWALS=true`.
- Velocity: at most 1–2 open withdrawals (`requested|approved|processing`) per user.
- Address validation: basic format checks (TRC20 starts with `T`, EVM starts with `0x` length 42, etc.).

## Frontend Work
- Wallet page
  - Add Withdraw section/tab gated on `/api/status.features.enableWithdrawals`.
  - When `kyc_status !== 'approved'`, show “Mock verification” flow: Start → sets `pending`; Admin must approve.
  - Form inputs: amount, currency, address; submit to create request; list withdrawals and statuses.
- Admin
  - Add Withdrawals view (new tab or combined in Admin Wallet) with filters + action buttons.

## Phase 2 (Optional)
- Provider payouts (e.g., NOWPayments Payouts): create payout, reconcile statuses, and add webhook verification.

## Testing
- Unit: request validation, KYC gating, holds/refunds, admin state transitions idempotency.
- E2E: faucet → withdrawal request → admin approve → mark paid → balances update; KYC gating path.

## Files to Touch (initial cut)
- Backend
  - `backend/src/models/user_model.ts` (KYC fields)
  - `backend/src/models/withdrawal_model.ts` (new)
  - `backend/src/controllers/billing_controller.ts` (user withdrawals)
  - `backend/src/routers/billing_router.ts` (routes)
  - `backend/src/controllers/admin_wallet_controller.ts` or `admin_withdrawals_controller.ts` (admin actions)
  - `backend/src/routers/admin_router.ts` (admin routes)
  - `backend/src/controllers/auth_controller.ts` (expose `kyc_status`; mock KYC start)
  - `backend/src/server.ts` (feature flag surface)
- Frontend
  - `frontend/src/components/Wallet/component.tsx` (withdraw UI, list)
  - `frontend/src/store/requests/billingRequests.ts` (withdraw/kyc requests)
  - `frontend/src/containers/AdminWallet` or new `AdminWithdrawals` (admin UI)
  - `frontend/src/store/requests/adminRequests.ts` (admin actions)

