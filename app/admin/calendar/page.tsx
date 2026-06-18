"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Users } from "lucide-react";
import clsx from "clsx";
import { getJson } from "@/lib/fetcher";
import { formatMnt } from "@/lib/payments";
import { StatusBadge } from "@/components/admin/badges";

interface R {
  id: string; tableId: string; zone: string; date: string; time: string;
  partySize: number; status: string; paymentStatus: string; amount: number;
  user: { name: string; email: string } | null;
  guestName: string | null; guestPhone: string | null;
}

type View = "month" | "week";

function monthMatrix(year: number, month: number /* 0-based */) {
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: string; inMonth: boolean }[] = [];
  // leading prev-month days
  for (let i = startWeekday; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    cells.push({ date: iso(d), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: iso(new Date(year, month, d)), inMonth: true });
  while (cells.length % 7 !== 0) {
    const lastIso = cells[cells.length - 1].date;
    const next = new Date(lastIso); next.setDate(next.getDate() + 1);
    cells.push({ date: iso(next), inMonth: false });
  }
  return cells;
}
function iso(d: Date) { return d.toISOString().slice(0, 10); }
function weekStart(d: Date) {
  const c = new Date(d);
  const day = (c.getDay() + 6) % 7;
  c.setDate(c.getDate() - day);
  return c;
}

export default function AdminCalendar() {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [rows, setRows] = useState<R[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // load range
  const range = useMemo(() => {
    if (view === "month") {
      const y = cursor.getFullYear(); const m = cursor.getMonth();
      return { from: iso(new Date(y, m, -7)), to: iso(new Date(y, m + 1, 7)) };
    } else {
      const ws = weekStart(cursor);
      const we = new Date(ws); we.setDate(we.getDate() + 6);
      return { from: iso(ws), to: iso(we) };
    }
  }, [view, cursor]);

  const load = useCallback(async () => {
    setRows(null);
    const qs = new URLSearchParams({ dateFrom: range.from, dateTo: range.to });
    const { data } = await getJson<R[]>(`/api/admin/reservations?${qs}`);
    setRows(data ?? []);
  }, [range.from, range.to]);
  useEffect(() => { load(); }, [load]);

  const byDate = useMemo(() => {
    const m = new Map<string, R[]>();
    (rows ?? []).forEach((r) => {
      const list = m.get(r.date) ?? [];
      list.push(r);
      m.set(r.date, list);
    });
    return m;
  }, [rows]);

  const maxPerDay = useMemo(() => {
    let max = 1;
    byDate.forEach((arr) => { if (arr.length > max) max = arr.length; });
    return max;
  }, [byDate]);

  function shift(dir: -1 | 1) {
    const c = new Date(cursor);
    if (view === "month") c.setMonth(c.getMonth() + dir); else c.setDate(c.getDate() + dir * 7);
    setCursor(c);
  }

  const todayIso = iso(new Date());

  return (
    <div className="max-w-7xl space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-[28px] md:text-[34px] font-bold inline-flex items-center gap-2">
            <CalendarIcon size={24} className="text-accent" /> Календарь
          </h1>
          <p className="text-muted text-[14px] mt-1">Өдөр бүрийн захиалга, ачааллын heatmap.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-white border border-line rounded-full p-1">
            {(["month", "week"] as const).map((v) => {
              const lbl = v === "month" ? "Сар" : "Долоо хоног";
              return (
                <button key={v} onClick={() => setView(v)}
                  className={clsx("px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wide transition",
                    view === v ? "bg-accent text-white" : "text-muted hover:text-ink")}>{lbl}</button>
              );
            })}
          </div>
          <Link href="/admin/reservations/new"
            className="inline-flex items-center gap-1.5 bg-accent text-white font-semibold px-4 py-2 rounded-full shadow-glow text-[13px]">
            <Plus size={14} /> New
          </Link>
        </div>
      </div>

      {/* Period nav */}
      <div className="flex items-center justify-between bg-white dark:bg-[#14161b] border border-line rounded-2xl p-3">
        <button onClick={() => shift(-1)} className="w-9 h-9 rounded-full border border-line bg-white grid place-items-center hover:border-accent transition"><ChevronLeft size={16} /></button>
        <div className="text-center">
          <p className="font-display text-[20px] font-bold leading-none">
            {view === "month"
              ? cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })
              : `Week of ${weekStart(cursor).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
          </p>
          <button onClick={() => setCursor(new Date())} className="text-[11px] text-accent font-bold uppercase tracking-widest mt-1">Jump to today</button>
        </div>
        <button onClick={() => shift(1)} className="w-9 h-9 rounded-full border border-line bg-white grid place-items-center hover:border-accent transition"><ChevronRight size={16} /></button>
      </div>

      {/* Calendar */}
      {!rows ? (
        <div className="h-72 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
      ) : view === "month" ? (
        <MonthView cursor={cursor} byDate={byDate} maxPerDay={maxPerDay} todayIso={todayIso} onSelect={setSelected} selected={selected} />
      ) : (
        <WeekView cursor={cursor} byDate={byDate} maxPerDay={maxPerDay} todayIso={todayIso} onSelect={setSelected} selected={selected} />
      )}

      {/* Selected day panel */}
      {selected && (
        <DayPanel date={selected} bookings={byDate.get(selected) ?? []} onClose={() => setSelected(null)} />
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted">
        <span>Booking density</span>
        {[0.15, 0.35, 0.6, 0.9].map((o) => (
          <span key={o} className="inline-flex items-center gap-1.5"><span className="w-4 h-3 rounded" style={{ background: `rgba(255,106,26,${o})` }} />{Math.round(o * maxPerDay)}+</span>
        ))}
      </div>
    </div>
  );
}

function MonthView({ cursor, byDate, maxPerDay, todayIso, onSelect, selected }:
  { cursor: Date; byDate: Map<string, any[]>; maxPerDay: number; todayIso: string; onSelect: (d: string) => void; selected: string | null }) {
  const cells = monthMatrix(cursor.getFullYear(), cursor.getMonth());
  return (
    <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7 bg-neutral-50 dark:bg-neutral-50 text-[10px] uppercase tracking-widest font-bold text-muted">
        {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((d) => <div key={d} className="px-3 py-2 text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map(({ date, inMonth }) => {
          const list = byDate.get(date) ?? [];
          const density = maxPerDay > 0 ? list.length / maxPerDay : 0;
          const isToday = date === todayIso;
          const isSel = date === selected;
          return (
            <button key={date} onClick={() => onSelect(date)}
              className={clsx(
                "relative aspect-square sm:aspect-[1.1/1] border-r border-b border-line p-2 text-left flex flex-col transition",
                !inMonth && "opacity-40",
                isSel ? "ring-2 ring-accent ring-inset z-10 bg-white" : "hover:bg-neutral-50 dark:hover:bg-neutral-50",
              )}>
              {/* density background */}
              <div className="absolute inset-1 rounded pointer-events-none" style={{ background: `rgba(255,106,26,${density * 0.7})` }} />
              <div className="relative flex items-center justify-between">
                <span className={clsx("text-[13px] font-bold", isToday ? "bg-accent text-white w-6 h-6 rounded-full grid place-items-center" : "")}>
                  {parseInt(date.slice(8))}
                </span>
                {list.length > 0 && <span className="text-[10px] font-bold text-ink bg-white/80 px-1.5 py-0.5 rounded">{list.length}</span>}
              </div>
              <div className="relative mt-auto space-y-0.5">
                {list.slice(0, 3).map((r) => (
                  <div key={r.id} className="text-[9px] truncate">
                    <span className="font-bold">{r.time.slice(0, 5)}</span> <span className="text-ink/75">{r.guestName ?? r.user?.name ?? "—"}</span>
                  </div>
                ))}
                {list.length > 3 && <div className="text-[9px] text-muted">+{list.length - 3} more</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ cursor, byDate, maxPerDay, todayIso, onSelect, selected }:
  { cursor: Date; byDate: Map<string, any[]>; maxPerDay: number; todayIso: string; onSelect: (d: string) => void; selected: string | null }) {
  const ws = weekStart(cursor);
  const days = Array.from({ length: 7 }).map((_, i) => { const d = new Date(ws); d.setDate(d.getDate() + i); return d; });
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d) => {
        const date = iso(d);
        const list = byDate.get(date) ?? [];
        const density = maxPerDay > 0 ? list.length / maxPerDay : 0;
        const isToday = date === todayIso;
        const isSel = date === selected;
        return (
          <button key={date} onClick={() => onSelect(date)}
            className={clsx("text-left bg-white dark:bg-[#14161b] border-2 rounded-2xl p-3 min-h-[180px] flex flex-col relative overflow-hidden transition",
              isSel ? "border-accent" : isToday ? "border-accent/50" : "border-line hover:border-accent/40")}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(180deg, rgba(255,106,26,${density * 0.18}) 0%, transparent 100%)` }} />
            <div className="relative">
              <div className="text-[10px] uppercase tracking-widest text-muted font-bold">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
              <div className={clsx("font-display text-[24px] font-bold leading-none mt-1", isToday && "text-accent")}>{d.getDate()}</div>
              {list.length > 0 && <div className="text-[10px] font-bold text-accent mt-1">{list.length} booking{list.length === 1 ? "" : "s"}</div>}
            </div>
            <div className="relative mt-3 space-y-1 flex-1">
              {list.slice(0, 5).map((r) => (
                <div key={r.id} className="text-[11px] flex items-center gap-1.5">
                  <span className="font-mono font-bold">{r.time}</span>
                  <span className="text-ink/75 truncate flex-1">{r.guestName ?? r.user?.name ?? "—"}</span>
                </div>
              ))}
              {list.length > 5 && <div className="text-[10px] text-muted">+{list.length - 5} more</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function DayPanel({ date, bookings, onClose }: { date: string; bookings: any[]; onClose: () => void }) {
  const expected = bookings.filter((r) => r.status !== "CANCELLED" && r.status !== "NO_SHOW").reduce((s, r) => s + r.partySize, 0);
  const revenue = bookings.filter((r) => r.paymentStatus === "paid").reduce((s, r) => s + r.amount, 0);
  return (
    <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Selected</p>
          <h3 className="font-display text-[22px] font-bold mt-0.5 leading-none">{new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/reservations/new?date=${date}`} className="inline-flex items-center gap-1 bg-accent text-white font-semibold px-3 py-1.5 rounded-full text-[12px]"><Plus size={12} /> New</Link>
          <button onClick={onClose} className="text-muted hover:text-ink text-[13px]">Close</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 text-center">
        <div className="bg-neutral-50 rounded-lg p-3"><div className="text-[10px] uppercase tracking-widest text-muted font-bold">Bookings</div><div className="font-display text-[22px] font-bold mt-1">{bookings.length}</div></div>
        <div className="bg-neutral-50 rounded-lg p-3"><div className="text-[10px] uppercase tracking-widest text-muted font-bold">Expected guests</div><div className="font-display text-[22px] font-bold mt-1">{expected}</div></div>
        <div className="bg-neutral-50 rounded-lg p-3"><div className="text-[10px] uppercase tracking-widest text-muted font-bold">Revenue</div><div className="font-display text-[22px] font-bold mt-1">{formatMnt(revenue)}</div></div>
      </div>

      {bookings.length === 0 ? (
        <p className="text-[13px] text-muted text-center py-6">No bookings on this day.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {bookings.sort((a, b) => a.time.localeCompare(b.time)).map((r) => (
            <li key={r.id}>
              <Link href={`/admin/reservations/${r.id}`} className="py-2.5 flex items-center gap-3 hover:bg-neutral-50 -mx-2 px-2 rounded">
                <span className="font-mono text-[13px] font-bold w-12">{r.time}</span>
                <span className="w-8 h-8 rounded-lg bg-ink text-white grid place-items-center text-[11px] font-bold"><Users size={11} className="mr-0.5" />{r.partySize}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px] truncate">{r.guestName ?? r.user?.name ?? "—"}</div>
                  <div className="text-[11px] text-muted truncate">{r.tableId} · {r.zone}</div>
                </div>
                <StatusBadge status={r.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
