# Beta Plan — Human‑Augmented Thoughts

This document organizes your priorities into categories, paraphrases your points, and adds Candidate ideas sparked by them.

## Feedback & Support
- Human: Capture user feedback and bug reports in‑app, not just via the Discord footer link.
- Candidate:
  - Add “Report an issue” entry point (footer + menu) that collects a brief description, contact optional, console/network snippets, and an annotated screenshot. Post to a lightweight backend endpoint that forwards to Discord/email with correlation IDs.
  - Tag reports with user id, app version, environment, and current route for triage.
  - Add a quick‑rating toast after key flows (deposit, first wager) to gauge friction.

## Education & Clarity (Currencies, Betting, Refunds)
- Human: Provide clearer explanations: what is pari‑mutuel vs not, when/why bets get refunded, and how currencies differ.
- Candidate:
  - Inline “Why?” links on receipts and wager confirmation that open a compact FAQ panel (refund reasons: game aborted, pool size, pricing unavailability, risk gating, etc.).
  - A single “How balances and payouts work” page linked from Wallet and Deposit; include examples and edge cases.
  - Tooltips on currency chips/balance rows; surface which bets are pari‑mutuel (real WDL pools) vs fixed odds (if any).

## Legal & Terms
- Human: Create terms and conditions.
- Candidate:
  - Minimal Beta Terms modal with explicit acceptance during onboarding or first login (store `terms_version_accepted` on user).
  - Region gating baseline (soft block obvious restricted regions, or at least warn) and an “abuse = forfeiture” clause.
  - Link Terms + Privacy in footer and deposit screens.

## Wallet & Deposit Model (Dual‑Currency/Sweepstakes)
- Human: Fix deposit flow clarity — explain sweepstakes model: users buy KBits and receive BetMate Cash (redeemable 1:1) as a bonus.
- Candidate:
  - Redesign deposit modal to a short 2‑step explainer: Step 1 “Buy KBits” + disclosure, Step 2 “Bonus: BetMate Cash” + fee/estimates. Reflect both balances post‑deposit.
  - Rename labels in UI for clarity (e.g., “KBits (Tokens)” and “Cash (Redeemable USD)” with info icons).
  - Receipt entries specify wallet and reason (e.g., “Deposit → Cash + Bonus Tokens”).
  - Add a single link to the education page above for compliance clarity.

## UI/UX Polish (Game & Global)
- Human: Player‑header “Bet on White/Black” buttons need a touch‑up — text should be inside the button, not in an inner pill.
- Human: Several dead ends/non‑functional areas (e.g., Settings has many toggles that aren’t wired).
- Candidate:
  - Tighten the player header buttons (label/internals), ensure focus/hover/disabled styles match the design tokens.
  - Audit Settings and hide/gray out non‑functional toggles; only expose the subset that actually works in Beta.
  - Add a global toast/loader system to standardize feedback for async actions.

## Risk & Limits
- Human: Risk limits should not apply to KBits (Arcade) bets; currently KBits draw bets with 50x odds can be rejected.
- Candidate:
  - Verify backend gating applies only to Real mode (cash) and that Arcade (tokens) bypasses Real risk caps and max odds; if the FE tries Arcade with Real route, route it correctly.
  - Add a clear message when a Real bet is rejected (per‑bet/per‑player/outcome/global caps) and link “Why?” docs.
  - Add a small admin “risk preset” for Beta to keep caps sane and avoid accidental user frustration.

## Growth & Sharing
- Human: Ensure BetMate links look good when shared via text/forums.
- Candidate:
  - Set Open Graph/Twitter meta tags (title, description, preview image) and a clean favicon; test on mobile messaging apps.
  - Provide a campaign code in links (if appropriate) to auto‑fill invite codes.

## Navigation Integrity
- Human: Remove/avoid dead ends and non‑functional screens to reduce confusion.
- Candidate:
  - Hard‑limit the nav and routes to the Beta scope; 404 or hide anything not in scope.
  - Add guardrails: if a feature is off, show a friendly “Coming soon (Beta)” panel instead of a broken route.

## Performance & Dead Code
- Human: FE loads slowly; likely many deprecated components/styles remain. Dead code sweepers miss items still rendered somewhere.
- Human: “We only really need Dashboard, Game UI, Settings, My Bets, Stats, Login/Onboarding — one set of screens and only necessary subcomponents.”
- Candidate:
  - Produce a screen inventory and component dependency map for Beta scope. Tree‑shake by code‑splitting non‑Beta routes, lazy‑load admin, and remove legacy variants.
  - Run `unimported`, `ts-prune`, and a bundle analyzer; then manually prune stale imports and shared style sheets.
  - Replace heavy global SCSS with a thinner tokens/utilities layer for the Game + Dashboard; defer loading of admin CSS and demo components.
  - Add image/font preloading for above‑the‑fold assets; verify HTTP cache headers.

---

## Suggested Next Steps (Quick Wins)
- Add in‑app “Report issue” with auto‑context and route it to Discord/email.
- Swap/adjust the player header bet buttons to the desired text placement.
- Limit routes to the six Beta screens; hide unimplemented settings and admin bits.
- Add OG/Twitter meta and verify link previews.
- Clarify deposit modal copy for the sweepstakes model and show dual‑wallet deltas in receipts.
- Confirm Arcade (KBits) bypasses Real risk caps; fix any accidental gating.

