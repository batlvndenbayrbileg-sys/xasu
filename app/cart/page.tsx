"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useMounted } from "@/lib/useMounted";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/useSession";
import { DISHES } from "@/lib/data";
import { formatDishPrice, formatMnt } from "@/lib/payments";
import { sendJson } from "@/lib/fetcher";
import { toast } from "@/lib/toast";

export default function CartPage() {
  const router = useRouter();
  const { t } = useI18n();
  const mounted = useMounted();
  const { user } = useSession();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const [submitting, setSubmitting] = useState(false);

  const lines = useMemo(() => items
    .map((it) => {
      const d = DISHES.find((x) => x.id === it.id);
      if (!d) return null;
      const unit = Math.round(d.price * 1000);
      return { id: it.id, dish: d, qty: it.qty, unit, lineTotal: unit * it.qty };
    })
    .filter(Boolean) as { id: string; dish: any; qty: number; unit: number; lineTotal: number }[], [items]);

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;

  async function checkout() {
    if (!user) { router.push("/login?redirect=/cart"); return; }
    if (lines.length === 0) return;
    setSubmitting(true);
    const { ok, status, data, error } = await sendJson<any>("/api/payments/cart", "POST", {
      amount: total,
      items: lines.map((l) => ({ id: l.id, qty: l.qty, unit: l.unit })),
    });
    if (status === 401) { router.push("/login?redirect=/cart"); return; }
    if (!ok) { setSubmitting(false); toast.error(error ?? "Payment error"); return; }
    if (data.checkoutUrl) { window.location.href = data.checkoutUrl; return; }
    // mock mode
    router.push(`/cart/success?intent=${data.id}`);
  }

  return (
    <div className="pt-24 md:pt-32 min-h-[80vh] pb-32 md:pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-accent/10 text-accent grid place-items-center">
            <ShoppingBag size={22} />
          </span>
          <div>
            <h1 className="font-display text-[28px] md:text-[36px] font-bold leading-tight">{t("cart.title")}</h1>
            <p className="text-muted text-[13px] md:text-[14px]">{t("cart.sub")}</p>
          </div>
        </div>

        {!mounted ? null : lines.length === 0 ? (
          <div className="bg-white border border-line rounded-3xl py-20 px-8 text-center mt-8 shadow-card">
            <div className="w-16 h-16 rounded-full bg-neutral-100 grid place-items-center text-3xl mx-auto">🛍️</div>
            <h3 className="font-display text-[20px] font-bold mt-4">{t("cart.empty")}</h3>
            <p className="text-muted mt-1.5">{t("cart.emptySub")}</p>
            <Link href="/menu"
              className="inline-flex items-center gap-2 mt-7 bg-accent text-white font-semibold px-7 py-3.5 rounded-full shadow-glow hover:bg-accent-soft transition">
              {t("cart.browse")} <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5 mt-8">
            {/* LEFT — items */}
            <div className="bg-white border border-line rounded-3xl overflow-hidden shadow-card">
              <AnimatePresence initial={false}>
                {lines.map((l, i) => (
                  <motion.article
                    key={l.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className={`flex items-center gap-3 md:gap-4 p-4 md:p-5 ${i > 0 ? "border-t border-line" : ""}`}
                  >
                    <Link href={`/dish/${l.id}`} className="shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={l.dish.image} alt={l.dish.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/dish/${l.id}`} className="font-semibold text-[15px] md:text-[16px] hover:text-accent transition leading-tight block">
                        {l.dish.name}
                      </Link>
                      <p className="text-[12px] text-muted mt-1">{formatDishPrice(l.dish.price)} / ширхэг</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="inline-flex items-center bg-neutral-100 rounded-full">
                          <button onClick={() => setQty(l.id, l.qty - 1)}
                            className="w-8 h-8 grid place-items-center hover:bg-neutral-200 rounded-l-full transition" aria-label="Decrease">
                            <Minus size={14} />
                          </button>
                          <span className="min-w-[28px] text-center font-bold text-[14px]">{l.qty}</span>
                          <button onClick={() => setQty(l.id, l.qty + 1)}
                            className="w-8 h-8 grid place-items-center hover:bg-neutral-200 rounded-r-full transition" aria-label="Increase">
                            <Plus size={14} />
                          </button>
                        </div>
                        <button onClick={() => { remove(l.id); toast.info(t("cart.itemRemoved")); }}
                          className="text-muted hover:text-red-500 transition" aria-label="Remove">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[15px] md:text-[16px] font-bold">{formatMnt(l.lineTotal)}</div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>

              <div className="p-4 md:p-5 border-t border-line">
                <Link href="/menu" className="text-[13px] font-semibold text-accent hover:text-accent-soft inline-flex items-center gap-1">
                  ← {t("cart.continue")}
                </Link>
              </div>
            </div>

            {/* RIGHT — totals (sticky on desktop) */}
            <div>
              <div className="lg:sticky lg:top-28 space-y-3">
                <div className="bg-white border border-line rounded-3xl p-5 md:p-6 shadow-card">
                  <h3 className="font-display text-[18px] font-bold">Захиалгын хураангуй</h3>
                  <dl className="mt-4 space-y-2.5 text-[14px]">
                    <Row label={t("cart.subtotal")} value={formatMnt(subtotal)} />
                    <Row label={t("cart.serviceFee")} value={formatMnt(serviceFee)} />
                    <div className="border-t border-line pt-3 mt-3">
                      <Row label={<span className="font-bold text-[15px]">{t("cart.total")}</span>}
                        value={<span className="font-display text-[22px] font-bold">{formatMnt(total)}</span>} />
                    </div>
                  </dl>

                  <button onClick={checkout} disabled={submitting}
                    className="mt-6 w-full bg-accent text-white font-semibold py-4 rounded-full shadow-glow hover:bg-accent-soft transition inline-flex items-center justify-center gap-2 disabled:opacity-60">
                    {submitting ? <Loader2 size={17} className="animate-spin" /> : <ShieldCheck size={17} />}
                    {submitting ? t("cart.processing") : t("cart.checkout")}
                  </button>

                  <p className="text-[11px] text-muted text-center mt-3 inline-flex items-center justify-center gap-1.5 w-full">
                    <ShieldCheck size={11} className="text-emerald-500" />
                    Wire Payment · QPay-ээр аюулгүй төлбөр
                  </p>
                </div>

                {!user && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-[12.5px] text-amber-900">
                    Төлбөр төлөхийн тулд эхлээд <Link href="/login?redirect=/cart" className="font-bold underline">нэвтэрнэ үү</Link>.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
