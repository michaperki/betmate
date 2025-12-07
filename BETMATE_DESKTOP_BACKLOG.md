# BetMate Desktop UX Backlog

This backlog captures the high-impact tasks discussed during our recent conversation. Each item should eventually become its own ticket/PR so we can ship incrementally without another massive one-off refactor.

## 1. Frontend Routing & Onboarding
- Centralize post-login layout so onboarding checks run in one place instead of embedding the gate inside individual pages
- Ensure all authenticated routes share the same base shell (nav, background, connection status)

## 2. Shared Notification / Loading System
- Add a global toast/snackbar + async loading indicator
- Wire onboarding fetch/save (and other critical flows) to the shared system

## 3. Chess Match Desktop Redesign
- Implement the three-column responsive grid (20/60/20 approximations)
- Let the board scale up to ~78vh while staying centered
- Rebuild right-hand panel into a single scrollable column; simplify wagering/chat
- Shrink and reposition move bubbles below the board with a “Best Move” label
- Slim down the leaderboard with compact rows and minimal chrome
- Make player header a tight horizontal bar with avatar/name/rating/clock
- Replace large bet buttons with input + chips
- Reduce glow/shadow intensity on desktop breakpoints
- Standardize typography (H3/H5) and corner radii (10–12px)

## 4. Styling / SCSS Cleanup
- Remove unused imports and legacy style files (e.g., old drag tip CSS)
- Extract shared tokens/utilities for ChessMatch instead of layered overrides

## 5. Backend Feature Flags / Metadata
- Generalize onboarding version into a flexible `user_metadata` or `feature_flags` structure
- Expose CRUD endpoints for future UX experiments (tutorial replays, announcements, etc.)

## 6. Microservice Docker Modernization
- Update router Dockerfile (already done) and audit other Lambda images for buster/bullseye issues

## 7. Bugs / Polish
- Live status flicker on move: "Not Live" briefly flashes and board frame turns red during repaint when a new move arrives. Likely caused by transient `positionIndex`/`latestSnapshotIndex` mismatch while snapshots rebuild. Mitigation: debounce snapshot updates, preserve `isAtLatestSnapshot` across data refresh if staying at the tail, or render guard to avoid applying `board-frame--rewound` during live updates.

---
Feel free to append or reprioritize as we scope each sprint.
