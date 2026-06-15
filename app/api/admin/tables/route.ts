import { NextResponse } from "next/server";
import { getCurrentAdmin, requireManagerRole } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const a = await getCurrentAdmin();
  if (!a) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const tables = await prisma.table.findMany({ orderBy: [{ zone: "asc" }, { sortOrder: "asc" }] });
  return NextResponse.json({ data: tables });
}

export async function POST(req: Request) {
  const a = await requireManagerRole();
  if (!a) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { id, label, zone, shape, seats, x, y, rotation, position, image } = body ?? {};
  if (!id || !label || !zone || !shape || !seats) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  try {
    const t = await prisma.table.create({
      data: {
        id, label, zone, shape, seats: Number(seats),
        x: Number(x ?? 50), y: Number(y ?? 50), rotation: Number(rotation ?? 0),
        position: position ?? "", image: image ?? "",
      },
    });
    audit(a, "table.create", "table", t.id, null, t);
    return NextResponse.json({ data: t }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "id_taken" }, { status: 409 });
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}

/** Bulk position update — used by the floor editor drag. */
export async function PATCH(req: Request) {
  const a = await requireManagerRole();
  if (!a) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  if (!Array.isArray(body.positions)) return NextResponse.json({ error: "bad_body" }, { status: 400 });

  await Promise.all(
    body.positions.map((p: { id: string; x: number; y: number }) =>
      prisma.table.update({ where: { id: p.id }, data: { x: Number(p.x), y: Number(p.y) } }),
    ),
  );
  audit(a, "table.layout", "table", null, null, { count: body.positions.length });
  return NextResponse.json({ ok: true });
}
