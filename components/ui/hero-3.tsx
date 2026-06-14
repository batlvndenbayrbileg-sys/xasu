"use client";

import React from "react";
import { motion } from "framer-motion";
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

const FADE_IN = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } as const },
};

/**
 * Centered "marquee-floor" hero. Adapted from the shadcn pattern to this
 * project's tokens (bg-white, text-ink, text-muted, border-line, bg-accent).
 * The bottom marquee fades in/out and accepts any image set — pass dish
 * photos for a restaurant homepage.
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
  // Duplicate for seamless loop; ensure we always have enough to fill width
  const loop = [...images, ...images, ...images];

  return (
    <section
      className={cn(
        "relative w-full min-h-[78vh] md:min-h-[88vh] overflow-hidden bg-[#faf8f5] flex flex-col items-center text-center px-4 pt-20 md:pt-24",
        className
      )}
    >
      {/* soft ambient glows */}
      <div className="pointer-events-none absolute -top-32 left-1/4 w-[520px] h-[520px] rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-0 w-[420px] h-[420px] rounded-full bg-amber-200/20 blur-3xl" />

      <div className="z-10 flex flex-col items-center max-w-4xl mt-4 md:mt-8">
        {/* Tagline pill */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-1.5 text-[13px] font-medium text-muted backdrop-blur-sm shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          {tagline}
        </motion.div>

        {/* Title with staggered words */}
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="font-display text-[44px] sm:text-[64px] md:text-[78px] font-bold tracking-tight text-ink leading-[1.02]"
        >
          {typeof title === "string"
            ? title.split(" ").map((word, i) => (
                <motion.span key={i} variants={FADE_IN} className="inline-block">
                  {word}&nbsp;
                </motion.span>
              ))
            : title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-xl text-[15px] md:text-[17px] text-muted leading-relaxed"
        >
          {description}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <FlowButton text={ctaText} href={ctaHref} variant="accent" />
          {secondaryCtaText && <FlowButton text={secondaryCtaText} href={secondaryCtaHref} variant="dark" />}
        </motion.div>
      </div>

      {/* Animated image marquee */}
      <div className="absolute bottom-0 left-0 w-full h-[28%] md:h-[34%] [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_80%,transparent)] pointer-events-none">
        <motion.div
          className="flex gap-4 md:gap-5 px-4 h-full items-end pb-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 50, repeat: Infinity }}
        >
          {loop.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] h-36 md:h-52 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5"
              style={{ rotate: `${index % 2 === 0 ? -3 : 4}deg` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
