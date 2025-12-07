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
After running a release script, push tags and branches to your remotes:

```
git -C frontend push --follow-tags origin release
git -C backend  push --follow-tags origin release
git push --follow-tags origin release
```

Version Display in UI (Frontend)
- The UI component `frontend/src/components/VersionTag.tsx` reads `versionLabel` from `frontend/src/version.ts`.
- `version.ts` builds a label using `npm_package_version` and environment (adds “(dev)” in development).
- Webpack injects build-time metadata (build time, branch, URL) via `DefinePlugin`.

Notes
- Scripts require a clean working tree in the target submodule to avoid mixing unrelated changes with a release.
- If you need to release from a specific commit on `dev`, cherry-pick to `release` first, then run the script.

