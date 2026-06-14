import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Wire Payment gateway client (https://api.wire.mn).
 * Stripe-style PaymentIntents, MNT integer amounts, QPay operator.
 *
 * Live mode requires WIRE_SECRET_KEY (sk_live_…). Without it the client runs in
 * MOCK mode so the whole flow works in dev / on a demo deploy: a mock intent is
 * created with a QR next_action and auto-succeeds a few seconds after confirm.
 */

const BASE = "https://api.wire.mn/v1";
const KEY = process.env.WIRE_SECRET_KEY;
export const WIRE_LIVE = !!KEY;

export type PaymentIntentStatus =
  | "new" | "requires_payment_method" | "requires_action"
  | "requires_capture" | "processing" | "succeeded" | "canceled";

export interface PaymentIntent {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  client_secret?: string;
  automatic_operator?: boolean;
  allowed_operators?: string[];
  selected_operator?: string | null;
  next_action?: any;
  metadata?: Record<string, any>;
  livemode?: boolean;
  created?: number;
  expires_at?: number | null;
}

class WireError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

async function wireFetch<T>(path: string, init: RequestInit & { idempotencyKey?: string } = {}): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
  };
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;
  const res = await fetch(`${BASE}${path}`, { ...init, headers, cache: "no-store" });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = body?.error?.message || `Wire request failed (${res.status})`;
    throw new WireError(msg, res.status);
  }
  return body as T;
}

/* ───────────────── mock mode ───────────────── */
function mockQrFor(id: string) {
  return {
    type: "qr",
    operator: "qpay",
    // realistic-looking QR for the demo (not a real payment QR)
    qr_image: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent("wire:mock:" + id)}`,
    qr_text: "wire:mock:" + id,
  };
}
function mockIntent(amount: number, metadata: Record<string, any>): PaymentIntent {
  const ts = Date.now();
  return {
    id: `pi_mock_${ts}_${Math.random().toString(36).slice(2, 8)}`,
    object: "payment_intent", amount, currency: "MNT",
    status: "requires_action", client_secret: `cs_mock_${randomUUID()}`,
    automatic_operator: true, allowed_operators: ["qpay"], selected_operator: "qpay",
    next_action: mockQrFor("init"), metadata, livemode: false, created: Math.floor(ts / 1000),
    expires_at: Math.floor(ts / 1000) + 900,
  };
}
/** mock intents auto-succeed 5s after creation (simulates the user scanning + paying). */
function mockStatusFromId(id: string): PaymentIntentStatus {
  const m = id.match(/^pi_mock_(\d+)_/);
  if (!m) return "succeeded";
  return Date.now() - Number(m[1]) > 5000 ? "succeeded" : "processing";
}

/* ───────────────── public API ───────────────── */
export async function createPaymentIntent(opts: {
  amount: number; metadata?: Record<string, any>; idempotencyKey: string;
}): Promise<PaymentIntent> {
  if (!WIRE_LIVE) return mockIntent(opts.amount, opts.metadata ?? {});
  return wireFetch<PaymentIntent>("/payment_intents", {
    method: "POST",
    idempotencyKey: opts.idempotencyKey,
    body: JSON.stringify({
      amount: opts.amount, currency: "MNT",
      automatic_operator: true, allowed_operators: ["qpay"],
      metadata: opts.metadata ?? {},
    }),
  });
}

export async function confirmPaymentIntent(id: string, opts: {
  operator?: string; return_url?: string; idempotencyKey: string;
}): Promise<PaymentIntent> {
  if (!WIRE_LIVE) {
    return { ...mockIntent(0, {}), id, status: "requires_action", next_action: mockQrFor(id) };
  }
  return wireFetch<PaymentIntent>(`/payment_intents/${id}/confirm`, {
    method: "POST",
    idempotencyKey: opts.idempotencyKey,
    body: JSON.stringify({ operator: opts.operator ?? "qpay", return_url: opts.return_url }),
  });
}

export async function getPaymentIntent(id: string): Promise<PaymentIntent> {
  if (!WIRE_LIVE) {
    return { ...mockIntent(0, {}), id, status: mockStatusFromId(id), next_action: mockQrFor(id) };
  }
  return wireFetch<PaymentIntent>(`/payment_intents/${id}`, { method: "GET" });
}

export async function cancelPaymentIntent(id: string): Promise<PaymentIntent> {
  if (!WIRE_LIVE) return { ...mockIntent(0, {}), id, status: "canceled" };
  return wireFetch<PaymentIntent>(`/payment_intents/${id}/cancel`, { method: "POST" });
}

/** Verify a webhook signature: header `t=<ts>,v1=<hmac>`, signed payload `${t}.${rawBody}`. */
export function verifyWireSignature(rawBody: string, sigHeader: string | null, secret: string | undefined): boolean {
  if (!sigHeader || !secret) return false;
  const parts = Object.fromEntries(sigHeader.split(",").map((kv) => kv.split("=").map((s) => s.trim()) as [string, string]));
  const t = parts["t"]; const v1 = parts["v1"];
  if (!t || !v1) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  try {
    const a = Buffer.from(v1); const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch { return false; }
}

export const WIRE_WEBHOOK_IP = "65.109.117.186";
