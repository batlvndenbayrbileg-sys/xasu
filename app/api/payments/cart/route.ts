import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPaymentIntent, createCheckoutSession, WIRE_LIVE } from "@/lib/wire";
import { SITE_URL } from "@/lib/site";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

/** Cart checkout — creates a Wire PaymentIntent + hosted checkout for the cart total. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const { amount, items } = body ?? {};
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "bad_amount" }, { status: 400 });
  if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "empty_cart" }, { status: 400 });

  const idempotencyKey = `cart_${user.id}_${randomUUID().slice(0, 8)}`;

  try {
    const intent = await createPaymentIntent({
      amount,
      metadata: { userId: user.id, kind: "cart", items: JSON.stringify(items.slice(0, 50)) },
      idempotencyKey,
    });

    if (!WIRE_LIVE) {
      return NextResponse.json({
        data: { id: intent.id, status: intent.status, amount, mock: true, nextAction: intent.next_action ?? null },
      });
    }

    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("host");
    const origin = host ? `${proto}://${host}` : SITE_URL;

    const session = await createCheckoutSession({
      paymentIntentId: intent.id,
      successUrl: `${origin}/cart/success?intent=${intent.id}`,
      idempotencyKey: `${idempotencyKey}_sess`,
    });

    if (!session.url) return NextResponse.json({ error: "payment_failed" }, { status: 502 });

    return NextResponse.json({ data: { id: intent.id, amount, checkoutUrl: session.url, mock: false } });
  } catch (e: any) {
    console.error("[cart checkout]", { message: e?.message, status: e?.status });
    return NextResponse.json({ error: "payment_failed" }, { status: 502 });
  }
}
