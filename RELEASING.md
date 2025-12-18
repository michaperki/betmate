Releasing Betmate (Frontend, Backend, or Both)

This repository contains helper scripts to automate version bumps, tagging, and updating submodule pointers for releases.

Overview
- Frontend version and UI label come from `frontend/package.json` and `src/version.ts`.
- Release scripts use `npm version` inside each submodule, creating a commit and tag (vX.Y.Z).
- The root repo commits the updated submodule pointer(s) and adds convenience tags.
- Nothing is pushed automatically; commands to push are printed for safety.

Prerequisites
- Clean working trees in submodules: no unstaged/unstashed changes in `frontend` and/or `backend`.
- Branches: scripts operate on the `release` branch in each submodule (created if missing).

Quick Commands
- Frontend only
  - Patch: `npm run release:frontend:patch`
  - Minor: `npm run release:frontend:minor`
  - Major: `npm run release:frontend:major`
  - Exact: `npm run release:frontend -- 1.2.3`

- Backend only
  - Patch: `npm run release:backend:patch`
  - Minor: `npm run release:backend:minor`
  - Major: `npm run release:backend:major`
  - Exact: `npm run release:backend -- 2.0.0`

- Combined (Frontend + Backend)
  - Patch: `npm run release:app:patch`
  - Minor: `npm run release:app:minor`
  - Major: `npm run release:app:major`
  - Exact: `npm run release:app -- 1.2.3` (applies the same bump spec to both)

What Each Script Does
- `scripts/release-frontend.sh`
  - Checks `frontend` is clean; checks out/creates `release`.
  - Runs `npm version <spec>` (commit + tag in submodule).
  - Stages and commits the submodule pointer in the root repo.
  - Adds a root tag `frontend-vX.Y.Z`.

- `scripts/release-backend.sh`
  - Same as above but for `backend`, with tag `backend-vA.B.C`.

- `scripts/release-app.sh`
  - Performs both frontend and backend steps together and creates a combined root tag `app-vX.Y.Z+A.B.C`.

Publishing
These scripts never push for you; pushing is a manual, human step (team policy). After running a release script, push tags and branches yourself:

```
git -C frontend push --follow-tags origin release
git -C backend  push --follow-tags origin release
git push --follow-tags origin release
```

Keep Dev In Sync (recommended)
To avoid `dev` showing “behind” due to release-only version/tag bumps, merge `release` back into `dev` after publishing. You can either run the helper script or do it manually.

Option A — helper script (no push):

```
bash scripts/sync-release-to-dev.sh --fetch
# Then push manually (if desired):
# git -C frontend push origin dev
# git -C backend  push origin dev
# git push origin dev
```

Option B — manual commands:

```
# Submodules (no push here; push later if you want)
git -C frontend checkout dev && git -C frontend fetch origin && git -C frontend merge --no-ff origin/release
git -C backend  checkout dev && git -C backend  fetch origin && git -C backend  merge --no-ff origin/release

# Root: update submodule pointers on dev (no push)
git add frontend backend
git commit -m "chore(submodules): merge release->dev and update pointers"
```

Version Display in UI (Frontend)
- The UI component `frontend/src/components/VersionTag.tsx` reads `versionLabel` from `frontend/src/version.ts`.
- `version.ts` builds a label using `npm_package_version` and environment (adds “(dev)” in development).
- Webpack injects build-time metadata (build time, branch, URL) via `DefinePlugin`.

Notes
- Scripts require a clean working tree in the target submodule to avoid mixing unrelated changes with a release.
- If you need to release from a specific commit on `dev`, cherry-pick to `release` first, then run the script.
