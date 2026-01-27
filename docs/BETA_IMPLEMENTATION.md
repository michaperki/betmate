Beta Implementation Notes

Scope implemented for beta (lean + automated):

- Invite gating
  - New collection `InviteCode` with fields: `code`, `campaign`, `max_redemptions`, `redeemed_count`, `expires_at`, `active`, and grant fields `grant_tokens` (BET/K Bits) + `grant_cash_usd`.
  - Signup requires `invite_code`; service enforces active, expiry, and max redemptions with an atomic increment.
  - On successful redemption, user receives automatic dual-currency grants (see below) and BalanceHistory entries are recorded with reason "Signup bonus" (one row per currency).

- Automatic dual-currency grants on signup
  - After user creation, invite grants are applied to `token_balance` (BET/K Bits) and `cash_balance` (USDT/USD equivalent).
  - Ledger rows are recorded for both currencies. If no per-code grants are set, optional env fallbacks are used: `SIGNUP_GRANT_BET`, `SIGNUP_GRANT_USD` (numbers).

- Withdrawal lock (initial)
  - Withdrawals remain gated by the existing feature flag (`enableWithdrawals`), controlled via `Config` → `features` (defaults to disabled when unset). No playthrough math is enforced for beta.

- Manual (Venmo-style) withdrawals
  - `POST /billing/withdrawals/request` now accepts `method` and `handle`.
  - When `method` is `manual` or `venmo`, crypto address validation is skipped; `handle` (or `address`) is required and minimally validated.
  - Stored with `provider='manual'`, `currency='USD'`, and the handle placed in `address` for admin visibility.

- Risk overrides persistence
  - Admin risk overrides now persist to `Config` under key `risk_overrides` and are automatically loaded at startup. In-memory behavior remains for fast reads.

- Fraud context capture (basic)
  - On signup, the backend captures `signup_ip`, `signup_user_agent`, and optional device id from `X-Device-Id` header or `device_id` body.

Out of scope by design for beta:
- Phone-based identity, VPN/region gating, complex playthrough rules, bot enablement, and dashboard extensions.

Setup quickstart
- Seed invite codes in MongoDB (collection `invitecodes`) with desired `campaign`, `code`, limits, and optional grant amounts.
- Optionally set env defaults for grants: `SIGNUP_GRANT_BET`, `SIGNUP_GRANT_USD`.
- Keep `enableWithdrawals` off initially; flip via `Config` (`key=features`) later to allow withdrawals.

