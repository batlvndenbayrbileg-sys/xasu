import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { TABLES } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEPOSIT_MNT } from "@/lib/payments";

export const dynamic = "force-dynamic";

/** List the current user's reservations (most recent first). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const data = await prisma.reservation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data });
}

/**
 * Create a reservation. Concurrency-safe: the partial unique index on
 * (tableId, date, time) WHERE status=CONFIRMED guarantees only one writer wins
 * a contested slot — the loser's insert throws P2002, which we map to 409.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to book a table" }, { status: 401 });

  const body = await req.json();
  const { tableId, partySize, date, time } = body ?? {};
  if (!tableId || !partySize || !date || !time)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const table = TABLES.find((t) => t.id === tableId);
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });
  if (table.status === "occupied")
    return NextResponse.json({ error: "Table is currently occupied" }, { status: 409 });
  if (partySize > table.seats)
    return NextResponse.json({ error: "Party size exceeds table capacity" }, { status: 422 });

  try {
    const reservation = await prisma.reservation.create({
      data: { userId: user.id, tableId, zone: table.zone, partySize, date, time, amount: DEPOSIT_MNT },
    });
    return NextResponse.json({ data: { ...reservation, tableLabel: table.label } }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return NextResponse.json({ error: "That table is already booked for this slot" }, { status: 409 });
    throw e;
  }
}
