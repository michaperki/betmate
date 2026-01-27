
Here’s the minimum “beta infra” I’d put in before you invite strangers.

### Access + referral

* **Invite codes / referral links**: code → campaign → max redemptions → expires_at.
* **One-click onboarding**: landing page that explains bankroll + rules + eligibility.
* **Fraud gates**: 1 account per phone/email, device fingerprint-ish, basic VPN/risk flag, rate limits.

### Bankroll + accounting (don’t wing this)

* **Ledgered wallet** (internal): every credit/debit is an immutable entry (bonus, wager, win, loss, adjustment).
* **Bonus constraints**: “promo bankroll” is *not withdrawable*; only **net winnings** are (or only after playthrough).
* **Exposure limits**: per-user max bet, per-game max pool, per-day max withdraw.

### Payout / withdrawal

* **Withdrawal queue + state machine**: requested → review → approved → paid → failed/retry.
* **Manual review tools**: notes, risk flags, KYC-light fields if needed later.
* **Venmo**: you’ll need a **manual payout option** unless you’re integrating a provider; build the queue + “mark paid” now.
* **Receipts**: store payout method, handle, amount, timestamps.

### Admin dashboard (beta ops)

* Campaign overview: signups, activated, retained, bankroll issued, total wagers, net P&L, pending withdrawals.
* User detail: ledger, wagers, devices/IPs, flags, notes, ban/lock buttons.
* One-click “grant bonus” + “revoke/expire code”.

### Observability + support

* **Event tracking**: signup → first game → first wager → first win → withdrawal requested/completed.
* **Feedback capture**: in-app “report issue” with screenshot/log bundle + Discord/email hook.
* **Crash + error logging**: front + back correlation IDs.

### Legal / safety-ish (practical)

* Clear beta terms: “promo bankroll, no deposit required, withdrawals limited to winnings, abuse = forfeiture.”
* Region gating if needed (at least block obvious restricted jurisdictions).

If you want the absolute shortest build list: **invite codes + ledger + withdrawal queue + admin risk controls + event tracking**. Everything else can be v2.
