# Wire Payment системийг өөр вэбсайтад холбох гарын авлага

Энэ нь Xasu төсөл дээр хийгдсэн **Wire Payment** (https://wire.mn) интеграцийн бүрэн хураангуй.
Аль ч Next.js (App Router) төсөлд хуулж тавихад ажиллахаар бичсэн. Зарчим нь Stripe-тэй
яг адил: **PaymentIntent → Hosted Checkout → Webhook**.

---

## 1. Том зураг — төлбөрийн урсгал

```
Хэрэглэгч "Төлөх" дарна
        │
        ▼
[Таны backend]  POST /api/payments/intent
        │   1. Захиалга/сагсаа DB-д үүсгэнэ (paymentStatus = "unpaid")
        │   2. Wire-д PaymentIntent үүсгэнэ (createPaymentIntent)
        │   3. Hosted Checkout session үүсгэнэ (createCheckoutSession)
        │   4. session.url буцаана
        ▼
Frontend  window.location.href = checkoutUrl
        │
        ▼
pay.wire.mn  ← хэрэглэгч QPay/картаар төлнө
        │
        ├──(A)──► successUrl руу буцаана  → /pay?r=... эсвэл /cart/success
        │           backend status-аа дахин шалгаад "paid" болгоно
        │
        └──(B)──► Wire webhook → POST /api/webhooks/wire
                    payment_intent.succeeded → DB-д "paid" болгоно
```

> **Чухал:** (A) болон (B) **хоёулаа** төлбөрийг баталгаажуулдаг. Webhook найдвартай
> (хэрэглэгч хуудсаа хаасан ч ирнэ), success redirect нь хурдан (шууд UI шинэчилнэ).
> Хоёуланг нь хийвэл хамгийн найдвартай. Аль аль нь `paymentStatus != "paid"` гэсэн
> нөхцөлтэйгөөр шинэчилдэг тул **давхар тооцогдохгүй (idempotent)**.

---

## 2. Орчны хувьсагч (Environment variables)

`.env` (эсвэл Vercel → Settings → Environment Variables):

```bash
# Wire-ийн нууц түлхүүр. sk_test_… = тест, sk_live_… = бодит.
# Огт байхгүй бол кодыг MOCK горимд оруулна (доор үз).
WIRE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxx

# Webhook-ийн гарын үсэг шалгах нууц (Wire dashboard-аас авна).
WIRE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx

# Таны сайтын бодит домэйн (redirect URL зөв болгоход).
NEXT_PUBLIC_SITE_URL=https://tanaisajt.mn
```

`lib/site.ts`:
```ts
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
```

---

## 3. Wire client — `lib/wire.ts` (хуулж тавь)

Энэ бол гол файл. Wire API-тай ярьдаг бүх логик энд байна. **Бараг өөрчлөлтгүйгээр**
хуулж болно. Гол функцууд:

| Функц | Үүрэг |
|---|---|
| `createPaymentIntent({ amount, metadata, idempotencyKey })` | Төлбөрийн санаа үүсгэх (MNT, бүхэл тоо) |
| `getPaymentIntent(id)` | Төлөв шалгах (polling) |
| `createCheckoutSession({ paymentIntentId, successUrl, idempotencyKey })` | `pay.wire.mn/c/…` hosted хуудас үүсгэх |
| `cancelPaymentIntent(id)` | Цуцлах |
| `refundPaymentIntent({ paymentIntentId, amount?, reason? })` | Буцаалт |
| `verifyWireSignature(rawBody, sigHeader, secret)` | Webhook-ийн HMAC шалгах |

**Гол санаанууд:**
- `BASE = "https://api.wire.mn/v1"` — REST endpoint.
- Header: `Authorization: Bearer <WIRE_SECRET_KEY>`.
- **Idempotency-Key** header заавал — сүлжээ тасарч давтан илгээгдсэн ч давхар
  төлбөр үүсэхгүй. Жишээ нь захиалга бүрт `res_<id>` гэх тогтмол түлхүүр өг.
- Дүн нь **MNT-ийн бүхэл тоо** (₮20,000 = `20000`). Бутархай байж болохгүй.
- `allowed_operators`: тест горимд `["sandbox"]`, бодит горимд `["qpay"]`.

```ts
import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";

const BASE = "https://api.wire.mn/v1";
const KEY = process.env.WIRE_SECRET_KEY;
export const WIRE_LIVE = !!KEY;                              // түлхүүргүй → mock
export const WIRE_TEST_MODE = KEY?.startsWith("sk_test_") ?? false;
const ALLOWED_OPERATORS = WIRE_TEST_MODE ? ["sandbox"] : ["qpay"];

async function wireFetch<T>(path: string, init: any = {}): Promise<T> {
  const headers: Record<string, string> = { Authorization: `Bearer ${KEY}` };
  let body: string | undefined;
  if (init.json) { headers["Content-Type"] = "application/json"; body = JSON.stringify(init.json); }
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;
  const res = await fetch(`${BASE}${path}`, { ...init, body, headers, cache: "no-store" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message || `Wire failed (${res.status})`);
  return data as T;
}

export async function createPaymentIntent(opts: {
  amount: number; metadata?: Record<string, any>; idempotencyKey: string;
}) {
  if (!WIRE_LIVE) return mockIntent(opts.amount, opts.metadata ?? {});   // ↓ доор
  return wireFetch("/payment_intents", {
    method: "POST", idempotencyKey: opts.idempotencyKey,
    json: { amount: opts.amount, currency: "MNT", allowed_operators: ALLOWED_OPERATORS, metadata: opts.metadata ?? {} },
  });
}

export async function getPaymentIntent(id: string) {
  if (!WIRE_LIVE) return { id, status: mockStatusFromId(id) };
  return wireFetch(`/payment_intents/${id}`, { method: "GET" });
}

export async function createCheckoutSession(opts: {
  paymentIntentId: string; successUrl?: string; idempotencyKey: string;
}) {
  if (!WIRE_LIVE) return { id: `cs_mock_${randomUUID()}`, url: "", payment_intent: opts.paymentIntentId };
  return wireFetch("/checkout/sessions", {
    method: "POST", idempotencyKey: opts.idempotencyKey,
    json: { payment_intent: opts.paymentIntentId, success_url: opts.successUrl },
  });
}

// ── Webhook гарын үсэг шалгах: header "t=<ts>,v1=<hmac>", payload = `${t}.${rawBody}` ──
export function verifyWireSignature(rawBody: string, sigHeader: string | null, secret?: string): boolean {
  if (!sigHeader || !secret) return false;
  const parts = Object.fromEntries(sigHeader.split(",").map((kv) => kv.split("=").map((s) => s.trim())));
  const { t, v1 } = parts as any;
  if (!t || !v1) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(v1), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const WIRE_WEBHOOK_IP = "65.109.117.186";  // зөвхөн энэ IP-аас webhook ирнэ
```

(Бүрэн эх — `lib/wire.ts`-аас mock хэсэг, refund, cancel-ийг хуулна.)

---

## 4. Backend — PaymentIntent үүсгэх (`app/api/payments/intent/route.ts`)

Гол алхмууд:
1. Хэрэглэгчийг шалгах (auth).
2. DB-ээс захиалгаа олох. Аль хэдийн `paid` бол шууд буцаах.
3. Хуучин intent байвал дахин ашиглах (idempotent), үгүй бол шинээр үүсгэх.
4. **Live** бол hosted checkout үүсгэж `checkoutUrl` буцаах.
5. Алдааг **логонд** бичих, харин клиентэд gateway-ийн дотоод алдаа **бүү задал**.

```ts
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { reservationId } = await req.json();
  const reservation = await prisma.reservation.findFirst({ where: { id: reservationId, userId: user.id } });
  if (!reservation) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (reservation.paymentStatus === "paid")
    return NextResponse.json({ data: { status: "succeeded", paymentStatus: "paid" } });

  // Хуучин intent-ийг дахин ашиглах (давхар төлбөрөөс сэргийлнэ)
  const intent = reservation.paymentIntentId
    ? await getPaymentIntent(reservation.paymentIntentId)
    : await createPaymentIntent({
        amount: reservation.amount,
        metadata: { reservationId: reservation.id, userId: user.id },
        idempotencyKey: `res_${reservation.id}`,    // ← тогтмол түлхүүр
      });

  if (!reservation.paymentIntentId)
    await prisma.reservation.update({ where: { id: reservation.id }, data: { paymentIntentId: intent.id } });

  // successUrl-ийг хүсэлтийн жинхэнэ origin-аас барина (cookie session хадгалагдана)
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("host");
  const origin = host ? `${proto}://${host}` : SITE_URL;

  const session = await createCheckoutSession({
    paymentIntentId: intent.id,
    successUrl: `${origin}/pay?r=${reservation.id}&return=1`,
    idempotencyKey: `sess_${reservation.id}`,
  });

  return NextResponse.json({ data: { id: intent.id, checkoutUrl: session.url } });
}
```

**Status polling (GET)** — хэрэглэгч буцаж ирэхэд төлөв шалгаж DB-г шинэчилнэ:
```ts
export async function GET(req: Request) {
  const reservationId = new URL(req.url).searchParams.get("reservationId");
  const reservation = await prisma.reservation.findFirst({ where: { id: reservationId, userId: user.id } });
  if (reservation.paymentStatus === "paid") return NextResponse.json({ data: { status: "succeeded" } });

  const intent = await getPaymentIntent(reservation.paymentIntentId);
  if (intent.status === "succeeded")
    await prisma.reservation.update({ where: { id: reservation.id }, data: { paymentStatus: "paid" } });
  return NextResponse.json({ data: { status: intent.status } });
}
```

---

## 5. Backend — Webhook хүлээн авагч (`app/api/webhooks/wire/route.ts`)

```ts
export async function POST(req: Request) {
  const raw = await req.text();                          // ⚠️ raw body хэрэгтэй (JSON.parse-аас ӨМНӨ)
  const secret = process.env.WIRE_WEBHOOK_SECRET;

  if (secret) {                                          // production-д заавал шалга
    if (clientIp(req) !== WIRE_WEBHOOK_IP)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!verifyWireSignature(raw, req.headers.get("WirePayment-Signature"), secret))
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(raw);
  if (event?.type === "ping" || !event?.type) return NextResponse.json({ received: true });

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data?.object ?? event.data;
    const reservationId = intent?.metadata?.reservationId;
    await prisma.reservation.updateMany({
      where: { id: reservationId, paymentStatus: { not: "paid" } },   // idempotent
      data: { paymentStatus: "paid" },
    });
  }
  return NextResponse.json({ received: true });           // үргэлж 2xx буцаа
}
```

**Webhook-ийн дүрмүүд:**
- **raw body**-г `JSON.parse` хийхээс өмнө унш — гарын үсэг raw текст дээр тооцоологдсон.
- IP allowlist: зөвхөн `65.109.117.186`.
- Header нэр: `WirePayment-Signature`, формат: `t=<unix>,v1=<hmac_sha256>`.
- Гарын үсэг = `HMAC-SHA256(secret, "<t>.<rawBody>")`.
- `payment_intent.succeeded` ирэхэд `metadata.reservationId`-аар DB шинэчил.
- Алдаа гарсан ч **5xx бүү буцаа** (Wire дахин оролдоно) — баталгаажсан event-ийг 2xx-ээр хүлээн ав.

---

## 6. Frontend — checkout руу шилжих

```ts
async function checkout() {
  const res = await fetch("/api/payments/intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reservationId }),
  });
  const { data } = await res.json();
  if (data.checkoutUrl) {
    window.location.href = data.checkoutUrl;   // pay.wire.mn руу
  }
}
```

Хэрэглэгч төлж дуусаад `successUrl` (`/pay?r=...&return=1`) руу буцна. Тэр хуудсан дээр
`GET /api/payments/intent?reservationId=...`-аар төлвөө дахин шалгаж UI-аа шинэчилнэ.

---

## 7. MOCK горим (түлхүүргүйгээр хөгжүүлэх)

`WIRE_SECRET_KEY` тохируулаагүй бол `WIRE_LIVE = false` болж бүх функц **хуурамч**
өгөгдөл буцаана: QR зурагтай intent үүсгэж, **5 секундын дараа автоматаар `succeeded`**
болгодог. Ингэснээр Wire account нээлгэхээс өмнө бүх урсгалаа dev/demo дээр турших
боломжтой. Production-д жинхэнэ `sk_live_…` түлхүүрээ тавихад л бодит болно.

---

## 8. Wire Dashboard дээрх тохиргоо

1. https://wire.mn → бүртгэл үүсгэж байгууллагаа баталгаажуул.
2. **API Keys** → `sk_test_…` (турших), `sk_live_…` (бодит) аваад env-д тавь.
3. **Webhooks** → endpoint нэм:
   - URL: `https://tanaisajt.mn/api/webhooks/wire`
   - Event: `payment_intent.succeeded` (мөн `payment_intent.canceled`).
   - Signing secret (`whsec_…`)-ийг `WIRE_WEBHOOK_SECRET`-д тавь.
4. QPay-г операторын жагсаалтад идэвхжүүл (бодит горим).

---

## 9. Шинэ сайтад холбох checklist

- [ ] `lib/wire.ts`, `lib/site.ts` хуулах.
- [ ] DB модельд 3 талбар нэм: `paymentStatus` (`"unpaid"` default), `paymentIntentId` (nullable), `amount` (Int, MNT).
- [ ] `POST /api/payments/intent` — intent + checkout үүсгэх.
- [ ] `GET  /api/payments/intent` — төлөв шалгах (polling).
- [ ] `POST /api/webhooks/wire` — webhook (raw body, гарын үсэг шалгах).
- [ ] Frontend "Төлөх" товч → `checkoutUrl` руу redirect.
- [ ] Success хуудас → төлвөө дахин шалгах.
- [ ] Env: `WIRE_SECRET_KEY`, `WIRE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`.
- [ ] Wire dashboard дээр webhook URL + signing secret тохируулах.

---

## 10. Алдаанаас сэргийлэх гол зөвлөмжүүд

| Анхаар | Шалтгаан |
|---|---|
| Дүнг **MNT бүхэл тоо**-гоор дамжуул | ₮ тэмдэг/бутархай байвал Wire татгалзана |
| **Idempotency-Key** тогтмол өг | Сүлжээ тасарч давтагдсан ч давхар төлбөргүй |
| Webhook-ийн **raw body** ашигла | parse хийсэн body дээр гарын үсэг таарахгүй |
| Клиентэд gateway алдаа бүү задал | Зөвхөн логонд бич, хэрэглэгчид ерөнхий алдаа |
| `paymentStatus != "paid"` нөхцөлтэй update | Webhook + redirect давхар тулгарахаас сэргийлнэ |
| `successUrl`-ийг хүсэлтийн origin-аас бари | Session cookie ижил домэйнд хадгалагдана |
```
