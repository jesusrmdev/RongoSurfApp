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

## Current State (v1.1.0 - Production)
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
- User cancel: PATCH `/api/bookings/[id]` → "CANCELLED" (soft cancel, consistent with admin)
- Error feedback on all delete/cancel buttons (no silent error swallowing)
- HTML5 pattern validation on phone input (`pattern="\d{9}"`)
- All confirmation buttons use custom modals (no native `confirm()` anywhere)
- Math.max(0, ...) guards on all weight/height parsing (register, profile, admin)

### Registration (last updated: Jun 2026)
- `name`, `apellido1`, `apellido2`, `phone`, `weight`, `height`, `wetsuitSize` are REQUIRED on register
- Phone validated: exactly 9 digits (`/^\d{9}$/`)
- `weight`/`height` stored as Int, `wetsuitSize` as String (XS-XXL)
- All required fields validated server-side (400 if missing)
- seed.ts updated with phone/weight/height/wetsuitSize for both test users

### User Profile (`/perfil`)
- Users can view/edit: name, phone, weight, height, wetsuitSize
- Email is NOT editable (displayed disabled)
- API: `GET /api/profile` (fetch), `PATCH /api/profile` (update)
- Protected route via middleware (`/perfil` in protectedRoutes)
- Navbar shows "Mi Perfil" link for all authenticated users

### Admin Panel
- "Mis Reservas" link hidden for admin users in navbar
- Admin reservations page (`/admin/reservas`) shows full user info: email, phone, weight, height, wetsuitSize
- Cancel booking: PATCH `/api/admin/bookings/[id]` with status "CANCELLED" (modal confirmation)
- Delete booking: DELETE `/api/admin/bookings/[id]` (hard delete, modal confirmation)
- Admin loading states: `loading.tsx` in admin/, admin/clases/, admin/reservas/
- **Badge notification**: navbar shows red badge with count of CONFIRMED bookings created today, polls every 30s via `GET /api/admin/notifications`

### Booking Form (`/clases/[id]/BookForm.tsx`)
- When `isRental`, auto-fills weight/height/wetsuitSize from user profile (`/api/profile`)
- `.catch(() => {})` in effect to prevent unhandled rejections

### Cancel Buttons
- Both admin (`CancelBookingButton.tsx`) and user (`CancelButton.tsx`) use custom modal instead of native `confirm()`
- User cancel: PATCH `/api/bookings/[id]` → "CANCELLED" (soft cancel)
- Admin cancel: PATCH `/api/admin/bookings/[id]` → "CANCELLED"

### Seed (`scripts/seed.ts`)
- Admin: `admin@surfnaturemurcia.com` / `admin123` — apellidos: Admin SurfNature, phone: 612345678, 75kg, 178cm, L
- User: `surfer@test.com` / `surf123` — apellidos: Surfer Test, phone: 698765432, 70kg, 170cm, M
- Uses bcrypt 12 rounds (consistent with register)

## Key Files
- `src/lib/auth.ts` — JWT create/verify/session management
- `src/lib/dal.ts` — Data access layer with auth helpers (`getCurrentUser` includes phone/weight/height/wetsuitSize/apellidos; `requireAdmin` has null-check on session)
- `src/lib/prisma.ts` — Prisma client singleton (Neon adapter)
- `middleware.ts` — Auth guard + security headers (protects /perfil)
- `src/app/api/bookings/route.ts` — Booking creation with $transaction
- `src/app/api/register/route.ts` — Registration with phone validation (9 digits)
- `src/app/api/profile/route.ts` — User profile GET/PATCH
- `src/app/api/admin/notifications/route.ts` — Badge count (CONFIRMED bookings today)
- `src/app/perfil/page.tsx` — Profile page (client component)
- `src/app/admin/` — Admin panel pages
- `src/app/admin/reservas/CancelBookingButton.tsx` — Admin cancel (modal)
- `src/app/admin/reservas/DeleteBookingButton.tsx` — Admin hard delete (modal)
- `src/app/mis-reservas/CancelButton.tsx` — User cancel (modal)
- `src/app/clases/[id]/BookForm.tsx` — Booking form (pre-fills from profile)
- `prisma/schema.prisma` — Database schema (do not modify without asking)

## Recent Commits (latest first)
```
01da66a fix: add HTML5 pattern validation on phone input in register
fd186ae fix: add error feedback to DeleteBookingButton
c429b42 fix: add Math.max guards on weight/height in register and profile routes
6364161 fix: change user cancel from DELETE to PATCH for consistent soft cancel
04d4544 fix: replace native confirm() with custom modal in SessionsManager
6d847bf Badge admin solo cuenta reservas activas (no canceladas)
3d3406b Añadir badge de nuevas reservas en navbar para admin
578fe87 Ocultar Mis Reservas en navbar para admin
a97083f Añadir opción de eliminar reserva en panel admin
fe5a6cd Fix: catch message en register, null-check requireAdmin, bcrypt rounds 12, .catch() en BookForm
```
