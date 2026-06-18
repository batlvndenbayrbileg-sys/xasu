import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const employees = await prisma.employee.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: { shifts: { where: { clockOut: null }, take: 1 } },
  });
  return NextResponse.json({
    data: employees.map((e) => ({
      id: e.id,
      name: e.name,
      pin: e.pin,
      role: e.role,
      hourlyRate: e.hourlyRate,
      active: e.active,
      isClockedIn: e.shifts.length > 0,
      currentShiftStart: e.shifts[0]?.clockIn ?? null,
    })),
  });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (!b.name || !b.pin) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (!/^\d{4,6}$/.test(String(b.pin))) return NextResponse.json({ error: "bad_pin" }, { status: 400 });
  const exists = await prisma.employee.findUnique({ where: { pin: String(b.pin) } });
  if (exists) return NextResponse.json({ error: "pin_taken" }, { status: 400 });
  const emp = await prisma.employee.create({
    data: {
      name: String(b.name).trim(),
      pin: String(b.pin),
      role: String(b.role ?? "staff"),
      hourlyRate: Number.isFinite(b.hourlyRate) ? Math.max(0, Math.round(b.hourlyRate)) : 0,
    },
  });
  return NextResponse.json({ data: emp });
}
