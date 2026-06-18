import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const data: any = {};
  for (const k of ["name", "description", "category", "image"]) if (typeof b[k] === "string") data[k] = b[k].trim();
  for (const k of ["price", "calories", "prepMinutes", "rating"]) if (typeof b[k] === "number") data[k] = b[k];
  if (typeof b.available === "boolean") data.available = b.available;
  if (typeof b.sortOrder === "number") data.sortOrder = b.sortOrder;
  const dish = await prisma.customDish.update({ where: { id: params.id }, data }).catch(() => null);
  if (!dish) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ data: dish });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await prisma.customDish.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
