# CleanCity — Secure Garbage Overflow Reporting System

This is the working implementation matching the project documentation:
React (Next.js) + Tailwind frontend, Node/Express REST API, JWT auth with
bcrypt-hashed passwords, role-based access control (resident/admin), a
status_history audit log, and validated photo uploads.

**One substitution from the doc, both swappable:**
- **Database:** SQLite (via `better-sqlite3`) instead of MySQL, so it runs
  with zero external setup. The schema in `backend/db.js` maps 1:1 to MySQL
  types if you want to switch — see "Switching to MySQL" below.
- **File storage:** uploaded photos are saved to `backend/uploads/` and
  served by Express instead of a private S3 bucket + signed URLs. Swap
  `multer.diskStorage` in `backend/routes/reports.js` for an S3 client
  (e.g. `@aws-sdk/client-s3`) when you're ready to deploy for real.

## Project structure

```
cleancity/
  backend/     Express API (auth, reports, admin)
  frontend/    Next.js + Tailwind UI
```

## Run locally

**Prerequisites:** Node.js 18+ installed.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and set JWT_SECRET to a long random string
npm run start          # or: npm run dev (with nodemon)
```

This starts the API on `http://localhost:5000` and creates `cleancity.db`
automatically on first run.

Seed a sample admin, resident, and the three sample reports from the doc:

```bash
node seed.js
```

This creates:
- Admin: `meena.admin@cleancity.app` / `Admin@1234`
- Resident: `ravi.kumar@gmail.com` / `Resident@1234`

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Sign in with either seeded account, or create
a new resident account from the Auth screen.

Frontend API calls go through Next.js rewrites (`next.config.js`) to
`http://localhost:5000`, configurable via `NEXT_PUBLIC_API_URL`.

## Deploying

1. **Push to GitHub:** `git init && git add . && git commit -m "CleanCity" && git remote add origin <your-repo-url> && git push -u origin main`
2. **Backend → Render (or Railway/Fly.io):** point it at `backend/`, set
   `Build Command: npm install`, `Start Command: npm start`, and add the
   env vars from `.env.example` (set a real `JWT_SECRET` and
   `CLIENT_ORIGIN` to your deployed frontend URL). Note: SQLite's file
   lives on disk, so use a host with a persistent disk/volume, or switch to
   a managed MySQL/Postgres instance for production.
3. **Frontend → Vercel:** point it at `frontend/`, set env var
   `NEXT_PUBLIC_API_URL` to your deployed backend URL, deploy.

## Switching to MySQL

Replace `backend/db.js` with a `mysql2` connection pool and translate the
`CREATE TABLE` statements (types map directly: `INTEGER`→`INT`,
`AUTOINCREMENT`→`AUTO_INCREMENT`, `TEXT`→`VARCHAR`/`TEXT`,
`datetime('now')`→`NOW()`). All the `db.prepare(...).run/get/all(...)`
calls in the routes would become `pool.execute(...)` calls with the same
SQL — the rest of the app is unchanged.

## Security techniques implemented (Section 3 of the doc)

- Passwords hashed with bcrypt, cost factor 12 — never stored/transmitted
  in plaintext.
- Short-lived JWTs (role + user id), signed server-side, verified on
  **every** API call via `middleware/auth.js`.
- Every report-mutating endpoint checks the token's role
  (`requireRole('admin')`) — a resident calling the admin status-update
  endpoint gets a 403, regardless of what the UI shows.
- Uploads validated server-side for file type (JPG/PNG only) and size
  (8MB max) before storage.
- Every status change is written to `status_history` with a timestamp and
  the admin who made it — a full audit trail.
- Report submissions are rate-limited per account (15/hour) to prevent
  spam flooding the queue; login/register are rate-limited too.
