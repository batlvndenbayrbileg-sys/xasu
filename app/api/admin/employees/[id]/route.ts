import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const data: any = {};
  if (typeof b.name === "string") data.name = b.name.trim();
  if (typeof b.role === "string") data.role = b.role;
  if (typeof b.hourlyRate === "number") data.hourlyRate = Math.max(0, Math.round(b.hourlyRate));
  if (typeof b.active === "boolean") data.active = b.active;
  if (typeof b.pin === "string") {
    if (!/^\d{4,6}$/.test(b.pin)) return NextResponse.json({ error: "bad_pin" }, { status: 400 });
    // Reject if another employee already uses this PIN (PINs must be unique).
    const clash = await prisma.employee.findUnique({ where: { pin: b.pin } });
    if (clash && clash.id !== params.id) return NextResponse.json({ error: "pin_taken" }, { status: 400 });
    data.pin = b.pin;
  }
  const emp = await prisma.employee.update({ where: { id: params.id }, data }).catch(() => null);
  if (!emp) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ data: emp });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await prisma.employee.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
