"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import clsx from "clsx";
import { useToastStore } from "@/lib/toast";

const ICON = { success: CheckCircle2, error: XCircle, info: Info } as const;
const TONE = {
  success: "text-emerald-500",
  error: "text-red-500",
  info: "text-accent",
} as const;

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed z-[200] bottom-20 md:bottom-6 inset-x-0 flex flex-col items-center gap-2 px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICON[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              className="pointer-events-auto flex items-center gap-3 bg-white border border-line shadow-xl rounded-2xl pl-4 pr-3 py-3 max-w-sm w-full"
            >
              <Icon size={20} className={clsx("flex-none", TONE[t.type])} />
              <span className="text-[14px] font-medium flex-1 leading-snug">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="text-neutral-400 hover:text-ink transition flex-none">
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
