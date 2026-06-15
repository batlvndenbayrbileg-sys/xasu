"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Users, MapPin, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const TABLES = [
  { id: "T-01", x: 12, y: 18, status: "available", seats: 2 },
  { id: "T-02", x: 36, y: 14, status: "reserved", seats: 6 },
  { id: "T-03", x: 64, y: 14, status: "occupied", seats: 4 },
  { id: "T-04", x: 88, y: 18, status: "cleaning", seats: 5 },
  { id: "T-05", x: 12, y: 50, status: "available", seats: 2 },
  { id: "T-06", x: 36, y: 48, status: "vip", seats: 8 },
  { id: "T-07", x: 64, y: 48, status: "available", seats: 4 },
  { id: "T-08", x: 88, y: 50, status: "reserved", seats: 3 },
  { id: "T-09", x: 24, y: 80, status: "available", seats: 4 },
  { id: "T-10", x: 50, y: 84, status: "occupied", seats: 6 },
  { id: "T-11", x: 76, y: 80, status: "available", seats: 4 },
];

const STATUS_STYLE: Record<string, string> = {
  available: "bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.55)]",
  reserved: "bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.55)]",
  occupied: "bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.55)]",
  cleaning: "bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.55)]",
  vip: "bg-fuchsia-500 shadow-[0_0_18px_rgba(217,70,239,0.55)]",
};

export default function TableShowcase() {
  const { t } = useI18n();

  return (
    <section className="bg-[#070710] text-white py-24 md:py-32 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="pointer-events-none absolute top-1/3 -left-40 w-[440px] h-[440px] rounded-full bg-accent/20 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
        <div>
          <p className="text-[12px] font-bold tracking-[0.2em] text-accent">{t("saas.tableKicker").toUpperCase()}</p>
          <h2 className="font-display text-[36px] md:text-[52px] font-bold tracking-tight mt-3 leading-[1.05]">
            {t("saas.tableTitle")}
          </h2>
          <p className="text-white/65 text-[16px] md:text-[18px] mt-4 leading-relaxed">
            {t("saas.tableSub")}
          </p>
          <ul className="mt-7 space-y-3 text-[14px] text-white/80">
            {[
              ["Drag & drop ширээ зохион байгуулах"],
              ["Хувийн өрөө, VIP, нүхэн ширээ хүртэл загвар"],
              ["Хүлээж буй жагсаалт автомат удирдлага"],
              ["Захиалга цуцалбал автоматаар нөгөөг санал болгоно"],
            ].map(([s]) => (
              <li key={s} className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/book" className="inline-flex items-center gap-2 bg-white text-[#070710] font-semibold px-5 py-3 rounded-full hover:bg-neutral-200 transition">
              Try live demo <ArrowRight size={15} />
            </Link>
            <Link href="#contact" className="text-[13px] font-semibold text-white/70 hover:text-white transition">
              Book a walkthrough →
            </Link>
          </div>
        </div>

        {/* Floor plan mock */}
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-[#0e0e18] to-[#070710] p-5 md:p-7">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="text-[11px] uppercase tracking-widest text-white/45 font-bold">Indoor · Main hall</div>
            <div className="flex items-center gap-3 text-[10px] text-white/55">
              <Legend dot="bg-emerald-500" label="Sul" />
              <Legend dot="bg-amber-400" label="Захиалсан" />
              <Legend dot="bg-red-500" label="Завгүй" />
              <Legend dot="bg-sky-400" label="Цэвэрлэгдэж" />
              <Legend dot="bg-fuchsia-500" label="VIP" />
            </div>
          </div>
          <div className="relative h-[300px] sm:h-[360px] md:h-[420px] rounded-xl bg-[#13131a] border border-white/5 overflow-hidden">
            {/* faint grid */}
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
            {/* kitchen strip */}
            <div className="absolute top-2 left-1/4 right-1/4 h-6 rounded bg-white/[0.03] border border-white/5 grid place-items-center text-[10px] font-mono text-white/40">OPEN KITCHEN</div>
            {/* bar strip */}
            <div className="absolute bottom-2 left-2 right-2 h-5 rounded bg-white/[0.03] border border-white/5 grid place-items-center text-[10px] font-mono text-white/40">COCKTAIL BAR</div>

            {TABLES.map((tbl, i) => (
              <motion.button
                key={tbl.id}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.04, type: "spring", stiffness: 250 }}
                whileHover={{ scale: 1.18 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${tbl.x}%`, top: `${tbl.y}%` }}
              >
                <span className={`block w-5 h-5 rounded-full ring-2 ring-white/15 transition ${STATUS_STYLE[tbl.status]}`} />
                <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 text-[9px] font-mono text-white/55 group-hover:text-white whitespace-nowrap">
                  {tbl.id}
                </span>
              </motion.button>
            ))}

            {/* Inspector popover */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 1.1 }}
              className="absolute bottom-12 right-4 bg-white text-[#070710] rounded-xl shadow-2xl p-3 w-44"
            >
              <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">Available</div>
              <div className="font-bold text-[13px] mt-1">T-07 · Indoor</div>
              <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1"><MapPin size={10} /> Center hall</div>
              <div className="flex items-center gap-3 mt-2 text-[11px]">
                <span className="inline-flex items-center gap-1 font-semibold"><Users size={11} /> 4 seats</span>
                <span className="inline-flex items-center gap-1 text-muted"><Clock size={11} /> 19:00</span>
              </div>
              <button className="w-full mt-2.5 bg-accent text-white text-[10.5px] font-bold py-1.5 rounded-full">Reserve</button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${dot}`} />{label}</span>;
}
