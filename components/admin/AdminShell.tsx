"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarRange, CreditCard, UtensilsCrossed, BarChart3, LogOut, Home, Activity, Users, Calendar, Settings, Shield, Map, UserCog, Bell, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getJson } from "@/lib/fetcher";
import clsx from "clsx";
import { sendJson } from "@/lib/fetcher";
import type { PublicUser } from "@/lib/auth";

const NAV = [
  { href: "/admin/today", label: "Өнөөдөр", icon: Activity },
  { href: "/admin", label: "Хяналтын самбар", icon: LayoutDashboard, exact: true },
  { href: "/admin/calendar", label: "Календарь", icon: Calendar },
  { href: "/admin/reservations", label: "Захиалга", icon: CalendarRange },
  { href: "/admin/customers", label: "Үйлчлүүлэгчид", icon: Users },
  { href: "/admin/payments", label: "Төлбөр", icon: CreditCard },
  { href: "/admin/tables", label: "Ширээ", icon: Map },
  { href: "/admin/menu", label: "Цэс", icon: UtensilsCrossed },
  { href: "/admin/timesheet", label: "Цаг бүртгэл", icon: Clock },
  { href: "/admin/reports", label: "Тайлан", icon: BarChart3 },
  { href: "/admin/staff", label: "Ажилчид", icon: UserCog },
  { href: "/admin/audit", label: "Үйлдлийн лог", icon: Shield },
  { href: "/admin/settings", label: "Тохиргоо", icon: Settings },
];

function BellButton({ open, setOpen, count, recent }: { open: boolean; setOpen: (b: boolean) => void; count: number; recent: any[] }) {
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-label="Notifications"
        className="relative w-10 h-10 rounded-full bg-white dark:bg-[#1e2128] border border-line shadow-card grid place-items-center hover:border-accent transition">
        <Bell size={16} />
        {count > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold grid place-items-center">{count}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#14161b] border border-line rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest font-bold text-muted">Сүүлийн үйлдлүүд</span>
            <Link href="/admin/audit" onClick={() => setOpen(false)} className="text-[11px] font-bold text-accent">Бүгдийг үзэх →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="h-24 grid place-items-center text-muted text-[12px]">Үйл ажиллагаа алга</div>
          ) : (
            <ul className="max-h-96 overflow-y-auto divide-y divide-line">
              {recent.map((r) => (
                <li key={r.id} className="px-4 py-2.5 text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-accent/10 text-accent grid place-items-center text-[10px] font-bold">{r.actorName.charAt(0).toUpperCase()}</span>
                    <span className="font-semibold truncate">{r.actorName}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted ml-auto">{r.action}</span>
                  </div>
                  <p className="text-[10px] text-muted mt-1 pl-8">{new Date(r.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminShell({ user, children }: { user: PublicUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => (exact || href === "/admin" ? pathname === href : pathname.startsWith(href));
  const [bellOpen, setBellOpen] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    const load = () => getJson<any[]>("/api/admin/audit").then(({ data }) => setRecent((data ?? []).slice(0, 8)));
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

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
          <p className="mt-2 text-[11px] uppercase tracking-widest text-muted font-semibold">Удирдлагын самбар</p>
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
            <Home size={15} /> Вэбсайт үзэх
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
          <span className="text-[11px] uppercase tracking-widest text-muted font-semibold">Удирдлага</span>
          <div className="flex items-center gap-2">
            <BellButton open={bellOpen} setOpen={setBellOpen} count={recent.length} recent={recent} />
            <button onClick={logout} aria-label="Sign out" className="text-muted"><LogOut size={15} /></button>
          </div>
        </header>

        {/* Desktop floating bell */}
        <div className="hidden md:block fixed top-4 right-4 z-30">
          <BellButton open={bellOpen} setOpen={setBellOpen} count={recent.length} recent={recent} />
        </div>

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
