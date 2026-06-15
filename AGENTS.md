# RongoSurfApp — Surf Nature Murcia

## Project
Surf school booking platform. Next.js 16 + Prisma + Neon PostgreSQL + Tailwind v4.
Live at https://surf-nature-murcia.vercel.app

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
- Participants always 1 (each user books for themselves).

## Current State (v1.0.0 - Production)
- All forms show success/error messages before reload or router.refresh()
- Mobile menu closes on outside click
- Error boundary (error.tsx), loading state (loading.tsx), custom 404 (not-found.tsx)
- Security headers (HSTS, XFO, XCTO, Referrer-Policy) via middleware
- Server-side validation: password min 8 chars, email format, enum validation, Math.max guards
- API routes return proper 401/403 instead of 500 on auth failures
- Prisma $transaction prevents overbooking and duplicate booking race conditions
- Deactivation of classes/sessions blocked if active bookings exist
- All pages with auth use `force-dynamic` export
- Casts removed from Prisma queries (safe mapping instead)
- All public pages have SEO metadata
- RENTAL type available in admin forms
- Password minLength on client matches server (8)
- No dead code or unused imports
- Capacity error message: "No quedan plazas disponibles para la sesión seleccionada"

## Key Files
- `src/lib/auth.ts` — JWT create/verify/session management
- `src/lib/dal.ts` — Data access layer with auth helpers
- `src/lib/prisma.ts` — Prisma client singleton (Neon adapter)
- `middleware.ts` — Auth guard + security headers
- `src/app/api/bookings/route.ts` — Booking creation with $transaction
- `src/app/admin/` — Admin panel pages
- `prisma/schema.prisma` — Database schema (do not modify without asking)
