import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Returns shifts in [from, to) range with payroll totals per employee.
 * Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD (defaults to last 7 days).
 */
export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const fromStr = url.searchParams.get("from");
  const toStr = url.searchParams.get("to");
  const now = new Date();
  const defaultFrom = new Date(now); defaultFrom.setDate(now.getDate() - 7);

  const from = fromStr ? new Date(`${fromStr}T00:00:00`) : defaultFrom;
  const to = toStr ? new Date(`${toStr}T23:59:59`) : now;

  const shifts = await prisma.shift.findMany({
    where: { clockIn: { gte: from, lt: to } },
    include: { employee: true },
    orderBy: { clockIn: "desc" },
  });

  // Per-employee totals (only closed shifts contribute payroll).
  const totals = new Map<string, { name: string; role: string; hourlyRate: number; minutes: number; pay: number; shifts: number }>();
  for (const s of shifts) {
    if (!s.clockOut) continue;
    const mins = Math.round((s.clockOut.getTime() - s.clockIn.getTime()) / 60_000);
    const t = totals.get(s.employeeId) ?? { name: s.employee.name, role: s.employee.role, hourlyRate: s.employee.hourlyRate, minutes: 0, pay: 0, shifts: 0 };
    t.minutes += mins;
    t.shifts += 1;
    t.pay = Math.round((t.minutes / 60) * t.hourlyRate);
    totals.set(s.employeeId, t);
  }

  return NextResponse.json({
    range: { from: from.toISOString(), to: to.toISOString() },
    totals: Array.from(totals.entries()).map(([id, v]) => ({ employeeId: id, ...v })),
    shifts: shifts.map((s) => ({
      id: s.id,
      employeeId: s.employeeId,
      employeeName: s.employee.name,
      clockIn: s.clockIn.toISOString(),
      clockOut: s.clockOut?.toISOString() ?? null,
      minutes: s.clockOut ? Math.round((s.clockOut.getTime() - s.clockIn.getTime()) / 60_000) : null,
      note: s.note,
    })),
  });
}

/** Admin-created shift (manual entry, e.g. fixing forgotten clock-ins). */
export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (!b.employeeId || !b.clockIn) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const data = await prisma.shift.create({
    data: {
      employeeId: String(b.employeeId),
      clockIn: new Date(b.clockIn),
      clockOut: b.clockOut ? new Date(b.clockOut) : null,
      note: b.note ? String(b.note).slice(0, 200) : null,
    },
  });
  return NextResponse.json({ data });
}
