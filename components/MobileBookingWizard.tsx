"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft, Clock, Loader2,
  MapPin, Minus, PlayCircle, Plus, Users, X,
} from "lucide-react";
import clsx from "clsx";
import FloorPlan from "@/components/FloorPlan";
import Table360 from "@/components/Table360";
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
    return {
      iso: d.toISOString().slice(0, 10),
      dow: d.toLocaleDateString("en-US", { weekday: "short" }),
      day: d.getDate(),
      mon: d.toLocaleDateString("en-US", { month: "short" }),
      offset: i,
    };
  });
}

type Step = 1 | 2 | 3 | 4;

/** Mobile-first 4-step booking wizard. One decision per screen, large touch
 *  targets, a clear step indicator. Optional "add food" dialog before payment. */
export default function MobileBookingWizard() {
  const router = useRouter();
  const { t, tZone } = useI18n();
  const { zone, setZone, selectedTableId, selectTable, partySize, setPartySize, date, setDate, time, setTime, reset } = useBookingStore();

  const days = useMemo(() => nextDays(14), []);
  const [step, setStep] = useState<Step>(1);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [show360, setShow360] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!date) setDate(days[0].iso);
    if (!time) setTime("19:00");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load tables when we hit step 2 (or when date/time/zone change while on it).
  useEffect(() => {
    if (step !== 2 || !date || !time) return;
    setLoadingTables(true);
    const qs = new URLSearchParams({ zone, date, time });
    getJson<RestaurantTable[]>(`/api/tables?${qs}`).then(({ data }) => {
      const list = data ?? [];
      setTables(list);
      const still = list.find((x) => x.id === selectedTableId);
      if (!still || still.status !== "available") selectTable(null);
    }).finally(() => setLoadingTables(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, zone, date, time]);

  const selected = tables.find((x) => x.id === selectedTableId);
  const overCap = selected ? partySize > selected.seats : false;

  const canNext: Record<Step, boolean> = {
    1: !!date && !!time,
    2: !!selected && selected.status === "available",
    3: !!selected && !overCap && partySize > 0,
    4: true,
  };

  const go = (s: Step) => setStep(s);
  const next = () => { if (canNext[step]) setStep((s) => (Math.min(4, s + 1) as Step)); };
  const back = () => setStep((s) => (Math.max(1, s - 1) as Step));

  async function confirm() {
    if (!selected) return;
    setSubmitting(true);
    const { ok, status, data, error } = await sendJson<any>("/api/reservations", "POST", {
      tableId: selected.id, partySize, date, time,
    });
    setSubmitting(false);
    if (status === 401) { router.push("/login?redirect=/book"); return; }
    if (!ok) { toast.error(error ?? t("book.couldNotReserve")); return; }
    // Don't toast — booking isn't confirmed until deposit is paid.
    reset();
    router.push(`/booking/${data.id}/review`);
  }


  return (
    <div className="lg:hidden min-h-[calc(100vh-4rem)] flex flex-col bg-[var(--bg)]">
      {/* TOP BAR — back + progress */}
      <header className="sticky top-[64px] z-30 bg-[var(--bg)]/90 backdrop-blur border-b border-line">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => (step === 1 ? router.back() : back())}
            className="w-9 h-9 rounded-full border border-line bg-white grid place-items-center text-ink active:scale-95 transition">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <p className="text-[11px] text-muted font-medium">
              {t("book.stepOf").replace("{i}", String(step)).replace("{n}", "4")}
            </p>
            <p className="text-[14px] font-semibold leading-tight">{titleFor(step, t)}</p>
          </div>
        </div>
        {/* progress bar */}
        <div className="h-1 bg-line">
          <motion.div className="h-full bg-accent" animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ type: "spring", stiffness: 240, damping: 28 }} />
        </div>
      </header>

      {/* STEP CONTENT */}
      <main className="flex-1 px-4 pt-5 pb-32">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>

            {step === 1 && (
              <section>
                <Section icon={<CalendarDays size={15} />} label={t("book.selectDate")} />
                <div className="grid grid-cols-4 gap-2">
                  {days.slice(0, 12).map((d) => (
                    <button key={d.iso} onClick={() => setDate(d.iso)}
                      className={clsx("py-3 rounded-2xl border text-center transition active:scale-95",
                        date === d.iso ? "bg-accent text-white border-accent shadow-glow" : "bg-white border-line text-neutral-700")}>
                      <div className="text-[10px] opacity-80">{d.offset === 0 ? t("book.today") : d.offset === 1 ? t("book.tmrw") : d.dow}</div>
                      <div className="text-[17px] font-bold leading-tight">{d.day}</div>
                      <div className="text-[9px] opacity-70">{d.mon}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-7">
                  <Section icon={<Clock size={15} />} label={t("book.selectTime")} />
                  <div className="grid grid-cols-3 gap-2">
                    {TIMES.map((tm) => (
                      <button key={tm} onClick={() => setTime(tm)}
                        className={clsx("py-3 rounded-2xl border text-[15px] font-semibold transition active:scale-95",
                          time === tm ? "bg-ink text-white border-ink" : "bg-white border-line text-neutral-700")}>
                        {tm}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <Section icon={<MapPin size={15} />} label={tZone(zone)} />
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
                  {ZONES.map((z) => (
                    <button key={z} onClick={() => setZone(z)}
                      className={clsx("relative whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition active:scale-95",
                        z === zone ? "bg-ink text-white" : "bg-white border border-line text-neutral-600")}>
                      {tZone(z)}
                    </button>
                  ))}
                </div>

                <div className="mt-3 bg-white rounded-2xl border border-line shadow-card p-2">
                  {loadingTables ? (
                    <div className="h-[360px] grid place-items-center text-neutral-400"><Loader2 className="animate-spin" /></div>
                  ) : (
                    <FloorPlan tables={tables} zone={zone} hideInspector />
                  )}
                </div>

                {/* selected table preview */}
                <AnimatePresence>
                  {selected && (
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }}
                      className="mt-4 bg-white rounded-2xl border border-line shadow-card overflow-hidden">
                      <button onClick={() => setShow360(true)} className="relative block w-full aspect-[16/10] group text-left">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selected.image} alt={selected.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 bg-black/55 backdrop-blur text-white text-[11px] font-medium px-2.5 py-1.5 rounded-full">
                          <PlayCircle size={13} /> {t("book.view360")}
                        </span>
                        <div className="absolute left-3 bottom-3 text-white">
                          <div className="text-[15px] font-bold">{selected.label} · {tZone(selected.zone)}</div>
                          <div className="text-[12px] inline-flex items-center gap-1.5 mt-0.5"><Users size={13} /> {selected.seats} {t("book.seats")}</div>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )}

            {step === 3 && selected && (
              <section>
                <Section icon={<Users size={15} />} label={t("book.partySize")} />
                <div className="bg-white border border-line rounded-2xl shadow-card p-6 flex flex-col items-center">
                  <div className="text-[12px] text-muted">{t("book.max")} {selected.seats}</div>
                  <div className="flex items-center gap-7 mt-4">
                    <button onClick={() => setPartySize(Math.max(1, partySize - 1))}
                      className="w-14 h-14 rounded-full border border-line bg-white grid place-items-center text-ink active:scale-95 hover:border-accent transition">
                      <Minus size={20} />
                    </button>
                    <span className={clsx("font-display text-[64px] font-bold leading-none min-w-[80px] text-center", overCap && "text-red-500")}>{partySize}</span>
                    <button onClick={() => setPartySize(partySize + 1)}
                      className="w-14 h-14 rounded-full border border-line bg-white grid place-items-center text-ink active:scale-95 hover:border-accent transition">
                      <Plus size={20} />
                    </button>
                  </div>
                  {overCap && <p className="text-[12px] text-red-500 mt-4 text-center">{t("book.exceeds")}</p>}
                </div>

                <SummaryCard t={t} tZone={tZone} table={selected} date={date} time={time} party={partySize} />
              </section>
            )}

            {step === 4 && selected && (
              <section>
                <SummaryCard t={t} tZone={tZone} table={selected} date={date} time={time} party={partySize} />
                <div className="mt-5 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-[13px] text-amber-800">
                  {t("book.noPrepay")}
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-line p-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        {step < 4 ? (
          <button onClick={next} disabled={!canNext[step]}
            className={clsx("w-full inline-flex items-center justify-center gap-2 font-semibold py-4 rounded-full transition",
              canNext[step] ? "bg-accent text-white shadow-glow active:scale-[0.98]" : "bg-neutral-200 text-neutral-400")}>
            {t("book.continueWith")} <ArrowRight size={17} />
          </button>
        ) : (
          <button onClick={confirm} disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 font-semibold py-4 rounded-full bg-accent text-white shadow-glow active:scale-[0.98]">
            {submitting ? <Loader2 size={17} className="animate-spin" /> : <Check size={17} />}
            {t("book.confirm")}
          </button>
        )}
      </div>

      {/* 360° viewer */}
      <Table360 table={show360 ? selected ?? null : null} onClose={() => setShow360(false)}
        onBook={() => { setShow360(false); setStep(3); }} />
    </div>
  );
}

function titleFor(step: Step, t: (k: any) => string) {
  return step === 1 ? t("book.stepDate")
       : step === 2 ? t("book.stepTable")
       : step === 3 ? t("book.stepGuests")
       : t("book.stepReview");
}

function Section({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-500 mb-3">
      <span className="text-accent">{icon}</span> {label}
    </div>
  );
}

function SummaryCard({ t, tZone, table, date, time, party }: {
  t: (k: any) => string; tZone: (z: string) => string;
  table: RestaurantTable; date: string | null; time: string | null; party: number;
}) {
  return (
    <div className="mt-5 bg-white border border-line rounded-2xl shadow-card overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={table.image} alt={table.label} className="w-full h-32 object-cover" />
      <div className="p-4 space-y-2.5">
        <Row icon={<MapPin size={15} />} label={t("book.table")} value={`${table.label} · ${tZone(table.zone)}`} />
        <Row icon={<CalendarDays size={15} />} label={t("book.date")} value={date ?? "—"} />
        <Row icon={<Clock size={15} />} label={t("book.time")} value={time ?? "—"} />
        <Row icon={<Users size={15} />} label={t("book.partySize")} value={String(party)} />
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-9 h-9 rounded-xl bg-neutral-50 grid place-items-center text-accent">{icon}</span>
      <div className="flex-1">
        <div className="text-[11px] text-muted">{label}</div>
        <div className="text-[14px] font-semibold">{value}</div>
      </div>
    </div>
  );
}

