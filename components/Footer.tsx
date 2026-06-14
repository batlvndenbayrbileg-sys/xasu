"use client";

import Link from "next/link";
import { ArrowRight, Instagram, Youtube, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import Logo from "@/components/Logo";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 pb-24 md:pb-10">
      {/* gradient CTA banner */}
      <div className="relative overflow-hidden rounded-3xl bg-ink px-7 sm:px-12 py-12 md:py-16">
        {/* mesh glow */}
        <div className="pointer-events-none absolute -top-16 -right-10 w-80 h-80 rounded-full bg-accent/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="font-display text-[26px] md:text-[34px] font-bold text-white leading-tight">{t("footer.bannerTitle")}</h3>
            <p className="text-white/65 mt-2 text-[14px] md:text-[15px]">{t("footer.bannerSub")}</p>
          </div>
          <Link href="/book"
            className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-6 py-3.5 rounded-full shadow-glow hover:bg-accent-soft hover:gap-3 transition-all whitespace-nowrap self-start md:self-auto">
            {t("footer.subscribe")} <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      {/* simple bottom bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div className="flex items-center gap-2.5 text-[13px] text-muted">
          <span className="w-7 h-7 rounded-lg bg-accent text-white grid place-items-center"><Logo size={18} /></span>
          <span>© {new Date().getFullYear()} GourmetGrove. {t("footer.rights")}</span>
        </div>
        <div className="flex items-center gap-2">
          {[Instagram, Youtube, Send].map((Icon, i) => (
            <a key={i} href="#" aria-label="social"
              className="w-9 h-9 rounded-full bg-neutral-100 grid place-items-center text-neutral-600 hover:bg-accent hover:text-white transition">
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
