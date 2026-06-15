"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarRange, CreditCard, TrendingUp, Users, Loader2, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { getJson } from "@/lib/fetcher";
import { formatMnt } from "@/lib/payments";
import { StatusBadge, PaymentBadge } from "@/components/admin/badges";

interface Stats {
  todayCount: number;
  weekCount: number;
  revenueToday: number;
  revenueWeek: number;
  statusMix: { status: string; count: number }[];
  paymentMix: { status: string; count: number }[];
  dailyRevenue: { date: string; total: number; count: number }[];
  recent: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getJson<Stats>("/api/admin/stats").then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <div className="h-64 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display text-[28px] md:text-[34px] font-bold">Dashboard</h1>
        <p className="text-muted text-[14px] mt-1">Today's bookings, this week's revenue, and recent activity at a glance.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<CalendarRange size={16} />} label="Today's bookings" value={stats.todayCount} accent="emerald" />
        <Kpi icon={<Users size={16} />} label="This week" value={stats.weekCount} accent="sky" />
        <Kpi icon={<CreditCard size={16} />} label="Revenue today" value={formatMnt(stats.revenueToday)} accent="amber" />
        <Kpi icon={<TrendingUp size={16} />} label="Revenue (7d)" value={formatMnt(stats.revenueWeek)} accent="accent" />
      </div>

      {/* Two-column: revenue chart + status mix */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
        <Card title="Daily revenue · last 7 days">
          <RevenueChart data={stats.dailyRevenue} />
        </Card>
        <Card title="Status mix · this week">
          <StatusMix items={stats.statusMix} total={stats.weekCount} />
        </Card>
      </div>

      {/* Recent reservations */}
      <Card
        title="Recent reservations"
        action={<Link href="/admin/reservations" className="text-[13px] font-semibold text-accent inline-flex items-center gap-1">View all <ArrowRight size={13} /></Link>}
      >
        <ul className="divide-y divide-line">
          {stats.recent.map((r) => (
            <li key={r.id} className="py-3 flex items-center gap-3 text-[13px]">
              <div className="w-10 h-10 rounded-xl bg-ink text-white grid place-items-center font-bold flex-none">{r.partySize}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{r.user?.name ?? "—"} <span className="text-muted">· {r.tableId}</span></div>
                <div className="text-[11px] text-muted truncate">{r.date} · {r.time} · {r.zone}</div>
              </div>
              <StatusBadge status={r.status} />
              <PaymentBadge status={r.paymentStatus} amount={r.amount} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Kpi({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number | string; accent: string }) {
  const tints: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-4 md:p-5">
      <div className={clsx("w-8 h-8 rounded-lg grid place-items-center", tints[accent])}>{icon}</div>
      <div className="text-[12px] text-muted mt-3">{label}</div>
      <div className="font-display text-[24px] md:text-[28px] font-bold mt-1 leading-none">{value}</div>
    </div>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-semibold text-[14px]">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function RevenueChart({ data }: { data: { date: string; total: number; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <div>
      <div className="flex items-end gap-2 h-40 mt-1">
        {data.map((d) => {
          const h = Math.round((d.total / max) * 100);
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="text-[10px] text-muted opacity-0 group-hover:opacity-100 transition">{formatMnt(d.total)}</div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-100 rounded-md relative overflow-hidden" style={{ height: "100%" }}>
                <div
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-accent to-amber-400 rounded-md transition-all"
                  style={{ height: `${Math.max(2, h)}%` }}
                />
              </div>
              <div className="text-[10px] text-muted">{d.date.slice(5)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusMix({ items, total }: { items: { status: string; count: number }[]; total: number }) {
  const colors: Record<string, string> = {
    CONFIRMED: "bg-emerald-500",
    ARRIVED: "bg-sky-500",
    COMPLETED: "bg-violet-500",
    CANCELLED: "bg-neutral-300",
    NO_SHOW: "bg-red-500",
  };
  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-[13px] text-muted">No data yet.</p>}
      {items.map((it) => {
        const pct = total ? Math.round((it.count / total) * 100) : 0;
        return (
          <div key={it.status}>
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold">{it.status}</span>
              <span className="text-muted">{it.count} · {pct}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-100 overflow-hidden">
              <div className={clsx("h-full rounded-full transition-all", colors[it.status] ?? "bg-neutral-400")} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

