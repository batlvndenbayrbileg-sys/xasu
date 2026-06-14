"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star, ChevronRight, UtensilsCrossed, CalendarRange, Sparkles } from "lucide-react";
import CategoryTabs from "@/components/CategoryTabs";
import DishCard from "@/components/DishCard";
import DishMarquee from "@/components/DishMarquee";
import FloatingDishes from "@/components/FloatingDishes";
import PhoShowcase from "@/components/PhoShowcase";
import Testimonials from "@/components/Testimonials";
import { Reveal, Stagger, StaggerItem, CountUp } from "@/components/Reveal";
import { DISHES } from "@/lib/data";
import type { Category } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useI18n();
  const [cat, setCat] = useState<Category>("Specials");
  const dishes = useMemo(() => DISHES.filter((d) => d.category === cat), [cat]);
  const featured = DISHES.filter((d) => d.category === "Specials").slice(0, 8);
  const grid = dishes.length ? dishes : featured;

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const heroLines = t("home.heroTitle").split("\n");

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[92vh] md:min-h-screen flex items-center overflow-hidden">
        <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80"
            alt="" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 hero-overlay" />

        <motion.div style={{ y: contentY, opacity: contentOpacity }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-28 pb-16">
          <div className="max-w-2xl text-white">
            <motion.span initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-4 py-1.5 text-[13px] font-medium">
              <Sparkles size={14} className="text-accent" /> {t("home.badge")}
            </motion.span>
            <h1 className="font-display text-[40px] sm:text-[56px] lg:text-[68px] font-bold leading-[1.05] mt-6">
              {heroLines.map((l, i) => (
                <motion.span key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1], duration: 0.7 }} className="block">
                  {l}
                </motion.span>
              ))}
            </h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="text-[15px] sm:text-[17px] text-white/85 mt-5 max-w-xl leading-relaxed">{t("home.heroSub")}</motion.p>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              className="flex flex-wrap gap-3 mt-8">
              <Link href="/book" className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-7 py-3.5 rounded-full shadow-glow hover:bg-accent-soft hover:gap-3 transition-all">
                {t("home.reserve")} <ArrowRight size={18} />
              </Link>
              <Link href="/menu" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/25 text-white font-semibold px-7 py-3.5 rounded-full hover:bg-white/20 transition">
                {t("home.explore")}
              </Link>
            </motion.div>

            <div className="flex items-center gap-8 mt-12">
              <Stat value={<CountUp to={4.9} />} label={t("home.statRating")} />
              <div className="w-px h-10 bg-white/20" />
              <Stat value={<CountUp to={12} suffix="k+" />} label={t("home.statGuests")} />
              <div className="w-px h-10 bg-white/20" />
              <Stat value="#1" label={t("home.statCity")} />
            </div>
          </div>
        </motion.div>

        {/* scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-white/60">
          <span className="w-5 h-8 rounded-full border border-white/40 grid place-items-start p-1">
            <motion.span animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="w-1 h-1.5 rounded-full bg-white/70" />
          </span>
        </motion.div>
      </section>

      {/* VALUE STRIP */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StaggerItem><Feature icon={<UtensilsCrossed />} title={t("home.feat1Title")} desc={t("home.feat1Desc")} /></StaggerItem>
          <StaggerItem><Feature icon={<CalendarRange />} title={t("home.feat2Title")} desc={t("home.feat2Desc")} /></StaggerItem>
          <StaggerItem><Feature icon={<Star />} title={t("home.feat3Title")} desc={t("home.feat3Desc")} /></StaggerItem>
        </Stagger>
      </section>

      {/* SPECIALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-accent font-semibold text-[14px] tracking-wide uppercase">{t("home.kicker")}</p>
              <h2 className="font-display text-[32px] md:text-[42px] font-bold mt-1">{t("home.specials")}</h2>
            </div>
            <Link href="/menu" className="inline-flex items-center gap-1 text-[14px] font-semibold text-ink hover:text-accent transition self-start md:self-auto">
              {t("home.viewMenu")} <ChevronRight size={16} />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.05}><div className="mt-6"><CategoryTabs value={cat} onChange={setCat} /></div></Reveal>

        <Stagger key={cat} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
          {grid.map((d) => <StaggerItem key={d.id}><DishCard dish={d} /></StaggerItem>)}
        </Stagger>
      </section>

      {/* MOVING DISHES MARQUEE */}
      <DishMarquee />

      {/* FLOATING DISHES SHOWCASE */}
      <FloatingDishes />

      {/* PHO PINNED SHOWCASE — spin-in dishes */}
      <PhoShowcase />

      {/* EVENTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
        <Reveal><h2 className="font-display text-[32px] md:text-[42px] font-bold">{t("home.events")}</h2></Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Reveal dir="right"><EventCard img="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=70"
            title={t("home.event1Title")} date="Feb 16, 2024 · 7:00 PM" badge={t("home.event1Badge")} desc={t("home.event1Desc")} cta={t("home.reserveSpot")} /></Reveal>
          <Reveal dir="left"><EventCard img="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=70"
            title={t("home.event2Title")} date="Feb 23, 2024 · 8:00 PM" desc={t("home.event2Desc")} cta={t("home.reserveSpot")} /></Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-ink text-white px-8 md:px-16 py-14 md:py-20">
            <div className="relative z-10 max-w-xl">
              <h2 className="font-display text-[30px] md:text-[40px] font-bold leading-tight">{t("home.ctaTitle")}</h2>
              <p className="text-white/75 mt-3">{t("home.ctaSub")}</p>
              <Link href="/book" className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-7 py-3.5 rounded-full shadow-glow mt-7 hover:bg-accent-soft hover:gap-3 transition-all">
                {t("home.bookNow")} <ArrowRight size={18} />
              </Link>
            </div>
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 6 }}
              className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-accent/30 blur-3xl" />
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="font-display text-[26px] font-bold">{value}</div>
      <div className="text-[12px] text-white/70">{label}</div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl border border-line shadow-card p-6 flex items-start gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <span className="w-11 h-11 rounded-xl bg-accent/10 text-accent grid place-items-center flex-none">{icon}</span>
      <div>
        <h3 className="font-semibold text-[15px]">{title}</h3>
        <p className="text-[13px] text-muted mt-1">{desc}</p>
      </div>
    </div>
  );
}

function EventCard({ img, title, date, desc, badge, cta }: { img: string; title: string; date: string; desc: string; badge?: string; cta: string }) {
  return (
    <article className="group flex gap-4 md:gap-6 bg-white rounded-2xl border border-line shadow-card overflow-hidden p-3 md:p-4 hover:shadow-xl transition h-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt="" loading="lazy" decoding="async" className="w-28 md:w-44 h-28 md:h-40 rounded-xl object-cover flex-none group-hover:scale-105 transition-transform duration-500" />
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-[17px] md:text-[19px]">{title}</h3>
          {badge && <span className="bg-accent/10 text-accent text-[11px] font-semibold px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
        <p className="text-[12px] text-accent font-medium mt-1">{date}</p>
        <p className="text-[13px] text-muted mt-2 line-clamp-2 md:line-clamp-3">{desc}</p>
        <Link href="/book" className="inline-flex items-center gap-1 text-[13px] font-semibold mt-3 hover:text-accent transition">
          {cta} <ChevronRight size={15} />
        </Link>
      </div>
    </article>
  );
}
