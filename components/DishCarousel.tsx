"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Check, ArrowLeft, ArrowRight, Star } from "lucide-react";
import clsx from "clsx";
import type { Dish } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { useMounted } from "@/lib/useMounted";
import { formatDishPrice } from "@/lib/payments";

const DISH_FALLBACK = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=70";

/**
 * "Бэлэн захиалах хоол" carousel — bold dark food cards with floating imagery,
 * a glowing accent price + cart button, and circular prev/next controls.
 * Horizontal scroll-snap; swipeable on touch, arrow-driven on desktop.
 */
export default function DishCarousel({ dishes }: { dishes: Dish[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    sync();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => { el.removeEventListener("scroll", sync); window.removeEventListener("resize", sync); };
  }, [sync, dishes.length]);

  const scrollByDir = (dir: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.8 * dir, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* prev */}
      <button onClick={() => scrollByDir(-1)} aria-label="Өмнөх" disabled={atStart}
        className={clsx(
          "hidden md:grid absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full place-items-center transition-all",
          atStart ? "opacity-0 pointer-events-none" : "bg-neutral-700 text-white hover:bg-neutral-600 shadow-lg hover:scale-105",
        )}>
        <ArrowLeft size={18} />
      </button>
      {/* next */}
      <button onClick={() => scrollByDir(1)} aria-label="Дараах" disabled={atEnd}
        className={clsx(
          "hidden md:grid absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full place-items-center transition-all",
          atEnd ? "opacity-0 pointer-events-none" : "bg-accent text-white hover:bg-accent-soft shadow-glow hover:scale-105",
        )}>
        <ArrowRight size={18} />
      </button>

      <div ref={scroller}
        className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-3 -mx-1 px-1">
        {dishes.map((d) => <DishSlide key={d.id} dish={d} />)}
      </div>
    </div>
  );
}

function DishSlide({ dish }: { dish: Dish }) {
  const items = useCart((s) => s.items);
  const add = useCart((s) => s.add);
  const mounted = useMounted();
  const inCart = mounted && items.some((x) => x.id === dish.id);

  return (
    <div className="snap-start shrink-0 w-[220px] sm:w-[240px]">
      <Link href={`/dish/${dish.id}`}
        className="group block h-full rounded-[28px] bg-[#16171c] border border-white/10 p-4 pt-6 hover:border-accent/40 hover:-translate-y-1.5 transition-all duration-300 shadow-[0_12px_36px_rgba(0,0,0,.45)]">
        {/* floating food image */}
        <div className="relative mx-auto w-[150px] h-[150px] rounded-[22px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,.55)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dish.image} alt={dish.name} loading="lazy" decoding="async"
            onError={(e) => { const t = e.currentTarget; if (t.src !== DISH_FALLBACK) t.src = DISH_FALLBACK; }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[600ms] ease-out" />
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-black/55 backdrop-blur text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
            <Star size={11} className="fill-yellow-400 text-yellow-400" /> {dish.rating}
          </span>
        </div>

        <h4 className="mt-4 text-white text-[17px] md:text-[18px] font-bold leading-tight line-clamp-1">{dish.name}</h4>
        <p className="text-neutral-400 text-[12.5px] mt-1 line-clamp-1">{dish.description}</p>

        <div className="mt-3.5 flex items-center justify-between">
          <span className="text-accent text-[20px] font-extrabold drop-shadow-[0_0_18px_rgba(255,106,26,.35)]">
            {formatDishPrice(dish.price)}
          </span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.preventDefault(); add(dish.id); }}
            className={clsx(
              "w-11 h-11 rounded-2xl grid place-items-center transition-colors shadow-glow",
              inCart ? "bg-emerald-500 text-white" : "bg-accent text-white hover:bg-accent-soft",
            )}
            aria-label={inCart ? "Сагсанд байна" : "Сагслах"}>
            {inCart ? <Check size={18} /> : <ShoppingCart size={17} />}
          </motion.button>
        </div>
      </Link>
    </div>
  );
}
