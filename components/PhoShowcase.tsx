"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import type { DictKey } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n";

/**
 * Pinned scroll showcase (Adachi "Something Pho Everyone" style):
 * the left headline stays fixed while, on each scroll step, the centre bowl
 * drops in from the top while spinning 360° to the next dish, and the
 * right-hand caption swaps with motion.
 */
const SLIDES: { img: string; titleKey: DictKey; subKey: DictKey }[] = [
  { img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=900&q=80", titleKey: "pho.s1Title", subKey: "pho.s1Sub" },
  { img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80", titleKey: "pho.s2Title", subKey: "pho.s2Sub" },
  { img: "https://images.unsplash.com/photo-1547928576-b822bc410bdf?auto=format&fit=crop&w=900&q=80", titleKey: "pho.s3Title", subKey: "pho.s3Sub" },
  { img: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=900&q=80", titleKey: "pho.s4Title", subKey: "pho.s4Sub" },
];

export default function PhoShowcase() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [index, setIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(SLIDES.length - 1, Math.max(0, Math.floor(v * SLIDES.length - 1e-6)));
    if (i !== index) setIndex(i);
  });

  const slide = SLIDES[index];
  const headLines = t("pho.headline").split("\n");

  return (
    <section ref={ref} className="relative mt-24" style={{ height: `${SLIDES.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#ece3d9] flex items-center pt-16 lg:pt-0">
        <div className="relative mx-auto max-w-7xl w-full px-5 sm:px-6 lg:px-12 flex flex-col lg:grid lg:grid-cols-[1fr_1.1fr_1fr] items-center justify-center gap-5 lg:gap-20 h-full text-center lg:text-left">

          {/* LEFT — headline + CTA */}
          <div className="order-1 lg:order-none z-20">
            <h2 className="font-display font-extrabold uppercase leading-[0.92] tracking-tight text-[#173d2e]
                           text-[clamp(34px,8vw,100px)]">
              {headLines.map((l, i) => <span key={i} className="block">{l}</span>)}
            </h2>
            <Link href="/menu"
              className="inline-flex mt-4 lg:mt-6 bg-[#e23744] text-white font-bold px-7 lg:px-8 py-3 lg:py-3.5 rounded-full hover:brightness-110 transition shadow-lg">
              {t("pho.cta")}
            </Link>
          </div>

          {/* CENTER — bowl drops from top, spinning 360° */}
          <div className="order-2 lg:order-none relative lg:col-start-2 flex items-center justify-center w-full h-[34vh] sm:h-[40vh] lg:h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 w-[52vw] max-w-[320px] aspect-square rounded-full bg-black/15 blur-2xl" />
            <AnimatePresence>
              <motion.img
                key={index}
                src={slide.img}
                alt=""
                initial={{ y: "-120%", rotate: -300, scale: 0.5, opacity: 0 }}
                animate={{ y: 0, rotate: 0, scale: 1, opacity: 1 }}
                exit={{ y: "120%", rotate: 300, scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 70, damping: 16, opacity: { duration: 0.4 } }}
                className="absolute w-[54vw] max-w-[340px] aspect-square rounded-full object-cover ring-1 ring-black/10 shadow-2xl"
              />
            </AnimatePresence>
          </div>

          {/* RIGHT — swapping caption */}
          <div className="order-3 lg:order-none z-20 lg:pl-4">
            <AnimatePresence mode="wait">
              <motion.div key={index}
                initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                <h3 className="font-display font-bold text-[#173d2e] leading-tight text-[clamp(22px,4vw,46px)]">{t(slide.titleKey)}</h3>
                <p className="text-[#173d2e]/70 mt-2 text-[13px] md:text-[16px]">{t(slide.subKey)}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
