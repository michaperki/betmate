
Key safeguards you should put in place:

* **Hard caps**

  * Max bet size per market.
  * Max liability per game (especially draw).

* **Dynamic margin (vig)**

  * Increase house edge when draw probability is high or uncertain.
  * Apply extra margin to draws specifically.

* **Exposure-based repricing**

  * If too much money piles onto draw, automatically shorten draw odds.
  * Pause betting when exposure crosses a threshold.

* **Confidence gating**

  * Lower max stakes when engine eval is shallow, volatile, or early-game.
  * Higher stakes only when eval is stable (late middlegame / endgame).

* **Draw throttles**

  * Cap absolute payout on draw outcomes.
  * Optionally convert draw bets into capped-return bets.

* **Anomaly detection**

  * Flag users repeatedly targeting draw-heavy positions.
  * Manual review / auto-limits for sharp behavior.

* **Kill switches**

  * Per-game and global ability to suspend draw betting instantly.

* **Backtesting + stress tests**

  * Simulate worst-case historical draw streaks with real stake limits.

If you want, next step is designing **a formal exposure model** (liability curves per outcome) and **draw-specific pricing rules**.
