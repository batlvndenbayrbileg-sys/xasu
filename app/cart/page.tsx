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
import { DISHES, TABLES } from "@/lib/data";
import { formatDishPrice, formatMnt } from "@/lib/payments";
import { sendJson, getJson } from "@/lib/fetcher";
import { toast } from "@/lib/toast";
import { useTableSession } from "@/lib/table-session";
import { useEffect } from "react";
import { QrCode, MapPin } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { t } = useI18n();
  const mounted = useMounted();
  const { user } = useSession();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const tableId = useTableSession((s) => s.tableId);
  const tableSource = useTableSession((s) => s.source);
  const setTable = useTableSession((s) => s.setTable);
  const clearTable = useTableSession((s) => s.clear);
  const [submitting, setSubmitting] = useState(false);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [availableTables, setAvailableTables] = useState<any[] | null>(null);

  useEffect(() => {
    if (!tablePickerOpen || availableTables) return;
    getJson<any[]>("/api/tables").then(({ data }) => setAvailableTables(data ?? []));
  }, [tablePickerOpen, availableTables]);

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
    if (!tableId) { toast.error("Эхлээд ширээгээ сонгоно уу"); setTablePickerOpen(true); return; }
    setSubmitting(true);
    const { ok, status, data, error } = await sendJson<any>("/api/payments/cart", "POST", {
      amount: total,
      tableId,
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
                {/* Table card */}
                <div className="bg-white border border-line rounded-3xl p-5 shadow-card">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-9 h-9 rounded-xl grid place-items-center ${tableSource === "qr" ? "bg-emerald-50 text-emerald-700" : "bg-accent/10 text-accent"}`}>
                      {tableSource === "qr" ? <QrCode size={16} /> : <MapPin size={16} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] uppercase tracking-widest font-bold text-muted">Ширээ</div>
                      <div className="font-semibold text-[15px] leading-tight">
                        {tableId ? tableId : "Сонгоогүй"}
                        {tableSource === "qr" && <span className="ml-1.5 text-[10px] text-emerald-700 font-bold">· QR-аас</span>}
                      </div>
                    </div>
                    {tableSource !== "qr" && (
                      <button onClick={() => setTablePickerOpen(true)} className="text-[12px] font-bold text-accent">
                        {tableId ? "Солих" : "Сонгох"}
                      </button>
                    )}
                  </div>
                </div>

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

      {tablePickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 grid place-items-center p-4" onClick={() => setTablePickerOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-line">
              <h3 className="font-display text-[20px] font-bold">Ширээ сонгох</h3>
              <p className="text-[12.5px] text-muted mt-1">Зайнаас захиалж байгаа бол ширээ сонгож баталгаажуулна уу. Чөлөөтэй ширээ л харагдана.</p>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              {!availableTables ? (
                <div className="h-32 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
              ) : (
                ["Indoor", "Outdoor", "Garden Terrace", "Private Meeting"].map((zone) => {
                  const inZone = availableTables.filter((t: any) => t.zone === zone && t.status !== "occupied");
                  if (inZone.length === 0) return null;
                  return (
                    <div key={zone}>
                      <div className="text-[11px] uppercase tracking-widest font-bold text-muted mb-2">{zone}</div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {inZone.map((t: any) => {
                          const selected = t.id === tableId;
                          return (
                            <button key={t.id} onClick={() => { setTable(t.id, "manual"); setTablePickerOpen(false); toast.success(`${t.label} сонгогдлоо`); }}
                              className={`rounded-xl border px-3 py-3 text-left transition ${selected ? "border-accent bg-accent/5" : "border-line hover:border-accent"}`}>
                              <div className="font-bold text-[14px]">{t.label}</div>
                              <div className="text-[11px] text-muted">{t.seats} суудал</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="px-5 py-3 border-t border-line flex justify-between items-center">
              {tableId && (
                <button onClick={() => { clearTable(); setTablePickerOpen(false); }} className="text-[12.5px] text-muted hover:text-red-500">
                  Ширээ цуцлах
                </button>
              )}
              <button onClick={() => setTablePickerOpen(false)} className="ml-auto px-4 py-2 rounded-lg border border-line text-[13px] font-semibold">Хаах</button>
            </div>
          </div>
        </div>
      )}
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
