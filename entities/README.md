Git Manager Entity

Scope
- Owns all git-related operations in this repository, including submodules.
- Coordinates safe release flows, tagging, and submodule pointer updates.
- Surfaces clear, reproducible commands; avoids automatic pushes unless explicitly requested.

Submodules
- frontend — submodule tracked in `frontend`.
- backend — submodule tracked in `backend`.
- microservice — submodule tracked in `microservice` (marked `ignore = dirty` in `.gitmodules`).

Primary Responsibilities
- Tree health overview
  - Run aggregated status for root + submodules: `npm run git:status` (see `scripts/git-tree-status.sh`).
  - Initialize or sync submodules when needed:
    - Init: `npm run git:submodules:init`
    - Sync + init/update: `npm run git:submodules:sync`
    - Show submodule pointers: `npm run git:submodules:status`

- Release management (per docs/ops/RELEASING.md)
  - Frontend only:
    - Patch/minor/major: `npm run release:frontend:patch|minor|major`
    - Exact: `npm run release:frontend -- 1.2.3`
  - Backend only:
    - Patch/minor/major: `npm run release:backend:patch|minor|major`
    - Exact: `npm run release:backend -- 2.0.0`
  - Combined (FE + BE):
    - Patch/minor/major: `npm run release:app:patch|minor|major`
    - Exact (same bump spec applied to both): `npm run release:app -- 1.2.3`
  - What the scripts do:
    - Ensure clean working tree in the target submodule.
    - Switch/create `release` branch in each submodule.
    - Run `npm version <spec>` in the submodule (creates commit + tag `vX.Y.Z`).
    - Commit updated submodule pointer(s) in the root repo.
    - Create convenience tags in the root:
      - Frontend: `frontend-vX.Y.Z`
      - Backend: `backend-vA.B.C`
      - Combined: `app-vX.Y.Z+A.B.C`
    - Output push commands; pushing remains manual by policy.

- Publish and sync
  - After a release script completes, publish manually:
    - `git -C frontend push --follow-tags origin release`
    - `git -C backend  push --follow-tags origin release`
    - `git push --follow-tags origin release`
  - Keep `dev` in sync with `release` (recommended):
    - Helper: `bash scripts/sync-release-to-dev.sh --fetch` (no push)
    - Or merge manually, then push `dev` branches and root pointer updates.

Guardrails
- Never push automatically; explicit confirmation is required for any network push.
- Require clean working trees in root and target submodules before releases or merges.
- Respect `.gitmodules` policy for `microservice` (dirty state is tolerated/ignored by design).
- Resolve conflicts interactively with a clear plan; do not auto-resolve.

Branch & Tag Conventions
- Working branches: `dev` (integration) and `release` (stable for tagging/publishing).
- Tags within submodules: `vX.Y.Z` created by `npm version`.
- Root tags:
  - Frontend: `frontend-vX.Y.Z`
  - Backend: `backend-vX.Y.Z`
  - Combined: `app-vX.Y.Z+A.B.C`

Typical Requests the Git Manager Handles
- “Show me the git health right now” → run `npm run git:status` and summarize.
- “Prepare a frontend patch release” → run `npm run release:frontend:patch` and report next push steps.
- “Release backend as 2.1.0” → run `npm run release:backend -- 2.1.0`.
- “Bump both to minor and sync dev” → run `npm run release:app:minor`, then `bash scripts/sync-release-to-dev.sh`.
- “Initialize/sync submodules” → run `npm run git:submodules:sync`.

References
- Release guide: `docs/ops/RELEASING.md`
- Scripts: `scripts/release-frontend.sh`, `scripts/release-backend.sh`, `scripts/release-app.sh`, `scripts/sync-release-to-dev.sh`, `scripts/git-tree-status.sh`
- NPM script entry points: `package.json`

Notes
- Frontend displays version label from `frontend/src/version.ts`; tagging aligns UI with releases.
- If releasing from specific commits, cherry-pick to `release` first and then run the release script.
