Admin Access Setup — Dev, Staging, Prod

Overview
- Goal: Use the same, secure admin model everywhere. In staging and prod, prefer JWT role-based admin (no shared admin key). In dev, an env admin key is optional for convenience.

How Admin Is Gated (backend)
- Dual gate middleware:
  - `requireAdminAccess`: allows admin access if EITHER (a) `X-Admin-Key` matches `ADMIN_API_KEY` OR (b) the authenticated user’s `role === 'admin'`.
  - `requireAdminKey`: requires only the admin key header (used for certain operational endpoints).
- Routers:
  - `/admin/*` (risk/exposure/config) uses `requireAdminAccess`.
  - Some `/billing/*` ops use `requireAdminKey`.

Recommended Policy by Environment
- Development (local):
  - You may set `ADMIN_API_KEY` in `backend/.env.local` and (optionally) set `FAUCET_ADMIN_KEY` in the frontend env to send the header for testing.
  - Or test prod-like: omit `ADMIN_API_KEY` and promote a user to `admin` (see below) and sign in to access admin routes.
- Staging (prod-like):
  - Do NOT set `ADMIN_API_KEY` (keeps staging behavior aligned with prod). Do NOT set `FAUCET_ADMIN_KEY` in the frontend.
  - Promote specific users to `role='admin'` using the promote script below; they access admin routes via JWT only.
- Production:
  - Do NOT set `ADMIN_API_KEY`. Rely solely on JWT `role='admin'`.

Promote/Demote Admins (script)
- Script: `backend/scripts/promote-admin.ts`
- NPM task: `promote-admin` (added in `backend/package.json`)
- Function: sets a user’s `role` (`admin|user|streamer`) by email. Requires `--yes` to avoid accidents. Loads `.env.local` then `.env` (for `MONGODB_URI`). Includes SRV URI fallback (honors `MONGODB_USERNAME`/`MONGODB_PASSWORD`).

Usage Examples
- Heroku (staging):
  - Ensure the backend commit with this script is deployed to the staging app.
  - Promote:
    - `heroku run -a betmate-staging -- bash -lc 'npm run promote-admin -- --email you@example.com --role admin --yes'`
  - Demote back to user:
    - `heroku run -a betmate-staging -- bash -lc 'npm run promote-admin -- --email you@example.com --role user --yes'`
- Heroku (prod):
  - After production deploy includes the script:
    - `heroku run -a betmate-prod -- bash -lc 'npm run promote-admin -- --email you@example.com --role admin --yes'`
- Generic (if you have the DB URI locally):
  - `MONGODB_URI='mongodb+srv://…' npm --prefix backend run promote-admin -- --email you@example.com --role admin --yes`

Deploying the Script to Heroku
- This repository tracks `backend/` as a submodule. Make changes inside `backend/`, commit to the appropriate branch (e.g., `dev`), and push.
- Deploy to staging:
  - If Heroku auto-deploys from GitHub, merge/push your branch accordingly and wait for the build.
  - Or push directly to Heroku:
    - `cd backend`
    - `heroku git:remote -a betmate-staging -r heroku-staging`
    - `git push heroku-staging dev:main`

Verification
- Sign in as the promoted user.
- Frontend: visit `/admin/risk` — should load without an admin key header.
- API: `GET /admin/risk/config` with your Bearer token — expect 200; non-admins get 401.

Security Notes & Best Practices
- Do not set `ADMIN_API_KEY` and do not set `FAUCET_ADMIN_KEY` in staging/prod. This prevents shared-secret admin access.
- If you temporarily enable staging faucets/ops using an admin key, document the change, keep the key strong, and remove the envs when done.
- Audit admins periodically by querying the DB for users with `role: 'admin'`.
- To revoke, use the same script to set `--role user`.

Troubleshooting
- `Missing script: promote-admin`: the deployed slug doesn’t include the latest backend commit. Redeploy the backend to the target Heroku app.
- `command not found: run`: pass arguments correctly — use `-- bash -lc '…'` or `--` before the command to prevent mis-parsing.
- `MongoDB username/password missing`: if using SRV URIs without inline credentials, set `MONGODB_USERNAME` and `MONGODB_PASSWORD` config vars in Heroku (the script supports SRV fallback like the server).
- `Cannot find module …/user_model`: ensure you run from the backend app slug (Heroku `run` on the backend app) and not from the monorepo root in a different environment.

References
- Backend admin gate: `backend/src/authentication/requireAdminAccess.ts`
- Admin key gate (ops): `backend/src/authentication/requireAdminKey.ts`
- Admin router: `backend/src/routers/admin_router.ts`
- Promote script and task:
  - `backend/scripts/promote-admin.ts`
  - `backend/package.json` (script: `promote-admin`)

