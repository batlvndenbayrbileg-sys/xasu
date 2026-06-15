"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles, TrendingUp, Calendar, CreditCard, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function SaasHero() {
  const { t } = useI18n();
  const titleLines = t("saas.heroTitle").split("\n");

  return (
    <section className="relative overflow-hidden bg-[#070710] text-white pt-28 md:pt-32 pb-20 md:pb-28">
      {/* grid texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/3 w-[640px] h-[640px] rounded-full bg-accent/25 blur-[160px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 w-[480px] h-[480px] rounded-full bg-fuchsia-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-10 items-center">
        {/* LEFT — copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-3.5 py-1.5 text-[12px] font-medium"
          >
            <Sparkles size={13} className="text-accent" />
            <span className="text-white/85">{t("saas.kicker")}</span>
            <span className="hidden sm:inline text-white/40">·</span>
            <span className="hidden sm:inline text-emerald-300 font-semibold">YC W26</span>
          </motion.div>

          <h1 className="font-display font-bold tracking-tight leading-[1.04] text-[42px] sm:text-[58px] md:text-[68px] lg:text-[74px] mt-6">
            {titleLines.map((l, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                {i === 1 ? (
                  <span className="bg-gradient-to-r from-accent via-amber-300 to-rose-400 bg-clip-text text-transparent">
                    {l}
                  </span>
                ) : l}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white/65 text-[16px] md:text-[18px] mt-6 max-w-xl leading-relaxed"
          >
            {t("saas.heroSub")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="#contact"
              className="inline-flex items-center gap-2 bg-white text-[#070710] font-semibold px-6 py-3.5 rounded-full hover:bg-neutral-200 transition shadow-[0_8px_30px_rgba(255,255,255,0.15)]">
              {t("saas.bookDemo")} <ArrowRight size={17} />
            </Link>
            <Link href="#tour"
              className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-full hover:bg-white/5 transition">
              <PlayCircle size={17} /> {t("saas.watchTour")}
            </Link>
          </motion.div>

          {/* social proof strip */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <p className="text-[11px] tracking-[0.2em] font-semibold text-white/40">{t("saas.trustedBy")}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 opacity-70">
              {["MOGUL DINING", "OLD STONE", "AKARI", "PASTA NORD", "BLUEFIN", "OBSIDIAN"].map((n) => (
                <span key={n} className="font-display text-[15px] font-bold tracking-[0.18em] text-white/55">{n}</span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT — product mockup composition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[440px] sm:h-[520px] lg:h-[560px]"
        >
          {/* Main dashboard panel */}
          <div className="absolute inset-x-2 top-4 bottom-12 bg-gradient-to-br from-[#13131a] to-[#0a0a12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 h-9 border-b border-white/5 bg-white/[0.02]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-3 text-[11px] text-white/40 font-mono">xasu.app/dashboard</span>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3">
              <KpiTile icon={<Calendar size={13} />} label="Today" value="42" delta="+18%" tint="emerald" />
              <KpiTile icon={<CreditCard size={13} />} label="Revenue" value="₮4.1M" delta="+24%" tint="amber" />
              <KpiTile icon={<TrendingUp size={13} />} label="Occupancy" value="89%" delta="+12%" tint="violet" />
            </div>
            <div className="px-4">
              <div className="text-[11px] uppercase tracking-widest text-white/40 font-semibold flex items-center gap-1.5">
                <Sparkles size={10} className="text-accent" /> Live revenue · 7d
              </div>
              <div className="mt-2 h-24 flex items-end gap-1.5">
                {[42, 58, 38, 67, 55, 78, 96].map((v, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-accent to-amber-300 rounded-t-sm" style={{ height: `${v}%` }} />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[9px] text-white/35 font-mono">
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => <span key={d}>{d}</span>)}
              </div>
            </div>
            <div className="m-4 mt-3 rounded-lg bg-white/[0.03] border border-white/5 p-3">
              <div className="flex items-center gap-2">
                <Users size={12} className="text-emerald-400" />
                <span className="text-[11px] text-white/80 font-semibold">Recent bookings</span>
                <span className="ml-auto text-[10px] text-white/40">LIVE</span>
              </div>
              <div className="mt-2 space-y-1.5">
                {[
                  ["T-04", "19:00", "4 guests", "emerald"],
                  ["T-11", "20:00", "8 guests", "amber"],
                  ["T-02", "21:30", "6 guests", "violet"],
                ].map(([t, time, g, c]) => (
                  <div key={t as string} className="flex items-center gap-2 text-[10.5px]">
                    <span className={`w-1.5 h-1.5 rounded-full bg-${c}-400`} />
                    <span className="font-mono text-white/75">{t}</span>
                    <span className="text-white/40">{time}</span>
                    <span className="text-white/55 ml-auto">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating phone */}
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="absolute -bottom-4 -left-2 lg:-left-12 w-[148px] h-[300px] rounded-[28px] bg-[#0a0a12] border border-white/12 shadow-2xl overflow-hidden rotate-[-6deg]"
          >
            <div className="h-5 bg-black grid place-items-center"><div className="w-12 h-1 bg-white/30 rounded-full" /></div>
            <div className="p-2.5">
              <div className="text-[8.5px] uppercase tracking-widest text-white/40 font-bold">Xasu · Guest</div>
              <div className="font-display text-[14px] font-bold text-white mt-1 leading-tight">Reserve a table</div>
              <div className="mt-3 grid grid-cols-4 gap-1">
                {["TUE", "WED", "THU", "FRI"].map((d, i) => (
                  <div key={d} className={`text-center py-1.5 rounded text-[8px] font-bold ${i === 1 ? "bg-accent text-white" : "bg-white/5 text-white/55"}`}>
                    {d}<br /><span className="text-[10px]">{14 + i}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1">
                {["19:00", "20:00", "21:00"].map((tm, i) => (
                  <div key={tm} className={`text-center py-1 rounded text-[8.5px] font-bold ${i === 0 ? "bg-white text-black" : "bg-white/5 text-white/60"}`}>
                    {tm}
                  </div>
                ))}
              </div>
              <div className="mt-3 h-32 rounded-lg bg-gradient-to-br from-[#1a1410] to-[#0e0a07] border border-white/10 relative overflow-hidden">
                {/* mini floorplan dots */}
                {[
                  [22, 28, "emerald"], [55, 22, "amber"], [82, 28, "red"],
                  [50, 55, "emerald"], [22, 75, "violet"], [82, 70, "emerald"],
                ].map(([x, y, c], i) => (
                  <span key={i} className={`absolute w-2 h-2 rounded-full bg-${c}-400 shadow-[0_0_8px_currentColor]`} style={{ left: `${x}%`, top: `${y}%` }} />
                ))}
              </div>
              <button className="w-full mt-2.5 bg-accent text-white text-[9px] font-bold py-1.5 rounded-full">Continue</button>
            </div>
          </motion.div>

          {/* Floating notification card */}
          <motion.div
            initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="absolute top-12 -right-2 lg:-right-6 w-[200px] bg-white text-[#070710] rounded-2xl shadow-2xl p-3.5 rotate-[4deg]"
          >
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" /><span className="relative rounded-full h-2 w-2 bg-emerald-500" /></span>
              New booking
            </div>
            <div className="mt-1.5 text-[13px] font-semibold leading-tight">Bayasaa C. · T-04</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Today 19:00 · 4 guests</div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">PAID ₮20,000</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function KpiTile({ icon, label, value, delta, tint }: { icon: React.ReactNode; label: string; value: string; delta: string; tint: string }) {
  const tints: Record<string, string> = {
    emerald: "bg-emerald-500/15 text-emerald-300",
    amber: "bg-amber-500/15 text-amber-300",
    violet: "bg-violet-500/15 text-violet-300",
  };
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2.5">
      <div className={`w-6 h-6 rounded grid place-items-center ${tints[tint]}`}>{icon}</div>
      <div className="text-[9.5px] uppercase tracking-widest text-white/45 font-bold mt-2">{label}</div>
      <div className="font-display text-[18px] font-bold text-white leading-none mt-1">{value}</div>
      <div className="text-[9.5px] font-semibold text-emerald-400 mt-1">{delta}</div>
    </div>
  );
}
