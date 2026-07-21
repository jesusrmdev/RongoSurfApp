# Database Documentation

## Technology

- **Provider:** PostgreSQL (via Neon serverless)
- **ORM:** Prisma v7.8.0 with `@prisma/adapter-neon`
- **Connection:** WebSocket via `ws` library for serverless compatibility
- **Migrations:** Prisma Migrate via `DIRECT_URL` (direct TCP connection)

## Entity Relationship

```mermaid
erDiagram
    User ||--o{ Booking : "has many"
    Booking }o--|| Session : "belongs to"
    Session }o--|| Class : "belongs to"

    User {
        string id PK
        string name
        string apellido1
        string apellido2
        string email UK
        string password
        string role "USER | ADMIN"
        string phone
        int weight "kg"
        int height "cm"
        string wetsuitSize "XS-XXL"
        int totalBookings "Counter"
        datetime createdAt
    }

    Class {
        string id PK
        string title
        string description
        string type "GROUP | INDIVIDUAL | RENTAL"
        int capacity
        float price
        int duration "minutes"
        boolean isActive "Soft delete"
        datetime createdAt
    }

    Session {
        string id PK
        string classId FK
        datetime date
        string time "HH:mm"
        boolean isActive "Soft delete"
    }

    Booking {
        string id PK
        string userId FK
        string sessionId FK
        int participants "Always 1"
        string status "CONFIRMED | CANCELLED"
        int weight "kg, nullable"
        int height "cm, nullable"
        string wetsuitSize "XS-XXL, nullable"
        datetime createdAt
    }
```

## Models

### User

Registered users and administrators.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `name` | `String` | Required | First name |
| `apellido1` | `String` | Required | First surname |
| `apellido2` | `String` | Required | Second surname |
| `email` | `String` | `@unique`, Required | Login identifier |
| `password` | `String` | Required | bcrypt(12) hashed |
| `role` | `String` | `@default("USER")` | "USER" or "ADMIN" |
| `phone` | `String` | Required | 9 digits, validated |
| `weight` | `Int` | Required | kg, validated `>= 0` |
| `height` | `Int` | Required | cm, validated `>= 0` |
| `wetsuitSize` | `String` | Required | XS, S, M, L, XL, XXL |
| `totalBookings` | `Int` | `@default(0)` | Lifetime counter |
| `createdAt` | `DateTime` | `@default(now())` | Registration date |

**Relations:**
- `bookings Booking[]` — One user has many bookings

**Indexes:** `email` (unique)

---

### Class

Course template (e.g., "Iniciación", "Alquiler").

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `title` | `String` | Required | Display name |
| `description` | `String` | Required | Detailed description |
| `type` | `String` | `@default("GROUP")` | GROUP, INDIVIDUAL, RENTAL |
| `capacity` | `Int` | `@default(8)` | Max students per session |
| `price` | `Float` | Required | In EUR |
| `duration` | `Int` | `@default(90)` | In minutes |
| `isActive` | `Boolean` | `@default(true)` | Soft delete toggle |
| `createdAt` | `DateTime` | `@default(now())` | Creation date |

**Relations:**
- `sessions Session[]` — One class has many sessions

**Constraints:**
- Cannot deactivate if any active session has CONFIRMED bookings

---

### Session

A specific date/time offering of a class.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `classId` | `String` | Required | Foreign key to Class |
| `date` | `DateTime` | Required | Date of the session |
| `time` | `String` | Required | Time, e.g. "09:00" |
| `isActive` | `Boolean` | `@default(true)` | Soft delete toggle |

**Relations:**
- `class Class` — Belongs to one class (required, cascade)
- `bookings Booking[]` — One session has many bookings

**Constraints:**
- Cannot deactivate if any CONFIRMED booking exists
- Foreign key: `classId` → `Class.id`

---

### Booking

A user's reservation for a specific session.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `userId` | `String` | Required | Foreign key to User |
| `sessionId` | `String` | Required | Foreign key to Session |
| `participants` | `Int` | `@default(1)` | Always 1 |
| `status` | `String` | `@default("CONFIRMED")` | CONFIRMED or CANCELLED |
| `weight` | `Int?` | Nullable | kg, only for RENTAL |
| `height` | `Int?` | Nullable | cm, only for RENTAL |
| `wetsuitSize` | `String?` | Nullable | XS-XXL, only for RENTAL |
| `createdAt` | `DateTime` | `@default(now())` | Booking date |

**Relations:**
- `user User` — Belongs to one user (required)
- `session Session` — Belongs to one session (required)

**Constraints:**
- User + Session pair should be unique (no duplicate booking, enforced in application via `$transaction`)
- Foreign keys: `userId` → `User.id`, `sessionId` → `Session.id`

## Soft Delete Strategy

Classes and Sessions use `isActive: Boolean` for soft deletion:

- **Deactivate** = set `isActive: false` — hides from public, keeps in DB
- **Reactivate** = set `isActive: true` — restores visibility
- **Blocked deactivation:** Cannot deactivate a class or session that has CONFIRMED bookings
- Bookings use `status: "CANCELLED"` as their soft delete mechanism

## Counters

### totalBookings

A denormalized counter on the User model for efficient display.

| Operation | Effect |
|-----------|--------|
| Booking created (CONFIRMED) | `totalBookings++` (inside `$transaction`) |
| Booking cancelled (future session) | `totalBookings--` (inside `$transaction`) |
| Booking hard deleted (past session) | No change |
| Admin cancels booking | `totalBookings--` (when status → CANCELLED) |

The counter was backfilled from existing data during migration via a raw SQL UPDATE.

## Cascade Behaviour

| Action | Effect |
|--------|--------|
| Delete User | Deletes all their Bookings (application-level cascade in API) |
| Delete Class | No cascade on Session (must deactivate first) |
| Delete Session | No cascade on Booking (must cancel first) |
| Hard delete Booking | Removes single booking row |

Prisma schema does NOT define `onDelete: Cascade` — cascade is handled in application code (API routes delete related records first, then the parent).

## Connection Strategy

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
