# Yatra Setu — Run Doc (this worktree)

Next.js 16 (App Router, Turbopack) + Prisma 7 (SQLite via better-sqlite3 adapter) + Auth.js v5.

## 1. Reproduce the uncommitted artifacts a fresh checkout needs

All paths relative to the worktree root (`C:\Users\Arush Walia\Desktop\yatrasetu_v1`).

1. **Environment file** — this workspace IS the main checkout, so `.env` is already present.
   In a fresh clone, copy `.env` from the main checkout. It must contain:
   - `DATABASE_URL="file:./prisma/dev.db"` (SQLite, relative to `prisma/`)
   - `AUTH_SECRET="<random 32-byte base64>"` (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
   Never commit `.env`; never record its values here.

2. **Dependencies** — `npm install` (lockfile: `package-lock.json`; Node 24, npm 11).

3. **Prisma client + database**
   - `npx prisma generate` (client is generated into `src/generated/prisma`, gitignored)
   - `npx prisma migrate dev` (applies migrations in `prisma/migrations/`, creates `prisma/dev.db`)
   - `npx tsx prisma/seed.ts` (seeds 16 destinations, 16 stays, 7 itineraries, 12 restoration events, 7 stamps, 6 rewards)

## 2. Run the server

- Command: `npm run dev` (script: `next dev`, Turbopack).
- Port: default `3000`; something already listens on 3000 on this machine, so Next
  auto-picks the next free port and prints it (`- Local: http://localhost:<port>`).
  Read the actual port from the log — do not assume 3000.
- Detached start (Windows, per Freebuff recipe):
  `powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"`
  with stdout and stderr in DIFFERENT files, then confirm with
  `powershell -NoProfile -Command "Get-Process -Id <pid>"` and poll the printed URL until it answers.
- Health check: `curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>/` → `200`.

## Notes

- The dev server writes `prisma/dev.db*`; both are gitignored.
- `npm run build` must pass (`tsc` runs inside it) before calling work done.
- Wikimedia Commons images bypass the Next image optimizer on purpose
  (Wikimedia rate-limits the optimizer's node fetch); see `src/components/ui/image.tsx`.
