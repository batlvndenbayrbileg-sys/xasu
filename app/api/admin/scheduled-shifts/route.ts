import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const where: any = {};
  if (from || to) where.date = { gte: from ?? undefined, lte: to ?? undefined };
  const data = await prisma.scheduledShift.findMany({
    where,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    include: { employee: { select: { id: true, name: true, role: true } } },
  });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (!b.employeeId || !b.date || !b.startTime || !b.endTime) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const data = await prisma.scheduledShift.create({
    data: {
      employeeId: String(b.employeeId),
      date: String(b.date),
      startTime: String(b.startTime),
      endTime: String(b.endTime),
      notes: b.notes ? String(b.notes).slice(0, 200) : null,
    },
  });
  return NextResponse.json({ data });
}
