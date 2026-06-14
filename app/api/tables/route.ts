import { NextResponse } from "next/server";
import { TABLES } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import type { Zone } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Returns tables for a zone with status resolved against live reservations.
 * Pass ?zone=&date=&time= to see availability for a specific slot.
 * Table layout itself is static config (no DB read); only the confirmed
 * reservations for the requested slot are queried.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const zone = url.searchParams.get("zone") as Zone | null;
  const date = url.searchParams.get("date");
  const time = url.searchParams.get("time");

  const reserved = new Set<string>();
  if (date && time) {
    const rows = await prisma.reservation.findMany({
      where: { status: "CONFIRMED", date, time },
      select: { tableId: true },
    });
    rows.forEach((r) => reserved.add(r.tableId));
  }

  const data = TABLES.filter((t) => !zone || t.zone === zone).map((t) => ({
    ...t,
    status: t.status === "occupied" ? "occupied" : reserved.has(t.id) ? "reserved" : t.status,
  }));

  return NextResponse.json({ data });
}
