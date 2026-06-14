"use client";

import { motion } from "framer-motion";
import { Clock, Phone, Sparkles, Users, Utensils } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "@/components/Reveal";
import { FlowButton } from "@/components/ui/flow-button";

/** Premium "Your table is waiting" call-to-action — dark hero card with a
 *  real interior photo at low opacity, a live-status row, and twin CTAs. */
export default function FinalCTA() {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px] bg-[#0c0a08] text-white">
          {/* atmospheric photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/restaurant-hall.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            aria-hidden="true"
          />
          {/* gradient washes for legibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c0a08]/95 via-[#0c0a08]/65 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a08] via-transparent to-transparent" />

          {/* content */}
          <div className="relative z-10 grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-center px-7 sm:px-10 md:px-14 py-12 md:py-16">
            {/* LEFT — copy + CTAs */}
            <div>
              {/* live pill */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                {t("home.ctaLive")} · {t("home.ctaOpen")} <span className="text-white/55 normal-case">{t("home.ctaUntil")}</span>
              </div>

              <h2 className="font-display text-[34px] md:text-[48px] font-bold leading-[1.05] mt-5">
                {t("home.ctaTitle")}
              </h2>
              <p className="text-white/70 mt-3 max-w-md text-[15px] md:text-[16px] leading-relaxed">
                {t("home.ctaSub")}
              </p>

              {/* dual CTA */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <FlowButton text={t("home.bookNow")} href="/book" variant="light" />
                <a href="tel:+9767011" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-[14px] font-semibold transition group">
                  <span className="w-10 h-10 rounded-full border border-white/15 grid place-items-center group-hover:border-accent group-hover:bg-accent/10 transition">
                    <Phone size={15} />
                  </span>
                  {t("home.ctaCall")}
                </a>
              </div>
            </div>

            {/* RIGHT — live stats card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-6"
            >
              {/* tiny chef-hat ornament */}
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-accent grid place-items-center shadow-glow">
                <Utensils size={16} className="text-white" />
              </div>

              <p className="text-[11px] uppercase tracking-widest text-white/55 font-semibold flex items-center gap-1.5">
                <Sparkles size={12} className="text-accent" /> {t("home.ctaLive")}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <Stat icon={<Users size={15} />} value="12" label={t("home.ctaSeats")} />
                <div className="w-px bg-white/10 mx-auto" />
                <Stat icon={<Clock size={15} />} value="0" suffix={t("home.ctaMin")} label={t("home.ctaWait")} />
              </div>

              {/* mini schedule strip */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <span>17:00</span><span>19:00</span><span>21:00</span><span>23:00</span>
                </div>
                <div className="mt-2 relative h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "62%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-amber-400 rounded-full"
                  />
                </div>
                <p className="mt-2 text-[11px] text-white/55">{t("home.ctaUntil")}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Stat({ icon, value, suffix, label }: { icon: React.ReactNode; value: string; suffix?: string; label: string }) {
  return (
    <div className="text-center col-span-1">
      <div className="flex items-center justify-center gap-1.5 text-accent">{icon}</div>
      <div className="font-display text-[28px] md:text-[34px] font-bold mt-1 leading-none">
        {value}{suffix && <span className="text-[14px] font-semibold text-white/60 ml-1">{suffix}</span>}
      </div>
      <p className="text-[11px] text-white/55 mt-1 leading-tight">{label}</p>
    </div>
  );
}
