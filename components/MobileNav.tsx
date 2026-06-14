"use client";

import { Home, BookOpen, CalendarRange, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const items = [
    { href: "/", icon: Home, label: t("nav.home") },
    { href: "/menu", icon: BookOpen, label: t("nav.menu") },
    { href: "/book", icon: CalendarRange, label: t("nav.reserve") },
    { href: "/profile", icon: User, label: t("nav.profile") },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-line grid grid-cols-4 px-2 pt-2 pb-[max(env(safe-area-inset-bottom),12px)]">
      {items.map(({ href, icon: Icon, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <button key={href} onClick={() => router.push(href)}
            className={clsx("flex flex-col items-center gap-1 py-1 text-[11px] font-medium transition-colors",
              active ? "text-accent" : "text-neutral-400")}>
            <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
