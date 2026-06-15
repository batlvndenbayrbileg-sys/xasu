import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Customer list with aggregated stats: visits, spend, last visit.
 *  Includes both registered users (with at least one reservation) and
 *  walk-in guests identified by guestPhone. */
export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const u = new URL(req.url);
  const q = u.searchParams.get("q")?.trim();

  // Registered users with at least one reservation
  const users = await prisma.user.findMany({
    where: {
      reservations: { some: {} },
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
    },
    include: {
      reservations: { select: { amount: true, paymentStatus: true, date: true, status: true } },
    },
    take: 200,
  });

  const registered = users.map((u) => {
    const r = u.reservations;
    const visits = r.filter((x) => x.status === "COMPLETED" || x.status === "ARRIVED").length;
    const spend = r.filter((x) => x.paymentStatus === "paid").reduce((s, x) => s + x.amount, 0);
    const lastVisit = r.map((x) => x.date).sort().pop() ?? null;
    return {
      kind: "user" as const,
      id: u.id,
      name: u.name,
      email: u.email,
      phone: null as string | null,
      visits,
      spend,
      lastVisit,
      bookings: r.length,
      createdAt: u.createdAt.toISOString(),
    };
  });

  // Walk-in guests (no userId, group by phone)
  const walkInRes = await prisma.reservation.findMany({
    where: {
      userId: null,
      guestPhone: { not: null },
      ...(q ? { OR: [{ guestName: { contains: q, mode: "insensitive" } }, { guestPhone: { contains: q } }] } : {}),
    },
    select: { guestName: true, guestPhone: true, amount: true, paymentStatus: true, date: true, status: true, createdAt: true },
  });
  const phoneMap = new Map<string, typeof registered[0]>();
  for (const r of walkInRes) {
    const key = r.guestPhone!;
    const ex = phoneMap.get(key);
    const isVisit = r.status === "COMPLETED" || r.status === "ARRIVED";
    const isPaid = r.paymentStatus === "paid";
    if (ex) {
      ex.visits += isVisit ? 1 : 0;
      ex.spend += isPaid ? r.amount : 0;
      ex.bookings += 1;
      if (!ex.lastVisit || r.date > ex.lastVisit) ex.lastVisit = r.date;
    } else {
      phoneMap.set(key, {
        kind: "user",
        id: `walkin:${key}`,
        name: r.guestName ?? "Guest",
        email: "",
        phone: key,
        visits: isVisit ? 1 : 0,
        spend: isPaid ? r.amount : 0,
        lastVisit: r.date,
        bookings: 1,
        createdAt: r.createdAt.toISOString(),
      });
    }
  }

  const all = [...registered, ...Array.from(phoneMap.values())].sort((a, b) => (b.lastVisit ?? "").localeCompare(a.lastVisit ?? ""));
  return NextResponse.json({ data: all });
}
