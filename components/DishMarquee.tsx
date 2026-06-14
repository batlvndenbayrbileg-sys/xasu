"use client";

import Link from "next/link";
import { DISHES } from "@/lib/data";

/** Two infinite rows of circular dish photos scrolling in opposite directions. */
export default function DishMarquee() {
  const rowA = DISHES.slice(0, 10);
  const rowB = [...DISHES].slice(8).concat(DISHES.slice(0, 4)).reverse();

  return (
    <section className="mt-24 overflow-hidden">
      {/* dish photo rows */}
      <div className="space-y-5">
        <Row dishes={rowA} dir="l" />
        <Row dishes={rowB} dir="r" />
      </div>
    </section>
  );
}

function Row({ dishes, dir }: { dishes: typeof DISHES; dir: "l" | "r" }) {
  return (
    <div className="marquee-host overflow-hidden">
      <div className={`flex w-max gap-5 ${dir === "l" ? "animate-marquee-l" : "animate-marquee-r"}`}>
        {[0, 1].map((k) => (
          <div key={k} className="flex gap-5 shrink-0">
            {dishes.map((d) => (
              <Link key={`${k}-${d.id}`} href={`/dish/${d.id}`}
                className="group relative w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden ring-1 ring-black/5 shadow-lg shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.image} alt={d.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors grid place-items-end p-2">
                  <span className="text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">{d.name}</span>
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
