import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GourmetGrove — Fine Dining & Reservations",
    short_name: "GourmetGrove",
    description: "Reserve your table at GourmetGrove — seasonal menus and a live interactive floorplan.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#FF6A1A",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
