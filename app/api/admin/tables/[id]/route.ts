import { NextResponse } from "next/server";
import { requireManagerRole } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const a = await requireManagerRole();
  if (!a) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const allowed = ["label", "zone", "shape", "seats", "x", "y", "rotation", "position", "image", "disabled", "sortOrder"];
  const patch: any = {};
  for (const k of allowed) if (body[k] !== undefined) patch[k] = body[k];
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "no_changes" }, { status: 400 });

  try {
    const before = await prisma.table.findUnique({ where: { id: params.id } });
    const t = await prisma.table.update({ where: { id: params.id }, data: patch });
    audit(a, "table.update", "table", t.id, before, t);
    return NextResponse.json({ data: t });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const a = await requireManagerRole();
  if (!a) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const before = await prisma.table.findUnique({ where: { id: params.id } });
    await prisma.table.delete({ where: { id: params.id } });
    audit(a, "table.delete", "table", params.id, before, null);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
