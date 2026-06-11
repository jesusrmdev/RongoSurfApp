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
| **Auth** | JWT via `jose` + `bcryptjs` (cookie-based) |
| **Deployment** | Vercel (auto-deploy from `main` branch) |

---

## Features

### Public
- Landing page with school info
- Browse all active classes (group lessons, surf camp, equipment rental)
- View class details with available sessions

### Customer (authenticated)
- Register with wetsuit size (required) + optional weight/height
- Book class sessions (group lessons) or equipment rentals (with weight/height/wetsuit size)
- View and cancel personal bookings

### Admin
- Dashboard overview
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
│       ├── prisma.ts          # Prisma client singleton (Neon adapter)
│       └── utils.ts           # Formatting helpers
├── proxy.ts                   # Next.js 16 middleware (auth guard)
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

Equipment rental includes surfboard + wetsuit, and requires wetsuit size + optional weight/height during booking.

---

## Authentication

JWT-based authentication stored in HTTP-only cookies:
- **Registration:** email, password, name, wetsuit size (required), weight/height (optional)
- **Login:** returns JWT cookie valid for 24h
- **Middleware (`proxy.ts`):** `/clases` routes are public; `/mis-reservas` and `/admin` require authentication; `/admin/*` requires `role: "ADMIN"`

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Local Development

```bash
# Clone
git clone https://github.com/jesusrmdev/RongoSurfApp.git
cd RongoSurfApp

# Install dependencies
npm install

# Set up environment variables
# Copy from .env.example or configure:
# DATABASE_URL — Neon pooled connection URL
# DIRECT_URL — Neon direct connection URL (for migrations)
# SESSION_SECRET — JWT signing secret

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run seed

# Start development server
npm run dev
```

### Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@surfnaturemurcia.com` | `admin123` |
| User | `surfer@test.com` | `surf123` |

---

## API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/register` | POST | - | Create account |
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
| `/api/admin/bookings/[id]` | DELETE | Admin | Cancel any booking |

---

## Deployment

Deployed on Vercel with automatic deploys from the `main` branch.

### Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon pooled connection (for app) |
| `DIRECT_URL` | Neon direct connection (for migrations) |
| `SESSION_SECRET` | JWT signing secret |

### Manual Deploy

```bash
vercel --prod
```

---

## License

Private — Surf Nature Murcia. All rights reserved.
