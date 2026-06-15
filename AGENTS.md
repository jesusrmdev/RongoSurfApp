# RongoSurfApp — Surf Nature Murcia

## Project
Surf school booking platform. Next.js 16 + Prisma + Neon PostgreSQL + Tailwind v4.

## Key Rules
- Do NOT modify `prisma/schema.prisma` without asking
- Do NOT modify `.env` or database credentials
- All API routes must use `getSession()` from `@/lib/auth` for auth (NOT `verifySession`)
- Admin API routes must check `session.role === "ADMIN"` manually
- Server components (pages) use `verifySession()` or `requireAdmin()` from `@/lib/dal`
- `middleware.ts` handles route protection + security headers

## Architecture
- `Class` = template (title, price, type). `Session` = date/time instance of a class.
- `Booking` connects User + Session. Rental data (weight/height/wetsuit) on Booking.
- Auth: JWT in httpOnly cookie, 7-day expiry, bcrypt(12) for passwords.

## Current State (v1.0.0)
- All forms show success/error messages before reload
- Mobile menu closes on outside click
- Error boundary (`error.tsx`), loading state (`loading.tsx`), custom 404 (`not-found.tsx`)
- Security headers (HSTS, XFO, XCTO, Referrer-Policy)
- Server-side validation: password min 8 chars, email format, NaN guard on parseInt
- API routes return proper 401/403 instead of 500 on auth failures
- Credentials removed from login page demo section
- Wetsuit size is optional on registration

## Key Files
- `src/lib/auth.ts` — JWT create/verify/session management
- `src/lib/dal.ts` — Data access layer with auth helpers
- `src/lib/prisma.ts` — Prisma client singleton (Neon adapter)
- `middleware.ts` — Auth guard + security headers
- `src/app/api/` — All API routes
- `src/app/admin/` — Admin panel pages
- `prisma/schema.prisma` — Database schema (do not modify without asking)
