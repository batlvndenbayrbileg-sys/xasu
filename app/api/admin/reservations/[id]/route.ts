import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VALID_STATUS = ["CONFIRMED", "ARRIVED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
const VALID_PAYMENT = ["unpaid", "paid", "refunded", "failed"] as const;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const r = await prisma.reservation.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
  });
  if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ data: r });
}

/** Admin patch — status, paymentStatus, notes, partySize, date, time, tableId, guestName, guestPhone. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const patch: any = {};
  if (body.status) {
    if (!VALID_STATUS.includes(body.status)) return NextResponse.json({ error: "bad_status" }, { status: 400 });
    patch.status = body.status;
  }
  if (body.paymentStatus) {
    if (!VALID_PAYMENT.includes(body.paymentStatus)) return NextResponse.json({ error: "bad_payment" }, { status: 400 });
    patch.paymentStatus = body.paymentStatus;
  }
  if (typeof body.notes === "string") patch.notes = body.notes;
  if (typeof body.partySize === "number" && body.partySize > 0) patch.partySize = body.partySize;
  if (typeof body.date === "string") patch.date = body.date;
  if (typeof body.time === "string") patch.time = body.time;
  if (typeof body.tableId === "string") patch.tableId = body.tableId;
  if (typeof body.guestName === "string") patch.guestName = body.guestName;
  if (typeof body.guestPhone === "string") patch.guestPhone = body.guestPhone;

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "no_changes" }, { status: 400 });

  try {
    const r = await prisma.reservation.update({ where: { id: params.id }, data: patch });
    return NextResponse.json({ data: r });
  } catch (e: any) {
    console.error("[admin patch reservation]", e?.message);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    await prisma.reservation.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
