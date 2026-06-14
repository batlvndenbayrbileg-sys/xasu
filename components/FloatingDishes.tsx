"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { DISHES } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

/**
 * Adachi-style showcase: a clean stage with big serif typography while plated
 * dishes float and parallax at different speeds as the section scrolls past.
 */
export default function FloatingDishes() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // heading drifts slowly upward + fades
  const headY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const titleLines = t("home.tasteTitle").split("\n");
  const pick = (id: string) => DISHES.find((d) => d.id === id)!;

  return (
    <section ref={ref} className="relative overflow-hidden mt-24 bg-white">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[120vh] md:min-h-[150vh]">
        {/* big serif heading layer */}
        <motion.div style={{ y: headY }} className="sticky top-[24%] z-0 pointer-events-none select-none text-center">
          <p className="text-accent font-semibold text-[13px] md:text-[14px] tracking-[0.2em] uppercase">{t("home.tasteKicker")}</p>
          <h2 className="font-display font-bold leading-[0.95] text-[clamp(48px,11vw,160px)] text-ink/90 mt-2">
            {titleLines.map((l, i) => <span key={i} className="block">{l}</span>)}
          </h2>
          <p className="text-muted max-w-md mx-auto mt-5 text-[14px] md:text-[15px]">{t("home.tasteSub")}</p>
        </motion.div>

        {/* floating plates */}
        <FloatingDish progress={scrollYProgress} img={pick("d1").image} round
          className="left-[2%] top-[8%] w-36 h-36 md:w-60 md:h-60" range={[120, -120]} dur={7} rot={-3} />
        <FloatingDish progress={scrollYProgress} img={pick("d14").image} round
          className="right-[4%] top-[6%] w-28 h-28 md:w-44 md:h-44" range={[180, -160]} dur={8.5} rot={4} />
        <FloatingDish progress={scrollYProgress} img={pick("d16").image} round
          className="right-[8%] top-[46%] w-40 h-40 md:w-64 md:h-64" range={[90, -90]} dur={9} rot={3} />
        <FloatingDish progress={scrollYProgress} img={pick("d8").image} round
          className="left-[6%] top-[52%] w-32 h-32 md:w-52 md:h-52" range={[150, -140]} dur={7.8} rot={-4} />
        <FloatingDish progress={scrollYProgress} img={pick("d7").image} round hideMobile
          className="left-[42%] top-[72%] w-28 h-28 md:w-40 md:h-40" range={[200, -120]} dur={8} rot={2} />
        <FloatingDish progress={scrollYProgress} img={pick("d5").image} round hideMobile
          className="right-[30%] top-[80%] w-24 h-24 md:w-36 md:h-36" range={[60, -180]} dur={9.5} rot={-2} />

        {/* CTA pinned near the bottom of the stage */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[6%] z-10 text-center">
          <Link href="/menu"
            className="inline-flex items-center gap-2 bg-ink text-white font-semibold px-7 py-3.5 rounded-full hover:bg-accent transition-colors shadow-lg">
            {t("home.viewMenu")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function FloatingDish({
  progress, img, className, range, dur, rot, round, hideMobile,
}: {
  progress: MotionValue<number>; img: string; className: string;
  range: [number, number]; dur: number; rot: number; round?: boolean; hideMobile?: boolean;
}) {
  const y = useTransform(progress, [0, 1], range);
  return (
    <motion.div style={{ y }} className={`absolute z-[1] ${className} ${hideMobile ? "hidden md:block" : ""}`}>
      <motion.div
        animate={{ y: [0, -16, 0], rotate: [0, rot, 0] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
        className={`w-full h-full overflow-hidden shadow-2xl ring-1 ring-black/5 ${round ? "rounded-full" : "rounded-[42%]"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
      </motion.div>
    </motion.div>
  );
}
