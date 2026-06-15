import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** List reservations with optional filters: status, paymentStatus, date, q. */
export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const u = new URL(req.url);
  const status = u.searchParams.get("status");
  const payment = u.searchParams.get("payment");
  const date = u.searchParams.get("date");
  const q = u.searchParams.get("q");

  const where: any = {};
  if (status && status !== "all") where.status = status;
  if (payment && payment !== "all") where.paymentStatus = payment;
  if (date) where.date = date;
  if (q) {
    where.OR = [
      { tableId: { contains: q, mode: "insensitive" } },
      { user: { is: { name: { contains: q, mode: "insensitive" } } } },
      { user: { is: { email: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const items = await prisma.reservation.findMany({
    where,
    orderBy: [{ date: "desc" }, { time: "desc" }],
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json({
    data: items.map((r) => ({
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
  });
}
