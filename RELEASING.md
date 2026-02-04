Releasing BetMate (Frontend, Backend, Microservice, Root)

Overview
- Repos: this root repo (with submodules `frontend`, `backend`, `microservice`).
- Branches: `dev` (active development) and `release` (production). No direct commits to `release`.
- Versioning: semantic versions per submodule (vX.Y.Z). Root tags for easy audit.
- Simplicity: local shell scripts, no CI emails, explicit env config.

Key Scripts
- `npm run git:status` — show parity of dev vs release and submodule pointers.
- `bash scripts/sync-release-to-dev.sh` — merge release → dev in FE/BE and update root pointers.
- `npm run release:promote` — promote dev → release, bump versions, tag, and print/push commands.
  - Usage: `npm run release:promote -- [patch|minor|major|<exact>] [--include-microservice] [--push]`

Branch Model & Best Practices
- Only merge from `dev` → `release`. Never commit directly to `release`.
- Keep `dev` green and ready; promote when you want to ship.
- After releasing, optionally sync `release` → `dev` to avoid parity drift (using `sync-release-to-dev.sh`).
- Microservice: has `dev` and `release` branches. For local dev, its router exposes both root and `/dev/*` paths; production is configured explicitly via env.

Environment Config
- Backend requires explicit env per environment. Important keys:
  - `MICROSERVICE_URL`: base URL for the model router.
    - Dev local: `http://localhost:8000`
    - Staging/Prod: your gateway or service base (include stage only if your gateway requires it; no stage guessing in code).
  - `LOG_LEVEL`: set `debug` in dev for helpful logs.
  - `MONGODB_URI`, `ADMIN_API_KEY`, etc. as needed.
- Frontend displays version via `src/version.ts`. Versions come from `package.json`.

Day‑to‑Day Dev
- Start stack: `npm run dev` (FE + BE + microservice router via Docker Compose).
- Router health: `curl http://localhost:8000/health` (and `/dev/health` also available for compatibility).
- Backend status: `curl http://localhost:9000/api/status` — includes microservice health, version info, and config summary.

Release Procedure (Local, No CI)
1) Preflight
   - Ensure clean trees everywhere: root, `frontend`, `backend` (and `microservice` if you plan to tag it).
   - Verify local dev is healthy (`npm run dev`, check `/api/status`).
   - Inspect status: `npm run git:status:fetch`.

2) Promote to release and bump versions
   - Patch bump and print push commands (no auto‑push):
     - `npm run release:promote -- patch`
   - Or push branches + tags too:
     - `npm run release:promote -- patch --push`
   - Recommended: switch all working trees back to `dev` after promotion to avoid accidental work on `release`:
     - `npm run release:promote -- patch --push -- --switch-back-to-dev`
   - Include microservice tagging (traceability only):
     - `npm run release:promote -- patch --include-microservice [--push]`

What `release:promote` does
- Merges `dev` → `release` for FE/BE (and microservice if `--include-microservice`).
- Runs `npm version <spec>` in FE/BE; creates submodule tags (e.g., `v2.0.7`).
- Commits updated submodule pointers in the root repo.
- Creates root tags:
  - `frontend-vX.Y.Z`, `backend-vA.B.C`, and combined `app-vX.Y.Z+A.B.C`.
- Prints push commands (or pushes automatically with `--push`).

3) Publish (if you didn’t use `--push`)
   - `git -C frontend push --follow-tags origin release`
   - `git -C backend  push --follow-tags origin release`
   - Optional (if included): `git -C microservice push --follow-tags origin release`
   - `git push --follow-tags origin release`

4) Verify
   - Backend `/api/status` shows the build info.
   - Root tags present: `git tag -l "app-*"`.
   - FE/BE submodule tags present.

5) Keep Dev in Sync (optional but recommended)
   - `bash scripts/sync-release-to-dev.sh --fetch`
   - Follow printed push commands to update dev branches.

Branch Hygiene (Important)
- After a release promotion, always switch your working copies back to `dev` to avoid making changes on `release` by accident.
- You can either:
  - Pass `--switch-back-to-dev` to `release:promote` as shown above, or
  - Run the helper:
    - `bash scripts/promote-release.sh noop --switch-back-to-dev`
    - Or manually: `git -C frontend checkout dev && git -C backend checkout dev && git checkout dev && git add frontend backend && git commit -m "chore: switch back to dev" && git push origin dev`


Rollback (Fast, Local)
- Root only: reset to previous combined tag and force‑push release:
  - `git checkout release && git reset --hard app-vPREV && git push -f origin release`
- Submodules (if needed):
  - FE: `git -C frontend checkout release && git -C frontend reset --hard vX.Y.Z && git -C frontend push -f origin release`
  - BE: `git -C backend  checkout release && git -C backend  reset --hard vA.B.C && git -C backend  push -f origin release`
  - Update root pointers: `git add frontend backend && git commit -m "rollback: pointers" && git push origin release`

Parity & Pointers
- Run `npm run git:status` to check parity. Fields:
  - `parity`: dev vs release ahead/behind counts.
  - `pointer: UPDATED`: the submodule HEAD advanced — commit pointers in root to clear.
- To clear pointer updates in root:
  - `git add frontend backend && git commit -m "chore: update pointers" && git push`

Why this is stable and reversible
- Only merges from dev → release; no direct edits to release.
- Version tags per submodule + combined root tag for snapshotting.
- No CI required; all actions are local and explicit.
- Microservice dev router exposes both root and `/dev/*`, minimizing dev friction.

Notes
- Scripts require clean working trees; they’ll stop if there are uncommitted changes.
- If promoting a specific commit, cherry‑pick to `release` first, then run the script.
- In production, always set `MICROSERVICE_URL` explicitly for the backend; avoid path guessing in code.
