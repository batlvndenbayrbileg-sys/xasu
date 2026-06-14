import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentIntent, confirmPaymentIntent, getPaymentIntent, WIRE_LIVE } from "@/lib/wire";
import { DEFAULT_OPERATOR } from "@/lib/payments";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Create (and dispatch) a deposit PaymentIntent for a reservation. Idempotent. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { reservationId } = await req.json();
  if (!reservationId) return NextResponse.json({ error: "reservationId required" }, { status: 400 });

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, userId: user.id },
  });
  if (!reservation) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  if (reservation.paymentStatus === "paid")
    return NextResponse.json({ data: { status: "succeeded", paymentStatus: "paid" } });

  try {
    // Reuse the existing intent if one was already created (idempotent retries).
    let intent = reservation.paymentIntentId
      ? await getPaymentIntent(reservation.paymentIntentId)
      : await createPaymentIntent({
          amount: reservation.amount,
          metadata: { reservationId: reservation.id, userId: user.id },
          idempotencyKey: `res_${reservation.id}`,
        });

    if (!reservation.paymentIntentId) {
      await prisma.reservation.update({ where: { id: reservation.id }, data: { paymentIntentId: intent.id } });
    }

    // Dispatch to the operator (QPay) to obtain the QR next_action.
    if (intent.status === "new" || intent.status === "requires_payment_method") {
      intent = await confirmPaymentIntent(intent.id, {
        operator: DEFAULT_OPERATOR,
        return_url: `${SITE_URL}/pay?r=${reservation.id}`,
        idempotencyKey: `confirm_${reservation.id}`,
      });
    }

    return NextResponse.json({
      data: {
        id: intent.id,
        status: intent.status,
        amount: reservation.amount,
        nextAction: intent.next_action ?? null,
        clientSecret: intent.client_secret ?? null,
        mock: !WIRE_LIVE,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Payment error" }, { status: 502 });
  }
}

/** Poll a reservation's deposit status; flips reservation to paid on success. */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const reservationId = new URL(req.url).searchParams.get("reservationId");
  if (!reservationId) return NextResponse.json({ error: "reservationId required" }, { status: 400 });

  const reservation = await prisma.reservation.findFirst({ where: { id: reservationId, userId: user.id } });
  if (!reservation) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  if (reservation.paymentStatus === "paid")
    return NextResponse.json({ data: { status: "succeeded", paymentStatus: "paid" } });
  if (!reservation.paymentIntentId)
    return NextResponse.json({ data: { status: "new", paymentStatus: "unpaid" } });

  try {
    const intent = await getPaymentIntent(reservation.paymentIntentId);
    if (intent.status === "succeeded" && reservation.paymentStatus !== "paid") {
      await prisma.reservation.update({ where: { id: reservation.id }, data: { paymentStatus: "paid" } });
    }
    return NextResponse.json({
      data: { status: intent.status, paymentStatus: intent.status === "succeeded" ? "paid" : reservation.paymentStatus },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Payment error" }, { status: 502 });
  }
}
