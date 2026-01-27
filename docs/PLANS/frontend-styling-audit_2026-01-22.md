BetMate Frontend Styling Audit — Game UI and Dashboard

Date: 2026-01-22
Author: Codex CLI Agent

Overview
- I reviewed INSTRUCTIONS.md, the latest context dumps, and inventoried styling across the frontend. This document summarizes how styling is organized, how the game UI and dashboard UI are laid out, and concrete improvements to unify design and theming.

Styling System
- Design tokens and mixins
  - Tokens: `frontend/src/styles/tokens.scss`
  - Mixins: `frontend/src/styles/mixins.scss`
  - Coverage: brand colors, typography, spacing, radii, shadows, animation, layout, component sizes.
- Theme variables
  - CSS variables defined in `frontend/src/styles/themes.scss` for dark (default) and `html.light-mode` overrides.
  - Utilities/components should consume `var(--...)` for runtime theming.
- Global entry
  - `frontend/src/style.scss` imports tokens, mixins, themes, utilities, components and defines base layout and Chessground integration.
- Utilities and components
  - Utility classes in `frontend/src/styles/utilities.scss` (layout, spacing, color, typography, border, shadow, etc.).
  - Component primitives in `frontend/src/styles/components.scss` (`.btn`, `.card`, `.form-*`, `.modal`, `.nav`, `.badge`, etc.).

Theming
- ThemeContext toggles `html.light-mode` at runtime `frontend/src/context/ThemeContext.tsx`.
- Many components correctly use CSS variables or guard via `html.light-mode &`.
- Caveat: `frontend/src/style.scss` sets `body` colors with SCSS tokens, potentially overriding theme variables. Recommend switching to `var(--text-primary)`/`var(--bg-primary)`.

Game UI (ChessMatch)
- Layout
  - Responsive grid with named areas in `frontend/src/containers/ChessMatch/style.scss`.
  - Mobile: single column; tablet/desktop compute side widths and board size continuously via CSS custom props.
- Key components
  - Bottom toolbar `frontend/src/containers/ChessMatch/bottom-toolbar.scss` with light-mode adjustments.
  - Eval bar `frontend/src/containers/ChessMatch/evaluation-bar.scss`.
  - Move bubbles `frontend/src/components/MoveBubbles/style.scss` (theme-aware).
  - Wager receipts `frontend/src/components/WagerReceipts/dark-style.scss` (theme-aware).
- Hotspots
  - `ChessMatch/style.scss` still has raw rgba/hex values for borders, chips, and hover states. Recent light-mode sweep improved areas but literals remain.

Dashboard UI
- Dashboard container and sections use tokens / CSS variables and light-mode refinements:
  - Dashboard: `frontend/src/containers/Dashboard/style.scss`
  - FilterBar: `frontend/src/containers/Dashboard/components/FilterBar/style.scss`
  - LiveMatchesGrid: `frontend/src/containers/Dashboard/components/LiveMatchesGrid/style.scss`
  - FeaturedMatch: `frontend/src/containers/Dashboard/components/FeaturedMatch/style.scss`
  - Leaderboard: `frontend/src/components/Leaderboard/styles.scss`

Tailwind
- Tailwind configured in `frontend/tailwind.config.js` and layered in `frontend/src/index.css`, but `index.css` is not imported in `frontend/src/index.tsx`. SCSS is the primary styling path per unification plan.

Notable Hot Spots / Suspicions
- Base theme override: `frontend/src/style.scss` sets `body` with SCSS tokens ($bg-primary/$text-primary). This likely blocks runtime theme updates. Switch to CSS variables.
- Hard-coded brand rgba: Repeated `rgba(0, 239, 178, ...)` scattered across files (Navbar, bottom toolbar, buttons, etc.). Prefer `rgb(var(--brand-primary-rgb) / <alpha>)` with a new `--brand-primary-rgb` variable.
- Mixed tokens vs variables: Newer styles use `var(--...)`, others use `$token` or raw hex. SCSS `$token` won’t update at runtime; prefer variables for theme-linked properties.
- Inconsistent blue accent: Frequent `#3b82f6` vs `$accent-blue: #00B6FF`. Normalize to a single accent via tokens.
- Legacy/duplicate styles: Old `style.scss` variants live alongside modern `dark-style.scss`; ChatBox, WagerReceipts, Auth, etc. keep legacy files not actively imported.
- Admin and ConnectionStatus: contain hard-coded dark-mode-only colors; could be tokenized.

Concrete Improvements
1) Make theme active at root
   - Switch `body` and `.dashboard-page` background/text colors in `frontend/src/style.scss` to CSS variables.
2) Add brand RGB variables
   - Add `--brand-primary-rgb` in `themes.scss` (override in `html.light-mode`) to eliminate hard-coded brand rgba across components.
3) Replace hardcoded brand rgba in key files
   - `frontend/src/components/NavBar/unified-navbar.scss`: replace `rgba(0, 239, 178, ...)` with `rgb(var(--brand-primary-rgb) / ...)`.
   - `frontend/src/containers/ChessMatch/bottom-toolbar.scss`: same for border/hover colors.
   - `frontend/src/components/Button/style.scss`: adjust primary/secondary hover shadows to use `rgb(var(--brand-primary-rgb) / ...)`.
4) Token sweep (next patches)
   - Prioritize `ChessMatch/style.scss` and `GameInfoPanel/style.scss` to remove raw hex/rgba and adopt tokens/variables.
5) Normalize accent blue
   - Decide on preferred blue, update `$accent-blue` if needed, and refactor stray `#3b82f6` instances.
6) Retire legacy files
   - Remove unused `style.scss` duplicates where `dark-style.scss` is the source once parity confirmed.
7) Optional lint
   - Add stylelint rule to ban hex colors outside tokens.

Initial Implementation Plan (this pass)
- Patch 1: Switch base `body`/`.dashboard-page` to CSS variables.
- Patch 2: Add `--brand-primary-rgb` to themes and use in a few high-traffic components (Navbar, bottom toolbar, Buttons) to remove hard-coded rgba usage.
- Later patches: Token sweep in ChessMatch and GameInfoPanel; blue accent normalization; retire legacy files.

