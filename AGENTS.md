# rongo-surf-app — Surf Nature Murcia

## Project
Surf school booking platform. Next.js 16 + Prisma + Neon PostgreSQL + Tailwind v4.
Live at https://surf-nature-murcia.vercel.app

---

## 1. Git Flow

- Una rama por feature/fix/docs.
- Prefijos de rama: `feat/`, `fix/`, `docs/`.
- Commits descriptivos en español.
- Merge mediante `--no-ff` (prohibido hacer squash).
- **Nada se commitea directamente a `main`** — ni siquiera documentación. Todo pasa por rama + Pull Request.
- Tras el merge a `main`, Vercel despliega automáticamente.

---

## 2. Prisma Migrations

- **No modificar `prisma/schema.prisma` sin solicitar confirmación.**
- **No ejecutar migraciones de Prisma en producción sin aprobación explícita.**
- Antes de cualquier migración, explicar:
  - qué cambia,
  - por qué cambia,
  - qué impacto tiene,
  - si existe riesgo de pérdida de datos.
- Esperar siempre aprobación antes de proceder.

---

## 3. Dependencias

- **No instalar nuevas dependencias automáticamente.**
- Antes de instalar cualquier paquete, justificar:
  - por qué es necesario,
  - tamaño aproximado,
  - mantenimiento del proyecto,
  - alternativas nativas disponibles,
  - ventajas e inconvenientes.
- Esperar siempre aprobación antes de instalar.

---

## 4. Arquitectura

Separación estricta por capas:

```
React/UI
   ↓
API Routes
   ↓
Servicios / Lógica de negocio
   ↓
Prisma
   ↓
Neon
```

- **Nunca** colocar lógica de negocio compleja dentro de componentes React.
- Los componentes se encargan únicamente de: renderizado, interacción del usuario, gestión de estado de interfaz.
- Toda la lógica debe vivir en servicios o en el backend.

### Mapeo actual
- `Class` = template (title, price, type). `Session` = date/time instance of a class.
- `Booking` connects User + Session. Rental data (weight/height/wetsuit) on Booking.
- Auth: JWT in httpOnly cookie, 7-day expiry, bcrypt(12) for passwords.
- Participants always 1 (each user books for themselves).

---

## 5. Documentación viva

Después de finalizar cualquier feature relevante, actualizar automáticamente:

- Estado del proyecto
- Arquitectura
- Árbol de carpetas (si cambia)
- Nuevos endpoints
- Nuevos modelos Prisma
- Variables de entorno nuevas
- Flujo afectado
- Tests añadidos
- Changelog (`CHANGELOG.md`)
- Próximos pasos

La documentación nunca debe quedarse desactualizada respecto al código.

---

## 6. Reporte de cierre obligatorio

Cuando termines una feature **NO hagas merge automáticamente**.

Genera siempre un informe con este formato y espera aprobación:

```
# Reporte de implementación

## Objetivo

## Archivos creados

## Archivos modificados

## Arquitectura afectada

## Base de datos afectada

## API afectada

## Tests añadidos

## Build

## Riesgos detectados

## Mejoras futuras

## Estado
```

Esperar aprobación antes de mergear.

---

## 7. Principios generales

Priorizar siempre en este orden:

1. **Mantenibilidad** — código legible, documentado, consistente
2. **Simplicidad** — la solución más simple que funcione
3. **Seguridad** — validación, auth, headers, inyección
4. **Escalabilidad** — estructura que crezca sin reescribir
5. **Código limpio** — sin dead code, sin imports huérfanos, sin comentarios muertos

Nunca sacrificar arquitectura por velocidad de implementación.

Si una decisión puede afectar a la arquitectura del proyecto, detenerse y consultar antes de implementarla.

---

## 8. Key Rules técnicas

- API routes: usar `getSession()` de `@/lib/auth` (nunca `verifySession`)
- Admin API routes: check manual `session.role === "ADMIN"`
- Server components (pages): usar `verifySession()` o `requireAdmin()` de `@/lib/dal`
- `middleware.ts` maneja protección de rutas + security headers

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
- `totalBookings` Int @default(0): contador acumulado que se incrementa al crear cada reserva y nunca se decrementa (migración con backfill desde datos existentes)
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
