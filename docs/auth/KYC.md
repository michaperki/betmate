
**Yes — build a mock KYC flow now. That’s the right move.**

**Do it this way (best of both worlds):**

* Implement a **KYC state machine** in your app:

  * `none → required → pending → approved → rejected`
* On withdrawal:

  * Trigger **KYC_REQUIRED**
  * Show placeholder screens (ID upload, selfie, review)
* Backend:

  * Block withdrawals unless `approved`
  * Log + test all edge cases

**Why this is correct:**

* Unblocks FE/BE work immediately
* Lets you ship + test withdrawal logic safely
* KYC providers plug into this cleanly later (webhooks map perfectly)

**Important rule:**

* **Do NOT** actually accept/use documents yet
* Make it explicit: *“Verification coming soon”* or *“Mock verification”*

**When you pick the provider:**

* Replace mock upload with provider SDK
* Map provider statuses → your state machine
* Minimal refactor

**Bottom line:**
Build the flow + gates now.
Swap the engine later.
