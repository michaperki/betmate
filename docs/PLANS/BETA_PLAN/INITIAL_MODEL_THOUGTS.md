# Beta Plan — Initial Model Thoughts

Here are my high‑level readouts and what I’d prioritize for Beta.

## Overall
- Monorepo with FE/BE/microservice as submodules; root scripts manage releases and submodule pointers. See `scripts/release-*.sh`, `scripts/git-tree-status.sh`.
- Local stack via Docker Compose with microservice chess engines; E2E runs Playwright against it. See `docker-compose.yml`, `e2e/`.
- Strong docs for Beta scope, ops, metrics, and release flow. See `docs/BETA_PREP.md`, `docs/BETA_IMPLEMENTATION.md`, `docs/ops/RELEASING.md`.
- Logging is unified and proxied through backend; Axiom integration across FE/BE/microservice. See `frontend/src/utils/logger.ts`, `backend/src/helpers/axiom_logger.ts`.

## Beta Foundations Already Implemented
- Invite gating + signup grants: enforced in backend with atomic redemption and dual‑currency ledger rows. See `backend/src/controllers/auth_controller.ts:28`, `backend/src/models/invite_code_model.ts`.
- Feature flags + public status snapshot: FE reads `/api/status` for flags, pricing version, limits, microservice health. See `backend/src/server.ts:251`, `frontend/src/context/ModeContext.tsx`.
- Ledgered wallet: unified `BalanceHistory` with idempotent reference index. See `backend/src/models/balance_history_model.ts`.
- Withdrawals: user request → hold → admin queue → approve/paid/reject/failed; manual/venmo supported. See `backend/src/controllers/billing_controller.ts:400`, `backend/src/controllers/admin_withdrawals_controller.ts:47`.
- Admin ops: risk caps, features, wallet views, dev helpers. See `backend/src/routers/admin_router.ts`.
- E2E coverage: auth/wallet, Arcade/Real wagers, deposits via NOWPayments mock, risk gates, websocket smoke, visual captures. See `e2e/tests/*`.

## Risks/Gaps I’d Tighten Pre‑Beta
- Auth/session ergonomics: cookies commented out; CSRF token returned in body. If staying token‑based, verify refresh flow + storage hardening; if feasible, re‑enable signed cookies post‑Beta. See `backend/src/routers/auth_router.ts`.
- Withdrawal ledgering: hold and refund entries exist; “paid” doesn’t write a confirming ledger entry. Consider a final “Withdrawal paid” ledger row for audit symmetry.
- Abuse/velocity controls: you’ve rate‑limited deposit/withdraw intent; consider per‑account withdrawal velocity (daily USD cap) and IP/device signup rate guardrails (Beta‑level simple gates).
- Admin key usage: ensure `X-Admin-Key` is not relied on in prod UI; keep user.role==admin as the UI gate and reserve the header solely for ops APIs. See `docs/ops/ADMIN_ACCESS.md`.
- CORS/Origins: defaults look sane; ensure prod/staging domains are in `ALLOWED_ORIGINS` envs and validated. See `backend/src/config/runtime.ts`.
- Onboarding defaults: FE defaults to suppress onboarding in local/dev; confirm server flag (`onboardingEnabled`) behavior in prod so the gate shows when intended. See `frontend/src/context/ModeContext.tsx`.
- Microservice resource ceilings: Compose sets generous memory for move analysis; confirm prod quotas/timeouts and graceful degradation if microservice is slow/unavailable.
- Unit tests: E2E is good; backend unit coverage is light (lint+jest scaffolds exist). Add 2–3 targeted tests for invite redemption, withdrawal request validation, and risk gate acceptance to catch regressions.

## Operational Checklist (Beta)
- Seed invites and grants; test race‑free redemption. `npm run admin:create-invite -- --campaign beta --max 100 ...` (see `README.md` root and `backend/scripts/create-invite.ts`).
- Promote initial admins for ops. `npm run admin:promote -- --email ... --role admin --yes`.
- Set `Config` features: real mode, faucet (off in prod), withdrawals (off initially), onboarding flag. Endpoint: `/admin/features`.
- Verify `/api/status` reflects correct flags, origins, and microservice health in staging. `backend/src/server.ts:251`.
- Exercise admin withdrawal flow end‑to‑end in staging (request → approve → mark paid/failed) and check ledger/balances.
- Confirm logging in Axiom with correlation from FE→BE; quiet noisy dev logs if needed. See `LOGGING_CHANGES.md`.

## Release/Branching
- Use submodule release scripts to bump/tag FE/BE and update pointers; push manually per policy. See `docs/ops/RELEASING.md`.
- Current git health: root on `dev`; submodules initialized; backend shows local `.env.local` only (expected). `git submodule status` shows FE `v2.0.0-54`, BE `v2.0.1-5`.
- After tagging, run `scripts/sync-release-to-dev.sh` to keep `dev` in sync and avoid drift.

## UX/Polish Candidates (Post‑Beta if time is tight)
- Desktop match layout refinements and shared toasts/loaders. See `docs/backlog/BETMATE_DESKTOP_BACKLOG.md`.
- Unify style tokens/SCSS cleanup; reduce visual flicker on live updates (snapshot debounce).
- Add simple “Report Issue” with screenshot + logs to feed Discord/email. See `docs/BETA_PREP.md` Observability.

## Questions/Assumptions
- Do we want a minimal “Beta Terms” screen baked into onboarding? (docs mention it; FE overlay exists but not legal copy.)
- Will payouts remain manual for the entire Beta? If so, a “mark paid” receipt export CSV from admin might be helpful later.
- Any region gating requirements at Beta (IP blocklist)? There’s no code-level enforcement yet.

If you share your list, I’ll map it against this and help order the work for a quick, safe Beta cut.

