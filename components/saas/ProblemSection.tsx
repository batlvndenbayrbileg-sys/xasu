"use client";

import { motion } from "framer-motion";
import { TrendingDown, Phone, Repeat, Layers, Users, Clock, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const PROBLEMS = [
  { icon: Phone, stat: "32%", labelMn: "захиалга утсаар алдагдсан", labelEn: "of bookings lost on the phone" },
  { icon: TrendingDown, stat: "24%", labelMn: "ширээний бөглөөсөл нь дэндүү бага", labelEn: "of seat capacity goes empty nightly" },
  { icon: Users, stat: "73%", labelMn: "ресторан зочны мэдээ хадгалдаггүй", labelEn: "of restaurants store no customer data" },
  { icon: Repeat, stat: "11%", labelMn: "л зочин буцаж ирдэг", labelEn: "of guests ever return" },
  { icon: Layers, stat: "6+", labelMn: "тусдаа систем нэг ресторанд", labelEn: "disconnected tools per restaurant" },
  { icon: Clock, stat: "4 цаг", labelMn: "өдөр бүр гар тайлан, тооцоонд", labelEn: "daily lost to manual ops & reports" },
];

export default function ProblemSection() {
  const { t, lang } = useI18n();

  return (
    <section className="relative bg-[#fafaf7] py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.2em] text-red-500">
            <AlertTriangle size={14} /> {t("saas.probKicker").toUpperCase()}
          </div>
          <h2 className="font-display text-[36px] md:text-[52px] font-bold tracking-tight mt-3 leading-[1.05]">
            {t("saas.probTitle")}
          </h2>
          <p className="text-muted text-[16px] md:text-[18px] mt-4 leading-relaxed">
            {t("saas.probSub")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mt-14">
          {PROBLEMS.map(({ icon: Icon, stat, labelMn, labelEn }, i) => (
            <motion.div
              key={stat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative bg-white border border-line rounded-2xl p-7 hover:border-red-200 hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-red-50 grid place-items-center text-red-500">
                <Icon size={18} />
              </div>
              <div className="font-display text-[42px] md:text-[48px] font-bold text-ink mt-5 leading-none tracking-tight">
                {stat}
              </div>
              <p className="text-[14px] text-muted mt-2 leading-snug">{lang === "mn" ? labelMn : labelEn}</p>
              <div className="mt-5 pt-5 border-t border-line text-[12px] font-semibold text-red-500">
                Xasu fixes this →
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
