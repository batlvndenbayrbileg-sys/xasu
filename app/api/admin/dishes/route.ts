import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Returns the availability override map (dishId → available). */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const rows = await prisma.dishAvailability.findMany();
  return NextResponse.json({
    data: Object.fromEntries(rows.map((r) => [r.dishId, r.available])),
  });
}

/** Upserts an availability override for a single dish. */
export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { dishId, available } = await req.json().catch(() => ({}));
  if (!dishId || typeof available !== "boolean") return NextResponse.json({ error: "bad_request" }, { status: 400 });
  await prisma.dishAvailability.upsert({
    where: { dishId },
    create: { dishId, available },
    update: { available },
  });
  return NextResponse.json({ ok: true });
}
