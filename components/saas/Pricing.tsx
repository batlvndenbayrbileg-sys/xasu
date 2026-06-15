"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const PLANS = [
  {
    name: "Starter",
    price: "₮990k",
    period: "/ сар",
    desc: "Бие даасан жижиг ресторан",
    features: [
      "100 ширээ хүртэл",
      "Захиалга + ширээний удирдлага",
      "QR цэс",
      "Үндсэн шинжилгээ",
      "Имэйл дэмжлэг",
    ],
    cta: "Эхлэх",
  },
  {
    name: "Professional",
    price: "₮2.4M",
    period: "/ сар",
    desc: "Өсөж буй өндөр зочны эргэлттэй ресторан",
    features: [
      "Хязгааргүй ширээ",
      "POS + Kitchen Display + CRM",
      "Үнэнч хөтөлбөр",
      "AI зөвлөгөө",
      "Тэргүүлэх 24/7 дэмжлэг",
      "API хандалт",
    ],
    cta: "Demo захиалах",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Yагша",
    period: "захиалга",
    desc: "Сүлжээ, хэд хэдэн салбар",
    features: [
      "Хязгаар үгүй салбар",
      "SSO + RBAC + Audit log",
      "Тусгай SLA + on-call",
      "Зориулсан CSM",
      "Custom интеграц",
      "On-prem options",
    ],
    cta: "Sales-тай ярих",
  },
];

export default function Pricing() {
  const { t } = useI18n();

  return (
    <section id="pricing" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[12px] font-bold tracking-[0.2em] text-accent">{t("saas.priceKicker").toUpperCase()}</p>
          <h2 className="font-display text-[36px] md:text-[52px] font-bold tracking-tight mt-3 leading-[1.05]">{t("saas.priceTitle")}</h2>
          <p className="text-muted text-[15px] md:text-[16px] mt-4">14 хоног үнэгүй туршилт · Картын мэдээлэл шаардахгүй</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-5 mt-14">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-3xl p-7 md:p-8 ${p.highlighted ? "bg-[#070710] text-white border border-accent shadow-2xl scale-[1.02]" : "bg-neutral-50 border border-line"}`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-7 inline-flex items-center gap-1 bg-accent text-white text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                  <Sparkles size={11} /> Popular
                </span>
              )}
              <h3 className={`font-display text-[24px] font-bold ${p.highlighted ? "text-white" : "text-ink"}`}>{p.name}</h3>
              <p className={`text-[13px] mt-1 ${p.highlighted ? "text-white/55" : "text-muted"}`}>{p.desc}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className={`font-display text-[44px] md:text-[52px] font-bold leading-none ${p.highlighted ? "text-white" : "text-ink"}`}>{p.price}</span>
                <span className={`text-[13px] ${p.highlighted ? "text-white/55" : "text-muted"}`}>{p.period}</span>
              </div>

              <ul className="mt-7 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px]">
                    <span className={`shrink-0 w-4 h-4 rounded-full grid place-items-center mt-0.5 ${p.highlighted ? "bg-accent/20 text-accent" : "bg-emerald-100 text-emerald-700"}`}>
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className={p.highlighted ? "text-white/85" : "text-neutral-700"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href="#contact"
                className={`mt-8 block text-center font-semibold py-3.5 rounded-full transition ${p.highlighted ? "bg-accent text-white hover:bg-accent-soft shadow-glow" : "bg-white border border-line text-ink hover:border-accent hover:text-accent"}`}>
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
