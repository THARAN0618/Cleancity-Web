# CleanCity — Secure Garbage Overflow Reporting System

CleanCity is a secure web application that allows residents to report
garbage overflow and enables administrators to track and resolve complaints
through a simple dashboard.

Residents can submit a garbage complaint with a location, description, and
optional photo. Administrators can view all complaints and update their
status through:

**Pending → In Progress → Resolved**

## Features

- User Registration and Login
- JWT-based authentication
- Role-based access control
- Resident and Admin accounts
- Report garbage overflow
- Location and description fields
- Optional JPG/PNG photo upload
- View submitted complaints
- Admin dashboard
- Update complaint status
- Status history and audit trail
- Password hashing using bcrypt
- Server-side file validation
- Rate limiting for authentication and reports

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | SQLite with better-sqlite3 |
| Authentication | JWT |
| Password Security | bcrypt |
| File Upload | Multer |
| Hosting | Vercel + Render |

## Project Structure

```text
cleancity/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── reports.js
│   │   └── admin.js
│   ├── uploads/
│   │   └── .gitkeep
│   ├── .env.example
│   ├── db.js
│   ├── package.json
│   ├── package-lock.json
│   ├── seed.js
│   └── server.js
│
├── frontend/
│   ├── components/
│   │   ├── Navbar.js
│   │   └── StatusTracker.js
│   ├── lib/
│   │   └── api.js
│   ├── pages/
│   │   ├── admin/
│   │   │   └── dashboard.js
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   ├── index.js
│   │   └── report.js
│   ├── styles/
│   │   └── globals.css
│   ├── next.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   └── tailwind.config.js
│
├── .gitignore
├── package-lock.json
└── README.md