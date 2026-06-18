import { NextResponse } from "next/server";
import { DISHES } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Public dish list. Combines static catalog (lib/data.ts) with admin-added
 *  custom dishes from the database, respecting availability overrides. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") as Category | null;

  const [hiddenRows, customs] = await Promise.all([
    prisma.dishAvailability.findMany({ where: { available: false } }),
    prisma.customDish.findMany({ where: { available: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
  ]);
  const hidden = new Set(hiddenRows.map((r) => r.dishId));
  const visible = DISHES.filter((d) => !hidden.has(d.id));
  const customMapped = customs.map((c) => ({
    id: c.id, name: c.name, price: c.price, rating: c.rating, image: c.image,
    category: c.category as Category, calories: c.calories, prepMinutes: c.prepMinutes, description: c.description,
  }));
  const all = [...visible, ...customMapped];
  const data = category ? all.filter((d) => d.category === category) : all;
  return NextResponse.json({ data });
}
