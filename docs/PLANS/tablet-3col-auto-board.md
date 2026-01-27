Title: Tablet 3‑Column Game Layout, Automatic Board Sizing, and Breadcrumb Removal

Scope
- Game UI (ChessMatch): maintain three columns (Side betting | Board | Notation) on tablet (768–1023px) and desktop (>=1024px), with the board resizing automatically. Remove the manual resize handle. Keep mobile (<768px) as a single-column stack.
- Header: remove the breadcrumb entirely.
- Dashboard: align container max-width to reduce the “stretched” look and match header conventions.

Non‑Goals
- Do not lower the board min size (keep current 350px or higher, respecting Chessground tolerance).
- No layout rework of inner components beyond what’s required for column behavior and board fit.

Design Decisions
- Tablet remains 3 columns: shrink side columns to a smaller minimum on tablet so three columns and the minimum board fit at 768px.
- Automatic board sizing: compute board size from viewport width/height and grid constraints rather than user drag. Preserve Chessground “content-box” hygiene to avoid piece/square misalignment.
- Max-width: keep the Game UI as-is; adjust Dashboard container to `$container-xl` to reduce over-stretching and align with the navbar container.

Technical Plan
1) ChessMatch CSS (grid)
   - Keep 3 columns for tablet: add `@media (min-width: 768px) and (max-width: 1023px)` with `grid-template-columns: minmax(140px, 280px) var(--board-width) minmax(140px, 280px)`.
   - Restrict the existing collapse to 1 column to mobile only: switch the current `@media (max-width: 1024px)` block to `@media (max-width: 767px)`.
   - Only hide the left move/outcome rail on mobile (<768px), not on tablet.

2) ChessMatch TSX (automatic board sizing)
   - Remove manual drag: delete the resize handle button and the drag logic (state, effects, and helpers).
   - Compute board size on load/resize using:
     - content side padding: measured from `.chess-match-page__content` (computed styles), fallback to 80px total.
     - grid gaps: 16px between columns, 2 gaps when 3 columns are present.
     - side columns: use min widths (desktop: 280px each; tablet: 140px each; mobile: 0).
     - eval bar formula: eval width ≈ `boardSize / 16` (since `boardSize >= 350`, the 14px minimum never applies).
     - board frame overhead: `BOARD_STACK_GAP (4) + FRAME_HORIZONTAL_PADDING (8) = 12`.
     - Solve `boardFrameWidth = boardSize + boardSize/16 + 12 <= availableBoardColumnWidth` ⇒ `boardSize <= (available - 12) * 16/17`.
     - Clamp by height (`window.innerHeight - 220`) and cap to 640.
   - Keep `MIN_BOARD_SIZE = 350`.

3) Breadcrumb removal
   - Remove the breadcrumb JSX block from `NavBar/component.tsx` and the corresponding `.navbar__breadcrumb` styles in `unified-navbar.scss`.

4) Dashboard max-width
   - Change `.dashboard-container` from `max-width: 1400px` to `max-width: $container-xl` (1280px) to better match the navbar container and reduce the stretched feel.

Acceptance Criteria
- On tablet (768–1023px):
  - Three columns are visible (left betting rail, board center, notation/right column).
  - No horizontal overflow; the board fits without manual resizing.
- On desktop (>=1024px):
  - Three columns as before; board scales with window.
- On mobile (<768px):
  - Single-column stack remains intact.
- Breadcrumb is not present in the header.
- Dashboard content no longer looks overly stretched; overall width aligns with navbar’s container.

Risk & Mitigations
- Tight space at narrow tablet widths: using 140px min side columns ensures `boardSize >= 350` fits at 768px. If content constrains wider than 140px, consider trimming internal paddings or typography in those columns in a follow-up.
- Chessground alignment: keep all content-box resets; do not introduce width/height overrides on `.cg-*` elements.

Rollout Notes
- All changes are behind responsive CSS and replace the temporary drag-resize UI. Test at 768, 900, 1024, 1280, and 1440 widths; verify pieces/highlights alignment and layout stability.

