# ADR 004: TotalBookings Counter

## Status
Accepted

## Context
The admin panel needs to display how many bookings each student has made. This could be calculated dynamically via `COUNT(Booking WHERE userId = ?)`, but that requires a query for each user in a list view.

## Problem
How to efficiently show booking counts per student in the admin alumnos list?

## Alternatives

1. **COUNT query per user** — Simple but N+1 queries in list views. Could use SQL COUNT with GROUP BY, but Prisma adds complexity.
2. **Denormalized counter on User** — Add a `totalBookings` Int field, increment/decrement on booking changes. Selected approach.
3. **Prisma aggregate in list query** — Use Prisma's `_count` relation count. Works but the field is also needed for sorting and display consistency.

## Decision
- Add `totalBookings Int @default(0)` to the User model
- Increment: in the same `$transaction` that creates a booking
- Decrement: when a booking is cancelled (CANCELLED status) IF the session date is in the future
- NOT decremented: on hard DELETE of past bookings (admin cleanup)
- Backfill migration: one-time SQL UPDATE to set `totalBookings` from existing CONFIRMED bookings

## Consequences

Positive:
- O(1) read for booking count per user
- No JOINs needed in admin list queries
- Admin alumnos page loads fast even with many users
- Counter is always consistent (updated in same transaction as booking)

Negative:
- Must remember to update counter in every booking mutation
- Counter can drift if a code path misses the update
- Need a backfill when adding the field to existing data
