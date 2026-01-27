# Clamp zero-value stake caps in Arcade wagers (P2)

- Area: Frontend stake clamping for Arcade bets
- Priority: P2
- File(s): `frontend/src/containers/ChessMatch/component.tsx:816-820` (and similar logic in quick-bet, WDL bet, and move bet flows)

## Summary
The clamp intended to enforce backend-provided Arcade stake limits is skipped when the cap is `0`. The current condition uses a truthiness check (`stakeCap && Number.isFinite(stakeCap)`), and because `0` is falsy, the clamp does not run. As a result, configurations that intentionally set `arcadeMaxStakeMove`/`arcadeMaxStakeWdl` to `0` (e.g., to disable Arcade wagers) will fail to clamp and allow the UI to attempt invalid wagers.

## Impact
- Users can submit wagers exceeding the configured maximum when the cap is `0`.
- UI becomes inconsistent with backend validation, potentially causing failed requests and poor UX.
- Regresses the stated goal of honoring server-advertised stake caps.

## Repro
1. Configure backend to return `arcadeMaxStakeMove = 0` (or `arcadeMaxStakeWdl = 0`).
2. In the UI, set `selectedStake` to any positive number.
3. Observe that the clamp logic is skipped and the higher value proceeds.

## Root cause
Use of a truthiness guard on `stakeCap` prevents `0` (a valid cap) from entering the clamp path:

```ts
// Current pattern (example)
if (stakeCap && Number.isFinite(stakeCap)) {
  selectedStake = Math.min(selectedStake, stakeCap)
}
```

## Fix
Remove the truthiness check and rely solely on finiteness so `0` is treated as a legitimate cap:

```ts
const hasCap = Number.isFinite(stakeCap)
const clampedStake = hasCap ? Math.min(selectedStake, Number(stakeCap)) : selectedStake
```

Apply the same change anywhere the stake cap is checked (quick-bet, WDL bet, and move bet flows), including `frontend/src/containers/ChessMatch/component.tsx:816-820`.

## Acceptance criteria
- With server cap `0`, all Arcade stake inputs clamp to `0` and prevent submission of higher values (or disable submission appropriately per UX).
- With a positive finite cap `C`, inputs clamp to `min(input, C)`.
- With `undefined`/`null`/`NaN` cap, clamp logic is bypassed (no regression in flows that expect no cap).
- Manual verification across quick-bet, WDL bet, and move bet flows.

## Notes
- Consider normalizing the cap once (e.g., `const cap = Number.isFinite(rawCap) ? Number(rawCap) : undefined`) to avoid scattered truthiness checks.
- Add a unit test (or component-level test) that explicitly covers caps of `0`, positive finite values, and invalid caps.
