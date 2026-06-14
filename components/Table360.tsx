"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { X, Move, Plus, Minus, ScanLine, Users, Compass } from "lucide-react";
import type { RestaurantTable } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

/**
 * Immersive 360°/AR-style table preview.
 * A wide panorama you can drag to look around (with momentum + idle auto-pan),
 * an AR-style HUD reticle, a pulsing "your table" hotspot, zoom, and Book now.
 */
export default function Table360({
  table, onClose, onBook,
}: { table: RestaurantTable | null; onClose: () => void; onBook: () => void }) {
  const { t, tZone } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);

  // gentle idle auto-pan until the user grabs it
  useEffect(() => {
    if (!table) return;
    setZoom(1);
    controls.set({ x: 0 });
    controls.start({ x: [0, -90, 0, 90, 0], transition: { duration: 26, ease: "easeInOut", repeat: Infinity } });
    return () => controls.stop();
  }, [table, controls]);

  // lock body scroll + Esc to close while open
  useEffect(() => {
    if (!table) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [table, onClose]);

  return (
    <AnimatePresence>
      {table && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full h-full sm:h-[80vh] sm:max-w-4xl sm:rounded-3xl overflow-hidden bg-black"
          >
            {/* panorama */}
            <div ref={containerRef} className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing">
              <motion.img
                src={table.pano}
                alt={table.label}
                draggable={false}
                drag="x"
                dragConstraints={containerRef}
                dragElastic={0.06}
                onDragStart={() => { setDragging(true); controls.stop(); }}
                onDragEnd={() => setDragging(false)}
                animate={controls}
                style={{ scale: zoom }}
                className="h-full w-auto max-w-none object-cover select-none origin-center"
              />
              {/* depth vignette */}
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_160px_60px_rgba(0,0,0,.65)]" />
            </div>

            {/* AR reticle */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <motion.div
                animate={{ opacity: dragging ? 0.25 : 0.6, scale: dragging ? 1.1 : 1 }}
                className="relative w-40 h-40">
                <ScanLine className="absolute inset-0 m-auto text-white/40" size={42} />
                <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/60 rounded-tl-lg" />
                <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/60 rounded-tr-lg" />
                <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/60 rounded-bl-lg" />
                <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/60 rounded-br-lg" />
              </motion.div>
            </div>

            {/* hotspot pin */}
            <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="relative grid place-items-center">
                <span className="absolute w-10 h-10 rounded-full bg-accent/40 animate-pulse-ring" />
                <span className="w-4 h-4 rounded-full bg-accent ring-4 ring-white/80 shadow-lg" />
                <span className="absolute -top-9 whitespace-nowrap bg-white text-ink text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                  {t("v360.here")}
                </span>
              </div>
            </div>

            {/* top bar */}
            <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-white text-[12px] font-semibold px-3 py-1.5 rounded-full">
                <Compass size={14} /> {t("v360.ar")}
              </span>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/15 backdrop-blur grid place-items-center text-white hover:bg-white/25 transition">
                <X size={20} />
              </button>
            </div>

            {/* zoom */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              <button onClick={() => setZoom((z) => Math.min(2, +(z + 0.2).toFixed(2)))}
                className="w-10 h-10 rounded-full bg-white/90 grid place-items-center shadow hover:scale-105 transition"><Plus size={18} /></button>
              <button onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(2)))}
                className="w-10 h-10 rounded-full bg-white/90 grid place-items-center shadow hover:scale-105 transition"><Minus size={18} /></button>
            </div>

            {/* drag hint */}
            <AnimatePresence>
              {!dragging && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-28 inline-flex items-center gap-2 bg-black/55 backdrop-blur text-white text-[12px] px-3.5 py-2 rounded-full">
                  <Move size={14} /> {t("v360.drag")}
                </motion.div>
              )}
            </AnimatePresence>

            {/* bottom card */}
            <div className="absolute bottom-0 inset-x-0 p-4">
              <div className="bg-white/95 backdrop-blur rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xl">
                <div>
                  <div className="text-[16px] font-bold">{table.label} · {tZone(table.zone)}</div>
                  <div className="text-[12px] text-muted flex items-center gap-1.5 mt-0.5">
                    <Users size={13} /> {table.seats} {t("book.seats")} · {table.position}
                  </div>
                </div>
                <button onClick={onBook}
                  className="bg-accent text-white font-semibold px-6 py-3 rounded-full shadow-glow hover:bg-accent-soft transition whitespace-nowrap">
                  {t("v360.bookNow")}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
