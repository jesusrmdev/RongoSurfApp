# Architecture

## Overview

```
┌────────────┐     ┌──────────────┐     ┌──────────┐
│  Next.js   │────▶│  API Routes  │────▶│  Prisma  │
│  (App)     │     │  (Server)    │     │  Client  │
└────────────┘     └──────────────┘     └────┬─────┘
                                             │
                                             ▼
                                        ┌──────────┐
                                        │  Neon DB │
                                        │ (Postgre)│
                                        └──────────┘
```

## Data Model

```
User ──┐
       │
       ├── has many ── Booking
       │
       │              ┌─── Class (template)
       │              │
       └── Booking─── Session (date/time instance)
```

### Models

**User**
- `id`, `name`, `email`, `password` (bcrypt hashed), `role` (USER/ADMIN)
- `weight` (kg, optional), `height` (cm, optional), `wetsuitSize` (XS-XXL)
- `createdAt`

**Class**
- Template entity representing a course type (e.g., "Iniciación")
- `title`, `description`, `type` (GROUP/RENTAL)
- `capacity`, `price`, `duration` (minutes)
- `isActive` — soft toggle for visibility
- `createdAt`

**Session**
- A specific date/time slot for a class
- `date` (DateTime), `time` (String, e.g. "09:00")
- `isActive` — soft toggle
- Relation: `belongs to Class`

**Booking**
- A customer's reservation for a specific session
- `participants` (default 1), `status` (CONFIRMED)
- `weight`, `height`, `wetsuitSize` — used only for RENTAL type classes
- `createdAt`
- Relations: `belongs to User`, `belongs to Session`

## Auth Flow

1. User registers/logs in → server creates JWT payload `{ userId, role, email }`
2. JWT is signed with `jose` and stored as HTTP-only cookie
3. `proxy.ts` middleware checks cookie on protected routes
4. `getSession()` in `src/lib/auth.ts` validates JWT on every request

## Key Design Decisions

### Class vs Session separation
Class is a course template (title, price, description). Session is a specific date/time offering of that class. This allows the admin to add multiple sessions to a single class without duplicating metadata.

### Rental fields on Booking
Equipment rental requires weight/height/wetsuit size. These fields are stored directly on the Booking (and pre-filled from User profile). Only used when `class.type === "RENTAL"`.

### Driver Adapter Pattern
Prisma v7 requires driver adapters. We use `@prisma/adapter-neon` with WebSocket connection for serverless compatibility.

### SQLite → PostgreSQL Migration
Originally developed with SQLite for local dev, migrated to Neon PostgreSQL for Vercel deployment. Migration history preserved in `prisma/migrations/`.

## Middleware (proxy.ts)

```
Request ──▶ proxy.ts ──▶ match route ──▶ public? → allow
                              │
                              ├── /clases → public
                              ├── /login, /register → public
                              ├── /mis-reservas → requires USER
                              └── /admin → requires ADMIN
```

## Styling

Tailwind CSS v4 with CSS `@theme` block:

- **Primary (#00a6a6):** Buttons, links, brand elements — class name `bg-ocean`
- **Sand (#f5f3ef):** Backgrounds, cards — class name `bg-sand`
- **Navy (#1a1a2e):** Text, header, footer — class name `text-navy`
- **Muted (#666):** Secondary text

## Database Connection Strategy

```
  Application (runtime)          Prisma CLI (migrations)
         │                              │
         ▼                              ▼
  DATABASE_URL (pooled)          DIRECT_URL (direct)
  (with -pooler host)            (without -pooler)
         │                              │
         ▼                              ▼
   Neon Pooler ──────────────▶  Neon Direct
```

- **`DATABASE_URL`** — Pooled connection, used by the app at runtime via Prisma Client + Neon adapter
- **`DIRECT_URL`** — Direct connection, used by `prisma migrate` and `prisma db push` CLI commands
