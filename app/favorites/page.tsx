"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DishCard from "@/components/DishCard";
import { DISHES } from "@/lib/data";
import { useFavorites } from "@/lib/favorites";
import { useMounted } from "@/lib/useMounted";
import { useI18n } from "@/lib/i18n";
import { confirmDialog } from "@/lib/confirm";
import { toast } from "@/lib/toast";

export default function FavoritesPage() {
  const router = useRouter();
  const { t } = useI18n();
  const ids = useFavorites((s) => s.ids);
  const clear = useFavorites((s) => s.clear);
  const mounted = useMounted();

  const dishes = useMemo(() => ids.map((id) => DISHES.find((d) => d.id === id)).filter(Boolean) as typeof DISHES, [ids]);

  return (
    <div className="pt-24 md:pt-32 min-h-[80vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-accent font-semibold text-[14px] tracking-wide uppercase">{t("nav.favorites")}</p>
            <h1 className="font-display text-[36px] md:text-[48px] font-bold mt-1">{t("fav.title")}</h1>
            <p className="text-muted mt-2">{t("fav.sub")}</p>
          </div>
          {mounted && dishes.length > 0 && (
            <button
              onClick={async () => {
                const ok = await confirmDialog({ message: t("fav.clear") + "?", danger: true });
                if (ok) { clear(); toast.info(t("toast.favCleared")); }
              }}
              className="text-[13px] font-semibold text-red-500 hover:text-red-600 transition self-start md:self-auto">
              {t("fav.clear")}
            </button>
          )}
        </div>

        {!mounted ? null : dishes.length === 0 ? (
          <div className="bg-white border border-line rounded-2xl py-20 px-8 text-center mt-8">
            <div className="w-16 h-16 rounded-full bg-accent/10 grid place-items-center text-3xl mx-auto">🤍</div>
            <h3 className="text-[18px] font-bold mt-4">{t("fav.empty")}</h3>
            <p className="text-muted mt-1">{t("fav.emptySub")}</p>
            <button onClick={() => router.push("/menu")}
              className="mt-6 bg-accent text-white font-semibold px-7 py-3 rounded-full shadow-glow hover:bg-accent-soft transition">{t("fav.browse")}</button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
            <AnimatePresence>
              {dishes.map((d) => (
                <motion.div key={d.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <DishCard dish={d} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
