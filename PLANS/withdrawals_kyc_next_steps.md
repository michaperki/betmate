# Withdrawals + KYC — Next Steps Plan

This plan tracks the next implementation steps to complete a safe, operable withdrawal flow with KYC.

## Scope to Implement Now
1) Admin Feature Toggles
   - Add `enableWithdrawals` and `requireKyc` toggles to the Admin Home UI.
   - Already supported in backend feature flags and `/api/status`.

2) Admin KYC Queue
   - Backend: list users by `kyc_status`, and approve/reject endpoints.
   - Frontend: new Admin KYC page with filters and Approve/Reject actions.

3) Wallet KYC Status
   - Show KYC status inline in the Withdraw section.
   - Read new flags (`withdrawEnabled`, `requireKyc`) from `/api/status` via ModeContext.

4) User‑Side Cancellation (requested → cancelled)
   - Allow users to cancel a pending (requested) withdrawal and automatically refund the hold.
   - Show a Cancel button in Wallet for `requested` withdrawals.

## Later (Separate Task)
- Fees & net amount display for withdrawals (`WITHDRAW_FEE_RATE`, `WITHDRAW_FIXED_FEE_USD`).
- Daily caps and velocity limits (24h cap per user).
- Provider payouts (e.g., NOWPayments Payouts) with reconciliation/webhooks.
- E2E tests covering approval and rejection paths.

## Files (This Phase)
- Backend
  - `backend/src/controllers/admin_features_controller.ts` (already supports flags)
  - `backend/src/utils/features_runtime.ts` (already supports flags)
  - `backend/src/controllers/admin_kyc_controller.ts` (new)
  - `backend/src/routers/admin_router.ts` (wire KYC endpoints)
  - `backend/src/controllers/billing_controller.ts` (cancel withdrawal)
  - `backend/src/routers/billing_router.ts` (cancel route)

- Frontend
  - `frontend/src/containers/AdminHome/component.tsx` (add toggles)
  - `frontend/src/containers/AdminKYC/component.tsx` (new page)
  - `frontend/src/components/app.tsx` (route)
  - `frontend/src/containers/AdminHome/component.tsx`, `frontend/src/containers/AdminWallet/component.tsx` (add KYC tab link)
  - `frontend/src/store/requests/adminRequests.ts` (KYC API)
  - `frontend/src/context/ModeContext.tsx` (expose feature flags)
  - `frontend/src/components/Wallet/component.tsx` (status, cancel button)

