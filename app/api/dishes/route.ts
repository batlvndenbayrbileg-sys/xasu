import { NextResponse } from "next/server";
import { DISHES } from "@/lib/data";
import type { Category } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") as Category | null;
  const data = category ? DISHES.filter((d) => d.category === category) : DISHES;
  return NextResponse.json({ data });
}
