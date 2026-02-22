# ⭐ RateStore — Store Rating Platform

Full-stack web application allowing users to discover and rate stores.  
Built for the **Roxiler Systems FullStack Intern Coding Challenge**.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | **Express.js** (Node.js)          |
| Database   | **SQLite** via better-sqlite3     |
| Auth       | **JWT** + bcryptjs                |
| Validation | express-validator                 |
| Frontend   | **React 18** + React Router v6    |
| HTTP       | Axios                             |

> **No database installation required.** SQLite stores everything in a single file
> (`backend/data/store_ratings.db`) that is created automatically on first run.

---

## Quick Start

### Prerequisites
- Node.js v18+  *(that's it!)*

### 1. Backend

```bash
cd backend

# Install dependencies
npm install

# Copy env (defaults work out of the box)
cp .env.example .env

# Start dev server  ← tables + admin are created automatically
npm run dev
```

> API starts at **http://localhost:4000/api**

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

> React app starts at **http://localhost:3000**

---

## Default Admin Account

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@platform.com     |
| Password | Admin@123              |

---

## Features

### System Administrator
- Dashboard: total users, stores, ratings
- Add users (Normal / Admin / Store Owner) with full validation
- Add stores
- Filter & sort all users and stores
- View user detail with store rating for owners

### Normal User
- Self-registration
- Browse stores in a card grid
- Search by name or address, sort by rating/name/date
- Submit or modify a star rating (1–5) per store
- Update password

### Store Owner
- Dashboard with average rating + total ratings
- See all customers who rated their store
- Update password

---

## Form Validations

| Field    | Rule                                                    |
|----------|---------------------------------------------------------|
| Name     | Min 20 chars, Max 60 chars                              |
| Email    | Standard email format                                   |
| Address  | Max 400 chars                                           |
| Password | 8–16 chars, ≥1 uppercase letter, ≥1 special character   |
| Rating   | Integer 1–5                                             |

---

## Project Structure

```
store-rating-app/
├── backend/
│   ├── data/                    ← SQLite DB file lives here (auto-created)
│   ├── src/
│   │   ├── config/db.js         ← Opens DB, creates all tables on startup
│   │   ├── middleware/          ← JWT auth + role guard + validation handler
│   │   ├── validators/rules.js  ← express-validator rule sets
│   │   ├── services/            ← Business logic (SQLite queries)
│   │   ├── controllers/         ← Thin HTTP handlers
│   │   ├── routes/              ← Express routers
│   │   ├── app.js               ← Express setup + CORS + error handler
│   │   └── server.js            ← Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/common/   ← Stars, Modal, SortableTable, RoleBadge
    │   ├── components/layout/   ← Navbar
    │   ├── context/             ← AuthContext
    │   ├── hooks/               ← useSortFilter
    │   ├── pages/auth/          ← Login, Register, ChangePassword
    │   ├── pages/admin/         ← AdminDashboard
    │   ├── pages/user/          ← UserStores
    │   ├── pages/owner/         ← OwnerDashboard
    │   ├── services/api.js      ← Axios instance
    │   └── utils/validators.js  ← Client-side validation
    └── package.json
```

---

## API Reference

### Auth  `/api/auth`
| Method | Path      | Auth   | Description                |
|--------|-----------|--------|----------------------------|
| POST   | /register | Public | User self-registration     |
| POST   | /login    | Public | Returns JWT                |
| GET    | /me       | Any    | Current user profile       |
| PATCH  | /password | Any    | Update own password        |
| POST   | /users    | Admin  | Create any user (any role) |

### Users  `/api/users` *(Admin only)*
| Method | Path    | Description                               |
|--------|---------|-------------------------------------------|
| GET    | /       | List with name/email/address/role filters |
| GET    | /stats  | Dashboard counters                        |
| GET    | /:id    | User detail (store rating for owners)     |

### Stores  `/api/stores`
| Method | Path           | Auth        | Description           |
|--------|----------------|-------------|-----------------------|
| POST   | /              | Admin       | Create store          |
| GET    | /              | Any         | List + search + sort  |
| GET    | /my-dashboard  | Store Owner | Owner dashboard       |
| GET    | /:id           | Any         | Single store          |

### Ratings  `/api/ratings`
| Method | Path | Auth | Description                    |
|--------|------|------|--------------------------------|
| POST   | /    | User | Submit or update rating (1–5)  |

---

## Security
- Passwords hashed with **bcrypt** (10 rounds)
- JWT tokens signed with `JWT_SECRET`, expire in 7 days
- Role authorization via `authorize(...roles)` middleware
- All inputs validated server-side with **express-validator**
- SQL queries use **prepared statements** (safe from injection)
- Sort columns whitelisted to prevent ORDER BY injection

---

*Submitted for Roxiler Systems FullStack Intern Coding Challenge — Deadline: 22 February 2026*
