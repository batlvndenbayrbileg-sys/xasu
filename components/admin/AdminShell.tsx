"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarRange, CreditCard, UtensilsCrossed, BarChart3, LogOut, Home, Activity, Users, Calendar, Settings, Shield } from "lucide-react";
import clsx from "clsx";
import { sendJson } from "@/lib/fetcher";
import type { PublicUser } from "@/lib/auth";

const NAV = [
  { href: "/admin/today", label: "Today", icon: Activity },
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/calendar", label: "Calendar", icon: Calendar },
  { href: "/admin/reservations", label: "Reservations", icon: CalendarRange },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/audit", label: "Audit log", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ user, children }: { user: PublicUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => (exact || href === "/admin" ? pathname === href : pathname.startsWith(href));

  async function logout() {
    await sendJson("/api/auth/logout", "POST");
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0c0f] flex">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-line bg-white dark:bg-[#14161b] sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Xasu Admin" className="h-9 w-auto" />
          <p className="mt-2 text-[11px] uppercase tracking-widest text-muted font-semibold">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link key={href} href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition",
                isActive(href, exact)
                  ? "bg-accent/10 text-accent"
                  : "text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-100 dark:text-neutral-300",
              )}>
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-line space-y-2">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-muted hover:bg-neutral-100 dark:hover:bg-neutral-100 transition">
            <Home size={15} /> View site
          </Link>
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-accent text-white grid place-items-center font-bold text-[12px]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">{user.name}</div>
              <div className="text-[11px] text-muted truncate">{user.email}</div>
            </div>
            <button onClick={logout} aria-label="Sign out" className="text-muted hover:text-red-500 transition">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOPBAR + content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-[#14161b] border-b border-line px-4 h-14 flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Xasu Admin" className="h-8 w-auto" />
          <span className="text-[11px] uppercase tracking-widest text-muted font-semibold">Admin</span>
          <button onClick={logout} aria-label="Sign out" className="text-muted">
            <LogOut size={15} />
          </button>
        </header>

        {/* mobile tabs */}
        <div className="md:hidden sticky top-14 z-30 bg-white dark:bg-[#14161b] border-b border-line overflow-x-auto no-scrollbar">
          <div className="flex gap-1 p-2 min-w-max">
            {NAV.map(({ href, label, icon: Icon, exact }) => (
              <Link key={href} href={href}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition",
                  isActive(href, exact) ? "bg-accent text-white" : "text-neutral-500 hover:bg-neutral-100",
                )}>
                <Icon size={13} /> {label}
              </Link>
            ))}
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
