# Cleancity-Web
# CleanCity – Secure Garbage Overflow Reporting System

CleanCity lets residents report garbage overflow near them in under a minute, and lets ward sanitation staff track and resolve those reports without digging through WhatsApp threads or paper registers.

A resident submits a location, description, and optional photo. The report enters a queue visible to admins, who move it through **Pending → In Progress → Resolved**. Residents can track that same status change in real time from their own account.

## Live Demo
`https://cleancity-web.vercel.app` *(update once deployed)*

## Features
- **User Registration/Login** — email/password auth, passwords hashed with bcrypt
- **Report Garbage Overflow** — location (with "use my location" geolocation), description, optional photo
- **My Complaints** — residents view their own submitted reports and live status
- **Admin Dashboard** — admins view all reports and update status per row

## Tech Stack
| Layer | Choice |
|---|---|
| Backend | Node.js + Express |
| Database | MySQL (via `mysql2`, parameterized queries) |
| Auth | JWT (httpOnly cookie) + bcrypt password hashing |
| File uploads | Multer, validated server-side |
| Frontend | HTML + CSS + vanilla JavaScript |
| Hosting | Vercel |

## Security
- Passwords hashed with bcrypt — never stored or logged in plain text
- JWT stored in an httpOnly, `sameSite=strict` cookie — not accessible to client-side JS
- Role checked **server-side** on every admin route via middleware — never trusted from the client
- All SQL queries use parameterized placeholders (no string-concatenated SQL)
- Uploaded photos validated for file type and size before storage
- Rate limiting on login and report-submission endpoints

See [`SECURITY.md`](./SECURITY.md) for full details.

## Getting Started Locally

### Prerequisites
- Node.js 18+
- MySQL 8+

### Setup
```bash
git clone https://github.com/THARAN0618/Cleancity-Web.git
cd Cleancity-Web
npm install
cp .env.example .env   # fill in your DB credentials and JWT secret
mysql -u root -p < schema.sql
npm start
```

The app runs at `http://localhost:3000` by default.

### Environment Variables
| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (`cleancity`) |
| `JWT_SECRET` | Secret used to sign JWTs |
| `PORT` | Local dev port (default `3000`) |

## Project Structure
```
cleancity/
  server.js
  config/db.js
  middleware/requireAuth.js
  middleware/requireRole.js
  routes/auth.routes.js
  routes/reports.routes.js
  schema.sql
  public/
    login.html
    register.html
    report.html
    complaints.html
    admin.html
    css/ js/
```

## License
Built for academic submission — Tech for Good 2026 (Sustainable Cities & Climate Action track).
