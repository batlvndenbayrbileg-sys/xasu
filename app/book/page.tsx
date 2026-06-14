"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Loader2, Users, MapPin, CalendarDays, Clock, Check, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import FloorPlan from "@/components/FloorPlan";
import Table360 from "@/components/Table360";
import MobileBookingWizard from "@/components/MobileBookingWizard";
import { useBookingStore } from "@/lib/store";
import { getJson, sendJson } from "@/lib/fetcher";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import type { RestaurantTable, Zone } from "@/lib/types";

const ZONES: Zone[] = ["Indoor", "Outdoor", "Garden Terrace", "Private Meeting"];
const TIMES = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

function nextDays(count: number) {
  return Array.from({ length: count }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { iso: d.toISOString().slice(0, 10), dow: d.toLocaleDateString("en-US", { weekday: "short" }),
      day: d.getDate(), mon: d.toLocaleDateString("en-US", { month: "short" }), offset: i };
  });
}

export default function BookPage() {
  const router = useRouter();
  const { t, tZone } = useI18n();
  const { zone, setZone, selectedTableId, selectTable, partySize, setPartySize, date, setDate, time, setTime } = useBookingStore();

  const days = useMemo(() => nextDays(14), []);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show360, setShow360] = useState(false);

  useEffect(() => {
    if (!date) setDate(days[0].iso);
    if (!time) setTime("19:00");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!date || !time) return;
    setLoading(true);
    const qs = new URLSearchParams({ zone, date, time });
    getJson<RestaurantTable[]>(`/api/tables?${qs}`).then(({ data }) => {
      const list = data ?? [];
      setTables(list);
      const still = list.find((x) => x.id === selectedTableId);
      if (!still || still.status !== "available") selectTable(null);
    }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone, date, time]);

  const selected = tables.find((x) => x.id === selectedTableId);
  const overCap = selected ? partySize > selected.seats : false;
  const canConfirm = !!selected && !overCap && !!date && !!time && selected.status === "available";

  async function confirm() {
    if (!canConfirm || !selected) return;
    setSubmitting(true); setError(null);
    const { ok, status, data, error } = await sendJson<any>("/api/reservations", "POST", { tableId: selected.id, partySize, date, time });
    setSubmitting(false);
    if (status === 401) { router.push("/login?redirect=/book"); return; }
    if (!ok) { setError(error ?? "Could not reserve"); toast.error(error ?? "Could not reserve"); return; }
    router.push(`/pay?r=${data.id}`);
  }

  function dayLabel(d: { offset: number; dow: string }) {
    if (d.offset === 0) return t("book.today");
    if (d.offset === 1) return t("book.tmrw");
    return d.dow;
  }

  return (
    <>
      {/* Mobile gets the step-by-step wizard; desktop keeps the rich layout. */}
      <div className="lg:hidden pt-20"><MobileBookingWizard /></div>

      <div className="hidden lg:block pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-accent font-semibold text-[14px] tracking-wide uppercase">{t("book.step")}</p>
            <h1 className="font-display text-[34px] md:text-[46px] font-bold mt-1">{t("book.title")}</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[13px] text-muted"><Stepper t={t} /></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-8 pb-40 lg:pb-12">
          {/* left */}
          <div className="lg:col-span-2 space-y-6">
            {/* zones */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {ZONES.map((z) => (
                <button key={z} onClick={() => setZone(z)}
                  className={clsx("relative whitespace-nowrap rounded-full px-5 py-2.5 text-[14px] font-medium transition",
                    z === zone ? "text-white" : "bg-white border border-line text-neutral-600 hover:text-ink")}>
                  {z === zone && <motion.span layoutId="zone-pill" className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <span className="relative z-10">{tZone(z)}</span>
                </button>
              ))}
            </div>

            {/* date + time */}
            <div className="bg-white rounded-2xl border border-line shadow-card p-4 md:p-5 space-y-5">
              <div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-500 mb-2"><CalendarDays size={15} /> {t("book.selectDate")}</div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {days.map((d) => (
                    <button key={d.iso} onClick={() => setDate(d.iso)}
                      className={clsx("flex-none w-[58px] py-2.5 rounded-xl border text-center transition",
                        date === d.iso ? "bg-accent text-white border-accent shadow-glow" : "bg-white border-line text-neutral-600 hover:border-neutral-300")}>
                      <div className="text-[10px] opacity-80">{dayLabel(d)}</div>
                      <div className="text-[17px] font-bold leading-tight">{d.day}</div>
                      <div className="text-[9px] opacity-70">{d.mon}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-500 mb-2"><Clock size={15} /> {t("book.selectTime")}</div>
                <div className="flex gap-2 flex-wrap">
                  {TIMES.map((tm) => (
                    <button key={tm} onClick={() => setTime(tm)}
                      className={clsx("px-5 py-2.5 rounded-full border text-[14px] font-semibold transition",
                        time === tm ? "bg-ink text-white border-ink" : "bg-white border-line text-neutral-600 hover:border-neutral-300")}>{tm}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* floorplan */}
            <div className="bg-white rounded-2xl border border-line shadow-card p-3 md:p-4">
              <div className="flex items-center justify-between px-1 pb-3 flex-wrap gap-2">
                <h3 className="font-semibold text-[15px]">{tZone(zone)} — {t("book.floorplan")}</h3>
                <div className="flex gap-3 text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> {t("book.available")}</span>
                  <span className="inline-flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> {t("book.reserved")}</span>
                  <span className="inline-flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {t("book.taken")}</span>
                  <span className="inline-flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-accent inline-block" /> {t("book.selected")}</span>
                </div>
              </div>
              {loading ? (
                <div className="h-[400px] md:h-[600px] grid place-items-center text-neutral-400"><Loader2 className="animate-spin" /></div>
              ) : (
                <FloorPlan tables={tables} zone={zone} />
              )}
            </div>

            {/* mobile: selected-table real photo card */}
            <AnimatePresence>
              {selected && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                  className="lg:hidden bg-white rounded-2xl border border-line shadow-card overflow-hidden">
                  <TablePhoto table={selected} t={t} tZone={tZone} onWatch={() => setShow360(true)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* right summary (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              {/* real photo reveal */}
              <AnimatePresence mode="wait">
                {selected && (
                  <motion.div key={selected.id} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="bg-white rounded-2xl border border-line shadow-card overflow-hidden">
                    <TablePhoto table={selected} t={t} tZone={tZone} onWatch={() => setShow360(true)} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-white rounded-2xl border border-line shadow-card p-6">
                <h3 className="font-display text-[22px] font-bold">{t("book.yourReservation")}</h3>
                <div className="mt-5 space-y-3">
                  <SummaryRow icon={<MapPin size={16} />} label={t("book.table")}
                    value={selected ? `${selected.label} · ${tZone(selected.zone)}` : t("book.selectOnMap")} muted={!selected} />
                  <SummaryRow icon={<CalendarDays size={16} />} label={t("book.date")} value={date ?? "—"} />
                  <SummaryRow icon={<Clock size={16} />} label={t("book.time")} value={time ?? "—"} />
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
                  <div>
                    <div className="text-[14px] font-semibold flex items-center gap-1.5"><Users size={15} /> {t("book.partySize")}</div>
                    <div className="text-[11px] text-muted">{selected ? `${t("book.max")} ${selected.seats}` : t("book.pickFirst")}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPartySize(Math.max(1, partySize - 1))} className="w-9 h-9 rounded-full border border-line grid place-items-center hover:bg-neutral-50"><Minus size={15} /></button>
                    <span className={clsx("min-w-[24px] text-center font-bold text-[17px]", overCap && "text-red-500")}>{partySize}</span>
                    <button onClick={() => setPartySize(partySize + 1)} className="w-9 h-9 rounded-full border border-line grid place-items-center hover:bg-neutral-50"><Plus size={15} /></button>
                  </div>
                </div>

                {overCap && <p className="text-[12px] text-red-500 mt-3">{t("book.exceeds")}</p>}
                {error && <p className="text-[12px] text-red-500 mt-3">{error}</p>}

                <button disabled={!canConfirm || submitting} onClick={confirm}
                  className={clsx("w-full mt-6 font-semibold py-4 rounded-full transition flex items-center justify-center gap-2",
                    canConfirm ? "bg-accent text-white shadow-glow hover:bg-accent-soft" : "bg-neutral-200 text-neutral-400")}>
                  {submitting ? <Loader2 size={17} className="animate-spin" /> : <Check size={17} />}
                  {selected ? t("book.confirm") : t("book.selectTable")}
                </button>
                <p className="text-center text-[11px] text-muted mt-3">{t("book.noPrepay")}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* mobile sticky action bar */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-40 bg-white border-t border-line p-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-none">
            <button onClick={() => setPartySize(Math.max(1, partySize - 1))} className="w-8 h-8 rounded-full border border-line grid place-items-center"><Minus size={14} /></button>
            <span className={clsx("min-w-[18px] text-center font-bold", overCap && "text-red-500")}>{partySize}</span>
            <button onClick={() => setPartySize(partySize + 1)} className="w-8 h-8 rounded-full border border-line grid place-items-center"><Plus size={14} /></button>
          </div>
          <button disabled={!canConfirm || submitting} onClick={confirm}
            className={clsx("flex-1 font-semibold py-3.5 rounded-full transition flex items-center justify-center gap-2 text-[14px]",
              canConfirm ? "bg-accent text-white shadow-glow" : "bg-neutral-200 text-neutral-400")}>
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {selected ? `${t("book.bookThis")}` : t("book.selectTable")}
          </button>
        </div>
        {(overCap || error) && <p className="text-[11px] text-red-500 mt-1.5 text-center">{error ?? t("book.exceeds")}</p>}
      </div>

      {/* 360° / AR viewer */}
      <Table360 table={show360 ? selected ?? null : null} onClose={() => setShow360(false)}
        onBook={() => { setShow360(false); confirm(); }} />
      </div>
    </>
  );
}

/* realistic photo of the selected table, with overlay label + 360 trigger */
function TablePhoto({ table, t, tZone, onWatch }: { table: RestaurantTable; t: (k: any) => string; tZone: (z: string) => string; onWatch: () => void }) {
  return (
    <div>
      <button onClick={onWatch} className="relative aspect-[16/10] w-full group block text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={table.image} alt={table.label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        {/* play overlay */}
        <span className="absolute inset-0 grid place-items-center">
          <span className="w-14 h-14 rounded-full bg-white/25 backdrop-blur grid place-items-center group-hover:scale-110 transition">
            <PlayCircle size={30} className="text-white" />
          </span>
        </span>
        <div className="absolute left-3 bottom-3 text-white">
          <div className="text-[15px] font-bold">{table.label} · {tZone(table.zone)}</div>
          <div className="text-[12px] inline-flex items-center gap-1.5 mt-0.5"><Users size={13} /> {table.seats} {t("book.seats")}</div>
        </div>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 bg-black/55 backdrop-blur text-white text-[11px] font-medium px-2.5 py-1.5 rounded-full group-hover:bg-accent transition">
          <PlayCircle size={13} /> {t("book.watchPosition")}
        </span>
      </button>
      <div className="px-4 py-2.5 text-[12px] text-muted flex items-center gap-1.5">
        <MapPin size={12} className="text-accent" /> {table.position}
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value, muted }: { icon: React.ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-9 h-9 rounded-xl bg-neutral-50 grid place-items-center text-accent">{icon}</span>
      <div>
        <div className="text-[11px] text-muted">{label}</div>
        <div className={clsx("text-[14px] font-semibold", muted && "text-neutral-400")}>{value}</div>
      </div>
    </div>
  );
}

function Stepper({ t }: { t: (k: any) => string }) {
  const steps = [t("step.details"), t("step.table"), t("step.confirm")];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span className={clsx("w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold",
            i === 1 ? "bg-accent text-white" : "bg-neutral-200 text-neutral-500")}>{i + 1}</span>
          <span className={clsx(i === 1 ? "text-ink font-medium" : "")}>{s}</span>
          {i < steps.length - 1 && <span className="w-6 h-px bg-neutral-300" />}
        </div>
      ))}
    </div>
  );
}
