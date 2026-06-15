import { NextResponse } from "next/server";
import { DISHES } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Public dish list. Hides any dish admin marked unavailable. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") as Category | null;

  // Admin overrides (only "unavailable" entries matter — default is available)
  const hidden = new Set(
    (await prisma.dishAvailability.findMany({ where: { available: false } }))
      .map((r) => r.dishId),
  );
  const visible = DISHES.filter((d) => !hidden.has(d.id));
  const data = category ? visible.filter((d) => d.category === category) : visible;
  return NextResponse.json({ data });
}
