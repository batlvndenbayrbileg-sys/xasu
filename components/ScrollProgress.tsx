"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Thin accent progress bar pinned to the very top, tracking page scroll. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-accent origin-left z-[60]"
    />
  );
}
