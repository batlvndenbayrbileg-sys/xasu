"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarRange, Clock, Sparkles } from "lucide-react";
import clsx from "clsx";
import type { DictKey } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n";
import { FlowButton } from "@/components/ui/flow-button";

interface Event {
  titleKey: DictKey;
  descKey: DictKey;
  badgeKey?: DictKey;
  date: string;
  time: string;
  img: string;
  /** Tailwind class for the per-card accent — keeps each card visually distinct. */
  tint: string;
}

const EVENTS: Event[] = [
  {
    titleKey: "home.event3Title",
    descKey: "home.event3Desc",
    badgeKey: "home.event3Badge",
    date: "Feb 14, 2026",
    time: "7:00 PM",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=75",
    tint: "from-rose-500/40 via-rose-500/0 to-transparent",
  },
  {
    titleKey: "home.event1Title",
    descKey: "home.event1Desc",
    badgeKey: "home.event1Badge",
    date: "Feb 16, 2026",
    time: "7:00 PM",
    img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=1200&q=75",
    tint: "from-amber-500/40 via-amber-500/0 to-transparent",
  },
  {
    titleKey: "home.event2Title",
    descKey: "home.event2Desc",
    date: "Feb 23, 2026",
    time: "8:00 PM",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=75",
    tint: "from-violet-500/40 via-violet-500/0 to-transparent",
  },
  {
    titleKey: "home.event5Title",
    descKey: "home.event5Desc",
    badgeKey: "home.event5Badge",
    date: "Mar 02, 2026",
    time: "6:30 PM",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=75",
    tint: "from-emerald-500/40 via-emerald-500/0 to-transparent",
  },
  {
    titleKey: "home.event4Title",
    descKey: "home.event4Desc",
    date: "Mar 09, 2026",
    time: "7:30 PM",
    img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=75",
    tint: "from-fuchsia-500/40 via-fuchsia-500/0 to-transparent",
  },
  {
    titleKey: "home.event6Title",
    descKey: "home.event6Desc",
    date: "Mar 14, 2026",
    time: "11:00 AM",
    img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=75",
    tint: "from-sky-500/40 via-sky-500/0 to-transparent",
  },
];

export default function EventCarousel() {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeRef = useRef(active);
  activeRef.current = active;

  // Compute the active card by tracking which card is closest to the viewport center.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      const center = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      Array.from(el.children).forEach((c, i) => {
        const card = c as HTMLElement;
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const d = Math.abs(cardCenter - center);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setActive(best);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { el.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  const scrollTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[i] as HTMLElement | undefined;
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2, behavior: "smooth" });
  };
  const prev = () => scrollTo(Math.max(0, active - 1));
  const next = () => scrollTo(Math.min(EVENTS.length - 1, active + 1));

  // Auto-advance every 3s, looping back to the first card at the end.
  // Pauses while the user hovers / touches the carousel so it never fights them.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const nextIdx = (activeRef.current + 1) % EVENTS.length;
      scrollTo(nextIdx);
    }, 3000);
    return () => clearInterval(id);
  }, [paused]);

  // Pause autoplay if the tab is hidden — saves CPU and avoids a sudden jump
  // when the user returns.
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-accent font-semibold text-[14px] tracking-wide uppercase inline-flex items-center gap-1.5">
            <Sparkles size={14} /> {t("home.events")}
          </p>
          <h2 className="font-display text-[32px] md:text-[42px] font-bold mt-1">{t("home.events")}</h2>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button onClick={prev} aria-label={t("home.eventPrev")}
            className={clsx("w-11 h-11 rounded-full border border-line bg-white grid place-items-center text-ink transition", active === 0 ? "opacity-40 cursor-not-allowed" : "hover:border-accent hover:text-accent hover:-translate-x-0.5")}
            disabled={active === 0}>
            <ArrowLeft size={17} />
          </button>
          <button onClick={next} aria-label={t("home.eventNext")}
            className={clsx("w-11 h-11 rounded-full border border-line bg-white grid place-items-center text-ink transition", active === EVENTS.length - 1 ? "opacity-40 cursor-not-allowed" : "hover:border-accent hover:text-accent hover:translate-x-0.5")}
            disabled={active === EVENTS.length - 1}>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* the rail */}
      <div className="relative mt-7 -mx-4 sm:-mx-6 lg:-mx-8">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#faf8f5] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#faf8f5] to-transparent z-10" />

        <div ref={trackRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth px-4 sm:px-6 lg:px-8 pb-4">
          {EVENTS.map((ev, i) => (
            <motion.article
              key={ev.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className={clsx(
                "snap-center shrink-0 w-[85%] sm:w-[58%] lg:w-[40%] relative bg-white border border-line rounded-3xl overflow-hidden shadow-card transition-all duration-500",
                i === active ? "lg:scale-[1.02] shadow-xl" : "lg:scale-[0.97] lg:opacity-90"
              )}
            >
              {/* image with tint overlay */}
              <div className="relative h-56 md:h-72 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ev.img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                <div className={clsx("absolute inset-0 bg-gradient-to-t", ev.tint)} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                {/* date pill top-left */}
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur text-ink text-[11px] font-semibold px-2.5 py-1.5 rounded-full">
                  <CalendarRange size={12} className="text-accent" /> {ev.date}
                </div>
                {ev.badgeKey && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-accent text-white text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-glow animate-pulse">
                    {t(ev.badgeKey)}
                  </div>
                )}

                {/* title on image bottom */}
                <h3 className="absolute left-4 right-4 bottom-3 font-display text-white text-[22px] md:text-[26px] font-bold leading-tight">
                  {t(ev.titleKey)}
                </h3>
              </div>

              {/* body */}
              <div className="p-5">
                <div className="flex items-center gap-3 text-[12px] text-muted">
                  <span className="inline-flex items-center gap-1"><Clock size={12} className="text-accent" /> {ev.time}</span>
                </div>
                <p className="text-[14px] text-neutral-600 mt-2.5 line-clamp-3">{t(ev.descKey)}</p>
                <div className="mt-4 flex items-center gap-3">
                  <FlowButton text={t("home.reserveSpot")} href="/book" variant="accent" />
                  <Link href="/menu"
                    className="text-[13px] font-semibold text-ink hover:text-accent transition">
                    {t("home.eventDetails")}
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {EVENTS.map((_, i) => (
            <button key={i} onClick={() => scrollTo(i)} aria-label={`Event ${i + 1}`}
              className={clsx("h-1.5 rounded-full transition-all", i === active ? "w-8 bg-accent" : "w-1.5 bg-neutral-300 hover:bg-neutral-400")} />
          ))}
        </div>
      </div>
    </section>
  );
}
