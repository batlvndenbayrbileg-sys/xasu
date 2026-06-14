"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, ChevronRight, UtensilsCrossed, CalendarRange } from "lucide-react";
import CategoryTabs from "@/components/CategoryTabs";
import DishCard from "@/components/DishCard";
import DishMarquee from "@/components/DishMarquee";
import FloatingDishes from "@/components/FloatingDishes";
import PhoShowcase from "@/components/PhoShowcase";
import Testimonials from "@/components/Testimonials";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import { DISHES } from "@/lib/data";
import type { Category } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useI18n();
  const [cat, setCat] = useState<Category>("Specials");
  const dishes = useMemo(() => DISHES.filter((d) => d.category === cat), [cat]);
  const featured = DISHES.filter((d) => d.category === "Specials").slice(0, 8);
  const grid = dishes.length ? dishes : featured;

  // Curated dish photos for the hero marquee — varied across categories.
  const heroImages = useMemo(() => {
    const picks = [
      ...DISHES.filter((d) => d.category === "Specials"),
      ...DISHES.filter((d) => d.category === "Main"),
      ...DISHES.filter((d) => d.category === "Seasonal"),
      ...DISHES.filter((d) => d.category === "Desserts"),
    ];
    // de-dupe images, take 14
    const seen = new Set<string>();
    const out: string[] = [];
    for (const d of picks) {
      if (!seen.has(d.image)) { seen.add(d.image); out.push(d.image); }
      if (out.length >= 14) break;
    }
    return out;
  }, []);

  const heroTitle = t("home.heroTitle");
  const titleNode = (
    <>
      {heroTitle.split("\n").map((line, i) => (
        <span key={i} className="block">{line}</span>
      ))}
    </>
  );

  return (
    <>
      {/* HERO — animated marquee */}
      <AnimatedMarqueeHero
        tagline={t("home.badge")}
        title={titleNode}
        description={t("home.heroSub")}
        ctaText={t("home.reserve")}
        ctaHref="/book"
        secondaryCtaText={t("home.explore")}
        secondaryCtaHref="/menu"
        images={heroImages}
      />

      {/* VALUE STRIP */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
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
