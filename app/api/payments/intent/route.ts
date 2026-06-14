import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentIntent, createCheckoutSession, getPaymentIntent, WIRE_LIVE } from "@/lib/wire";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Create (and dispatch) a deposit PaymentIntent for a reservation. Idempotent. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let reservationId: string | undefined;
  try {
    ({ reservationId } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!reservationId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, userId: user.id },
  });
  if (!reservation) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (reservation.paymentStatus === "paid")
    return NextResponse.json({ data: { status: "succeeded", paymentStatus: "paid", amount: reservation.amount } });

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

    if (intent.status === "succeeded") {
      if (reservation.paymentStatus !== "paid") {
        await prisma.reservation.update({ where: { id: reservation.id }, data: { paymentStatus: "paid" } });
      }
      return NextResponse.json({ data: { status: "succeeded", paymentStatus: "paid", amount: reservation.amount, mock: !WIRE_LIVE } });
    }

    // Mock mode: inline QR, no hosted checkout exists.
    if (!WIRE_LIVE) {
      return NextResponse.json({
        data: { id: intent.id, status: intent.status, amount: reservation.amount, nextAction: intent.next_action ?? null, mock: true },
      });
    }

    // Live/test mode: create a hosted checkout session and send the user there.
    // Build the return URL from the *actual* request origin so the user always
    // lands back on the same domain they paid from (keeps the session cookie
    // valid). Falls back to SITE_URL if headers are unavailable.
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("host");
    const origin = host ? `${proto}://${host}` : SITE_URL;
    const session = await createCheckoutSession({
      paymentIntentId: intent.id,
      successUrl: `${origin}/pay?r=${reservation.id}&return=1`,
      idempotencyKey: `sess_${reservation.id}`,
    });

    if (!session.url) {
      console.error("[payments/intent POST] empty checkout url", { reservationId, intent: intent.id });
      return NextResponse.json({ error: "payment_failed" }, { status: 502 });
    }

    return NextResponse.json({
      data: { id: intent.id, status: intent.status, amount: reservation.amount, checkoutUrl: session.url, mock: false },
    });
  } catch (e: any) {
    // Log the real upstream error (visible in Vercel logs) but never leak
    // gateway-internal messages to the client.
    console.error("[payments/intent POST]", { reservationId, message: e?.message, status: e?.status });
    return NextResponse.json({ error: "payment_failed" }, { status: 502 });
  }
}

/** Poll a reservation's deposit status; flips reservation to paid on success. */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const reservationId = new URL(req.url).searchParams.get("reservationId");
  if (!reservationId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const reservation = await prisma.reservation.findFirst({ where: { id: reservationId, userId: user.id } });
  if (!reservation) return NextResponse.json({ error: "not_found" }, { status: 404 });
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
    console.error("[payments/intent GET]", { reservationId, message: e?.message, status: e?.status });
    return NextResponse.json({ error: "payment_failed" }, { status: 502 });
  }
}
