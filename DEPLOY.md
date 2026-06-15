# Deploying Xasu to Vercel

## 1. Database (required — SQLite won't work on Vercel)

Vercel is serverless with an ephemeral filesystem, so you need a hosted Postgres.

**Neon (recommended — built-in pooler):**
1. Create a project at https://neon.tech → copy the **pooled** connection string.
2. You'll set it as `DATABASE_URL` in Vercel (and `DIRECT_URL` to the unpooled string for migrations).

Then create the tables + the atomic-booking index (run once, locally, pointing at Neon):

```bash
DATABASE_URL="postgresql://…neon…pooler…/db?sslmode=require" \
DIRECT_URL="postgresql://…neon…/db?sslmode=require" \
npm run db:setup        # prisma db push + scripts/init-db.mjs (partial unique index)
```

## 2. Push to GitHub & import to Vercel

```bash
git init && git add -A && git commit -m "Xasu"
# create a repo, then:
git remote add origin <your-repo> && git push -u origin main
```

In Vercel: **New Project → import the repo** (framework auto-detected as Next.js).

## 3. Environment variables (Vercel → Settings → Environment Variables)

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Neon **pooled** URL |
| `DIRECT_URL` | Neon unpooled URL |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |
| `WIRE_SECRET_KEY` | `sk_live_…` (leave blank → payments run in mock mode) |
| `WIRE_WEBHOOK_SECRET` | `whsec_…` (only if you register a webhook) |

Deploy. `npm run build` runs `prisma generate` automatically.

## 4. Connect Wire payments (real money)

Payments work in **mock mode** out of the box (auto-succeed) so you can demo immediately.
To take real QPay deposits:

1. In the Wire dashboard: phone + ДАН verification → create a Project → configure & verify your **QPay connector** → connect your payout account → create an **API key** (`sk_live_…`).
2. Set `WIRE_SECRET_KEY` in Vercel and redeploy.
3. (Optional) Register a webhook at `https://your-app.vercel.app/api/webhooks/wire`, set `WIRE_WEBHOOK_SECRET`. Wire calls only from `65.109.117.186`; the route verifies the IP + HMAC signature. Payments still confirm without a webhook (the app polls status).

### How the deposit flow works
`/book` → create reservation (holds the table via the partial unique index) → `/pay?r=<id>` creates a Wire **PaymentIntent** for the ₮20,000 deposit, dispatches to QPay, shows the QR, and polls until `succeeded` → reservation marked **paid** → `/confirmation`. Unpaid bookings can be paid later from **My Bookings**.
