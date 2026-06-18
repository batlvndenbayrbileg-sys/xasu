import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Public terminal endpoint: employee enters their PIN to clock in or out.
 * No admin session required — the terminal device is physically supervised.
 *
 * Behavior:
 *  - PIN unknown → 404
 *  - Already has an open shift → close it (clock out) and return shift duration
 *  - No open shift → open a new one (clock in)
 */
export async function POST(req: Request) {
  const { pin, note } = await req.json().catch(() => ({}));
  if (!pin || typeof pin !== "string") return NextResponse.json({ error: "bad_pin" }, { status: 400 });

  const employee = await prisma.employee.findUnique({ where: { pin } });
  if (!employee || !employee.active) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const openShift = await prisma.shift.findFirst({
    where: { employeeId: employee.id, clockOut: null },
    orderBy: { clockIn: "desc" },
  });

  if (openShift) {
    const now = new Date();
    const updated = await prisma.shift.update({
      where: { id: openShift.id },
      data: { clockOut: now, note: note ? String(note).slice(0, 200) : openShift.note },
    });
    const durationMinutes = Math.round((now.getTime() - updated.clockIn.getTime()) / 60_000);
    return NextResponse.json({
      action: "clock_out",
      employee: { id: employee.id, name: employee.name, role: employee.role },
      durationMinutes,
    });
  }

  const shift = await prisma.shift.create({
    data: { employeeId: employee.id, clockIn: new Date(), note: note ? String(note).slice(0, 200) : null },
  });
  return NextResponse.json({
    action: "clock_in",
    employee: { id: employee.id, name: employee.name, role: employee.role },
    shiftId: shift.id,
  });
}
