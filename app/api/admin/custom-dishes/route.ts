import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const data = await prisma.customDish.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (!b.name || !b.category || typeof b.price !== "number") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const data = await prisma.customDish.create({
    data: {
      name: String(b.name).trim(),
      description: String(b.description ?? "").trim(),
      price: Number(b.price),
      category: String(b.category),
      image: String(b.image ?? "").trim() || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=70",
      calories: Number.isFinite(b.calories) ? Math.max(0, Math.round(b.calories)) : 0,
      prepMinutes: Number.isFinite(b.prepMinutes) ? Math.max(1, Math.round(b.prepMinutes)) : 10,
      rating: Number.isFinite(b.rating) ? Math.min(5, Math.max(0, b.rating)) : 4.7,
      available: b.available !== false,
    },
  });
  return NextResponse.json({ data });
}
