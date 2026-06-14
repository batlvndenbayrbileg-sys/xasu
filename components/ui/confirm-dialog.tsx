"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { useConfirmStore } from "@/lib/confirm";
import { useI18n } from "@/lib/i18n";

export function ConfirmDialog() {
  const { open, title, message, danger, resolve } = useConfirmStore();
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") resolve(false);
      if (e.key === "Enter") resolve(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, resolve]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[210] grid place-items-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => resolve(false)}
          role="dialog" aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.94, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-line w-full max-w-sm p-6 text-center"
          >
            <div className={clsx("w-12 h-12 rounded-full grid place-items-center mx-auto",
              danger ? "bg-red-50 text-red-500" : "bg-accent/10 text-accent")}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-[17px] font-bold mt-4">{title || t("common.confirmTitle")}</h3>
            <p className="text-muted text-[14px] mt-1.5">{message}</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => resolve(false)}
                className="flex-1 py-3 rounded-full border border-line font-semibold hover:bg-neutral-50 transition">
                {t("common.cancel")}
              </button>
              <button onClick={() => resolve(true)} autoFocus
                className={clsx("flex-1 py-3 rounded-full font-semibold text-white transition",
                  danger ? "bg-red-500 hover:bg-red-600" : "bg-accent hover:bg-accent-soft")}>
                {t("common.confirm")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
