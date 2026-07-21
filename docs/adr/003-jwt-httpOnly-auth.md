# ADR 003: JWT httpOnly Authentication

## Status
Accepted

## Context
The project needs user authentication. The app is a full-stack Next.js app with both server-rendered pages (RSC) and API routes. The authentication solution must work for both, be secure against XSS, and be simple to implement.

## Problem
What authentication mechanism should be used?

## Alternatives

1. **Session IDs in database** — Store sessions in DB, reference by cookie. Requires DB query per request. More complex, more DB load.
2. **JWT in localStorage** — Simple client-side storage. Vulnerable to XSS (JavaScript can read localStorage). Less secure.
3. **JWT in httpOnly cookie** — JWT signed by server, stored in httpOnly cookie. Not readable by JavaScript. Selected approach.
4. **NextAuth.js** — Full-featured auth library. Adds dependency, more complex setup, overkill for simple email/password.

## Decision
- Use `jose` library for JWT signing (HS256 algorithm)
- Store JWT in httpOnly, Secure, SameSite=Lax cookie named "session"
- 7-day expiry
- Two auth strategies:
  - `verifySession()` — cached, redirects on failure (for server components)
  - `getSession()` — returns undefined on failure (for API routes)
- Admin variants: `requireAdmin()` and `requireAdminApi()`
- bcrypt(12) for password hashing

## Consequences

Positive:
- XSS-safe (cookie not readable by JS)
- Works with both RSC and API routes
- No database query for session lookup
- 7-day expiry is user-friendly
- `jose` is lightweight, no large dependencies

Negative:
- JWT cannot be revoked server-side (no logout from other devices)
- Cookie size limit (~4KB), but JWT payload is small
- `SameSite=Lax` means cookie not sent on some cross-site requests
