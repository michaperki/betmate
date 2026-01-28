# Beta Plan — Final Prioritized Tasks

1. Redesign deposit flow copy to clearly explain the sweepstakes model (buy KBits → receive BetMate Cash 1:1 bonus) and show dual-wallet effects.

-- THIS IS AS SIMPLE AS UPDATING THE DEPOSIT MODAL TO SHOw K-BITS AS THE DEPOSIT (AND THE ASSOCIATED BetMate Cash bonus can be calculated below)... So the user deposits (maybe deposit is the wrong verbiage?) The user buys 100K K-Bits and the receive $100 BetMate Cash as a bonus... I think having some flat ratio is fine? DO NOT WANT A TWO STEP SCREEN. FEWER CLICKS IS BETTER.

2. Ensure Arcade (KBits) wagers bypass Real-mode risk caps and max-odds; fix any rejection of KBits (e.g., 50x draw) at the backend.

3. Add an in‑app “Report Issue” entry (footer/menu) that captures screenshot + brief description + auto context (user, route, version, trace) and forwards to Discord/email via a backend endpoint.

4. Implement Terms & Conditions acceptance gate (modal on first login/onboarding), store `terms_version_accepted`, and link Terms/Privacy in footer and deposit screens.

5. Restrict the app to Beta scope routes only (Dashboard, Game UI, Settings, My Bets, Stats, Login/Onboarding); hide/disable or remove dead‑end/unwired screens and toggles.

I mean, there is also the Header that we need to keep... I don't want you to break something when we do this. I guess a good first step here would be just to list all of the components in the frontend and I'll let you know if anything seems superfluous / suspicious

6. Reduce initial load time by pruning deprecated components/styles, adding route‑based code‑splitting (lazy‑load Admin/rare views), and cleaning legacy SCSS imports.

Sure, just don't break anything.

7. Add Open Graph/Twitter metadata and preview image; verify link previews in iMessage/Discord/Reddit/Twitter.

(Claude Code will do this one)

8. Write a final “Withdrawal paid” ledger event for audit symmetry (complements “hold” and “refund”).

K... I haven't tested the Withdrawal flow thoroughly but sounds good, we will work the kinks out when we get to it.

9. Verify and set DB‑backed feature flags for Beta (realModeEnabled, enableFaucet=false in prod, enableWithdrawals=false initially, onboardingEnabled as desired) via `/admin/features`.

Good note, keep a list of reminders for me somewhere that includes this.

10. Confirm `/api/status` returns correct flags/origins and that `ALLOWED_ORIGINS` are correct in staging/prod; fix CORS if needed.

Think it's fine, but yeah we will test everything together

11. Update player header “Bet on White/Black” buttons: place text directly inside the button (remove inner pill) and align hover/focus styles to tokens.

Yup

12. Add inline “Why?” explainer links for refunds and acceptance rejections (pari‑mutuel behavior, aborted games, pricing gaps, risk caps) with a compact FAQ panel.

Space is at a premium in certain spots so maybe just a "?" in the header of receipts panel and elsewhere will be sufficient... Compact FAQ panel sounds good.

13. Update Wallet/Deposit UI labels to “KBits (Tokens)” and “Cash (Redeemable USD)” with info tooltips linking to the balances explainer page.

K

14. Enhance deposit receipts and ledger reasons to explicitly show wallet, fee, and “bonus tokens” attribution when applicable.

K

15. Add simple daily withdrawal velocity cap per account and harden signup velocity with IP/device guardrails suitable for Beta.

K

16. Standardize async feedback (toasts/spinners) across deposit, withdrawal, onboarding, and wagers using a shared notification/loading system.

K

17. Harden logging correlation (frontend trace id → backend request id), keep dev verbosity sane, and run logging verification script.

K

18. Improve microservice resilience: short health‑probe timeout, clear user‑facing fallback if analysis service is degraded; surface health in UI using `/api/status`.

K

19. Finalize onboarding flow: ensure Terms gate displays as intended in prod, and suppress it in local/dev per current defaults.

K

20. Add a small “risk presets for Beta” in Admin to keep caps conservative and reduce false rejections.
21. Expand E2E with targeted tests: invite redemption grants, withdrawal request validation (manual handle + crypto address), and Real risk gate acceptance.
22. Confirm NOWPayments currency allowlist and deposit quote accuracy (fee/fixed fee/charge vs desired USD) and show pay‑currency estimates to the user.
23. Add admin CSV export or simple copy‑export for withdrawals to aid manual payout reconciliation (optional if needed for Beta ops).
24. Ensure faucet is disabled outside dev/staging and that Admin UI does not rely on `X-Admin-Key` (UI checks user.role only); keep header for ops APIs.
25. Add image/font preloads for above‑the‑fold assets on Dashboard/Game; verify caching headers.
26. Remove/gray out non‑functional Settings toggles and only expose working Beta preferences.
27. Add friendly “Feature disabled (Beta)” stubs for flagged‑off features to avoid broken routes and confusing errors.
28. Validate link‑based invite capture (Onboarding preserves `code` param) and race‑free invite redemption with dual‑currency grants.
29. Update rejection messages on wager placement to include the specific cap hit (per‑bet, per‑player, per‑outcome, per‑game, global) with a help link.

-- While you are updating toasts, I want you to reference the MOCK TOASTS and see if you can get our toasts to look even more closely like the plutonic mocks.

30. Verify admin withdrawals flow end‑to‑end (request → approve → processing/paid/reject/failed) and the hold/refund/paid ledger sequence.
31. Confirm device id capture on signup (FE `getDeviceId`) and record signup IP/UA/device for basic Beta fraud context (already present; re‑verify FE → BE path).
32. Prune demo/example components from the production bundle and exclude admin CSS from main critical path.
33. Validate ALLOWED_ORIGINS env population in each environment and add a quick ops checklist to `docs/ops/RELEASING.md` for post‑deploy verification.
34. Create a concise “How balances and payouts work” page and link from Wallet/Deposit and wager confirmations.
35. Add optional post‑flow micro‑feedback (1–2 click rating) after deposit and first wager to capture friction points.
36. Confirm E2E CI stability against Docker stack (Playwright runs) and tag a smoke subset for quick pre‑release checks.
37. Run submodule release flow and root pointer/tagging per policy; sync `release` → `dev` after publishing (operational task).

38. Update branding assets: replace favicon/tab icon and manifest icons with new logo (update `webpack` favicon path if needed), ensure OG/Twitter preview uses the new image, and verify across environments.


EVERYTHING SEEMS GOOD!
