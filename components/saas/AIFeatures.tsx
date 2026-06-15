"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Boxes, MessagesSquare, Crown, ChartBar } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AIFeatures() {
  const { t } = useI18n();

  return (
    <section className="bg-[#0a0a14] text-white py-24 md:py-32 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 right-1/4 w-[520px] h-[520px] rounded-full bg-violet-500/20 blur-[160px]" />
      <div className="pointer-events-none absolute bottom-0 -left-40 w-[440px] h-[440px] rounded-full bg-accent/15 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[12px] font-bold tracking-[0.2em] text-violet-300">{t("saas.aiKicker").toUpperCase()}</p>
          <h2 className="font-display text-[36px] md:text-[52px] font-bold tracking-tight mt-3 leading-[1.05]">
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-accent bg-clip-text text-transparent">
              {t("saas.aiTitle")}
            </span>
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid lg:grid-cols-3 gap-4 mt-14 auto-rows-[180px]">
          {/* Big — Demand forecast */}
          <BentoCard className="lg:col-span-2 lg:row-span-2" icon={<TrendingUp size={16} />} title="Demand forecasting" badge="LIVE">
            <p className="text-white/65 text-[14px]">Predicts hourly demand 14 days out using your history, weather, events. Auto-suggests staff & inventory.</p>
            <div className="mt-5 grid grid-cols-7 gap-1 h-16">
              {[42, 68, 55, 82, 95, 71, 58].map((v, i) => (
                <div key={i} className="flex flex-col items-center justify-end">
                  <div className="w-full bg-gradient-to-t from-violet-500 to-fuchsia-400 rounded-sm" style={{ height: `${v}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-mono text-white/40">
              {["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d=><span key={d}>{d}</span>)}
            </div>
          </BentoCard>

          {/* Upsell */}
          <BentoCard icon={<MessagesSquare size={16} />} title="Smart upsell">
            <p className="text-white/65 text-[13px]">Recommends the right add-on at the right moment. <strong className="text-white">+18% ticket</strong>.</p>
          </BentoCard>

          {/* VIP */}
          <BentoCard icon={<Crown size={16} />} title="VIP detection">
            <p className="text-white/65 text-[13px]">Auto-flags high-value guests so staff prep their preferences before arrival.</p>
          </BentoCard>

          {/* Inventory */}
          <BentoCard icon={<Boxes size={16} />} title="Inventory needs">
            <p className="text-white/65 text-[13px]">Knows what to order tomorrow before you do. Cuts food waste <strong className="text-white">-23%</strong>.</p>
          </BentoCard>

          {/* Segmentation */}
          <BentoCard icon={<ChartBar size={16} />} title="Segmentation">
            <p className="text-white/65 text-[13px]">Auto-clusters guests so marketing speaks to the right person.</p>
          </BentoCard>

          {/* Revenue */}
          <BentoCard icon={<Sparkles size={16} />} title="Revenue forecast" badge="+28% MoM">
            <p className="text-white/65 text-[13px]">Models tomorrow, next week, next quarter — with confidence intervals.</p>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function BentoCard({ children, className = "", icon, title, badge }: { children: React.ReactNode; className?: string; icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 md:p-6 backdrop-blur ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-300 grid place-items-center">{icon}</span>
        <h3 className="font-semibold text-[15px]">{title}</h3>
        {badge && <span className="ml-auto text-[9px] font-bold tracking-widest bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded">{badge}</span>}
      </div>
      <div className="mt-3">{children}</div>
    </motion.div>
  );
}
