"use client";

import Link from "next/link";
import { useState } from "react";
import { Facebook, Instagram, Twitter, Youtube, Send, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import Logo from "@/components/Logo";
import { toast } from "@/lib/toast";

/**
 * Stacked circular footer — centered, vertical composition:
 *   ◯ logo bubble → nav → social → newsletter → copyright.
 * Adapted from the shadcn "stacked-circular-footer" pattern to the project's
 * own design tokens (bg-accent, border-line, text-muted, shadow-card).
 */
export default function Footer() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/menu", label: t("nav.menu") },
    { href: "/book", label: t("nav.reserve") },
    { href: "/orders", label: t("nav.myBookings") },
    { href: "/favorites", label: t("nav.favorites") },
  ];

  const socials = [
    { Icon: Instagram, label: "Instagram", href: "#" },
    { Icon: Facebook, label: "Facebook", href: "#" },
    { Icon: Twitter, label: "Twitter", href: "#" },
    { Icon: Youtube, label: "YouTube", href: "#" },
  ];

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setDone(true);
    toast.success(t("footer.subscribed"));
    setTimeout(() => { setDone(false); setEmail(""); }, 2400);
  }

  return (
    <footer className="relative mt-24 pb-24 md:pb-14 overflow-hidden">
      {/* soft ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-10 -z-10 flex justify-center">
        <div className="w-[480px] h-[480px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/* logo bubble */}
          <div className="relative mb-7">
            <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl" />
            <div className="relative rounded-full bg-white border border-line shadow-card p-7 grid place-items-center text-accent">
              <Logo size={34} />
            </div>
          </div>

          {/* brand line */}
          <p className="font-display text-[20px] md:text-[22px] font-bold text-ink">GourmetGrove</p>
          <p className="text-muted text-[13px] mt-1 max-w-sm">{t("footer.tagline")}</p>

          {/* nav */}
          <nav className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-3 text-[14px] font-medium text-neutral-600">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className="hover:text-accent transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* social */}
          <div className="mt-7 flex gap-3">
            {socials.map(({ Icon, label, href }) => (
              <a key={label} href={href} aria-label={label}
                className="w-11 h-11 rounded-full bg-white border border-line grid place-items-center text-neutral-600 hover:text-white hover:bg-accent hover:border-accent hover:-translate-y-0.5 transition-all shadow-card">
                <Icon size={16} />
              </a>
            ))}
          </div>

          {/* newsletter */}
          <form onSubmit={subscribe} className="mt-8 w-full max-w-md flex gap-2">
            <label htmlFor="footer-email" className="sr-only">Email</label>
            <input
              id="footer-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("footer.emailPlaceholder")}
              className="flex-1 h-11 px-5 rounded-full bg-white border border-line text-[14px] outline-none focus:border-accent transition placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={done}
              className="h-11 px-6 rounded-full bg-accent text-white text-[14px] font-semibold shadow-glow hover:bg-accent-soft transition inline-flex items-center gap-1.5 whitespace-nowrap disabled:opacity-80"
            >
              {done ? <Check size={16} /> : <Send size={15} />}
              {done ? t("footer.subscribed").split("!")[0] : t("footer.subscribeShort")}
            </button>
          </form>

          {/* hairline divider */}
          <div className="mt-10 w-24 h-px bg-line" />

          {/* copyright */}
          <p className="mt-5 text-[12px] text-muted">
            © {new Date().getFullYear()} GourmetGrove. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
