"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw, Plus, Clock, Users, Check, ArrowRight, MapPin, Phone } from "lucide-react";
import clsx from "clsx";
import { getJson, sendJson } from "@/lib/fetcher";
import { formatMnt } from "@/lib/payments";
import { toast } from "@/lib/toast";
import type { RestaurantTable } from "@/lib/types";
import { StatusBadge } from "@/components/admin/badges";

type Reservation = {
  id: string; tableId: string; zone: string; date: string; time: string;
  partySize: number; status: string; paymentStatus: string; amount: number;
  source: string; notes: string | null;
  user: { name: string; email: string } | null;
  guestName: string | null; guestPhone: string | null;
};
type TableRow = RestaurantTable & { currentRes: Reservation | null; nextRes: Reservation | null; bookings: number };
type Today = {
  today: string;
  stats: {
    total: number; confirmed: number; arrived: number; completed: number;
    cancelled: number; noShow: number;
    expectedRevenue: number; collectedRevenue: number;
  };
  tables: TableRow[];
  items: Reservation[];
};

export default function AdminToday() {
  const [data, setData] = useState<Today | null>(null);
  const [zone, setZone] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    const { data } = await getJson<Today>("/api/admin/today");
    setData(data);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
    // auto-refresh every 30s so the floor stays live
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  async function setStatus(id: string, status: string) {
    const { ok, error } = await sendJson(`/api/admin/reservations/${id}`, "PATCH" as any, { status });
    if (!ok) { toast.error(error ?? "Failed"); return; }
    toast.success(`Marked ${status}`);
    load();
  }

  const zones = useMemo(() => Array.from(new Set(data?.tables.map((t) => t.zone) ?? [])), [data]);

  if (!data) return <div className="h-64 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;

  const filteredTables = zone === "all" ? data.tables : data.tables.filter((t) => t.zone === zone);
  const upcoming = data.items.filter((r) => r.status === "CONFIRMED").slice(0, 8);
  const inService = data.items.filter((r) => r.status === "ARRIVED");

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[12px] uppercase tracking-widest text-muted font-semibold">{data.today} · {new Date().toLocaleDateString("mn-MN", { weekday: "long" })}</p>
          <h1 className="font-display text-[28px] md:text-[34px] font-bold flex items-center gap-3">
            Өнөөдөр
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" /><span className="relative rounded-full h-2 w-2 bg-emerald-500" /></span>
              ШУУД
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={refreshing}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink transition">
            <RefreshCw size={13} className={clsx(refreshing && "animate-spin")} /> Сэргээх
          </button>
          <Link href="/admin/reservations/new"
            className="inline-flex items-center gap-1.5 bg-accent text-white font-semibold px-4 py-2 rounded-full shadow-glow hover:bg-accent-soft transition text-[13px]">
            <Plus size={14} /> Шинэ захиалга
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Kpi label="Total" value={data.stats.total} tint="bg-neutral-100 text-neutral-700" />
        <Kpi label="Confirmed" value={data.stats.confirmed} tint="bg-emerald-50 text-emerald-700" />
        <Kpi label="Arrived" value={data.stats.arrived} tint="bg-sky-50 text-sky-700" />
        <Kpi label="Completed" value={data.stats.completed} tint="bg-violet-50 text-violet-700" />
        <Kpi label="No-show" value={data.stats.noShow} tint="bg-red-50 text-red-600" />
        <Kpi label="Expected" value={formatMnt(data.stats.expectedRevenue)} tint="bg-amber-50 text-amber-700" />
        <Kpi label="Collected" value={formatMnt(data.stats.collectedRevenue)} tint="bg-accent/10 text-accent" />
      </div>

      {/* In-service strip */}
      {inService.length > 0 && (
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-widest text-sky-700 font-bold mb-2.5">Currently seated · {inService.length}</p>
          <ul className="flex flex-wrap gap-2.5">
            {inService.map((r) => (
              <li key={r.id} className="bg-white border border-sky-100 rounded-xl px-3 py-2 flex items-center gap-2.5 text-[13px]">
                <span className="w-8 h-8 rounded bg-sky-600 text-white font-bold grid place-items-center text-[12px]">{r.partySize}</span>
                <div>
                  <div className="font-semibold leading-tight">{r.guestName ?? r.user?.name ?? "—"}</div>
                  <div className="text-[11px] text-muted">{r.tableId} · {r.time}</div>
                </div>
                <button onClick={() => setStatus(r.id, "COMPLETED")}
                  className="text-[11px] font-bold bg-violet-600 text-white px-2 py-1 rounded">Mark done</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Zone filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {["all", ...zones].map((z) => (
          <button key={z} onClick={() => setZone(z)}
            className={clsx("whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-semibold transition",
              zone === z ? "bg-ink text-white" : "bg-white border border-line text-neutral-600 hover:text-ink")}>
            {z === "all" ? "All zones" : z}
          </button>
        ))}
      </div>

      {/* Floor grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTables.map((tbl) => {
          const occupied = !!tbl.currentRes;
          const nextSoon = !!tbl.nextRes;
          const state = occupied ? "occupied" : nextSoon ? "reserved" : tbl.bookings > 0 ? "booked" : "free";
          const stateUI: Record<string, string> = {
            free: "border-line bg-white",
            booked: "border-line bg-white",
            reserved: "border-amber-200 bg-amber-50",
            occupied: "border-sky-200 bg-sky-50",
          };
          return (
            <article key={tbl.id} className={clsx("rounded-2xl border-2 p-4 transition", stateUI[state])}>
              <div className="flex items-start gap-3">
                <div className={clsx("w-12 h-12 rounded-xl grid place-items-center font-bold",
                  state === "occupied" ? "bg-sky-600 text-white" :
                  state === "reserved" ? "bg-amber-500 text-white" :
                  "bg-ink text-white")}>
                  {tbl.label}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold">{tbl.zone}</div>
                  <div className="text-[11px] text-muted flex items-center gap-1 truncate"><MapPin size={11} /> {tbl.position}</div>
                  <div className="text-[11px] text-muted mt-0.5">Seats {tbl.seats} · {tbl.bookings} booking{tbl.bookings === 1 ? "" : "s"} today</div>
                </div>
                <span className={clsx("text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                  state === "occupied" && "bg-sky-600 text-white",
                  state === "reserved" && "bg-amber-500 text-white",
                  state === "free" && "bg-emerald-100 text-emerald-700",
                  state === "booked" && "bg-neutral-100 text-neutral-500",
                )}>{state}</span>
              </div>

              {tbl.currentRes && (
                <div className="mt-3 rounded-xl bg-white border border-sky-200 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700">Seated now</p>
                  <ReservationLine r={tbl.currentRes} />
                  <div className="mt-1.5 flex gap-1.5">
                    <button onClick={() => setStatus(tbl.currentRes!.id, "COMPLETED")} className="text-[11px] font-bold bg-violet-600 text-white px-2.5 py-1 rounded">Done</button>
                    <Link href={`/admin/reservations/${tbl.currentRes.id}`} className="text-[11px] font-bold border border-line text-ink px-2.5 py-1 rounded">Detail</Link>
                  </div>
                </div>
              )}

              {tbl.nextRes && !tbl.currentRes && (
                <div className="mt-3 rounded-xl bg-white border border-amber-200 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Next · {tbl.nextRes.time}</p>
                  <ReservationLine r={tbl.nextRes} />
                  <div className="mt-1.5 flex gap-1.5">
                    <button onClick={() => setStatus(tbl.nextRes!.id, "ARRIVED")} className="text-[11px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded inline-flex items-center gap-1"><Check size={11} /> Seat</button>
                    <button onClick={() => setStatus(tbl.nextRes!.id, "NO_SHOW")} className="text-[11px] font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded">No-show</button>
                    <Link href={`/admin/reservations/${tbl.nextRes.id}`} className="text-[11px] font-bold border border-line text-ink px-2.5 py-1 rounded">Detail</Link>
                  </div>
                </div>
              )}

              {!tbl.currentRes && !tbl.nextRes && (
                <div className="mt-3 text-[12px] text-muted text-center py-3">No upcoming bookings</div>
              )}
            </article>
          );
        })}
      </div>

      {/* Upcoming list */}
      {upcoming.length > 0 && (
        <div className="bg-white border border-line rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[14px]">Upcoming today</h3>
            <Link href="/admin/reservations" className="text-[12px] font-semibold text-accent inline-flex items-center gap-1">All bookings <ArrowRight size={12} /></Link>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {upcoming.map((r) => (
              <li key={r.id} className="py-2.5 flex items-center gap-3 text-[13px]">
                <span className="w-10 h-10 rounded-lg bg-ink text-white grid place-items-center font-bold text-[12px]">{r.partySize}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{r.guestName ?? r.user?.name ?? "—"}</div>
                  <div className="text-[11px] text-muted truncate">{r.tableId} · {r.zone}</div>
                </div>
                <span className="text-[12px] text-muted inline-flex items-center gap-1"><Clock size={11} /> {r.time}</span>
                <StatusBadge status={r.status} />
                <Link href={`/admin/reservations/${r.id}`} className="text-[12px] font-bold text-accent">Open →</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, tint }: { label: string; value: number | string; tint: string }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-3">
      <div className={clsx("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-block", tint)}>{label}</div>
      <div className="font-display text-[22px] font-bold mt-1.5 leading-none">{value}</div>
    </div>
  );
}

function ReservationLine({ r }: { r: Reservation }) {
  return (
    <div className="mt-1">
      <div className="font-semibold text-[13px]">{r.guestName ?? r.user?.name ?? "—"}</div>
      <div className="text-[11px] text-muted flex items-center gap-2.5 mt-0.5">
        <span className="inline-flex items-center gap-1"><Users size={10} /> {r.partySize}</span>
        {r.guestPhone && <span className="inline-flex items-center gap-1"><Phone size={10} /> {r.guestPhone}</span>}
      </div>
    </div>
  );
}
