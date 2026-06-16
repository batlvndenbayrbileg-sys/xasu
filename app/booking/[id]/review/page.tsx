"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CalendarDays, Clock, Users, MapPin, ShoppingBasket, Plus, Minus, Trash2,
  ShieldCheck, ChefHat, ArrowRight, ChevronLeft, Check,
} from "lucide-react";
import { TABLES, DISHES } from "@/lib/data";
import { getJson, sendJson } from "@/lib/fetcher";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useMounted } from "@/lib/useMounted";
import { formatMnt, formatDishPrice, DEPOSIT_MNT } from "@/lib/payments";
import { toast } from "@/lib/toast";

interface Reservation {
  id: string; tableId: string; zone: string; date: string; time: string;
  partySize: number; status: string; paymentStatus: string; amount: number;
}

export default function BookingReview() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { t, tZone } = useI18n();
  const mounted = useMounted();

  const [res, setRes] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const cartItems = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const cartLines = useMemo(() => cartItems
    .map((c) => {
      const d = DISHES.find((x) => x.id === c.id);
      if (!d) return null;
      const unit = Math.round(d.price * 1000);
      return { id: c.id, dish: d, qty: c.qty, unit, total: unit * c.qty };
    })
    .filter(Boolean) as { id: string; dish: any; qty: number; unit: number; total: number }[], [cartItems]);

  const foodTotal = cartLines.reduce((s, l) => s + l.total, 0);
  const total = DEPOSIT_MNT + foodTotal;

  const load = useCallback(async () => {
    const { ok, status, data } = await getJson<Reservation>(`/api/reservations/${id}`);
    if (status === 401) { router.push(`/login?redirect=/booking/${id}/review`); return; }
    if (!ok) { router.push("/orders"); return; }
    setRes(data);
    setLoading(false);
  }, [id, router]);
  useEffect(() => { load(); }, [load]);

  const table = res ? TABLES.find((t) => t.id === res.tableId) : null;

  async function payAndConfirm() {
    if (!res) return;
    setSubmitting(true);
    // Update reservation amount to include food, then go to /pay
    if (foodTotal > 0) {
      const { ok } = await sendJson(`/api/reservations/${res.id}/total`, "PATCH" as any, {
        foodTotal, items: cartLines.map((l) => ({ id: l.id, qty: l.qty, unit: l.unit })),
      });
      if (!ok) {
        setSubmitting(false);
        toast.error("Хоолыг нэмэхэд алдаа гарлаа");
        return;
      }
    }
    router.push(`/pay?r=${res.id}`);
  }

  if (loading || !res || !table) {
    return <div className="pt-40 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;
  }

  return (
    <div className="pt-20 md:pt-28 min-h-[80vh] pb-32 md:pb-16 bg-[var(--bg)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <button onClick={() => router.push("/book")} className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink transition">
          <ChevronLeft size={14} /> Захиалга засах
        </button>

        <div className="mt-3 flex items-start gap-3">
          <span className="w-12 h-12 rounded-2xl bg-accent text-white grid place-items-center shadow-glow shrink-0">
            <Check size={22} strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-accent font-semibold text-[12px] tracking-wide uppercase">Захиалга үүсгэгдлээ</p>
            <h1 className="font-display text-[26px] md:text-[34px] font-bold leading-tight">{t("review.title")}</h1>
            <p className="text-muted text-[13px] md:text-[14px] mt-1.5 max-w-2xl">{t("review.sub")}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5 mt-7">
          {/* LEFT — reservation card + food picker */}
          <div className="space-y-4">
            {/* Reservation summary */}
            <section className="bg-white border border-line rounded-2xl shadow-card overflow-hidden">
              <div className="relative h-32 md:h-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={table.image} alt={table.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute left-4 bottom-3 text-white">
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">{t("review.reservation")}</p>
                  <h3 className="font-display text-[20px] font-bold mt-0.5">{table.label} · {tZone(table.zone)}</h3>
                </div>
              </div>
              <div className="p-4 md:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Meta icon={<CalendarDays size={14} />} label="Огноо" value={res.date} />
                <Meta icon={<Clock size={14} />} label="Цаг" value={res.time} />
                <Meta icon={<Users size={14} />} label="Зочин" value={String(res.partySize)} />
                <Meta icon={<MapPin size={14} />} label="Байршил" value={table.position.split("·")[0].trim()} />
              </div>
            </section>

            {/* Food pre-order */}
            <section className="bg-white border border-line rounded-2xl shadow-card overflow-hidden">
              <div className="p-4 md:p-5 flex items-start gap-3 border-b border-line">
                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 grid place-items-center shrink-0">
                  <ChefHat size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-[18px] font-bold">{t("review.preorder")}</h3>
                  <p className="text-[12px] text-muted mt-0.5">{t("review.preorderSub")}</p>
                </div>
                <Link href="/menu"
                  className="inline-flex items-center gap-1.5 bg-accent text-white text-[12px] font-bold px-3 py-2 rounded-full hover:bg-accent-soft transition shrink-0">
                  <Plus size={13} /> {t("review.addFood")}
                </Link>
              </div>

              {!mounted ? null : cartLines.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-[13px] text-muted">Алгасах нь боломжтой — ширээн дээрээ цэснээс сонгож болно.</p>
                </div>
              ) : (
                <>
                  <p className="px-4 md:px-5 pt-3 text-[10px] font-bold uppercase tracking-widest text-muted">{t("review.cartItems")} · {cartLines.length}</p>
                  <AnimatePresence initial={false}>
                    {cartLines.map((l, i) => (
                      <motion.article key={l.id}
                        layout
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                        className={`flex items-center gap-3 p-3 md:p-4 ${i > 0 ? "border-t border-line" : "border-t border-line"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={l.dish.image} alt={l.dish.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[14px] leading-tight">{l.dish.name}</div>
                          <div className="text-[11px] text-muted mt-0.5">{formatDishPrice(l.dish.price)} / ш</div>
                        </div>
                        <div className="inline-flex items-center bg-neutral-100 rounded-full">
                          <button onClick={() => setQty(l.id, l.qty - 1)} className="w-7 h-7 grid place-items-center" aria-label="−"><Minus size={12} /></button>
                          <span className="min-w-[24px] text-center font-bold text-[13px]">{l.qty}</span>
                          <button onClick={() => setQty(l.id, l.qty + 1)} className="w-7 h-7 grid place-items-center" aria-label="+"><Plus size={12} /></button>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[14px] font-bold">{formatMnt(l.total)}</div>
                        </div>
                        <button onClick={() => remove(l.id)} className="text-muted hover:text-red-500 transition" aria-label="Remove">
                          <Trash2 size={14} />
                        </button>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </>
              )}
            </section>
          </div>

          {/* RIGHT — total + pay */}
          <div>
            <div className="lg:sticky lg:top-28 space-y-3">
              <section className="bg-white border border-line rounded-2xl shadow-card p-5 md:p-6">
                <h3 className="font-display text-[18px] font-bold">Захиалгын дүн</h3>
                <dl className="mt-4 space-y-2.5 text-[14px]">
                  <Row label={t("review.deposit")} value={formatMnt(DEPOSIT_MNT)} hint="ширээ баталгаажуулах урьдчилгаа" />
                  {mounted && foodTotal > 0 && (
                    <Row label={t("review.foodTotal")} value={formatMnt(foodTotal)} hint={`${cartLines.length} хоол урьдчилан`} />
                  )}
                  <div className="border-t border-line pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <dt className="font-bold text-[15px]">{t("review.totalToPay")}</dt>
                      <dd><span className="font-display text-[24px] font-bold">{formatMnt(total)}</span></dd>
                    </div>
                  </div>
                </dl>

                <button onClick={payAndConfirm} disabled={submitting}
                  className="mt-6 w-full bg-accent text-white font-semibold py-4 rounded-full shadow-glow hover:bg-accent-soft transition inline-flex items-center justify-center gap-2 disabled:opacity-60">
                  {submitting ? <Loader2 size={17} className="animate-spin" /> : <ShieldCheck size={17} />}
                  {t("review.payAndConfirm")}
                  <ArrowRight size={15} />
                </button>

                <p className="text-[11px] text-muted text-center mt-3 inline-flex items-center justify-center gap-1.5 w-full">
                  <ShieldCheck size={11} className="text-emerald-500" /> Wire Payment · QPay
                </p>
              </section>

              <Link href="/menu"
                className="block bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-100 rounded-2xl p-4 hover:shadow-card transition">
                <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-amber-700">
                  <ShoppingBasket size={13} /> Зөвлөмж
                </div>
                <p className="text-[13px] text-ink mt-1.5 leading-snug">
                  Хоолоо одоо сонговол ширээ дээрээ суумагц шууд хүртэх боломжтой. Хүлээх цаг алга.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted inline-flex items-center gap-1">{icon} {label}</div>
      <div className="font-semibold text-[14px] mt-0.5">{value}</div>
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt>
        <div>{label}</div>
        {hint && <div className="text-[10px] text-muted">{hint}</div>}
      </dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
