# Security Architecture

## Overview

Security is implemented in layers: middleware (edge), API routes (server), and database (Prisma). The approach follows defense-in-depth.

---

## Authentication

| Mechanism | Detail |
|-----------|--------|
| **Type** | JWT (JSON Web Token) |
| **Algorithm** | HS256 (HMAC with SHA-256) |
| **Library** | `jose` |
| **Storage** | httpOnly, Secure, SameSite=Lax cookie named "session" |
| **Expiry** | 7 days from creation |
| **Signing key** | `SESSION_SECRET` env var (validated: min 32 chars at startup) |
| **Password hashing** | bcrypt with 12 rounds (`bcryptjs`) |

Implementation in `src/lib/auth.ts`:
- `encrypt(payload)` — Signs JWT with HS256, issued-at and 7-day expiry
- `decrypt(session)` — Verifies JWT, returns payload or undefined
- `createSession(userId, role)` — Encrypts + sets httpOnly cookie
- `deleteSession()` — Clears cookie

## Authorization

| Layer | Mechanism | File |
|-------|-----------|------|
| **Middleware (edge)** | Route protection by path prefix + role check | `middleware.ts` |
| **API routes** | `getSession()` returns payload or undefined → manual role check | Each route handler |
| **Server components** | `verifySession()` redirects on failure; `requireAdmin()` redirects if not admin | `src/lib/dal.ts` |

### Route protection matrix

```
/ (public), /login, /register   → No auth required
/clases/*                       → No auth required
/mis-reservas, /perfil          → Requires valid session
/admin/*                        → Requires ADMIN role
/api/*                          → No middleware protection (protected in route handler)
```

## Validation

| Input | Validation | Location |
|-------|-----------|----------|
| Email | Required, valid email format | API routes |
| Password | Required, min 8 characters | API routes + client HTML5 |
| Phone | Required, exactly 9 digits `/^\d{9}$/` | API routes + client `pattern` |
| Weight/Height | Required, `Math.max(0, parseInt(...))` | API routes |
| Wetsuit size | Required, one of XS-XXL | API routes |
| Class type | Required, one of GROUP/INDIVIDUAL/RENTAL | API routes |
| Booking status | Required, one of CONFIRMED/CANCELLED | API routes |
| Session ID | Required, must exist and be active | API routes |
| Capacity | Checked atomically in `$transaction` | API routes |

## Password Security

- **Algorithm:** bcrypt
- **Rounds:** 12 (cost factor)
- **Library:** `bcryptjs` (pure JS, no native compilation)
- **Storage:** Hashed only, plain text never stored
- **Comparison:** `bcrypt.compare()` on login
- **Min length:** 8 characters (server + client validation)

## JWT Security

- **Algorithm:** HS256 (symmetric)
- **Key:** `SESSION_SECRET` from environment, min 32 chars
- **Validation at startup:** App throws if `SESSION_SECRET` is missing or too short
- **Payload:** `{ userId, role, expiresAt }`
- **Expiry:** 7 days (configurable via `encrypt()`)
- **Cookie flags:** httpOnly (no JS access), Secure (HTTPS only), SameSite=Lax (CSRF protection)

## Middleware

`middleware.ts` runs at the edge (Vercel CDN) before requests reach the app.

- Protects `/mis-reservas`, `/perfil`, `/admin` from unauthenticated access
- Protects `/admin` from non-ADMIN users
- Redirects authenticated users away from `/login` and `/register`
- Adds security headers to all responses

### Security headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Enforces HTTPS for 2 years |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer header |

### Vercel additional headers

`vercel.json` adds `X-Content-Type-Options: nosniff` as an additional layer.

## SQL Injection Protection

- **ORM:** Prisma generates parameterized queries — no raw SQL in application code
- **Raw SQL:** Only used in migrations (backfill scripts), never in application
- **Input:** All user input goes through Prisma's typed queries

## XSS Considerations

- **Cookie:** httpOnly prevents JS access to session token
- **React:** JSX auto-escapes values by default
- **No `dangerouslySetInnerHTML`:** Not used anywhere in the codebase
- **JSON responses:** API returns JSON only (no HTML injection vectors)

## CSRF Considerations

- **SameSite=Lax:** Cookie is not sent on cross-site POST requests (basic CSRF protection)
- **No CSRF token:** Not implemented. Current SameSite=Lax + httpOnly provides sufficient protection for this project's scope.
- **API design:** Mutations require authentication cookie, which is not sent cross-origin with SameSite=Lax

## Secrets Management

| Secret | Storage | Access |
|--------|---------|--------|
| `SESSION_SECRET` | Environment variable (Vercel dashboard) | Never committed, never logged |
| `DATABASE_URL` | Environment variable (Vercel + .env.local) | Contains credentials |
| `DIRECT_URL` | Environment variable (Vercel + .env.local) | Contains credentials |
| `.env` | Local only | In `.gitignore` |

## Rate Limiting

**Current status:** Not implemented.

No rate limiting on login, register, or any endpoint. This is a known gap.

**Recommended future improvements:**
- Add rate limiting on `/api/login` (e.g., 5 attempts per minute per IP)
- Add rate limiting on `/api/register`
- Consider Vercel WAF or external rate limiting service

## Audit Points

| Event | Logged? | Mechanism |
|-------|---------|-----------|
| Login success | No | — |
| Login failure | No | — |
| Booking created | No | — |
| Booking cancelled | No | — |
| User registered | No | — |
| Admin actions | No | — |

**Recommended:** Add structured logging for audit events (login, registration, cancellations, admin mutations).

## Future Improvements

1. **Rate limiting** on auth endpoints (login, register)
2. **Audit logging** for security events
3. **CSRF token** for state-changing operations (optional, given SameSite=Lax)
4. **Session revocation** — ability to invalidate all sessions for a user
5. **Password strength meter** on registration
6. **Account lockout** after N failed login attempts
7. **Email verification** flow
8. **Password reset** flow
