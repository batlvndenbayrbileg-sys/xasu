"use client";

import { motion } from "framer-motion";
import { TrendingUp, Calendar, DollarSign, RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const STUDIES = [
  {
    name: "Mogul Dining",
    tagline: "Fine dining · 80 seats · Ulaanbaatar",
    mn: "6 сарын дотор Xasu-руу шилжсэнээр захиалга, орлогын өсөлт.",
    en: "Within 6 months of moving to Xasu, both bookings and revenue jumped.",
    stats: [
      { label: "Reservations", value: "+37%", icon: Calendar, tint: "bg-emerald-50 text-emerald-700" },
      { label: "Avg ticket", value: "+18%", icon: DollarSign, tint: "bg-amber-50 text-amber-700" },
      { label: "Repeat guests", value: "+24%", icon: RotateCcw, tint: "bg-sky-50 text-sky-700" },
      { label: "Ops efficiency", value: "+31%", icon: TrendingUp, tint: "bg-violet-50 text-violet-700" },
    ],
  },
  {
    name: "Old Stone",
    tagline: "Steakhouse · 120 seats · Erdenet",
    mn: "Гар ажиллагааны дарамтыг бууруулж, үнэнч зочны бааз 2.4х өсгөв.",
    en: "Cut manual ops dramatically and 2.4×'d their loyal-guest base.",
    stats: [
      { label: "No-shows", value: "−62%", icon: Calendar, tint: "bg-emerald-50 text-emerald-700" },
      { label: "Loyalty signups", value: "2.4×", icon: RotateCcw, tint: "bg-sky-50 text-sky-700" },
      { label: "Food waste", value: "−23%", icon: TrendingUp, tint: "bg-violet-50 text-violet-700" },
      { label: "Revenue", value: "+28%", icon: DollarSign, tint: "bg-amber-50 text-amber-700" },
    ],
  },
  {
    name: "Akari",
    tagline: "Izakaya group · 4 venues · Asia",
    mn: "Дөрвөн салбараа нэг dashboard-аас удирдан, нийт ROI 4.1×.",
    en: "Runs 4 venues from one dashboard. Net ROI 4.1× in year one.",
    stats: [
      { label: "ROI (Y1)", value: "4.1×", icon: DollarSign, tint: "bg-amber-50 text-amber-700" },
      { label: "Booking time", value: "−47%", icon: Calendar, tint: "bg-emerald-50 text-emerald-700" },
      { label: "Avg cover", value: "+22%", icon: TrendingUp, tint: "bg-violet-50 text-violet-700" },
      { label: "VIP retention", value: "+58%", icon: RotateCcw, tint: "bg-sky-50 text-sky-700" },
    ],
  },
];

export default function CaseStudies() {
  const { t, lang } = useI18n();

  return (
    <section id="customers" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[12px] font-bold tracking-[0.2em] text-accent">{t("saas.caseKicker").toUpperCase()}</p>
          <h2 className="font-display text-[36px] md:text-[52px] font-bold tracking-tight mt-3 leading-[1.05]">{t("saas.caseTitle")}</h2>
        </div>

        <div className="mt-14 space-y-5">
          {STUDIES.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-neutral-50 border border-line rounded-3xl p-6 md:p-8 grid lg:grid-cols-[1fr_2fr] gap-6 lg:gap-10"
            >
              <div>
                <span className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase">Case · {String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-[26px] md:text-[32px] font-bold mt-2 leading-tight">{s.name}</h3>
                <p className="text-[12px] text-muted mt-1">{s.tagline}</p>
                <p className="text-[14px] text-neutral-700 mt-4 leading-relaxed">{lang === "mn" ? s.mn : s.en}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {s.stats.map(({ label, value, icon: Icon, tint }) => (
                  <div key={label} className="bg-white border border-line rounded-2xl p-4">
                    <div className={`w-7 h-7 rounded-md grid place-items-center ${tint}`}><Icon size={14} /></div>
                    <div className="font-display text-[26px] md:text-[28px] font-bold mt-3 leading-none">{value}</div>
                    <div className="text-[11px] text-muted font-semibold mt-1.5">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
