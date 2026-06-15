"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PhoneCall, Calendar, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function EnterpriseCTA() {
  const { t } = useI18n();

  return (
    <section id="contact" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[32px] bg-[#070710] text-white px-7 sm:px-12 md:px-16 py-14 md:py-20"
        >
          {/* gradient orbs */}
          <div className="pointer-events-none absolute -top-32 -right-20 w-[460px] h-[460px] rounded-full bg-accent/30 blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 w-[420px] h-[420px] rounded-full bg-fuchsia-500/20 blur-[140px]" />
          {/* grid */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

          <div className="relative z-10 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest">
                <Sparkles size={12} className="text-accent" /> 30-минутын demo
              </div>
              <h2 className="font-display text-[36px] md:text-[56px] font-bold leading-[1.05] tracking-tight mt-5">
                {t("saas.finalTitle")}
              </h2>
              <p className="text-white/70 text-[16px] md:text-[18px] mt-4 max-w-xl leading-relaxed">
                {t("saas.finalSub")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="#contact-form"
                  className="inline-flex items-center gap-2 bg-white text-[#070710] font-semibold px-6 py-3.5 rounded-full hover:bg-neutral-200 transition shadow-[0_8px_30px_rgba(255,255,255,0.15)]">
                  <Calendar size={17} /> {t("saas.bookDemo")} <ArrowRight size={16} />
                </Link>
                <a href="tel:+9767011"
                  className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-full hover:bg-white/5 transition">
                  <PhoneCall size={16} /> +976 7011-0000
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-white/55">
                <span className="inline-flex items-center gap-1.5">✓ 14 хоног үнэгүй туршилт</span>
                <span className="inline-flex items-center gap-1.5">✓ Картын мэдээлэл шаардахгүй</span>
                <span className="inline-flex items-center gap-1.5">✓ 7 хоногт live</span>
              </div>
            </div>

            {/* form card */}
            <div id="contact-form" className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-6">
              <p className="text-[11px] font-bold tracking-widest text-white/55 uppercase">Demo захиалах</p>
              <form className="mt-4 space-y-2.5" onSubmit={(e) => e.preventDefault()}>
                <Input placeholder="Таны нэр" />
                <Input placeholder="Имэйл" type="email" />
                <Input placeholder="Утас" type="tel" />
                <Input placeholder="Рестораны нэр" />
                <select className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-3 text-[13.5px] outline-none focus:border-accent appearance-none text-white">
                  <option className="text-ink">Хичнээн ширээтэй вэ?</option>
                  <option className="text-ink">1–20</option>
                  <option className="text-ink">21–50</option>
                  <option className="text-ink">51–100</option>
                  <option className="text-ink">100+</option>
                </select>
                <button type="submit"
                  className="w-full mt-2 bg-accent text-white font-semibold py-3.5 rounded-full hover:bg-accent-soft transition shadow-glow">
                  Demo цаг захиалах →
                </button>
                <p className="text-[10.5px] text-white/45 text-center">30 минутын дотор бид холбоо барина</p>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Input({ placeholder, type = "text" }: { placeholder: string; type?: string }) {
  return (
    <input type={type} placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-3 text-[13.5px] outline-none focus:border-accent text-white placeholder:text-white/35" />
  );
}
