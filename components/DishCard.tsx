"use client";
import { Plus, Star, Eye, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { Dish } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { useMounted } from "@/lib/useMounted";
import { formatDishPrice } from "@/lib/payments";

/** Guaranteed-working image used if a dish photo fails to load. */
const DISH_FALLBACK = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=70";

export default function DishCard({ dish }: { dish: Dish }) {
  const items = useCart((s) => s.items);
  const add = useCart((s) => s.add);
  const mounted = useMounted();
  const inCart = mounted && items.some((x) => x.id === dish.id);

  return (
    <Link
      href={`/dish/${dish.id}`}
      className="group block rounded-2xl bg-white shadow-card border border-line overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dish.image} alt={dish.name} loading="lazy" decoding="async"
             onError={(e) => { const t = e.currentTarget; if (t.src !== DISH_FALLBACK) t.src = DISH_FALLBACK; }}
             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[600ms] ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* hover view chip */}
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-white text-ink text-[11px] font-semibold px-2.5 py-1.5 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Eye size={13} /> {dish.prepMinutes}′
        </span>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.preventDefault(); add(dish.id); }}
          className={clsx("absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center shadow-md transition-colors",
            inCart ? "bg-accent text-white" : "bg-white/90 text-ink backdrop-blur hover:bg-accent hover:text-white")}
          aria-label={inCart ? "In cart" : "Add to cart"}
        >
          {inCart ? <Check size={16} /> : <Plus size={17} />}
        </motion.button>
        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-[12px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
          <Star size={12} className="fill-yellow-400 text-yellow-400" /> {dish.rating}
        </span>
      </div>
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[15px] md:text-[16px] font-semibold leading-tight">{dish.name}</h4>
          <span className="text-[15px] font-bold text-accent whitespace-nowrap">{formatDishPrice(dish.price)}</span>
        </div>
        <p className="text-[12.5px] text-muted line-clamp-2 mt-1.5">{dish.description}</p>
      </div>
    </Link>
  );
}
