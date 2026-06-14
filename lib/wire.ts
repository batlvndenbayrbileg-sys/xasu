import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Wire Payment gateway client (https://api.wire.mn, docs: https://docs.wire.mn).
 * PaymentIntent + hosted Checkout Session, MNT integer (minor unit) amounts.
 *
 * Live mode requires WIRE_SECRET_KEY (sk_live_… or sk_test_…). Without it the
 * client runs in MOCK mode so the whole flow works in dev / on a demo deploy:
 * a mock intent is created with a QR next_action and auto-succeeds a few
 * seconds after creation.
 */

const BASE = "https://api.wire.mn/v1";
const KEY = process.env.WIRE_SECRET_KEY;
export const WIRE_LIVE = !!KEY;
export const WIRE_TEST_MODE = KEY?.startsWith("sk_test_") ?? false;

/** Operators allowed for checkout: sandbox in test mode, QPay in live mode. */
const ALLOWED_OPERATORS = WIRE_TEST_MODE ? ["sandbox"] : ["qpay"];

export type PaymentIntentStatus =
  | "new" | "requires_payment_method" | "requires_action"
  | "requires_capture" | "processing" | "succeeded" | "canceled";

export interface PaymentIntent {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  allowed_operators?: string[];
  next_action?: any;
  metadata?: Record<string, any>;
  livemode?: boolean;
  created?: number;
  expires_at?: number | null;
}

export interface CheckoutSession {
  id: string;
  object: "checkout.session";
  url: string;
  payment_intent: string;
}

class WireError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

/** Encode params Stripe-style: nested objects -> key[subkey], arrays -> key[]. */
function toForm(params: Record<string, any>): URLSearchParams {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) usp.append(`${key}[]`, String(item));
    } else if (typeof value === "object") {
      for (const [k, v] of Object.entries(value)) usp.append(`${key}[${k}]`, String(v));
    } else {
      usp.append(key, String(value));
    }
  }
  return usp;
}

async function wireFetch<T>(path: string, init: RequestInit & { idempotencyKey?: string } = {}): Promise<T> {
  const headers: Record<string, string> = { Authorization: `Bearer ${KEY}` };
  if (init.body instanceof URLSearchParams) headers["Content-Type"] = "application/x-www-form-urlencoded";
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
    operator: "sandbox",
    // realistic-looking QR for the demo (not a real payment QR)
    qr_image: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent("wire:mock:" + id)}`,
    qr_text: "wire:mock:" + id,
  };
}
function mockIntent(amount: number, metadata: Record<string, any>): PaymentIntent {
  const ts = Date.now();
  const id = `pi_mock_${ts}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id, object: "payment_intent", amount, currency: "MNT",
    status: "requires_action", allowed_operators: ["sandbox"],
    next_action: mockQrFor(id), metadata, livemode: false, created: Math.floor(ts / 1000),
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
    body: toForm({
      amount: opts.amount, currency: "MNT",
      allowed_operators: ALLOWED_OPERATORS,
      metadata: opts.metadata ?? {},
    }),
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

/** Create a hosted checkout session for a PaymentIntent. Returns a `pay.wire.mn/c/{token}` URL. */
export async function createCheckoutSession(opts: {
  paymentIntentId: string; successUrl?: string; idempotencyKey: string;
}): Promise<CheckoutSession> {
  if (!WIRE_LIVE) {
    return { id: `cs_mock_${randomUUID()}`, object: "checkout.session", url: "", payment_intent: opts.paymentIntentId };
  }
  return wireFetch<CheckoutSession>("/checkout/sessions", {
    method: "POST",
    idempotencyKey: opts.idempotencyKey,
    body: toForm({ payment_intent: opts.paymentIntentId, success_url: opts.successUrl }),
  });
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
