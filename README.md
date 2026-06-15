# Xasu — Fine Dining & Reservations

A **responsive** restaurant website (not a phone mockup) built with **Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion + Zustand + Prisma/PostgreSQL**. Mobile-first, with a distinct, richer desktop layout.

## What users can do (full end-to-end)

| Flow | Route |
|------|-------|
| Browse — hero, specials, events | `/` |
| Full menu + search | `/menu` |
| Dish detail (two-column on desktop) | `/dish/[id]` |
| Sign up / Sign in (split-screen) | `/login` |
| Reserve — zone, date, time, **interactive floorplan**, party size | `/book` |
| Confirmation | `/confirmation` |
| My bookings — Upcoming / Completed / Cancelled tabs, cancel | `/orders` |
| Profile (logout) | `/profile` |

Selecting a table on the floorplan reveals a **realistic photo of that exact table** (seats, zone, position) before you confirm. Bookings are classified automatically: future confirmed = **Upcoming**, past confirmed = **Completed**, cancelled = **Cancelled**.

## Responsive design

- **Mobile-first**: bottom tab bar (`MobileNav`), stacked layouts, sticky action bar on the reserve page.
- **Desktop**: sticky translucent top nav, full-bleed hero, multi-column dish grids, two-column dish detail, a **two-column reservation layout** (large floorplan + sticky summary panel), and a full footer.
- The interactive floorplan is SVG on a resolution-independent 100×100 grid — it scales up beautifully on desktop (`h-[380px] md:h-[560px]`).

## Performance & scale (built for 1000+ concurrent)

1. **Read-heavy paths never touch the DB.** Menu and floorplan layout are static config (`lib/data.ts`). Home / menu / dish / book / login / orders / profile are **prerendered static** pages (see build output `○`) — served from cache/CDN at near-zero cost. Only auth + reservations hit Postgres.
2. **Atomic booking under concurrency.** A **partial unique index** on `(tableId, date, time) WHERE status = 'CONFIRMED'` (see `prisma/migrations/0001_init/migration.sql`) makes the database itself the arbiter — concurrent attempts on the same slot can't double-book; the loser gets a unique violation → HTTP `409`. No app-level locking, no race window.
3. **Connection safety.** Singleton `PrismaClient` (`lib/prisma.ts`) + pooled `DATABASE_URL`. With Neon/Supabase/PgBouncer this scales to thousands of concurrent connections.
4. **Indexes** on `User.email`, `Session.token` (PK), `Session.expiresAt`, and `Reservation(tableId, date, time)`.

## Languages

Mongolian-first 🇲🇳. The whole UI loads in Mongolian by default; a **МН / EN** toggle in the header switches instantly (persisted in `localStorage`). Translations live in `lib/i18n.tsx`.

## Setup

```bash
npm install            # also runs `prisma generate`
# .env already contains DATABASE_URL="file:./dev.db" (SQLite, zero install)
npm run db:setup       # creates dev.db + the partial unique index
npm run dev            # http://localhost:3000
```

> Already running `npm run dev`? **Restart it** after `npm run db:setup` so the new `.env` (DATABASE_URL) is picked up.

### Going to production / 1000+ concurrent — PostgreSQL

SQLite is for local dev. For production, switch to Postgres (Neon recommended — built-in pooler):

1. In `prisma/schema.prisma`: `provider = "postgresql"`
2. `.env`: `DATABASE_URL="postgresql://USER:PASS@HOST-pooler.<region>.aws.neon.tech/db?sslmode=require"`
3. `npm run db:push && node scripts/init-db.mjs`

The models and the atomic-booking partial index are identical on both engines.

```bash
npm run build && npm start   # production server
```

## Project structure

```
app/
  layout.tsx              # Inter + Playfair, global header/footer/mobile-nav
  page.tsx                # Home (hero, specials, events, CTA)
  menu, dish/[id], book, confirmation, orders, profile, login
  api/
    auth/{signup,login,logout,me}/route.ts
    tables/route.ts        # static layout + live availability
    reservations/route.ts  # create (atomic) + list
    reservations/[id]/route.ts  # cancel
components/
  SiteHeader, MobileNav, Footer
  CategoryTabs, DishCard
  FloorPlan.tsx            # ★ interactive SVG floorplan + inspector
lib/
  prisma.ts                # singleton client
  auth.ts                  # scrypt + cookie sessions (Prisma-backed)
  data.ts                  # static dishes + table layout
  store.ts                 # Zustand booking state
  useSession.ts, types.ts
prisma/
  schema.prisma
  migrations/0001_init/migration.sql   # incl. partial unique index
```

## Production readiness

- **Errors & states**: custom `not-found`, `error` boundary, route `loading` skeletons, opacity route transitions, top scroll-progress bar.
- **Feedback**: branded toast system (`lib/toast.ts`) and promise-based confirm dialog (`lib/confirm.ts`) — no native `alert/confirm`.
- **SEO/PWA**: `app/icon.svg`, `manifest.ts`, `robots.ts`, `sitemap.ts`, `metadataBase` + title template + OpenGraph/Twitter, themed `viewport`.
- **Security**: security headers in `next.config.js`, in-memory **rate limiting** on `/api/auth/*` (verified: 8 logins/min → 429), email/length validation, `httpOnly`+`SameSite`+`Secure` sessions, scrypt hashing.
- **A11y**: `:focus-visible` rings, Esc-to-close on modals/dialogs, aria labels.
- **Performance**: static prerender for all read paths, `loading="lazy"`/`decoding="async"` on imagery, singleton Prisma, atomic booking via partial unique index.

## Notes

- The session cookie is `httpOnly` + `SameSite=Lax`, and `Secure` in production.
- Passwords hashed with `scrypt` (`node:crypto`), no external dep.
- Swap `alert()`/`confirm()` for a toast lib (e.g. `sonner`) before launch; add rate-limiting on `/api/auth/*`.
