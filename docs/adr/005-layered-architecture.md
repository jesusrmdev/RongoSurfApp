# ADR 005: Layered Architecture

## Status
Accepted

## Context
The project started as a simple booking app. As features grow (admin panel, profiles, notifications, rental management), the code needs structure to remain maintainable.

## Problem
How to organize code to prevent business logic from spreading into UI components?

## Alternatives

1. **Flat structure** — Put everything in components. Fast to write, impossible to maintain as project grows.
2. **MVC-style** — Models, Views, Controllers. Not idiomatic for Next.js App Router.
3. **Layered architecture** — Strict separation: React → API Routes → DAL → Prisma → DB. Selected approach.

## Decision
Enforce strict layer separation:

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

Rules:
- React components: only rendering, user interaction, UI state. **No business logic.**
- API routes: validation, orchestration, session check. **Call Prisma directly or via DAL.**
- DAL (data access layer): reusable auth helpers, user queries. **No rendering logic.**
- Prisma: query building, transactions. **No business rules.**

Current mapping:
- `Class` = template (title, price, type). `Session` = date/time instance of a class.
- `Booking` connects User + Session. Rental data (weight/height/wetsuit) on Booking.
- Participants always 1 (each user books for themselves).

## Consequences

Positive:
- Business logic is testable without rendering
- Components are reusable and simple
- API routes are the single source of truth for validation
- New features follow a predictable pattern

Negative:
- More files to create per feature
- Simple operations require crossing multiple layers
- Discipline required from all developers
