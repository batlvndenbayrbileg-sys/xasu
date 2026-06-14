"use client";

import { motion } from "framer-motion";

/** Gentle cross-page fade. Opacity-only on purpose — a translate/scale here would
 *  create a containing block and break `position: fixed` children (e.g. the 360°
 *  modal) and sticky sections. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
