import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { Toaster } from "@/components/ui/toaster";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";
import TableFromUrl from "@/components/TableFromUrl";
import { Suspense } from "react";

const noFlashTheme = `(function(){try{var t=localStorage.getItem('gg_theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme:dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display", display: "swap" });

import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Xasu · Fine Dining & Reservations",
    template: "%s · Xasu",
  },
  description: "Reserve your table at Xasu — seasonal tasting menus, an exclusive Valentine's experience, and a live interactive floorplan.",
  applicationName: "Xasu",
  keywords: ["restaurant", "reservation", "fine dining", "Xasu", "ширээ захиалга", "ресторан"],
  openGraph: {
    title: "Xasu — Fine Dining & Reservations",
    description: "Seasonal menus and a live interactive floorplan. Reserve your exact table.",
    type: "website",
    url: SITE_URL,
    siteName: "Xasu",
  },
  twitter: { card: "summary_large_image", title: "Xasu", description: "Fine dining reservations" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF6A1A" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans min-h-screen flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
        <ThemeProvider>
          <I18nProvider>
            <SmoothScroll />
            <ScrollProgress />
            <Suspense fallback={null}><TableFromUrl /></Suspense>
            <SiteHeader />
            <main className="flex-1 w-full pb-16 md:pb-0">{children}</main>
            <Footer />
            <MobileNav />
            <Toaster />
            <ConfirmDialog />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
