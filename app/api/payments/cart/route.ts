import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentIntent, createCheckoutSession, WIRE_LIVE } from "@/lib/wire";
import { priceCart, isValidTable } from "@/lib/orders";
import { SITE_URL } from "@/lib/site";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

/**
 * Cart checkout — prices the cart SERVER-SIDE, persists an Order the kitchen
 * can fulfil, then creates a Wire PaymentIntent + hosted checkout for the total.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const { items, tableId, note } = body ?? {};
  if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  if (!isValidTable(tableId)) return NextResponse.json({ error: "missing_table" }, { status: 400 });

  // Never trust client prices — re-price from the catalog/DB.
  const { lines, subtotal, serviceFee, total } = await priceCart(items);
  if (lines.length === 0 || total <= 0) return NextResponse.json({ error: "empty_cart" }, { status: 400 });

  const idempotencyKey = `cart_${user.id}_${randomUUID().slice(0, 8)}`;

  try {
    const intent = await createPaymentIntent({
      amount: total,
      metadata: { userId: user.id, kind: "cart", tableId, items: JSON.stringify(lines.slice(0, 50)) },
      idempotencyKey,
    });

    // Persist the order. Mock mode has no webhook, so treat it as paid for the demo.
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        tableId,
        items: lines as unknown as object,
        subtotal,
        serviceFee,
        amount: total,
        paymentIntentId: intent.id,
        paymentStatus: WIRE_LIVE ? "unpaid" : "paid",
        source: "qr",
        note: typeof note === "string" ? note.slice(0, 200) : null,
      },
    });

    if (!WIRE_LIVE) {
      return NextResponse.json({
        data: { id: intent.id, orderId: order.id, status: intent.status, amount: total, mock: true, nextAction: intent.next_action ?? null },
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

    return NextResponse.json({ data: { id: intent.id, orderId: order.id, amount: total, checkoutUrl: session.url, mock: false } });
  } catch (e: any) {
    console.error("[cart checkout]", { message: e?.message, status: e?.status });
    return NextResponse.json({ error: "payment_failed" }, { status: 502 });
  }
}
