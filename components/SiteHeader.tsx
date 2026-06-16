"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ShoppingBag, Menu, X, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { useSession } from "@/lib/useSession";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useMounted } from "@/lib/useMounted";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();
  const { t } = useI18n();
  const cartCount = useCart((s) => s.items.reduce((n, x) => n + x.qty, 0));
  const mounted = useMounted();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/menu", label: t("nav.menu") },
    { href: "/book", label: t("nav.reserve") },
    { href: "/orders", label: t("nav.myBookings") },
  ];

  useEffect(() => { setOpen(false); }, [pathname]);

  // Admin uses its own shell.
  if (pathname.startsWith("/admin")) return null;

  // Header is always solid — the hero is now cream/light so a transparent
  // white-text overlay would be invisible.
  const solid = true;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className={clsx("fixed top-0 inset-x-0 z-50 transition-all duration-300",
        solid ? "bg-white/80 backdrop-blur-md border-b border-line shadow-[0_1px_20px_rgba(0,0,0,.04)]" : "bg-transparent")}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          <Link href="/" aria-label="Home" className="flex items-center shrink-0 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Xasu" className="h-10 md:h-12 w-auto group-hover:scale-[1.03] transition-transform" />
          </Link>

          {/* desktop nav with animated underline */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className={clsx("relative px-4 py-2 text-[14px] font-medium transition-colors",
                  isActive(l.href) ? "text-accent" : solid ? "text-neutral-600 hover:text-ink" : "text-white/85 hover:text-white")}>
                {l.label}
                {isActive(l.href) && (
                  <motion.span layoutId="nav-underline" className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 md:gap-2.5">
            {/* language + dark/light — matching sliding pills */}
            <LanguageToggle className="hidden sm:flex scale-90" />
            <ThemeToggle className="hidden sm:flex scale-90" />

            {/* cart */}
            <Link href="/cart" aria-label={t("nav.cart")}
              className={clsx("relative w-9 h-9 md:w-10 md:h-10 rounded-full grid place-items-center transition", solid ? "hover:bg-neutral-100" : "hover:bg-white/10")}>
              <ShoppingBag size={18} className={clsx(pathname === "/cart" ? "text-accent" : solid ? "text-ink" : "text-white")} />
              {mounted && cartCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold grid place-items-center">{cartCount}</motion.span>
              )}
            </Link>

            {user ? (
              <button onClick={() => router.push("/profile")}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-accent text-white grid place-items-center font-bold shadow-glow">
                {user.name.charAt(0).toUpperCase()}
              </button>
            ) : (
              <Link href="/book" className="hidden md:inline bg-accent text-white text-[14px] font-semibold px-5 py-2.5 rounded-full shadow-glow hover:bg-accent-soft transition">
                {t("nav.reserveBtn")}
              </Link>
            )}

            {/* mobile hamburger */}
            <button onClick={() => setOpen(true)} aria-label="Menu"
              className={clsx("md:hidden w-9 h-9 rounded-full grid place-items-center", solid ? "hover:bg-neutral-100 text-ink" : "text-white")}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] md:hidden" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-[80%] max-w-xs bg-white shadow-2xl flex flex-col p-6">
              <div className="flex items-center justify-between">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Xasu" className="h-10 w-auto" />
                <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-neutral-100 grid place-items-center"><X size={18} /></button>
              </div>

              <nav className="mt-8 flex flex-col gap-1">
                {[...links, { href: "/cart", label: t("nav.cart") }].map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.05 }}>
                    <Link href={l.href}
                      className={clsx("flex items-center justify-between py-3.5 text-[17px] font-semibold border-b border-line",
                        isActive(l.href) ? "text-accent" : "text-ink")}>
                      {l.label} <ArrowRight size={16} className="text-neutral-300" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-3">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
                {!user && (
                  <Link href="/login" className="block text-center bg-accent text-white font-semibold py-3.5 rounded-full shadow-glow">
                    {t("nav.signIn")}
                  </Link>
                )}
                <p className="text-[12px] text-muted flex items-center gap-1.5"><MapPin size={13} className="text-accent" /> {t("common.location")}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
