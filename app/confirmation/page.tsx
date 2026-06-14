"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CalendarDays, Clock, Users, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { TABLES } from "@/lib/data";
import { getJson } from "@/lib/fetcher";
import { useI18n } from "@/lib/i18n";
import type { Reservation } from "@/lib/types";

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="pt-40 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>}>
      <ConfirmationInner />
    </Suspense>
  );
}

function ConfirmationInner() {
  const router = useRouter();
  const { t, tZone } = useI18n();
  const id = useSearchParams().get("id");
  const [res, setRes] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJson<Reservation[]>("/api/reservations").then(({ data }) => {
      setRes((data ?? []).find((x) => x.id === id) ?? null);
    }).finally(() => setLoading(false));
  }, [id]);

  const table = res ? TABLES.find((x) => x.id === res.tableId) : null;

  return (
    <div className="pt-24 md:pt-32 min-h-[80vh]">
      <div className="mx-auto max-w-lg px-4 sm:px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent grid place-items-center shadow-glow mx-auto">
          <Check size={44} className="text-white" strokeWidth={3} />
        </motion.div>

        <p className="text-accent font-semibold text-[14px] tracking-wide uppercase mt-6">{t("conf.step")}</p>
        <h1 className="font-display text-[30px] md:text-[40px] font-bold mt-1">{t("conf.title")}</h1>
        <p className="text-muted mt-2">{t("conf.sub")}</p>

        {loading ? (
          <Loader2 className="animate-spin mt-10 text-neutral-400 mx-auto" />
        ) : res && table ? (
          <div className="mt-8 bg-white border border-line rounded-2xl shadow-card overflow-hidden text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={table.image} alt="" className="w-full h-40 object-cover" />
            <div className="p-6 space-y-4">
              <Row icon={<MapPin size={18} />} label={t("book.table")} value={`${table.label} · ${tZone(res.zone)}`} />
              <Row icon={<Users size={18} />} label={t("conf.guests")} value={`${res.partySize} ${t("conf.people")}`} />
              <Row icon={<CalendarDays size={18} />} label={t("book.date")} value={res.date} />
              <Row icon={<Clock size={18} />} label={t("book.time")} value={res.time} />
              <div className="flex items-center justify-between pt-3 border-t border-line">
                <span className="text-[13px] text-muted">{t("pay.deposit")}</span>
                <span className={clsx("text-[12px] font-semibold px-2.5 py-1 rounded-full",
                  res.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                  {res.paymentStatus === "paid" ? t("conf.paid") : t("conf.unpaid")}
                </span>
              </div>
              <div className="text-[11px] text-muted">{t("conf.no")} #{res.id}</div>
            </div>
          </div>
        ) : (
          <p className="mt-10 text-neutral-400">{t("conf.notFound")}</p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.push("/orders")}
            className="flex-1 bg-accent text-white font-semibold py-4 rounded-full shadow-glow hover:bg-accent-soft transition">{t("conf.viewBookings")}</button>
          <button onClick={() => router.push("/")}
            className="flex-1 bg-white border border-line text-ink font-semibold py-4 rounded-full hover:bg-neutral-50 transition">{t("conf.backHome")}</button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 h-10 rounded-xl bg-neutral-50 grid place-items-center text-accent">{icon}</span>
      <div>
        <div className="text-[11px] text-muted">{label}</div>
        <div className="text-[15px] font-semibold">{value}</div>
      </div>
    </div>
  );
}
