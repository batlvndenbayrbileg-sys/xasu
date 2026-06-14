import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { DISHES } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/menu", "/book", "/favorites", "/login"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  const dishRoutes = DISHES.map((d) => ({
    url: `${SITE_URL}/dish/${d.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...staticRoutes, ...dishRoutes];
}
