import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { TABLES } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Today's live ops snapshot:
 *  - today's reservations grouped (upcoming / arrived / completed / cancelled)
 *  - per-table next booking
 *  - KPI: today count, paid count, expected revenue */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const today = new Date().toISOString().slice(0, 10);

  const reservations = await prisma.reservation.findMany({
    where: { date: today },
    orderBy: { time: "asc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const items = reservations.map((r) => ({
    id: r.id,
    tableId: r.tableId,
    zone: r.zone,
    date: r.date,
    time: r.time,
    partySize: r.partySize,
    status: r.status,
    paymentStatus: r.paymentStatus,
    amount: r.amount,
    source: r.source,
    notes: r.notes,
    user: r.user,
    guestName: r.guestName,
    guestPhone: r.guestPhone,
  }));

  // Per-table next upcoming booking
  const nowMinutes = (() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); })();
  const toMins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

  const tables = TABLES.map((tbl) => {
    const todays = items.filter((r) => r.tableId === tbl.id && r.status !== "CANCELLED" && r.status !== "NO_SHOW");
    const upcoming = todays.find((r) => toMins(r.time) >= nowMinutes - 60 && r.status !== "COMPLETED");
    const current = todays.find((r) => r.status === "ARRIVED");
    return {
      ...tbl,
      currentRes: current ?? null,
      nextRes: upcoming && upcoming.id !== current?.id ? upcoming : null,
      bookings: todays.length,
    };
  });

  const expected = items.filter((r) => r.status !== "CANCELLED" && r.status !== "NO_SHOW").reduce((s, r) => s + r.amount, 0);
  const collected = items.filter((r) => r.paymentStatus === "paid").reduce((s, r) => s + r.amount, 0);

  return NextResponse.json({
    data: {
      today,
      stats: {
        total: items.length,
        confirmed: items.filter((r) => r.status === "CONFIRMED").length,
        arrived: items.filter((r) => r.status === "ARRIVED").length,
        completed: items.filter((r) => r.status === "COMPLETED").length,
        cancelled: items.filter((r) => r.status === "CANCELLED").length,
        noShow: items.filter((r) => r.status === "NO_SHOW").length,
        expectedRevenue: expected,
        collectedRevenue: collected,
      },
      tables,
      items,
    },
  });
}
