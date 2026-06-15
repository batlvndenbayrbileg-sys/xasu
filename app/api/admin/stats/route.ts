import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Dashboard stats: today / week reservation counts, revenue, status mix. */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [todayCount, weekCount, paidToday, paidWeek, statusGroups, recent, paymentGroups] = await Promise.all([
    prisma.reservation.count({ where: { date: today } }),
    prisma.reservation.count({ where: { date: { gte: weekAgo } } }),
    prisma.reservation.aggregate({
      _sum: { amount: true },
      where: { date: today, paymentStatus: "paid" },
    }),
    prisma.reservation.aggregate({
      _sum: { amount: true },
      where: { date: { gte: weekAgo }, paymentStatus: "paid" },
    }),
    prisma.reservation.groupBy({
      by: ["status"],
      _count: true,
      where: { date: { gte: weekAgo } },
    }),
    prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.reservation.groupBy({
      by: ["paymentStatus"],
      _count: true,
      where: { date: { gte: weekAgo } },
    }),
  ]);

  // Daily revenue for last 7 days (in MNT, paid only)
  const dailyRevenue: { date: string; total: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const agg = await prisma.reservation.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { date: d, paymentStatus: "paid" },
    });
    dailyRevenue.push({ date: d, total: agg._sum.amount ?? 0, count: agg._count });
  }

  return NextResponse.json({
    data: {
      todayCount,
      weekCount,
      revenueToday: paidToday._sum.amount ?? 0,
      revenueWeek: paidWeek._sum.amount ?? 0,
      statusMix: statusGroups.map((g) => ({ status: g.status, count: g._count })),
      paymentMix: paymentGroups.map((g) => ({ status: g.paymentStatus, count: g._count })),
      dailyRevenue,
      recent: recent.map((r) => ({
        id: r.id,
        tableId: r.tableId,
        zone: r.zone,
        date: r.date,
        time: r.time,
        partySize: r.partySize,
        status: r.status,
        paymentStatus: r.paymentStatus,
        amount: r.amount,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
      })),
    },
  });
}
