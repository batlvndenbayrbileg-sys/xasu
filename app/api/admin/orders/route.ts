import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "preparing", "served", "completed", "cancelled"];

/** List food orders (newest first). Optional ?status= filter. */
export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const status = new URL(req.url).searchParams.get("status");
  const orders = await prisma.order.findMany({
    where: status && STATUSES.includes(status) ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ data: orders });
}

/** Update an order's kitchen status (or payment status for manual fixes). */
export async function PATCH(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const data: any = {};
  if (typeof b.status === "string" && STATUSES.includes(b.status)) data.status = b.status;
  if (typeof b.paymentStatus === "string" && ["unpaid", "paid", "refunded", "failed"].includes(b.paymentStatus)) data.paymentStatus = b.paymentStatus;
  if (Object.keys(data).length === 0) return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });

  const order = await prisma.order.update({ where: { id: String(b.id) }, data }).catch(() => null);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ data: order });
}
