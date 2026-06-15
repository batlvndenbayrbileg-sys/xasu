import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VALID_STATUS = ["CONFIRMED", "ARRIVED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
const VALID_PAYMENT = ["unpaid", "paid", "refunded", "failed"] as const;

/** Admin updates a reservation: status and/or paymentStatus. */
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
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "no_changes" }, { status: 400 });

  try {
    const r = await prisma.reservation.update({ where: { id: params.id }, data: patch });
    return NextResponse.json({ data: r });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
