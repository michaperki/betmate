# UI Test Layout — Frames, Board, Panels, Notation, Receipts, Bottom Bar

Date: 2025-12-21
Owner: UI Test Page scaffolding for responsive layout prototyping
Route: `/ui-test`

## Goals
- Create a low‑fidelity Test page to nail responsive placement before wiring real data.
- Keep it minimal, fast to iterate, and faithful to the Game UI patterns where helpful.

## What Was Built

- Top‑level frames (Header, Footer, and 4 content frames):
  - Left panel (moves/tiles)
  - Board frame (Player 1 header, Board+Eval row, Player 2 header)
  - Right‑top (Notation Pad)
  - Right‑bottom (Wager Receipts)
  - Thin bottom bar spanning across (stake chips, draw, viewers/chat/leaderboard)

- New route wired in: `frontend/src/components/app.tsx:68` → `Route exact path="/ui-test" component={TestLayoutPage}`.

## Responsive Layout Model (grid)
- Mobile (<768px):
  - Order: Board → Left (moves) → Bar → Notation → Receipts (single column)
  - Board is width‑bound square; left panel becomes a single horizontal row; no dead space.
- Tablet (≥768px and <900px):
  - Board spans 3 columns, then the row: Left | Receipts | Notation, then the Bar across all 3.
- Desktop (≥900px):
  - 3‑column layout: Left | Board (tall) | Right stack (top/bottom)
  - Bar spans all 3 columns below.

Key CSS vars: `--H`/`--W` fit viewport; `--p` (side tile square), `--s` (board width), `--row` (right stack row height), `--bar` (bottom bar height). See `frontend/src/containers/TestLayoutPage/style.scss`.

## Board Fidelity (Chessground)
- Real Chessground board embedded using the same wrapper pattern as Game UI:
  - Wrapper: `.chessboard-wrapper` (absolute fill) + `.cg-wrap` from global CSS.
  - Always square:
    - Mobile: width‑bound square
    - Tablet/Desktop: height‑bound square
- Player headers above/below with click‑to‑cycle demo states:
  - Clock ticking (blinking dot), Active wager (emphasis), Loading (amber pulse), Confirmed (green), Rejected (red)
  - z‑index and pointer‑events adjusted to keep headers clickable over the board.

Key refs:
- Board wrapper CSS: `frontend/src/styles/chessboard-global.css`
- Test page: `frontend/src/containers/TestLayoutPage/component.tsx` and `style.scss`

## Left Panel (Moves/Tiles)
- Equal‑sized tiles in a grid that always fits the panel (no overflow):
  - Uses ResizeObserver to compute best columns/tile size.
  - Mobile forces a single row (N columns) with breathing margins.
- Click‑to‑cycle tile states: idle → active → loading → success → disabled → idle.
- Removed green frame; tiles have playful gradients with compact labels.

## Notation Pad (Right‑Top)
- Minimal, Lichess‑inspired list with compact controls and active move.
- Tablet placement on the right (row: Left | Receipts | Notation).

## Wager Receipts (Right‑Bottom)
- Replaced card list with a compact, table‑like grid:
  - Columns: Bet (type dot + label) | Stake (right) | Odds (right) | Status
  - Status color only; no heavy chrome. Fits without horizontal scroll.

## Bottom Bar (Spanning Row)
- Desktop: spans across all three columns (below the 3‑column layout).
- Tablet: below the Left/Receipts/Notation row.
- Mobile: below moves and above notation.
- Contents:
  - Mode badge (KBITZ/USDT) + stake chips ($1, $2, $3, $5)
  - Centered “Draw” button
  - Right cluster: viewers + Chat/Leaderboard icons (popover placeholders)

## Important Styling/Behavior Decisions
- Board square continuity: Board size grows/shrinks smoothly across breakpoints (no jumps) via shared CSS vars.
- Headers stay compact; board dominates available height.
- `overflow: hidden` on board center row prevents visual spill; with the wrapper square this avoids clipping.
- `z-index` ordering ensures headers remain clickable.
- Mobile width clamps are explicitly scoped to mobile to avoid breaking desktop spans.

## Breakpoints
- Mobile: `< 768px`
- Tablet: `≥ 768px && < 900px`
- Desktop: `≥ 900px`

## Follow‑ups / TODOs
- Wire notation pad and receipts to real game data.
- Hook draw button, chat, and leaderboard to page‑level state/providers.
- Add stake symbol parity with mode (KBITZ/USDT) and unify chips with Game UI.
- Consider an arrow preview on tile hover (using chessground shapes) for extra fidelity.
- Refine tablet spacing if the bar feels tight; tweak `--bar` accordingly.

## Verification Notes
- Resize browser and dev tools to verify:
  - No vertical scroll on large screens; board grows to max allowed by height/width.
  - Tablet: bar sits below the row; right‑top (notation) is rightmost.
  - Mobile: left panel is a single row; bar sits between moves and notation.
- Check clickability of player headers and tile cycles; popovers toggle correctly.

