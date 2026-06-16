"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Users, MapPin, Loader2, X, CreditCard, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { TABLES } from "@/lib/data";
import { getJson, sendJson } from "@/lib/fetcher";
import { useI18n } from "@/lib/i18n";
import { confirmDialog } from "@/lib/confirm";
import { toast } from "@/lib/toast";
import type { Reservation } from "@/lib/types";

type Tab = "upcoming" | "completed" | "cancelled";

export default function OrdersPage() {
  const router = useRouter();
  const { t, tZone } = useI18n();
  const [items, setItems] = useState<Reservation[] | null>(null);
  const [authed, setAuthed] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");

  const load = useCallback(async () => {
    const { status, data } = await getJson<Reservation[]>("/api/reservations");
    if (status === 401) { setAuthed(false); setItems([]); return; }
    setAuthed(true);
    setItems(data ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = new Date().toISOString().slice(0, 10);
  const classify = useCallback((r: Reservation): Tab => {
    if (r.status === "CANCELLED") return "cancelled";
    return r.date >= today ? "upcoming" : "completed";
  }, [today]);

  const counts = useMemo(() => {
    const c = { upcoming: 0, completed: 0, cancelled: 0 };
    (items ?? []).forEach((r) => { c[classify(r)]++; });
    return c;
  }, [items, classify]);

  const filtered = useMemo(() => (items ?? []).filter((r) => classify(r) === tab), [items, tab, classify]);

  async function cancel(id: string) {
    const ok = await confirmDialog({ message: t("orders.confirmCancel"), danger: true });
    if (!ok) return;
    await sendJson(`/api/reservations/${id}`, "DELETE");
    toast.success(t("toast.cancelled"));
    load();
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "upcoming", label: t("orders.tabUpcoming") },
    { key: "completed", label: t("orders.tabCompleted") },
    { key: "cancelled", label: t("orders.tabCancelled") },
  ];

  return (
    <div className="pt-24 md:pt-32 min-h-[80vh]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-accent font-semibold text-[14px] tracking-wide uppercase">{t("orders.kicker")}</p>
        <h1 className="font-display text-[36px] md:text-[48px] font-bold mt-1">{t("orders.title")}</h1>
        <p className="text-muted mt-2">{t("orders.sub")}</p>

        {/* tabs */}
        <div className="flex gap-2 mt-6 bg-neutral-100 rounded-full p-1 w-full sm:w-fit">
          {tabs.map((tb) => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={clsx("flex-1 sm:flex-none px-4 py-2 rounded-full text-[13px] font-semibold transition whitespace-nowrap",
                tab === tb.key ? "bg-white shadow-sm text-ink" : "text-neutral-500")}>
              {tb.label} <span className="opacity-60">({counts[tb.key]})</span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          {items === null ? (
            <div className="h-40 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
          ) : !authed ? (
            <Empty title={t("orders.signInToView")} cta={t("orders.signIn")} onClick={() => router.push("/login?redirect=/orders")} />
          ) : filtered.length === 0 ? (
            <Empty title={t("orders.none")} sub={t("orders.noneSub")} cta={t("orders.reserve")} onClick={() => router.push("/book")} />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map((r) => {
                const table = TABLES.find((x) => x.id === r.tableId);
                const kind = classify(r);
                const isPaid = r.paymentStatus === "paid";
                // upcoming: paid → green "Баталгаажсан", unpaid → amber "Төлбөр хүлээж буй"
                const badge = kind === "upcoming"
                  ? (isPaid
                      ? { cls: "bg-emerald-50 text-emerald-700", label: t("orders.stConfirmed") }
                      : { cls: "bg-amber-50 text-amber-700", label: t("orders.stPending") })
                  : kind === "completed"
                    ? { cls: "bg-sky-50 text-sky-700", label: t("orders.stCompleted") }
                    : { cls: "bg-neutral-100 text-neutral-500", label: t("orders.stCancelled") };
                return (
                  <article key={r.id}
                    className={clsx("bg-white border rounded-2xl overflow-hidden transition",
                      kind === "cancelled" ? "border-line opacity-70" : "border-line shadow-card")}>
                    {table && (
                      <div className="relative h-28">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={table.image} alt="" className={clsx("w-full h-full object-cover", kind !== "upcoming" && "grayscale", kind === "upcoming" && !isPaid && "opacity-90")} />
                        <span className={clsx("absolute top-2 right-2 text-[10px] font-bold px-2.5 py-1 rounded-full", badge.cls)}>
                          {badge.label}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="w-11 h-11 rounded-xl bg-ink text-white grid place-items-center font-bold">{r.partySize}</span>
                        <div>
                          <div className="text-[15px] font-bold">{table?.label ?? r.tableId} · {tZone(r.zone)}</div>
                          <div className="text-[11px] text-muted flex items-center gap-1"><MapPin size={11} /> {table?.position ?? ""}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 mt-3 text-[13px] text-neutral-600">
                        <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />{r.date}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock size={14} />{r.time}</span>
                        <span className="inline-flex items-center gap-1.5"><Users size={14} />{r.partySize}</span>
                      </div>
                      {kind === "upcoming" && (
                        <div className="mt-3 flex items-center gap-4 flex-wrap">
                          {!isPaid ? (
                            <>
                              <button onClick={() => router.push(`/pay?r=${r.id}`)}
                                className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent hover:text-accent-soft">
                                <CreditCard size={14} /> {t("pay.payNow")}
                              </button>
                              <button onClick={() => cancel(r.id)}
                                className="inline-flex items-center gap-1 text-[13px] font-semibold text-red-500 hover:text-red-600">
                                <X size={14} /> {t("orders.cancel")}
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 size={13} /> {t("orders.paidNote")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Empty({ title, sub, cta, onClick }: { title: string; sub?: string; cta: string; onClick: () => void }) {
  return (
    <div className="bg-white border border-line rounded-2xl py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-100 grid place-items-center text-3xl mx-auto">🍽️</div>
      <h3 className="text-[18px] font-bold mt-4">{title}</h3>
      {sub && <p className="text-muted mt-1">{sub}</p>}
      <button onClick={onClick} className="mt-6 bg-accent text-white font-semibold px-7 py-3 rounded-full shadow-glow hover:bg-accent-soft transition">{cta}</button>
    </div>
  );
}
