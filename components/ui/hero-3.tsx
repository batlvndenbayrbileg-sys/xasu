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
        "relative w-full min-h-[auto] md:min-h-[88vh] overflow-hidden bg-[var(--bg)] flex flex-col items-center text-center px-3 sm:px-4 pt-20 md:pt-24 pb-4 md:pb-0",
        className
      )}
    >
      <div className="z-10 flex flex-col items-center max-w-4xl mt-2 md:mt-8 w-full">
        {/* Title with staggered words */}
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="font-display text-[32px] xs:text-[38px] sm:text-[52px] md:text-[64px] lg:text-[72px] font-bold tracking-tight text-ink leading-[1.05] md:leading-[1.02] px-2 sm:px-0"
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
          className="mt-5 md:mt-6 max-w-xl text-[14px] md:text-[17px] text-muted leading-relaxed px-3 sm:px-0"
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

      {/* Animated image marquee — relative on mobile (flows after content),
          absolute on desktop (positioned at bottom of viewport hero). */}
      <div className="mt-6 md:mt-0 relative md:absolute md:bottom-0 md:left-0 w-full md:h-[34%] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_80%,transparent)] pointer-events-none">
        <motion.div
          className="flex gap-4 md:gap-5 px-4 md:h-full items-end pb-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 50, repeat: Infinity }}
        >
          {loop.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] h-32 sm:h-36 md:h-52 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5"
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
