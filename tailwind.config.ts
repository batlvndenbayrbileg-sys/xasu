import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0c0c0e",
        surface: "#ffffff",
        muted: "#6b7280",
        line: "#eceef1",
        accent: { DEFAULT: "#FF6A1A", soft: "#FF8A3C" },
      },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
      borderRadius: { xl2: "28px" },
      boxShadow: {
        card: "0 6px 18px rgba(0,0,0,.06)",
        glow: "0 8px 20px rgba(255,106,26,.35)",
        device: "0 30px 80px rgba(0,0,0,.6), inset 0 0 0 2px #1d1d22",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(.9)", opacity: "1" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: { "pulse-ring": "pulse-ring 1.6s ease-out infinite" },
    },
  },
  plugins: [],
};
export default config;
