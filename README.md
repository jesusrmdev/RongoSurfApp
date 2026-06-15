# Surf Nature Murcia — Booking Platform

A full-featured surf school booking platform built for **Surf Nature Murcia**, a surf school based in Calnegre, Murcia (Spain). Customers can browse classes, book sessions, and manage rentals online. The school admin has full CRUD control over classes, sessions, and reservations.

**Live:** [surf-nature-murcia.vercel.app](https://surf-nature-murcia.vercel.app)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | Neon (PostgreSQL serverless) |
| **ORM** | Prisma v7 (driver adapter: `@prisma/adapter-neon`) |
| **Auth** | JWT via `jose` + `bcryptjs` (cookie-based, httpOnly) |
| **Deployment** | Vercel (auto-deploy from `main` branch) |

---

## Features

### Public
- Landing page with school info
- Browse all active classes (group lessons, surf camp, equipment rental)
- View class details with available sessions

### Customer (authenticated)
- Register with name, email, password (min 8 chars) + optional weight/height/wetsuit size
- Book class sessions (group lessons) or equipment rentals (with weight/height/wetsuit size)
- View and cancel personal bookings

### Admin
- Dashboard overview (admin-only)
- CRUD manage classes (create, edit, toggle active)
- Manage sessions per class (add, remove)
- View all bookings with customer details
- Full admin API

---

## Project Structure

```
.
├── prisma/
│   ├── schema.prisma          # Database models (User, Class, Session, Booking)
│   ├── migrations/             # Migration history
│   └── prisma.config.ts        # Prisma CLI configuration
├── public/
│   └── logo.png               # School logo
├── scripts/
│   └── seed.ts                # Database seeder (6 courses + 2 test users)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout (Navbar + Footer)
│   │   ├── error.tsx          # Global error boundary
│   │   ├── loading.tsx        # Global loading state
│   │   ├── not-found.tsx      # Custom 404 page
│   │   ├── opengraph-image.png # OG preview image
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── clases/            # Browse & detail classes
│   │   ├── mis-reservas/      # Customer bookings
│   │   ├── admin/             # Admin dashboard, class & booking management
│   │   └── api/               # API routes (auth, classes, bookings, admin)
│   ├── components/
│   │   ├── Navbar.tsx         # Navigation bar with logo
│   │   └── Footer.tsx         # Footer with school location
│   └── lib/
│       ├── auth.ts            # JWT session management
│       ├── dal.ts             # Data access layer (auth helpers)
│       ├── prisma.ts          # Prisma client singleton (Neon adapter)
│       └── utils.ts           # Formatting helpers
├── middleware.ts              # Next.js middleware (auth guard + security headers)
├── vercel.json                # Vercel deployment config
└── package.json
```

---

## Course Catalog

All courses and prices match the school's real offerings:

| Course | Type | Price | Capacity | Duration |
|--------|------|-------|----------|----------|
| Iniciación (Beginner) | GROUP | €40 | 4 people | 90 min |
| Perfeccionamiento (Advanced) | GROUP | €40 | 4 people | 90 min |
| Surf & Yoga Camp 2 días | GROUP | €160 | 12 people | 2 days |
| Equipment Rental 1h | RENTAL | €18 | 4 units | 1h |
| Equipment Rental 2h | RENTAL | €30 | 4 units | 2h |
| Equipment Rental 3h | RENTAL | €45 | 4 units | 3h |

Equipment rental includes surfboard + wetsuit. Wetsuit size, weight, and height are collected during booking.

---

## Authentication

JWT-based authentication stored in HTTP-only cookies:
- **Registration:** email, password (min 8 chars), name. Weight, height, wetsuit size are optional.
- **Login:** Returns JWT cookie valid for 7 days.
- **Security headers:** HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy set on all responses.
- **Middleware (`middleware.ts`):** `/clases` routes are public; `/mis-reservas` and `/admin` require authentication; `/admin/*` requires `role: "ADMIN"`

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- Server-side validation: email format, password length (min 8 chars)
- Protected against NaN injection (all numeric inputs validated with `||` fallback)
- CSRF mitigated via `SameSite=Lax` cookies
- HTTP-only, Secure session cookies
- API routes return proper 401/403 instead of 500 on auth failures
- `SESSION_SECRET` validated at startup (min 32 chars required)
- No SQL injection (Prisma ORM, no raw queries)
- No XSS vectors (React auto-escaping, no `dangerouslySetInnerHTML`)

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Neon PostgreSQL database (or local PostgreSQL)

### Local Development

```bash
# Clone
git clone https://github.com/jesusrmdev/RongoSurfApp.git
cd RongoSurfApp

# Install dependencies
npm install

# Set up environment variables (create .env file):
# DATABASE_URL — Neon pooled connection URL
# DIRECT_URL — Neon direct connection URL (for migrations)
# SESSION_SECRET — Random 32+ char string

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run seed

# Start development server
npm run dev
```

---

## API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/register` | POST | - | Create account (min 8 char password) |
| `/api/login` | POST | - | Sign in |
| `/api/logout` | POST | User | Sign out |
| `/api/me` | GET | User | Current user info |
| `/api/classes` | GET | - | List active classes |
| `/api/classes/[id]` | GET | - | Class details + sessions |
| `/api/bookings` | GET/POST | User | List/create bookings |
| `/api/bookings/[id]` | DELETE | User | Cancel booking |
| `/api/admin/classes` | GET/POST | Admin | List/create classes |
| `/api/admin/classes/[id]` | PUT/DELETE | Admin | Update/delete class |
| `/api/admin/sessions` | POST | Admin | Create session |
| `/api/admin/sessions/[id]` | DELETE | Admin | Remove session |
| `/api/admin/bookings` | GET | Admin | List all bookings |
| `/api/admin/bookings/[id]` | PATCH | Admin | Cancel any booking |

---

## Deployment

Deployed on Vercel with automatic deploys from the `main` branch.

### Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon pooled connection (for app) |
| `DIRECT_URL` | Neon direct connection (for migrations) |
| `SESSION_SECRET` | JWT signing secret (min 32 chars, use `openssl rand -base64 32`) |

### Manual Deploy

```bash
vercel --prod
```

---

## Changelog

### v1.0.0 (2026-06-15)
- Initial production release
- Class booking system with group lessons and equipment rental
- Admin panel with full CRUD for classes, sessions, and bookings
- JWT authentication with httpOnly cookies
- Neon PostgreSQL with Prisma ORM
- Responsive design with Tailwind CSS v4
- Security: HSTS, XSS protection, input validation, bcrypt(12)
- Error boundary, loading states, and custom 404 page
- OG tags and SEO metadata

---

## License

Private — Surf Nature Murcia. All rights reserved.
