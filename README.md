BetMate — Top‑Level Quick Commands

Admin Access
- Promote a user to admin (from repo root):
  - Local dev (docker‑compose Mongo):
    - Create `backend/.env.local` with `MONGODB_URI=mongodb://localhost:27017/betmate`.
    - Run: `npm run admin:promote -- --email "you@example.com" --role admin --yes`
  - Demote back to user:
    - `npm run admin:promote -- --email "you@example.com" --role user --yes`
- Cloud Mongo (SRV):
  - `export MONGODB_URI="mongodb+srv://<cluster>/<db>?retryWrites=true&w=majority"`
  - `export MONGODB_USERNAME="<user>"`
  - `export MONGODB_PASSWORD="<pass>"`
  - Run the same `npm run admin:promote …` command.
 - Create an invite code (beta onboarding):
   - `npm run admin:create-invite -- --campaign beta --max 100 --grant-bet 1000 --grant-usd 10 --yes`

Notes
- The script is implemented in `backend/scripts/promote-admin.ts` and loads `backend/.env.local`, then `backend/.env`.
- Admin UI requires `user.role === 'admin'`. Alternatively, server endpoints can be accessed using `X-Admin-Key` if `ADMIN_API_KEY` is set, but the UI still checks the role.

Documentation
- All project docs have moved under `docs/` to keep the root clean.
- Migration guide: `docs/migration/MIGRATION.md`
- Frontend mock UI docs: `docs/frontend/`
- Ops/dev notes: `docs/ops/`
