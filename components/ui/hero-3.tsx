"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Sparkles, MapPin, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowButton } from "@/components/ui/flow-button";

interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: string;
  ctaText: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  images: string[];
  className?: string;
}

const FADE = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } as const },
};

/**
 * Premium editorial hero — asymmetric 2-column on desktop, stacked on mobile.
 * Left: kicker + headline + sub + dual CTA + trust strip.
 * Right: a hero dish photo with floating "today's pick" + "live tables" cards.
 * Bottom: minimal dish marquee.
 */
export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  ctaHref = "#",
  secondaryCtaText,
  secondaryCtaHref = "#",
  images,
  className,
}) => {
  const heroImage = images[0] ?? "";
  const inset = images[1] ?? heroImage;
  const loop = [...images, ...images];

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-[var(--bg)] pt-20 md:pt-24 pb-10 md:pb-0",
        className,
      )}
    >
      {/* warm radial spotlight + grain */}
      <div className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(60% 50% at 70% 30%, rgba(255,150,80,0.15) 0%, transparent 70%), radial-gradient(50% 40% at 20% 70%, rgba(180,80,40,0.08) 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' /></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")" }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
        {/* LEFT — copy */}
        <div className="text-center lg:text-left">
          {/* Kicker */}
          <motion.div
            initial="hidden" animate="show" variants={FADE}
            className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-bold tracking-[0.22em] uppercase text-accent"
          >
            <span className="w-8 h-px bg-accent hidden sm:inline-block" />
            {tagline}
            <span className="w-8 h-px bg-accent hidden sm:inline-block" />
          </motion.div>

          {/* Title with staggered words / lines */}
          <motion.h1
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
            className="font-display text-[36px] xs:text-[44px] sm:text-[56px] md:text-[64px] lg:text-[72px] xl:text-[80px] font-bold tracking-tight text-ink leading-[1.04] mt-5"
          >
            {typeof title === "string"
              ? title.split(" ").map((word, i) => (
                  <motion.span key={i} variants={FADE} className="inline-block">{word}&nbsp;</motion.span>
                ))
              : title}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial="hidden" animate="show" variants={FADE}
            transition={{ delay: 0.5 }}
            className="text-[14.5px] md:text-[16.5px] text-muted leading-relaxed mt-5 max-w-xl mx-auto lg:mx-0"
          >
            {description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial="hidden" animate="show" variants={FADE}
            transition={{ delay: 0.6 }}
            className="mt-7 md:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3"
          >
            <FlowButton text={ctaText} href={ctaHref} variant="accent" />
            {secondaryCtaText && <FlowButton text={secondaryCtaText} href={secondaryCtaHref} variant="dark" />}
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
            className="mt-8 md:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-[12px] text-muted"
          >
            <div className="inline-flex items-center gap-1.5">
              <span className="inline-flex">
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}
              </span>
              <strong className="text-ink">4.9</strong> · 8,400+ зочин
            </div>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-neutral-300" />
            <div className="inline-flex items-center gap-1.5"><MapPin size={12} className="text-accent" /> Лас Крусес</div>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-neutral-300" />
            <div className="inline-flex items-center gap-1.5"><Clock size={12} className="text-accent" /> 17:00 — 23:00</div>
          </motion.div>
        </div>

        {/* RIGHT — hero image composition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5] max-h-[640px] mx-auto w-full max-w-md lg:max-w-none"
        >
          {/* Main image */}
          <div className="absolute inset-0 rounded-[28px] overflow-hidden shadow-2xl ring-1 ring-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Floating "Today's pick" card — bottom-left */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute left-4 bottom-4 sm:left-5 sm:bottom-5 bg-white/95 backdrop-blur rounded-2xl shadow-xl p-3 flex items-center gap-3 max-w-[230px]"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={inset} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-accent">Өнөөдрийн онцлох</p>
              <p className="text-[13px] font-semibold text-ink leading-tight truncate">Тогоочийн санал</p>
              <p className="text-[11px] text-muted mt-0.5 inline-flex items-center gap-1">
                <Star size={10} className="fill-amber-400 text-amber-400" /> 4.9 · 12 захиалга
              </p>
            </div>
          </motion.div>

          {/* Floating "Live tables" card — top-right */}
          <motion.div
            initial={{ opacity: 0, y: -10, x: 10 }} animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute right-3 top-3 sm:right-5 sm:top-5 bg-ink text-white rounded-2xl shadow-xl px-3.5 py-2.5"
          >
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Шууд
            </div>
            <div className="text-[14px] font-bold mt-0.5 leading-tight">12 ширээ сул</div>
            <div className="text-[11px] text-white/65 mt-0.5 inline-flex items-center gap-1"><Users size={10} /> Өнөө орой</div>
          </motion.div>

          {/* Accent badge — sparkles top-left */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.1, type: "spring", stiffness: 240 }}
            className="absolute -left-2 -top-2 sm:-left-4 sm:-top-4 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent text-white grid place-items-center shadow-glow rotate-[-12deg]"
          >
            <div className="text-center leading-tight">
              <Sparkles size={14} className="mx-auto" />
              <div className="text-[8px] font-bold uppercase tracking-widest mt-0.5">Шинэ</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom marquee — thin elegant strip */}
      <div className="mt-12 md:mt-16 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] pointer-events-none">
        <motion.div
          className="flex gap-3 md:gap-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 60, repeat: Infinity }}
        >
          {loop.map((src, index) => (
            <div
              key={index}
              className="relative aspect-square h-20 sm:h-24 md:h-28 flex-shrink-0 rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
