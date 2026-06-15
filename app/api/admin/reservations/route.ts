import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { TABLES } from "@/lib/data";
import { DEPOSIT_MNT } from "@/lib/payments";

export const dynamic = "force-dynamic";

/** List reservations with optional filters: status, paymentStatus, date, q. */
export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const u = new URL(req.url);
  const status = u.searchParams.get("status");
  const payment = u.searchParams.get("payment");
  const date = u.searchParams.get("date");
  const dateFrom = u.searchParams.get("dateFrom");
  const dateTo = u.searchParams.get("dateTo");
  const q = u.searchParams.get("q");

  const where: any = {};
  if (status && status !== "all") where.status = status;
  if (payment && payment !== "all") where.paymentStatus = payment;
  if (date) where.date = date;
  if (dateFrom || dateTo) where.date = { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) };
  if (q) {
    where.OR = [
      { tableId: { contains: q, mode: "insensitive" } },
      { guestName: { contains: q, mode: "insensitive" } },
      { guestPhone: { contains: q } },
      { user: { is: { name: { contains: q, mode: "insensitive" } } } },
      { user: { is: { email: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const items = await prisma.reservation.findMany({
    where,
    orderBy: [{ date: "desc" }, { time: "desc" }],
    take: 300,
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
      source: r.source,
      notes: r.notes,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
      guestName: r.guestName,
      guestPhone: r.guestPhone,
    })),
  });
}

/** Admin manually creates a reservation — walk-in, phone-in, or on-site. */
export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { tableId, partySize, date, time, guestName, guestPhone, source, notes, paymentStatus } = body ?? {};

  if (!tableId || !partySize || !date || !time) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!guestName?.trim()) return NextResponse.json({ error: "name_required" }, { status: 422 });

  const table = TABLES.find((t) => t.id === tableId);
  if (!table) return NextResponse.json({ error: "table_not_found" }, { status: 404 });
  if (partySize > table.seats) return NextResponse.json({ error: "exceeds_capacity" }, { status: 422 });

  try {
    const r = await prisma.reservation.create({
      data: {
        tableId,
        zone: table.zone,
        partySize,
        date,
        time,
        amount: DEPOSIT_MNT,
        source: source || "admin",
        notes: notes || null,
        guestName: guestName.trim(),
        guestPhone: guestPhone?.trim() || null,
        paymentStatus: paymentStatus || "unpaid",
      },
    });
    return NextResponse.json({ data: r }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return NextResponse.json({ error: "slot_taken" }, { status: 409 });
    console.error("[admin create reservation]", e);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
