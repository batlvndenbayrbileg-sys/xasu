import { NextResponse } from "next/server";
import { requireManagerRole } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { refundPaymentIntent } from "@/lib/wire";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** Issue a Wire refund for a paid reservation, then mark refunded.
 *  Falls back to local mark-only if Wire returns an error. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const a = await requireManagerRole();
  if (!a) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { reason } = await req.json().catch(() => ({}));

  const r = await prisma.reservation.findUnique({ where: { id: params.id } });
  if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (r.paymentStatus !== "paid") return NextResponse.json({ error: "not_paid" }, { status: 422 });

  let refundResult: any = null;
  let wireError: string | null = null;

  if (r.paymentIntentId && !r.paymentIntentId.startsWith("pi_mock_")) {
    try {
      refundResult = await refundPaymentIntent({
        paymentIntentId: r.paymentIntentId,
        amount: r.amount,
        reason: reason || "requested_by_customer",
        idempotencyKey: `re_${r.id}`,
      });
    } catch (e: any) {
      wireError = e?.message ?? "wire_failed";
      console.error("[admin refund] wire error", wireError);
    }
  }

  const updated = await prisma.reservation.update({
    where: { id: params.id },
    data: { paymentStatus: "refunded", status: r.status === "CONFIRMED" ? "CANCELLED" : r.status },
  });
  audit(a, "reservation.refund", "reservation", r.id, r, { ...updated, refundResult, wireError });

  return NextResponse.json({
    data: { reservation: updated, refund: refundResult, wireError },
  });
}
