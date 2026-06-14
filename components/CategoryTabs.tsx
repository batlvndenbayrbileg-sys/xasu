"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import type { Category } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const cats: Category[] = ["Specials", "Seasonal", "Appetizers", "Main", "Desserts"];

export default function CategoryTabs({ value, onChange }: { value: Category; onChange: (c: Category) => void }) {
  const { tCat } = useI18n();
  return (
    <nav className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar">
      {cats.map((c) => (
        <button key={c} onClick={() => onChange(c)}
          className={clsx("relative whitespace-nowrap rounded-full px-4 md:px-5 py-2 text-[14px] font-medium transition-colors",
            value === c ? "text-white" : "text-neutral-600 hover:text-ink bg-white border border-line")}>
          {value === c && (
            <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-ink"
              transition={{ type: "spring", stiffness: 380, damping: 32 }} />
          )}
          <span className="relative z-10">{tCat(c)}</span>
        </button>
      ))}
    </nav>
  );
}
