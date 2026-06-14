"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, ChevronRight, UtensilsCrossed, CalendarRange } from "lucide-react";
import CategoryTabs from "@/components/CategoryTabs";
import DishCard from "@/components/DishCard";
import DishMarquee from "@/components/DishMarquee";
import PhoShowcase from "@/components/PhoShowcase";
import EventCarousel from "@/components/EventCarousel";
import Testimonials from "@/components/Testimonials";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import {
  ContainerAnimated,
  ContainerInset,
  ContainerScroll,
  ContainerSticky,
  HeroButton,
  HeroImage,
} from "@/components/ui/animated-video-on-scroll";
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

      {/* RESTAURANT AMBIENCE — scroll-driven cinematic reveal */}
      <RestaurantReveal />

      {/* PHO PINNED SHOWCASE — spin-in dishes */}
      <PhoShowcase />

      {/* EVENTS — swipeable carousel */}
      <EventCarousel />

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

function RestaurantReveal() {
  const { t } = useI18n();
  const titleLines = t("home.experienceTitle").split("\n");
  return (
    <section className="mt-24">
      <ContainerScroll className="h-[280vh]">
        <ContainerSticky
          style={{
            background:
              "radial-gradient(60% 60% at 50% 18%, #2a1a0e 0%, #1a1208 35%, #0c0805 75%, #050302 100%)",
          }}
          className="overflow-hidden px-6 py-16 text-white"
        >
          <ContainerAnimated className="space-y-3 text-center">
            <p className="text-accent font-semibold text-[13px] tracking-wide uppercase">{t("home.experienceKicker")}</p>
            <h2 className="font-display text-[40px] md:text-[64px] font-bold leading-[1.05] tracking-tight">
              {titleLines.map((l, i) => (<span key={i} className="block">{l}</span>))}
            </h2>
            <p className="mx-auto max-w-[48ch] text-white/70 text-[15px] md:text-[16px] pt-2">
              {t("home.experienceSub")}
            </p>
          </ContainerAnimated>

          <ContainerInset className="max-h-[520px] w-auto py-8">
            <HeroImage
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80"
              alt="GourmetGrove dining room"
            />
          </ContainerInset>

          <ContainerAnimated
            transition={{ delay: 0.4 }}
            outputRange={[-120, 0]}
            inputRange={[0, 0.7]}
            className="mx-auto mt-2 w-fit"
          >
            <Link href="/book">
              <HeroButton>
                <UtensilsCrossed size={16} className="mr-2 text-white" />
                {t("home.orderFood")}
              </HeroButton>
            </Link>
          </ContainerAnimated>
        </ContainerSticky>
      </ContainerScroll>
    </section>
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

