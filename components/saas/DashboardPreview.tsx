"use client";

import { motion } from "framer-motion";
import { TrendingUp, Calendar, Users, DollarSign, BarChart3, Sparkles, Activity } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function DashboardPreview() {
  const { t } = useI18n();

  return (
    <section id="tour" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[12px] font-bold tracking-[0.2em] text-accent">{t("saas.dashKicker").toUpperCase()}</p>
          <h2 className="font-display text-[36px] md:text-[52px] font-bold tracking-tight mt-3 leading-[1.05]">
            {t("saas.dashTitle")}
          </h2>
        </div>

        {/* Dashboard mock */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 rounded-3xl border border-line shadow-2xl bg-white overflow-hidden"
        >
          {/* topbar */}
          <div className="flex items-center gap-3 px-5 h-12 border-b border-line bg-neutral-50">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <span className="text-[12px] font-mono text-muted">xasu.app/dashboard</span>
            <div className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" /><span className="relative rounded-full h-2 w-2 bg-emerald-500" /></span>
              LIVE
            </div>
          </div>

          <div className="grid lg:grid-cols-[200px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-line">
            {/* sidebar */}
            <div className="hidden lg:block p-4 bg-neutral-50">
              <div className="text-[10px] uppercase tracking-widest font-bold text-muted mb-2">Workspace</div>
              <ul className="space-y-1">
                {[
                  ["Dashboard", true],
                  ["Reservations", false],
                  ["Tables", false],
                  ["Menu", false],
                  ["Payments", false],
                  ["Customers", false],
                  ["Staff", false],
                  ["Analytics", false],
                ].map(([l, active]) => (
                  <li key={l as string} className={`text-[13px] px-3 py-2 rounded-lg ${active ? "bg-white shadow-sm font-semibold text-ink" : "text-muted hover:text-ink"}`}>{l}</li>
                ))}
              </ul>
            </div>

            {/* main */}
            <div className="p-5 md:p-7">
              {/* KPI row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <Kpi icon={<DollarSign size={14} />} label="Revenue today" value="₮4.1M" delta="+24%" tint="emerald" />
                <Kpi icon={<Calendar size={14} />} label="Reservations" value="142" delta="+18%" tint="sky" />
                <Kpi icon={<Activity size={14} />} label="Occupancy" value="89%" delta="+12%" tint="amber" />
                <Kpi icon={<Users size={14} />} label="Avg spend" value="₮62k" delta="+9%" tint="accent" />
              </div>

              {/* main two-column charts */}
              <div className="grid md:grid-cols-[2fr_1fr] gap-4 mt-5">
                {/* Revenue chart */}
                <div className="bg-neutral-50 border border-line rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[14px]">Revenue · 14 days</h4>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">+28%</span>
                  </div>
                  <div className="mt-4 flex items-end gap-1 h-40">
                    {[35, 48, 41, 56, 62, 58, 72, 65, 70, 84, 78, 90, 88, 96].map((v, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-accent to-amber-400 rounded-sm" style={{ height: `${v}%` }} />
                    ))}
                  </div>
                </div>

                {/* Top dishes */}
                <div className="bg-neutral-50 border border-line rounded-2xl p-5">
                  <h4 className="font-semibold text-[14px]">Top dishes</h4>
                  <ul className="mt-3 space-y-2.5">
                    {[
                      ["Lamb Chops", 92], ["Truffle Pasta", 78], ["Filet Mignon", 65], ["Lava Cake", 52],
                    ].map(([n, p]) => (
                      <li key={n as string} className="text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{n}</span>
                          <span className="text-muted">{p}</span>
                        </div>
                        <div className="mt-1 h-1.5 bg-white rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${p as number}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Forecast strip */}
              <div className="mt-5 bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl p-4 flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-violet-500 text-white grid place-items-center"><Sparkles size={16} /></span>
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-violet-700 uppercase tracking-wide">AI forecast</p>
                  <p className="text-[13px] text-ink mt-0.5">Next Saturday <strong>20:00–22:00</strong> will see <strong>+34% demand</strong>. Open 3 extra tables to capture est. <strong>₮1.2M</strong>.</p>
                </div>
                <button className="text-[12px] font-bold text-violet-700 hover:text-violet-900">Apply →</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Kpi({ icon, label, value, delta, tint }: { icon: React.ReactNode; label: string; value: string; delta: string; tint: string }) {
  const tints: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <div className="bg-white border border-line rounded-2xl p-4">
      <div className={`w-7 h-7 rounded-md grid place-items-center ${tints[tint]}`}>{icon}</div>
      <div className="text-[11px] text-muted mt-3 font-semibold">{label}</div>
      <div className="font-display text-[22px] font-bold mt-0.5 leading-none">{value}</div>
      <div className="text-[11px] font-bold text-emerald-600 mt-1.5">{delta}</div>
    </div>
  );
}
