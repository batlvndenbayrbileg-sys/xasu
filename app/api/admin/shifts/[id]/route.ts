import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const data: any = {};
  if (typeof b.clockIn === "string") data.clockIn = new Date(b.clockIn);
  if (b.clockOut === null) data.clockOut = null;
  else if (typeof b.clockOut === "string") data.clockOut = new Date(b.clockOut);
  if (typeof b.note === "string") data.note = b.note;
  const updated = await prisma.shift.update({ where: { id: params.id }, data }).catch(() => null);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await prisma.shift.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
