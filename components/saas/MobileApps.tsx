"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const APPS = [
  { name: "Owner", color: "from-violet-500 to-fuchsia-500", lines: ["Revenue ↑ 24%", "Occupancy 89%", "AI forecast"], mn: "Эзэн" },
  { name: "Manager", color: "from-sky-500 to-cyan-500", lines: ["Today · 142", "Reservations", "Walk-ins · 24"], mn: "Менежер" },
  { name: "Server", color: "from-emerald-500 to-teal-500", lines: ["T-04 · ready", "T-11 · order in", "Tip avg ₮14k"], mn: "Зөөгч" },
  { name: "Guest", color: "from-accent to-amber-400", lines: ["Reserve table", "View menu", "Earn points"], mn: "Зочин" },
];

export default function MobileApps() {
  const { t, lang } = useI18n();

  return (
    <section className="bg-[#fafaf7] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[12px] font-bold tracking-[0.2em] text-accent">{t("saas.mobKicker").toUpperCase()}</p>
          <h2 className="font-display text-[36px] md:text-[52px] font-bold tracking-tight mt-3 leading-[1.05]">{t("saas.mobTitle")}</h2>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {APPS.map((app, i) => (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col items-center"
            >
              {/* Phone */}
              <div className="relative w-full max-w-[180px] aspect-[9/19] rounded-[28px] bg-[#0a0a14] border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-5 bg-black grid place-items-center"><div className="w-12 h-1 bg-white/30 rounded-full" /></div>
                <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-20`} />
                <div className="absolute inset-0 p-3 pt-7 flex flex-col text-white">
                  <div className="text-[8px] font-bold uppercase tracking-widest text-white/55">Xasu · {app.name}</div>
                  <div className="font-display text-[15px] font-bold mt-1 leading-tight">{lang === "mn" ? app.mn : app.name}</div>
                  <div className="text-[8px] text-white/55 mt-1">Live dashboard</div>

                  <div className="mt-4 space-y-2">
                    {app.lines.map((l, idx) => (
                      <div key={l} className="bg-white/10 backdrop-blur rounded-lg p-2 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-white">{l}</span>
                        <span className={`w-1.5 h-1.5 rounded-full bg-white/${50 + idx * 10}`} />
                      </div>
                    ))}
                  </div>

                  {/* mini chart */}
                  <div className="mt-auto h-12 flex items-end gap-0.5">
                    {[40, 55, 38, 65, 70, 52, 80].map((v, idx) => (
                      <div key={idx} className={`flex-1 bg-gradient-to-t ${app.color} rounded-sm`} style={{ height: `${v}%` }} />
                    ))}
                  </div>
                  <button className={`mt-2 w-full bg-gradient-to-r ${app.color} text-white text-[8.5px] font-bold py-1.5 rounded-full`}>Open dashboard</button>
                </div>
              </div>
              <h3 className="font-semibold text-[15px] mt-5">{lang === "mn" ? app.mn : app.name}</h3>
              <p className="text-[12px] text-muted">{app.name} app</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
