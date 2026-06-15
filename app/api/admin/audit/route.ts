import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const u = new URL(req.url);
  const entity = u.searchParams.get("entity");
  const entityId = u.searchParams.get("entityId");
  const where: any = {};
  if (entity) where.entity = entity;
  if (entityId) where.entityId = entityId;

  const items = await prisma.auditEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ data: items });
}
