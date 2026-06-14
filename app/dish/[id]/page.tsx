"use client";

import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Heart, Flame, Timer, Star, ArrowRight, ShoppingBasket } from "lucide-react";
import clsx from "clsx";
import { DISHES } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useFavorites } from "@/lib/favorites";
import { useMounted } from "@/lib/useMounted";

const INGREDIENTS = [
  { emoji: "🥩", label: "Prime Filet Mignon" },
  { emoji: "🥕", label: "Seasonal Vegetables" },
  { emoji: "🥣", label: "Signature Sauce" },
  { emoji: "🌿", label: "Herb Blend" },
];
const ALLERGENS = ["Dairy", "Gluten", "Nuts", "Shellfish", "Egg"];

export default function DishDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t } = useI18n();
  const ids = useFavorites((s) => s.ids);
  const toggle = useFavorites((s) => s.toggle);
  const mounted = useMounted();
  const dish = DISHES.find((d) => d.id === params.id);
  if (!dish) notFound();
  const liked = mounted && ids.includes(dish.id);

  const pairings = DISHES.filter((d) => d.id !== dish.id).slice(0, 3);

  return (
    <div className="pt-20 md:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[14px] text-muted hover:text-ink transition mt-2 mb-4">
          <ChevronLeft size={18} /> {t("dish.back")}
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* image */}
          <div className="relative rounded-3xl overflow-hidden lg:sticky lg:top-28 aspect-[4/3] lg:aspect-square shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dish.image} alt={dish.name} decoding="async" className="w-full h-full object-cover" />
            <button onClick={() => toggle(dish.id)}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/85 backdrop-blur grid place-items-center">
              <Heart size={20} className={clsx(liked ? "fill-accent text-accent" : "text-ink")} />
            </button>
          </div>

          {/* info */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-[32px] md:text-[44px] font-bold leading-tight">{dish.name}</h1>
              <span className="inline-flex items-center gap-1 text-[16px] font-semibold whitespace-nowrap mt-2">
                <Star size={16} className="fill-yellow-400 text-yellow-400" /> {dish.rating}
              </span>
            </div>

            <p className="text-[15px] text-neutral-600 leading-relaxed mt-4">{dish.description}</p>

            <div className="flex items-center gap-6 mt-6">
              <span className="inline-flex items-center gap-2 text-[14px]"><Flame size={16} className="text-accent" /> {dish.calories} {t("dish.kcal")}</span>
              <span className="inline-flex items-center gap-2 text-[14px]"><Timer size={16} className="text-accent" /> {dish.prepMinutes} {t("dish.min")}</span>
              <span className="text-[22px] font-bold text-accent ml-auto">${dish.price.toFixed(2)}</span>
            </div>

            <h3 className="font-display text-[22px] font-bold mt-9 mb-3">{t("dish.ingredients")}</h3>
            <div className="grid grid-cols-4 gap-3">
              {INGREDIENTS.map((i) => (
                <div key={i.label} className="bg-white border border-line rounded-2xl py-4 px-2 flex flex-col items-center gap-2">
                  <div className="w-11 h-11 rounded-xl bg-neutral-50 grid place-items-center text-xl">{i.emoji}</div>
                  <span className="text-[11px] md:text-[12px] text-center leading-tight text-neutral-600">{i.label}</span>
                </div>
              ))}
            </div>

            <h3 className="font-display text-[22px] font-bold mt-9 mb-3">{t("dish.allergens")}<span className="text-accent">*</span></h3>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((a) => (
                <span key={a} className="bg-white border border-line text-[13px] px-3 py-1.5 rounded-full text-neutral-700 font-medium">{a}</span>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/book"
                className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-8 py-4 rounded-full shadow-glow hover:bg-accent-soft hover:gap-3 transition-all">
                {t("dish.reserve")} <ArrowRight size={18} />
              </Link>
              <button onClick={() => toggle(dish.id)}
                className={clsx("inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-full border transition",
                  liked ? "bg-accent/10 border-accent text-accent" : "bg-white border-line hover:bg-neutral-50")}>
                <ShoppingBasket size={18} /> {liked ? t("dish.saved") : t("dish.save")}
              </button>
            </div>
          </div>
        </div>

        {/* pairings */}
        <section className="mt-20">
          <h2 className="font-display text-[28px] md:text-[36px] font-bold">{t("dish.pairsWith")}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
            {pairings.map((p) => (
              <Link key={p.id} href={`/dish/${p.id}`}
                className="group rounded-2xl overflow-hidden bg-white border border-line shadow-card hover:shadow-lg transition">
                <div className="aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <h4 className="font-semibold text-[15px]">{p.name}</h4>
                  <span className="font-bold text-accent">${p.price.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
