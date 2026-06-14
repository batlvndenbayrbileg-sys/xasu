"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import CategoryTabs from "@/components/CategoryTabs";
import DishCard from "@/components/DishCard";
import { DISHES } from "@/lib/data";
import type { Category } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export default function MenuPage() {
  const { t } = useI18n();
  const [cat, setCat] = useState<Category>("Specials");
  const [q, setQ] = useState("");
  const dishes = useMemo(
    () => DISHES.filter((d) => d.category === cat && d.name.toLowerCase().includes(q.toLowerCase())),
    [cat, q]
  );

  return (
    <div className="pt-24 md:pt-32">
      {/* page header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <p className="text-accent font-semibold text-[14px] tracking-wide uppercase">{t("menu.kicker")}</p>
            <h1 className="font-display text-[36px] md:text-[48px] font-bold mt-1">{t("menu.title")}</h1>
            <p className="text-muted mt-2 max-w-lg">{t("menu.sub")}</p>
          </div>
          <label className="flex items-center gap-2.5 bg-white border border-line rounded-full px-4 h-12 w-full md:w-72 shadow-card focus-within:border-accent transition">
            <Search size={17} className="text-neutral-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("menu.search")}
                   className="flex-1 bg-transparent outline-none text-[14px]" />
          </label>
        </div>

        {/* Sticky so the active category is always reachable while scrolling
            the long dish grid — no need to scroll back up to switch. */}
        <div className="sticky top-[68px] md:top-[76px] z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mt-5 bg-[var(--bg)]/85 backdrop-blur-md border-b border-line/60">
          <CategoryTabs value={cat} onChange={setCat} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
          {dishes.map((d) => <DishCard key={d.id} dish={d} />)}
        </div>
        {dishes.length === 0 && (
          <p className="text-center text-neutral-400 py-20">{t("menu.noResults")}</p>
        )}
      </div>
    </div>
  );
}
