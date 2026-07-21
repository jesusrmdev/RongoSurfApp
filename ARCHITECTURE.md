# Architecture

## Overview

```mermaid
graph TD
    Browser["Browser"] --> Next["Next.js App Router"]
    Next --> Pages["Pages (RSC)"]
    Next --> API["API Routes"]
    Pages --> DAL["DAL (src/lib/dal.ts)"]
    API --> Auth["Auth (src/lib/auth.ts)"]
    API --> Prisma["Prisma Client"]
    DAL --> Prisma
    Prisma --> Neon["Neon PostgreSQL"]
    Next --> MW["Middleware (middleware.ts)"]
    MW --> Browser
```

## Layered Architecture

```
React/UI (Server & Client Components)
    |
    v
API Routes (Route Handlers)
    |
    v
Services / Business Logic (in API routes or lib/)
    |
    v
Data Access Layer (src/lib/dal.ts)
    |
    v
Prisma Client (src/lib/prisma.ts)
    |
    v
Neon PostgreSQL (Serverless)
```

Strict separation:

- **Never** place complex business logic inside React components
- Components are only responsible for: rendering, user interaction, UI state management
- All logic must live in API routes or the data access layer

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant MW as Middleware
    participant API as API Route
    participant A as Auth (lib/auth.ts)
    participant P as Prisma

    Note over U,P: Register / Login
    U->>API: POST /api/register or /api/login
    API->>A: encrypt({ userId, role, expiresAt })
    A->>API: JWT
    API->>U: Set httpOnly cookie "session"

    Note over U,P: Subsequent Requests
    U->>MW: Request with cookie
    MW->>A: decrypt(cookie)
    A->>MW: SessionPayload or undefined
    MW->>U: Redirect to /login if unauthenticated
    MW->>U: Redirect to /login if not ADMIN on /admin

    Note over U,P: API Route Protection
    U->>API: Request with cookie
    API->>A: getSession() — decrypt cookie
    A->>API: SessionPayload or undefined
    API->>API: Return 401/403 if missing/wrong role

    Note over U,P: Server Component Protection
    U->>Pages: Request page
    Pages->>A: verifySession() — redirects on failure
    Pages->>A: requireAdmin() — redirects if not ADMIN
```

## Booking Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as BookForm
    participant API as POST /api/bookings
    participant S as Session check
    participant T as Prisma $transaction
    participant DB as Database

    U->>F: Select session, fill rental data
    F->>API: POST { sessionId, weight, height, wetsuitSize }
    API->>S: Validate session exists & is active
    S->>API: OK
    API->>T: Begin transaction
    T->>DB: Check duplicate booking (userId + sessionId)
    DB->>T: No duplicate
    T->>DB: Count CONFIRMED bookings for session
    DB->>T: Count
    T->>T: Check count < session.capacity
    T->>DB: Create booking + increment user.totalBookings
    DB->>T: Booking created
    T->>API: Return booking
    API->>U: 201 Created
```

The entire check-and-create sequence is atomic via `$transaction`. Two simultaneous requests for the same session cannot both succeed (race condition prevention).

## Cancel Flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Modal
    participant API as PATCH /api/bookings/[id]
    participant DB as Database

    U->>M: Click Cancel
    M->>U: Confirm modal
    U->>M: Confirm
    M->>API: PATCH { status: "CANCELLED" }
    API->>DB: Update booking.status = CANCELLED
    API->>DB: Decrement user.totalBookings (if session in future)
    API->>M: 200 OK
    M->>U: Refresh page
```

Admin cancel follows the same pattern via `PATCH /api/admin/bookings/[id]`. Admin hard delete via `DELETE /api/admin/bookings/[id]` does NOT decrement `totalBookings`.

## Folder Structure

```
/
├── ARCHITECTURE.md          # This file
├── AGENTS.md                # Development workflow rules
├── CHANGELOG.md             # Release history
├── middleware.ts            # Auth guard + security headers
├── docs/
│   ├── adr/                 # Architecture Decision Records
│   ├── API.md               # API documentation
│   ├── DATABASE.md          # Database documentation
│   ├── SECURITY.md          # Security checklist
│   └── architecture.md      # Legacy architecture doc
├── prisma/
│   ├── schema.prisma        # Database schema (4 models)
│   ├── migrations/          # Prisma migrations
│   └── config.ts            # Prisma config (direct URL)
├── scripts/
│   └── seed.ts              # Database seeder
├── src/
│   ├── app/
│   │   ├── api/             # Route handlers (22 endpoints)
│   │   ├── admin/           # Admin panel pages
│   │   ├── clases/          # Public class catalog
│   │   ├── login/           # Login page
│   │   ├── mis-reservas/    # User bookings page
│   │   ├── perfil/          # User profile page
│   │   ├── register/        # Registration page
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── error.tsx        # Error boundary
│   │   ├── loading.tsx      # Global loading
│   │   └── not-found.tsx    # 404 page
│   ├── components/
│   │   ├── Navbar.tsx       # Navigation + admin badge
│   │   └── Footer.tsx       # Footer
│   └── lib/
│       ├── auth.ts          # JWT encrypt/decrypt/session
│       ├── dal.ts           # Data access layer helpers
│       ├── prisma.ts        # Prisma client singleton
│       ├── utils.ts         # Utilities
│       └── __tests__/       # Tests + mocks
├── vercel.json              # Vercel deployment config
├── vitest.config.ts         # Test runner config
└── package.json
```

## Middleware

`middleware.ts` runs on every non-API, non-static request.

```mermaid
graph TD
    R["Request"] --> MW["middleware.ts"]
    MW --> Match["Match route"]
    Match --> Public["Public routes: /, /login, /register, /clases"]
    Match --> Protected["Protected: /mis-reservas, /perfil"]
    Match --> AdminRoute["Admin: /admin/*"]
    Public --> Allow["Allow"]
    Protected --> CheckAuth{"Has valid session?"}
    CheckAuth -->|Yes| Allow
    CheckAuth -->|No| Redirect["Redirect /login"]
    AdminRoute --> CheckAdmin{"Has ADMIN role?"}
    CheckAdmin -->|Yes| Allow
    CheckAdmin -->|No| Redirect
    Allow --> Headers["Add security headers"]
    Headers --> Response["Response"]
```

Security headers added by middleware:

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

## API Layer

All 22 API endpoints follow Next.js App Router Route Handlers pattern.

General pattern:

1. Extract session from cookie via `getSession()` from `@/lib/auth`
2. Return 401/403 JSON if unauthenticated/unauthorized
3. Parse and validate request body
4. Execute Prisma operations
5. Return JSON response

## Data Layer

```
User ──1:N──> Booking ──N:1──> Session ──N:1──> Class
```

- **User**: Registered students and admins. Stores profile data and `totalBookings` counter.
- **Class**: Course template (title, price, type, capacity, duration).
- **Session**: Specific date/time instance of a class. One class can have many sessions.
- **Booking**: Connects a user to a session. Stores rental-specific data (weight, height, wetsuit).

## Deployment Flow

```mermaid
graph LR
    Dev["Developer"] --> Branch["feature/fix/docs branch"]
    Branch --> Push["git push"]
    Push --> PR["Pull Request to main"]
    PR --> Review["Code Review"]
    Review --> Merge["Merge (--no-ff)"]
    Merge --> Vercel["Vercel Auto-deploy"]
    Vercel --> Prod["Production"]
    Merge --> Migrate["Manual: prisma migrate deploy"]
    Migrate --> Prod
```

## Environment Variables

| Variable | Purpose | Used By |
|----------|---------|---------|
| `DATABASE_URL` | Pooled Neon connection string (Prisma + Neon adapter at runtime) | `src/lib/prisma.ts` |
| `DIRECT_URL` | Direct Neon connection string (Prisma CLI migrations) | `prisma.config.ts` |
| `SESSION_SECRET` | JWT signing key (min 32 chars, HS256) | `src/lib/auth.ts` |

## Main Design Principles

1. **Maintainability** — readable, documented, consistent code
2. **Simplicity** — the simplest working solution
3. **Security** — validation, auth, headers, injection prevention
4. **Scalability** — structure that grows without rewrites
5. **Clean code** — no dead code, no orphan imports, no stale comments
