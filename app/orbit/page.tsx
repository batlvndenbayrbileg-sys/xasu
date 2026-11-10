"use client";

import { useMemo } from "react";
import DishOrbitCarousel, { type Dish } from "@/components/ui/dish-orbit-carousel";
import { DISHES } from "@/lib/data";

const ACCENTS = ["#f6a37c", "#f2a6c6", "#bcd98e", "#f5d26a", "#9fcbe8", "#c7b2f0"];
const CHEFS = [
  { chef: "Chef Mara Lind", kitchen: "Ember Counter" },
  { chef: "Chef Teo Ashe", kitchen: "The Greenhouse Table" },
  { chef: "Chef Ilse Noor", kitchen: "Saltwater Kitchen" },
  { chef: "Chef Rafa Okoye", kitchen: "Pergola Café" },
  { chef: "Chef June Park", kitchen: "Morning Room" },
  { chef: "Chef Noa Vance", kitchen: "Copper Pass" },
];

/** Preview of the Dish Orbit Carousel, fed from the project's own catalog. */
export default function OrbitPage() {
  const dishes = useMemo<Dish[]>(() => {
    const picks = DISHES.filter((d) => d.category === "Specials").slice(0, 6);
    const source = picks.length >= 2 ? picks : DISHES.slice(0, 6);
    return source.map((d, i) => {
      const parts = d.name.trim().split(" ");
      const subtitle = parts.length > 1 ? parts[parts.length - 1] : d.name;
      const title = parts.length > 1 ? parts.slice(0, -1).join(" ") : d.name;
      return {
        title,
        subtitle,
        image: d.image,
        alt: d.name,
        rating: d.rating,
        chef: CHEFS[i % CHEFS.length].chef,
        kitchen: CHEFS[i % CHEFS.length].kitchen,
        description: d.description,
        likes: 60 + i * 11,
        ingredients: [`${d.calories} kcal`, `${d.prepMinutes}′ prep`, d.category],
        accent: ACCENTS[i % ACCENTS.length],
        label: d.name,
      };
    });
  }, []);

  return (
    <main className="bg-[var(--color-background)]">
      <DishOrbitCarousel dishes={dishes} />
    </main>
  );
}
