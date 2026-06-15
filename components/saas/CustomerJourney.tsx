"use client";

import { motion } from "framer-motion";
import { Search, Map, Utensils, CreditCard, Heart, RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const STEPS = [
  { icon: Search, mn: ["Сайтад орох", "Хайлт хийж рестораныг олно"], en: ["Discover", "Find the restaurant"] },
  { icon: Map, mn: ["Ширээ сонгох", "Танхимаас амьд харж сонголт хийнэ"], en: ["Pick a table", "Live floor plan selection"] },
  { icon: Utensils, mn: ["Хоол захиалах", "Цэснээс урьдчилан захиалга"], en: ["Pre-order food", "Browse menu, add to order"] },
  { icon: CreditCard, mn: ["Онлайн төлбөр", "Хадгаламжтай аюулгүй төлбөр"], en: ["Pay online", "Secure deposit upfront"] },
  { icon: Heart, mn: ["Оноо хуримтлуулах", "Үнэнч хөтөлбөрт автоматаар"], en: ["Earn points", "Auto-enrolled to loyalty"] },
  { icon: RotateCcw, mn: ["Дахин ирэх", "VIP түвшин, хувийн санал"], en: ["Return", "VIP tier, personalised offers"] },
];

export default function CustomerJourney() {
  const { t, lang } = useI18n();

  return (
    <section className="bg-gradient-to-b from-[#fafaf7] to-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[12px] font-bold tracking-[0.2em] text-accent">{t("saas.journeyKicker").toUpperCase()}</p>
          <h2 className="font-display text-[36px] md:text-[52px] font-bold tracking-tight mt-3 leading-[1.05]">
            {t("saas.journeyTitle")}
          </h2>
        </div>

        {/* Desktop flow */}
        <div className="hidden md:block mt-16">
          <div className="relative grid grid-cols-6 gap-3">
            {/* connecting line */}
            <div className="pointer-events-none absolute top-10 left-[8%] right-[8%] h-px bg-gradient-to-r from-accent/30 via-accent to-accent/30" />
            {STEPS.map(({ icon: Icon, mn, en }, i) => {
              const [t1, t2] = lang === "mn" ? mn : en;
              return (
                <motion.div
                  key={t1}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="mx-auto w-20 h-20 rounded-full bg-white border-2 border-line shadow-card grid place-items-center text-accent relative">
                    <Icon size={26} />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-ink text-white text-[12px] font-bold grid place-items-center">{i + 1}</span>
                  </div>
                  <h3 className="font-semibold text-[14px] mt-4">{t1}</h3>
                  <p className="text-[12px] text-muted mt-1 px-2 leading-snug">{t2}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile vertical */}
        <div className="md:hidden mt-12 space-y-4">
          {STEPS.map(({ icon: Icon, mn, en }, i) => {
            const [t1, t2] = lang === "mn" ? mn : en;
            return (
              <motion.div
                key={t1}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-start gap-4 bg-white border border-line rounded-2xl p-4"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-accent/10 text-accent grid place-items-center"><Icon size={20} /></div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ink text-white text-[10px] font-bold grid place-items-center">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[14px]">{t1}</h3>
                  <p className="text-[12px] text-muted mt-0.5">{t2}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
