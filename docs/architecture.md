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
- Template entity representing a course type (e.g., "Iniciación", "Alquiler")
- `title`, `description`, `type` (GROUP / INDIVIDUAL / RENTAL)
- `capacity`, `price`, `duration` (minutes)
- `isActive` — soft toggle for visibility
- `createdAt`

**Session**
- A specific date/time slot for a class
- `date` (DateTime), `time` (String, e.g. "09:00")
- `isActive` — soft toggle for deletion
- Relation: `belongs to Class`

**Booking**
- A customer's reservation for a specific session
- `participants` (always 1 — each user books for themselves)
- `status` (CONFIRMED / CANCELLED)
- `weight`, `height`, `wetsuitSize` — used only for RENTAL type classes
- `createdAt`
- Relations: `belongs to User`, `belongs to Session`

## Auth Flow

1. User registers/logs in → server creates JWT payload `{ userId, role, email }`
2. JWT is signed with HS256 via `jose` and stored as HTTP-only cookie
3. `middleware.ts` checks cookie on protected routes at the edge
4. `getSession()` in `src/lib/auth.ts` validates JWT on every API request
5. Server components use `verifySession()` or `requireAdmin()` from `@/lib/dal`

## Booking Flow (Race Condition Safe)

```
User POST /api/bookings
  │
  ├── 1. Validate sessionId, check session is active
  ├── 2. Enter Prisma $transaction
  │       ├── 2a. Check no duplicate booking (userId + sessionId)
  │       ├── 2b. Aggregate CONFIRMED bookings for capacity check
  │       ├── 2c. If capacity exceeded → throw CAPACITY_EXCEEDED
  │       └── 2d. Create booking
  └── 3. Return booking or error
```

The entire check-and-create sequence is atomic. Two simultaneous requests for the same session cannot both succeed.

## Key Design Decisions

### Class vs Session separation
Class is a course template (title, price, description). Session is a specific date/time offering of that class. This allows the admin to add multiple sessions to a single class without duplicating metadata.

### Rental fields on Booking
Equipment rental requires weight/height/wetsuit size. These fields are stored directly on the Booking (and pre-filled from User profile). Only used when `class.type === "RENTAL"`.

### Driver Adapter Pattern
Prisma v7 requires driver adapters. We use `@prisma/adapter-neon` with WebSocket connection for serverless compatibility.

### Auth Pattern
- **API routes:** Use `getSession()` from `@/lib/auth`. Check `userId` and `role` manually. Return 401/403 JSON.
- **Server components (pages):** Use `verifySession()` or `requireAdmin()` from `@/lib/dal`. These call `redirect()` on failure.

## Middleware (middleware.ts)

```
Request ──▶ middleware.ts ──▶ match route ──▶ public? → allow
                                    │
                                    ├── /clases → public
                                    ├── /login, /register → public
                                    ├── /mis-reservas → requires USER
                                    └── /admin → requires ADMIN

Security headers added:
- Strict-Transport-Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
```

## Styling

Tailwind CSS v4 with CSS `@theme` block:

- **Primary (#00a6a6):** Buttons, links, brand elements — CSS var `--color-navy`
- **Sand (#f5f3ef):** Backgrounds, cards — CSS var `--color-sand`
- **Sand Dark (#e0d8c8):** Borders — CSS var `--color-sand-dark`
- **Muted (rgba(26,26,26,0.65)):** Secondary text — CSS var `--color-muted`

## Security

- bcrypt(12) for password hashing
- JWT with HS256, httpOnly/Secure/SameSite=Lax cookies, 7-day expiry
- `$transaction` for overbooking prevention and duplicate booking race condition
- Enum validation on `type` (GROUP/INDIVIDUAL/RENTAL) and `status` (CONFIRMED/CANCELLED)
- `Math.max(0, ...)` guards on all numeric inputs to prevent negative values
- `SESSION_SECRET` validated at startup (min 32 chars)
- Soft delete (`isActive: false`) preserves referential integrity
- Deactivation of classes/sessions blocked if active bookings exist
- All API routes authenticate before DB access

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
