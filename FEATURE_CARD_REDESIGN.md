
**Featured Match – Critique**

* **Wasted space**: Huge empty left/right areas; key info is cramped in the center.
* **Weak focal point**: “VS” and names don’t command attention; eyes don’t know where to land.
* **Player context missing**: No flags, titles, streaks, time control, or opening—ratings alone are thin.
* **Stakes unclear**: “HIGH STAKES” badge is vague—no numbers, caps, or risk cues.
* **Piece icons feel decorative**: Glowing pawns add noise but no information.
* **Action ambiguity**: “Join Game” vs “View Details” lacks hierarchy; primary action isn’t obvious.
* **Status absent**: No game phase, move number, clock times, or live indicator.
* **Visual imbalance**: Center column floats; sides feel dead—either fill with info or collapse.

**Quick fixes**

* Compress card height; widen center content.
* Add clocks, time control, live dot, move #.
* Replace pawn glows with player chips (flag, title, form).
* Make stakes explicit (min/max, exposure).
* Promote one clear primary CTA.



## Featured Match: exact UI changes

### 1) Card header (top row)

* Replace current `🔥 Featured Match` + floating “HIGH STAKES” pill with:

  * **Title**: “Featured Match”
  * **LIVE badge**: red pill `LIVE` (only when in_progress)
  * **Meta strip** (single line, subtle): `3+0 • Rapid • Lichess • High Stakes` (or your source)
* Add a **right-side mini summary** (optional): “Pools: 12” or “Bets: 34” so it feels active.

### 2) Use the full width (kill the dead space)

* Convert the inner layout to **3-column**:

  * **Left player block** (35%)
  * **Center VS + clocks + stakes** (30%)
  * **Right player block** (35%)
* The current giant empty left/right should be filled by **player identity chips** (flag, title badge, rating, streak).

### 3) Player blocks (left + right)

Each player block should include:

**Top row**

* Flag avatar (square) + username (bigger, bold)
* Title badge (IM/GM/etc) as a shield/pill
* Optional: verified/source icon if you have it

**Second row**

* Rating big (`2187`) + delta arrow (↑ ↓) if you have last-N rating change
* Small “form” row: last 5 results (`W W W W L`) with color + tiny dots for unknown

**Bottom row**

* Opening / context line:

  * If you have PGN opening: `Ruy Lopez • C99`
  * Else: `Move 12 • Midgame` or `Opening: Unknown`
* Optional: “side” icon (white/black piece) near the edge for clarity

**Styling**

* No glowing pawn silhouettes. If you want piece art, keep it **tiny** and tied to meaning (side-to-move / color), not decorative.

### 4) Center block (VS + clocks + stakes)

**Clocks**

* Left clock and right clock visible at a glance.
* If you have increment: show `3+0` in meta row, not inside the clock.
* When not live: clocks replaced with `Starts in 00:12` / `Scheduled` / `Finished`.

**VS**

* Make VS the focal point: a circle with subtle ring glow, but not huge.
* The “VS” should sit between clocks, with a thin divider line to connect it.

**Stakes**

* Replace vague “HIGH STAKES” with actual constraints:

  * `HIGH STAKES`
  * `$50 – $200 (min–max bet)` (or tokens if Arcade)
* If you support it: show **house exposure** / pool size:

  * `Total pool: $1,240 • Your active: $0`
  * Or `House exposure: $420 / cap $2,000`

### 5) Primary actions (bottom row)

* Make **Join Game** the primary CTA (filled).
* Make **View Details** secondary (outline / neutral).
* Add a third small text-link on the right: **“Open in Lichess”** (or “Watch Source”) if applicable.

### 6) States you must design for (no dead visuals)

Add explicit UI states so the component always feels alive:

* **Loading**: skeleton for player blocks + center
* **No featured match**: friendly empty state + “Browse Matches”
* **Not started**: scheduled time + countdown + “Set alerts” (optional)
* **In progress**: live badge + clocks + move #
* **Finished**: result (1–0/0–1/½–½) + “Settle bets” status + link to recap

---

## Data + backend fields you’ll need (or good fallbacks)

Minimum to render the new card:

* `match_id`
* `status` (`not_started|in_progress|finished`)
* `time_control` (`initial_seconds`, `increment_seconds`)
* `players[]`: `{username, rating, title?, country_code?, color}`
* `clocks`: `{white_ms, black_ms}` (only when live)
* `opening`: `{name?, eco?}` (optional)
* `stakes`: `{tier, min_bet, max_bet, currency}` (currency = tokens/$/USDT)
* `source`: `{provider, url}` (optional)
* `stats`: `{total_bets, total_pool, house_exposure?, cap?}` (optional but big UX win)

Fallback logic if missing:

* No opening: show `Move N • {phase}`
* No country/title: omit, don’t show placeholders
* No clocks: show “Live” + “Move N” only

---

## What “View Details” should do (make it *useful*, not just “more info”)

Clicking **View Details** should open a **Match Details drawer/modal** (preferred) or a dedicated page.

### Drawer layout (top to bottom)

1. **Header**

* Match title + LIVE badge
* Player row (same chips, smaller)
* Source link (Lichess) on the right

2. **Game snapshot**

* Small board preview (or FEN-based mini board)
* Below it:

  * `Move N • Side to move`
  * Last move SAN
  * Optional eval/WDL (if you have it)

3. **Betting panel (the real point)**

* **Outcome prices**: White / Draw / Black with odds and implied %
* **Min/max** and any caps shown clearly
* Quick bet sizes (chips): `$10 $25 $50 $100`
* Primary action: **Place Bet**
* Secondary: **Join Game** (if your UX means “enter the match room”)

4. **Market / risk info**

* “Pool & exposure”

  * Total pool, your active bets
  * House exposure by outcome (bar or list)
  * Limits currently in effect (from your Risk & Limits system)
* If you want: “Recent odds movement” mini sparkline

5. **Activity / timeline**

* Recent bets feed:

  * `User • outcome • amount • time`
* Game events:

  * move timestamps, blunders (if you compute), etc.

6. **Settlement expectations**

* “When match ends: payouts auto-credit to wallet”
* “Voids/refunds” rules link (important for real mode)

### Behavior details

* The drawer should be deep-linkable: `/matches/:id` (so “View Details” works with refresh/share).
* If the match is live and user clicks “Join Game”, you route to the **full match room** (board + wager UI).
* If match is not started, show **Remind me** / **Notify** (optional) instead of betting.

---

## Implementation checklist (front-end work)

* Refactor FeaturedMatch into:

  * `FeaturedMatchCard` (summary)
  * `MatchDetailsDrawer` (details)
* Add routing (even if you use a drawer):

  * `/matches/:id` loads the same drawer/page
* Add API calls:

  * `GET /matches/featured`
  * `GET /matches/:id/details` (includes odds + pool + exposure + clocks)
* Add polling / websockets for live:

  * poll clocks + odds every 2–5s, or socket events if you already have them
* Replace decorative pawns with real data-driven UI elements.

If you want, paste your current FeaturedMatch component (or a screenshot of its JSX) and I’ll give you the exact component structure + props + Tailwind/shadcn mapping to build it quickly.
