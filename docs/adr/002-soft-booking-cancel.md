# ADR 002: Soft Booking Cancel

## Status
Accepted

## Context
Users need to cancel their bookings. The admin also needs to cancel bookings on behalf of users. There are two conflicting requirements:
1. Cancel a future booking (should free up capacity, should update statistics)
2. Delete past bookings (cleanup, GDPR-like requirements)

## Problem
Should cancel be a DELETE (hard delete) or a status change?

## Alternatives

1. **Hard DELETE** — Remove the row. Simple but loses history. Cannot distinguish cancelled vs never booked.
2. **Soft cancel (PATCH to CANCELLED)** — Keep the row, change status. Preserves history. Requires filtering cancelled bookings in queries.
3. **Both** — Soft cancel for future bookings, hard delete for past bookings. Selected approach.

## Decision
- User cancel: `PATCH /api/bookings/[id]` → sets `status = "CANCELLED"`
- Admin cancel: `PATCH /api/admin/bookings/[id]` → sets `status = "CANCELLED"`
- Admin delete: `DELETE /api/admin/bookings/[id]` → hard delete (for past bookings cleanup)
- Hard delete does NOT decrement `totalBookings` (past bookings already counted)
- Soft cancel DOES decrement `totalBookings` (only if session date is in the future)

## Consequences

Positive:
- Full booking history preserved
- Capacity correctly freed on cancel
- Admin can clean up past bookings without affecting statistics
- TotalBookings counter reflects real attendance

Negative:
- Application must filter by `status` in most queries
- Two different behaviors (cancel vs delete) must be documented
- Admin UI has two separate buttons with different modals
