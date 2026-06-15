"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star, ChevronRight, UtensilsCrossed, CalendarRange } from "lucide-react";
import CategoryTabs from "@/components/CategoryTabs";
import DishCard from "@/components/DishCard";
import DishMarquee from "@/components/DishMarquee";
import PhoShowcase from "@/components/PhoShowcase";
import EventCarousel from "@/components/EventCarousel";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import { FlowButton } from "@/components/ui/flow-button";
import {
  ContainerAnimated,
  ContainerInset,
  ContainerScroll,
  ContainerSticky,
  HeroButton,
  HeroImage,
} from "@/components/ui/animated-video-on-scroll";
import { useMediaQuery } from "@/lib/useMediaQuery";
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

      {/* FINAL CTA — Your table is waiting */}
      <FinalCTA />
    </>
  );
}

function RestaurantReveal() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Mobile gets a simple reveal — sticky + clip-path is unreliable on
  // iOS Safari (URL bar resize repaints make clip-path snap to end state).
  // Desktop keeps the full cinematic scroll-driven version.
  return isDesktop ? <RestaurantRevealDesktop /> : <RestaurantRevealMobile />;
}

function RestaurantRevealDesktop() {
  const { t } = useI18n();
  const titleLines = t("home.experienceTitle").split("\n");
  return (
    <section className="mt-24">
      <ContainerScroll className="h-[260vh]">
        <ContainerSticky
          style={{
            background:
              "radial-gradient(60% 60% at 50% 18%, #2a1a0e 0%, #1a1208 35%, #0c0805 75%, #050302 100%)",
          }}
          className="overflow-hidden px-6 py-16 text-white flex flex-col items-center justify-center"
        >
          <ContainerAnimated className="space-y-3 text-center max-w-3xl">
            <p className="text-accent font-semibold text-[13px] tracking-wide uppercase">{t("home.experienceKicker")}</p>
            <h2 className="font-display text-[60px] font-bold leading-[1.05] tracking-tight">
              {titleLines.map((l, i) => (<span key={i} className="block">{l}</span>))}
            </h2>
            <p className="mx-auto max-w-[48ch] text-white/70 text-[16px] pt-2">{t("home.experienceSub")}</p>
          </ContainerAnimated>

          <ContainerInset className="my-8 w-full max-w-5xl aspect-[16/10]">
            <HeroImage
              src="/restaurant-hall.png"
              alt="Xasu dining hall"
              className="w-full h-full object-cover object-center"
            />
          </ContainerInset>

          <ContainerAnimated transition={{ delay: 0.4 }} outputRange={[-120, 0]} inputRange={[0, 0.7]} className="mx-auto w-fit">
            <FlowButton text={t("home.orderFood")} href="/book" variant="light" />
          </ContainerAnimated>
        </ContainerSticky>
      </ContainerScroll>
    </section>
  );
}

function RestaurantRevealMobile() {
  const { t } = useI18n();
  const titleLines = t("home.experienceTitle").split("\n");
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-driven reveal — transform + border-radius only (NO clip-path).
  // This avoids the iOS Safari clip-path corner-rounding snap that creates
  // the mid-animation "rectangle jump" the user reported.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.7], [0.55, 1]);
  const radius = useTransform(scrollYProgress, [0, 0.7], [180, 16]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section ref={sectionRef} className="mt-24 relative">
      <div className="h-[180vh]">
        <div
          className="sticky top-0 h-screen overflow-hidden px-4 py-12 text-white flex flex-col items-center justify-center"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 15%, #2a1a0e 0%, #1a1208 40%, #0c0805 80%, #050302 100%)",
          }}
        >
          <div className="space-y-2.5 text-center max-w-md mx-auto">
            <p className="text-accent font-semibold text-[13px] tracking-wide uppercase">{t("home.experienceKicker")}</p>
            <h2 className="font-display text-[34px] font-bold leading-[1.05] tracking-tight">
              {titleLines.map((l, i) => (<span key={i} className="block">{l}</span>))}
            </h2>
            <p className="mx-auto max-w-[42ch] text-white/70 text-[14px] pt-1">{t("home.experienceSub")}</p>
          </div>

          {/* The image grows from a small pill to a full rounded card.
              transform: scale + border-radius are both GPU-accelerated and
              animate smoothly throughout the entire scroll, no snap. */}
          <motion.div
            style={{
              scale,
              borderRadius: radius,
              opacity,
              willChange: "transform, border-radius",
            }}
            className="my-7 w-full max-w-md aspect-[4/3] overflow-hidden shadow-2xl ring-1 ring-white/10 mx-auto"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/restaurant-hall.png" alt="Xasu dining hall" className="w-full h-full object-cover object-center" />
          </motion.div>

          <motion.div style={{ opacity }} className="text-center">
            <FlowButton text={t("home.orderFood")} href="/book" variant="light" />
          </motion.div>
        </div>
      </div>
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

