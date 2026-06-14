import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWireSignature, WIRE_WEBHOOK_IP } from "@/lib/wire";
import { clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Wire webhook receiver.
 * - Verifies the source IP (65.109.117.186) and HMAC-SHA256 signature.
 * - On payment_intent.succeeded, marks the reservation paid.
 * Webhooks are optional (Wire confirms payment regardless), but give instant updates.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const ip = clientIp(req);

  // IP allowlist (skip in dev when no secret configured)
  const secret = process.env.WIRE_WEBHOOK_SECRET;
  if (secret) {
    if (ip !== WIRE_WEBHOOK_IP)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!verifyWireSignature(raw, req.headers.get("WirePayment-Signature"), secret))
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: "Bad payload" }, { status: 400 }); }

  // Respond 2xx to the verification ping immediately.
  if (event?.type === "ping" || !event?.type) return NextResponse.json({ received: true });

  try {
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data?.object ?? event.data;
      const reservationId = intent?.metadata?.reservationId;
      const intentId = intent?.id;
      if (reservationId) {
        await prisma.reservation.updateMany({
          where: { id: reservationId, paymentStatus: { not: "paid" } },
          data: { paymentStatus: "paid" },
        });
      } else if (intentId) {
        await prisma.reservation.updateMany({
          where: { paymentIntentId: intentId, paymentStatus: { not: "paid" } },
          data: { paymentStatus: "paid" },
        });
      }
    } else if (event.type === "payment_intent.canceled") {
      const intentId = event.data?.object?.id ?? event.data?.id;
      if (intentId) {
        await prisma.reservation.updateMany({
          where: { paymentIntentId: intentId, paymentStatus: "unpaid" },
          data: { paymentStatus: "failed" },
        });
      }
    }
  } catch {
    // swallow — Wire will retry; never 5xx a verified webhook we already parsed
  }

  return NextResponse.json({ received: true });
}
