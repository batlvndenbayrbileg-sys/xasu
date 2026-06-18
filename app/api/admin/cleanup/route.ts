import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Reservation retention policy:
 *   - unpaid:  kept for 7 days, then deleted
 *   - paid:    kept for 365 days, then deleted
 *
 * Triggered by:
 *   1. Vercel Cron (configured in vercel.json) — daily at 03:00 UTC
 *   2. Admin manual purge button
 *
 * Auth: requires CRON_SECRET header (Authorization: Bearer ...) OR an admin
 * session cookie. This way the cron platform can hit it without a user.
 */
export async function POST(req: Request) {
  // Cron secret bypass — Vercel sends Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    const { getCurrentAdmin } = await import("@/lib/admin");
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const now = Date.now();
  const unpaidCutoff = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const paidCutoff = new Date(now - 365 * 24 * 60 * 60 * 1000);

  const [unpaid, paid] = await Promise.all([
    prisma.reservation.deleteMany({
      where: {
        paymentStatus: { in: ["unpaid", "failed"] },
        createdAt: { lt: unpaidCutoff },
      },
    }),
    prisma.reservation.deleteMany({
      where: {
        paymentStatus: { in: ["paid", "refunded"] },
        createdAt: { lt: paidCutoff },
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    deletedUnpaid: unpaid.count,
    deletedPaid: paid.count,
    ranAt: new Date().toISOString(),
  });
}

/** Allow GET as well so a browser admin can trigger the same cleanup. */
export async function GET(req: Request) {
  return POST(req);
}
