import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Xasu — Fine Dining & Reservations",
    short_name: "Xasu",
    description: "Reserve your table at Xasu — seasonal menus and a live interactive floorplan.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#FF6A1A",
    icons: [
      { src: "/logo.png", sizes: "any", type: "image/png" },
    ],
  };
}
