import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function ymd(d: Date) {
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Rich analytics for the Reports page. Pulls all reservations in [from, to]
 * once and aggregates in-memory (cheaper than a dozen groupBy round-trips for
 * the volumes a single restaurant produces).
 */
export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const now = new Date();
  const defFrom = new Date(now); defFrom.setDate(now.getDate() - 6);
  const from = url.searchParams.get("from") ?? ymd(defFrom);
  const to = url.searchParams.get("to") ?? ymd(now);

  const rows = await prisma.reservation.findMany({
    where: { date: { gte: from, lte: to } },
    select: {
      date: true, time: true, zone: true, source: true, partySize: true,
      status: true, paymentStatus: true, amount: true, tableId: true,
    },
  });

  const paidRows = rows.filter((r) => r.paymentStatus === "paid");
  const totalBookings = rows.length;
  const totalGuests = rows.reduce((s, r) => s + r.partySize, 0);
  const paidRevenue = paidRows.reduce((s, r) => s + r.amount, 0);
  const unpaidRevenue = rows.filter((r) => r.paymentStatus === "unpaid").reduce((s, r) => s + r.amount, 0);
  const avgPartySize = totalBookings ? totalGuests / totalBookings : 0;
  const avgBookingValue = paidRows.length ? paidRevenue / paidRows.length : 0;
  const cancelled = rows.filter((r) => r.status === "CANCELLED").length;
  const noShow = rows.filter((r) => r.status === "NO_SHOW").length;

  // Daily series — every day in range, zero-filled.
  const days: string[] = [];
  const dFrom = new Date(`${from}T00:00:00`);
  const dTo = new Date(`${to}T00:00:00`);
  for (let d = new Date(dFrom); d <= dTo; d.setDate(d.getDate() + 1)) days.push(ymd(d));
  const dailySeries = days.map((date) => {
    const dayRows = rows.filter((r) => r.date === date);
    return {
      date,
      bookings: dayRows.length,
      guests: dayRows.reduce((s, r) => s + r.partySize, 0),
      revenue: dayRows.filter((r) => r.paymentStatus === "paid").reduce((s, r) => s + r.amount, 0),
    };
  });

  const countBy = (keyFn: (r: typeof rows[number]) => string) => {
    const m = new Map<string, number>();
    for (const r of rows) { const k = keyFn(r); m.set(k, (m.get(k) ?? 0) + 1); }
    return Array.from(m.entries()).map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
  };

  const statusMix = countBy((r) => r.status);
  const paymentMix = countBy((r) => r.paymentStatus);
  const sourceMix = countBy((r) => r.source || "online");

  const zoneMap = new Map<string, { count: number; revenue: number }>();
  for (const r of rows) {
    const z = zoneMap.get(r.zone) ?? { count: 0, revenue: 0 };
    z.count++;
    if (r.paymentStatus === "paid") z.revenue += r.amount;
    zoneMap.set(r.zone, z);
  }
  const zoneMix = Array.from(zoneMap.entries()).map(([zone, v]) => ({ zone, ...v })).sort((a, b) => b.count - a.count);

  const hourMap = new Map<number, number>();
  for (const r of rows) { const h = parseInt(r.time.slice(0, 2), 10); if (!Number.isNaN(h)) hourMap.set(h, (hourMap.get(h) ?? 0) + 1); }
  const hourMix = Array.from(hourMap.entries()).map(([hour, count]) => ({ hour, count })).sort((a, b) => a.hour - b.hour);

  const tableMap = new Map<string, number>();
  for (const r of rows) tableMap.set(r.tableId, (tableMap.get(r.tableId) ?? 0) + 1);
  const topTables = Array.from(tableMap.entries()).map(([tableId, count]) => ({ tableId, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  return NextResponse.json({
    data: {
      range: { from, to, days: days.length },
      summary: {
        totalBookings, totalGuests, avgPartySize, paidRevenue, unpaidRevenue,
        avgBookingValue, paidCount: paidRows.length, cancelled, noShow,
      },
      dailySeries, statusMix, paymentMix, sourceMix, zoneMix, hourMix, topTables,
    },
  });
}
