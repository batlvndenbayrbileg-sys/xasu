"use client";

import { motion } from "framer-motion";
import {
  Calendar, LayoutDashboard, QrCode, CreditCard, MonitorCog, Boxes,
  Users, Heart, BarChart3, Sparkles, Smartphone, Map,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const MODULES = [
  { icon: Calendar, mn: ["Захиалгын систем", "Хүчирхэг calendar, давхар захиалгын хамгаалалт"], en: ["Reservation Management", "Powerful calendar, atomic double-booking guard"] },
  { icon: Map, mn: ["Интерактив танхимын зураг", "Бодит цагт ширээ сонгох, амьд статус"], en: ["Interactive Floor Plan", "Live table selection with real-time status"] },
  { icon: QrCode, mn: ["QR цэс", "Ширээнээс шууд захиалга өгөх"], en: ["QR Menu", "In-table ordering with no app to install"] },
  { icon: CreditCard, mn: ["Онлайн төлбөр", "QPay, картын төлбөр, хадгаламж"], en: ["Online Payments", "QPay, cards, deposits, refunds"] },
  { icon: MonitorCog, mn: ["POS интеграц", "Cash, card, mobile, бүгд нэг кассад"], en: ["POS Integration", "Cash, card, mobile in one register"] },
  { icon: Boxes, mn: ["Бараа материал", "Хөргөгчийн үлдэгдэл, авто захиалга"], en: ["Inventory Management", "Stock levels, auto re-order"] },
  { icon: LayoutDashboard, mn: ["Кухний дэлгэц (KDS)", "Захиалга кухинд шууд харагдана"], en: ["Kitchen Display", "Orders printed and routed instantly"] },
  { icon: Users, mn: ["Зочны CRM", "Хувийн түүх, дуртай хоол, харшил"], en: ["Customer CRM", "Visit history, favourites, allergies"] },
  { icon: Heart, mn: ["Үнэнч хөтөлбөр", "Оноо, шагнал, VIP түвшин"], en: ["Loyalty Program", "Points, rewards, VIP tiers"] },
  { icon: BarChart3, mn: ["Шинжилгээний dashboard", "Орлого, ажилчид, KPI"], en: ["Analytics Dashboard", "Revenue, staff, KPIs"] },
  { icon: Sparkles, mn: ["AI зөвлөгөө", "Эрэлт хэрэгцээ, upsell, forecast"], en: ["AI Insights", "Demand forecast, upsell, predictions"] },
  { icon: Smartphone, mn: ["Гар утасны апп", "Эзэн, менежер, зөөгч, зочин"], en: ["Mobile Apps", "Owner, manager, server, guest"] },
];

export default function PlatformModules() {
  const { t, lang } = useI18n();

  return (
    <section id="platform" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[12px] font-bold tracking-[0.2em] text-accent">{t("saas.modKicker").toUpperCase()}</p>
          <h2 className="font-display text-[36px] md:text-[52px] font-bold tracking-tight mt-3 leading-[1.05]">
            {t("saas.modTitle")}
          </h2>
          <p className="text-muted text-[16px] md:text-[18px] mt-4 leading-relaxed">
            {t("saas.modSub")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-14">
          {MODULES.map(({ icon: Icon, mn, en }, i) => {
            const [title, desc] = lang === "mn" ? mn : en;
            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: i * 0.03 }}
                className="group relative bg-neutral-50 border border-line rounded-2xl p-6 hover:border-accent/40 hover:bg-white hover:shadow-card transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-amber-400 text-white grid place-items-center shadow-[0_8px_24px_rgba(255,106,26,0.35)]">
                  <Icon size={19} />
                </div>
                <h3 className="font-semibold text-[16px] mt-5">{title}</h3>
                <p className="text-[13px] text-muted mt-1.5 leading-relaxed">{desc}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-[12px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
