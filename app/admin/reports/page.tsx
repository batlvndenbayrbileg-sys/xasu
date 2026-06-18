"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, CalendarRange, CreditCard } from "lucide-react";
import clsx from "clsx";
import { getJson } from "@/lib/fetcher";
import { formatMnt } from "@/lib/payments";

interface Stats {
  todayCount: number;
  weekCount: number;
  revenueToday: number;
  revenueWeek: number;
  statusMix: { status: string; count: number }[];
  paymentMix: { status: string; count: number }[];
  dailyRevenue: { date: string; total: number; count: number }[];
}

export default function AdminReports() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => { getJson<Stats>("/api/admin/stats").then(({ data }) => setS(data)); }, []);
  if (!s) return <div className="h-64 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;

  const weekAvg = Math.round(s.revenueWeek / 7);
  const bestDay = [...s.dailyRevenue].sort((a, b) => b.total - a.total)[0];

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-[28px] md:text-[34px] font-bold">Тайлан</h1>
        <p className="text-muted text-[14px] mt-1">7 хоногийн орлого, төлвийн задаргаа, төлбөрийн байдал.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile label="Өнөөдрийн орлого" value={formatMnt(s.revenueToday)} icon={<CreditCard size={15} />} tint="emerald" />
        <Tile label="7 хоногийн орлого" value={formatMnt(s.revenueWeek)} icon={<TrendingUp size={15} />} tint="accent" />
        <Tile label="Өдрийн дундаж" value={formatMnt(weekAvg)} icon={<CalendarRange size={15} />} tint="sky" />
        <Tile label="Хамгийн их өдөр" value={bestDay ? `${bestDay.date.slice(5)} · ${formatMnt(bestDay.total)}` : "—"} icon={<TrendingUp size={15} />} tint="amber" />
      </div>

      <Card title="Revenue trend · last 7 days">
        <Bars data={s.dailyRevenue} />
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Booking statuses · this week">
          <Bar items={s.statusMix} total={s.weekCount} colorMap={{
            CONFIRMED: "bg-emerald-500", ARRIVED: "bg-sky-500", COMPLETED: "bg-violet-500",
            CANCELLED: "bg-neutral-300", NO_SHOW: "bg-red-500",
          }} />
        </Card>
        <Card title="Payments · this week">
          <Bar items={s.paymentMix} total={s.weekCount} colorMap={{
            paid: "bg-emerald-500", unpaid: "bg-amber-500", refunded: "bg-sky-500", failed: "bg-red-500",
          }} />
        </Card>
      </div>
    </div>
  );
}

function Tile({ label, value, icon, tint }: { label: string; value: string; icon: React.ReactNode; tint: string }) {
  const tints: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-4 md:p-5">
      <div className={clsx("w-8 h-8 rounded-lg grid place-items-center", tints[tint])}>{icon}</div>
      <div className="text-[12px] text-muted mt-3">{label}</div>
      <div className="font-display text-[20px] md:text-[24px] font-bold mt-1 leading-none">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-4 md:p-5">
      <h3 className="font-semibold text-[14px] mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Bars({ data }: { data: { date: string; total: number; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <div className="flex items-end gap-3 h-48">
      {data.map((d) => {
        const h = Math.round((d.total / max) * 100);
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="text-[11px] font-semibold text-ink">{d.total ? formatMnt(d.total) : "—"}</div>
            <div className="w-full bg-neutral-100 dark:bg-neutral-100 rounded-md relative overflow-hidden" style={{ height: "100%" }}>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-accent to-amber-400 rounded-md transition-all"
                style={{ height: `${Math.max(2, h)}%` }} />
            </div>
            <div className="text-[10px] text-muted">{d.date.slice(5)}</div>
          </div>
        );
      })}
    </div>
  );
}

function Bar({ items, total, colorMap }: { items: { status: string; count: number }[]; total: number; colorMap: Record<string, string> }) {
  if (items.length === 0) return <p className="text-[13px] text-muted">No data yet.</p>;
  return (
    <div className="space-y-3">
      {items.map((it) => {
        const pct = total ? Math.round((it.count / total) * 100) : 0;
        return (
          <div key={it.status}>
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold uppercase tracking-wide">{it.status}</span>
              <span className="text-muted">{it.count} · {pct}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-100 overflow-hidden">
              <div className={clsx("h-full rounded-full transition-all", colorMap[it.status] ?? "bg-neutral-400")} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
