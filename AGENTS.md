# rongo-surf-app — Surf Nature Murcia

## Project
Surf school booking platform. Next.js 16 + Prisma + Neon PostgreSQL + Tailwind v4.
Live at https://surf-nature-murcia.vercel.app

---

## 1. Git Flow

- One branch per feature/fix/docs.
- Branch prefixes: `feat/`, `fix/`, `docs/`.
- Descriptive commits (English).
- Merge via `--no-ff` (squash prohibited).
- **Never commit directly to `main`** — not even documentation. Everything goes through a branch + Pull Request.
- After merging to `main`, Vercel auto-deploys.

---

## 2. Prisma Migrations

- **Do not modify `prisma/schema.prisma` without asking for confirmation.**
- **Do not run Prisma migrations in production without explicit approval.**
- Before any migration, explain:
  - what changes,
  - why it changes,
  - what impact it has,
  - whether there is data loss risk.
- Always wait for approval before proceeding.

---

## 3. Dependencies

- **Do not install new dependencies automatically.**
- Before installing any package, justify:
  - why it's needed,
  - approximate size,
  - project maintenance status,
  - native alternatives available,
  - pros and cons.
- Always wait for approval before installing.

---

## 4. Architecture

Strict layer separation:

```
React/UI
   ↓
API Routes
   ↓
Services / Business Logic
   ↓
Prisma
   ↓
Neon
```

- **Never** place complex business logic inside React components.
- Components are only responsible for: rendering, user interaction, UI state management.
- All logic must live in services or the backend.

### Current mapping
- `Class` = template (title, price, type). `Session` = date/time instance of a class.
- `Booking` connects User + Session. Rental data (weight/height/wetsuit) on Booking.
- Auth: JWT in httpOnly cookie, 7-day expiry, bcrypt(12) for passwords.
- Participants always 1 (each user books for themselves).

---

## 5. Living documentation

After finishing any relevant feature, automatically update:

- Project state
- Architecture
- Folder tree (if changed)
- New endpoints
- New Prisma models
- New environment variables
- Affected flow
- Added tests
- Changelog (`CHANGELOG.md`)
- Next steps

Documentation must never be out of sync with code.

---

## 6. Mandatory closing report

When you finish a feature **DO NOT merge automatically**.

Always generate a report with this format and wait for approval:

```
# Implementation Report

## Objective

## Files created

## Files modified

## Affected architecture

## Affected database

## Affected API

## Added tests

## Build

## Detected risks

## Future improvements

## Status
```

Wait for approval before merging.

---

## 7. General principles

Always prioritize in this order:

1. **Maintainability** — readable, documented, consistent code
2. **Simplicity** — the simplest working solution
3. **Security** — validation, auth, headers, injection prevention
4. **Scalability** — structure that grows without rewrites
5. **Clean code** — no dead code, no orphan imports, no stale comments

Never sacrifice architecture for speed.

If a decision may affect project architecture, stop and ask before implementing.

---

## 8. Technical Key Rules

- API routes: use `getSession()` from `@/lib/auth` (never `verifySession`)
- Admin API routes: check `session.role === "ADMIN"` manually
- Server components (pages): use `verifySession()` or `requireAdmin()` from `@/lib/dal`
- `middleware.ts` handles route protection + security headers

---

## 9. Current State (v1.2.0 - Production)

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

### Registration
- `name`, `apellido1`, `apellido2`, `phone`, `weight`, `height`, `wetsuitSize` are REQUIRED
- Phone validated: exactly 9 digits (`/^\d{9}$/`)
- `weight`/`height` stored as Int, `wetsuitSize` as String (XS-XXL)
- `totalBookings` Int @default(0): counter incremented on booking creation, decremented on cancel (before the session), not decremented on past booking deletion (migration with backfill from existing data)
- All required fields validated server-side (400 if missing)

### User Profile (`/perfil`)
- Users can view/edit: name, apellido1, apellido2, phone, weight, height, wetsuitSize
- Email is NOT editable
- API: `GET /api/profile` (fetch), `PATCH /api/profile` (update)
- Protected route via middleware

### Admin Panel
- "Mis Reservas" link hidden for admin users in navbar
- Admin reservations page: full user info, separated into próximas/pasadas with counts
- Cancel booking: PATCH `/api/admin/bookings/[id]` → "CANCELLED" (modal confirmation)
- Delete booking: DELETE `/api/admin/bookings/[id]` (hard delete, modal confirmation)
- Admin loading states: `loading.tsx` in admin/, admin/clases/, admin/reservas/, admin/alumnos/
- Badge notification: navbar red badge with count of CONFIRMED bookings today, polling 30s via `GET /api/admin/notifications`
- **Alumnos section** (`/admin/alumnos`): table with all registered users (name, email, phone, weight, height, wetsuit, totalBookings, registration date). Desktop table + mobile cards. API: `GET /api/admin/users` (admin-only)

### Booking Form (`/clases/[id]/BookForm.tsx`)
- When `isRental`, auto-fills weight/height/wetsuitSize from user profile
- `.catch(() => {})` in effect to prevent unhandled rejections

### Cancel Buttons
- Both admin and user use custom modal (no native `confirm()`)
- User cancel: PATCH `/api/bookings/[id]` → "CANCELLED" (soft cancel)
- Admin cancel: PATCH `/api/admin/bookings/[id]` → "CANCELLED"

### Seed (`scripts/seed.ts`)
- Admin: `admin@surfnaturemurcia.com` / `admin123` — phone: 612345678, 75kg, 178cm, L
- User: `surfer@test.com` / `surf123` — phone: 698765432, 70kg, 170cm, M
- Uses bcrypt 12 rounds (consistent with register)

---

## 10. Testing

- **Framework:** Vitest v4.1.9
- **Run:** `npm test` (single run) or `npm run test:watch`
- **33 tests** across 6 files, ~1.3s
- **Database mock:** Prisma mocked globally in `src/lib/__tests__/vitest.setup.ts` — never connects to Neon
- **Per-test auth mock:** each file mocks `@/lib/auth` with `vi.mock()` to control session per test
- **Pattern:** create `Request` object and call handler directly, assert on `res.status` + `res.json()`

### Test files
| File | Tests | Coverage |
|---|---|---|
| `src/lib/__tests__/auth.test.ts` | 5 | JWT encrypt/decrypt, invalid token, empty/undefined, wrong secret |
| `src/lib/__tests__/utils.test.ts` | 3 | formatDuration helper |
| `src/app/api/__tests__/bookings.test.ts` | 8 | POST /api/bookings full flow |
| `src/app/api/__tests__/register.test.ts` | 6 | POST /api/register full validation |
| `src/app/api/__tests__/profile.test.ts` | 7 | GET/PATCH /api/profile |
| `src/app/api/bookings/__tests__/cancel.test.ts` | 4 | PATCH /api/bookings/[id] |

---

## 11. Key Files

- `src/lib/auth.ts` — JWT create/verify/session management
- `src/lib/dal.ts` — Data access layer with auth helpers
- `src/lib/prisma.ts` — Prisma client singleton (Neon adapter)
- `middleware.ts` — Auth guard + security headers
- `src/app/api/bookings/route.ts` — Booking creation with $transaction
- `src/app/api/register/route.ts` — Registration with phone validation (9 digits)
- `src/app/api/profile/route.ts` — User profile GET/PATCH
- `src/app/api/admin/notifications/route.ts` — Badge count (CONFIRMED bookings today)
- `src/app/api/admin/users/route.ts` — List all users (admin-only)
- `src/app/perfil/page.tsx` — Profile page (client component)
- `src/app/admin/` — Admin panel pages
- `src/app/admin/alumnos/page.tsx` — Alumnos list (table + mobile cards)
- `src/app/admin/alumnos/loading.tsx` — Skeleton for alumnos
- `src/app/admin/reservas/CancelBookingButton.tsx` — Admin cancel (modal)
- `src/app/admin/reservas/DeleteBookingButton.tsx` — Admin hard delete (modal)
- `src/app/mis-reservas/CancelButton.tsx` — User cancel (modal)
- `src/app/clases/[id]/BookForm.tsx` — Booking form (pre-fills from profile)
- `prisma/schema.prisma` — Database schema (do not modify without asking)
- `scripts/seed.ts` — Database seeder
- `src/lib/__tests__/vitest.setup.ts` — Global Prisma mock for tests
- `CHANGELOG.md` — Release history
