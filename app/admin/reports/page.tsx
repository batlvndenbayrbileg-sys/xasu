"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2, TrendingUp, CalendarRange, CreditCard, Users, Download, Printer,
  Wallet, ArrowUpRight, ArrowDownRight, Clock, MapPin, Armchair,
} from "lucide-react";
import clsx from "clsx";
import { getJson } from "@/lib/fetcher";
import { formatMnt } from "@/lib/payments";
import { downloadCsv } from "@/lib/csv";
import { toast } from "@/lib/toast";

interface ReportData {
  range: { from: string; to: string; days: number };
  summary: {
    totalBookings: number; totalGuests: number; avgPartySize: number;
    paidRevenue: number; unpaidRevenue: number; avgBookingValue: number;
    paidCount: number; cancelled: number; noShow: number;
  };
  dailySeries: { date: string; bookings: number; guests: number; revenue: number }[];
  statusMix: { key: string; count: number }[];
  paymentMix: { key: string; count: number }[];
  sourceMix: { key: string; count: number }[];
  zoneMix: { zone: string; count: number; revenue: number }[];
  hourMix: { hour: number; count: number }[];
  topTables: { tableId: string; count: number }[];
}

const STATUS_MN: Record<string, string> = {
  CONFIRMED: "Баталгаажсан", ARRIVED: "Ирсэн", COMPLETED: "Дууссан",
  CANCELLED: "Цуцалсан", NO_SHOW: "Ирээгүй",
};
const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: "#10b981", ARRIVED: "#0ea5e9", COMPLETED: "#8b5cf6",
  CANCELLED: "#d4d4d4", NO_SHOW: "#ef4444",
};
const PAY_MN: Record<string, string> = {
  paid: "Төлсөн", unpaid: "Төлөгдөөгүй", refunded: "Буцаасан", failed: "Амжилтгүй",
};
const PAY_COLOR: Record<string, string> = {
  paid: "#10b981", unpaid: "#f59e0b", refunded: "#0ea5e9", failed: "#ef4444",
};
const SOURCE_MN: Record<string, string> = {
  online: "Онлайн", walkin: "Орж ирсэн", phone: "Утсаар", admin: "Админ",
};
const ZONE_MN: Record<string, string> = {
  Indoor: "Доторх", Outdoor: "Гадаа", "Garden Terrace": "Цэцэрлэгт", "Private Meeting": "Хувийн өрөө",
};

function ymd(d: Date) {
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const PRESETS = [
  { label: "7 хоног", days: 7 },
  { label: "14 хоног", days: 14 },
  { label: "30 хоног", days: 30 },
  { label: "90 хоног", days: 90 },
];

export default function AdminReports() {
  const today = new Date();
  const [from, setFrom] = useState(ymd(new Date(today.getTime() - 6 * 86400000)));
  const [to, setTo] = useState(ymd(today));
  const [activePreset, setActivePreset] = useState(7);
  const [d, setD] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getJson<ReportData>(`/api/admin/reports?from=${from}&to=${to}`);
    setD(data);
    setLoading(false);
  }, [from, to]);
  useEffect(() => { load(); }, [load]);

  function applyPreset(days: number) {
    setActivePreset(days);
    setFrom(ymd(new Date(Date.now() - (days - 1) * 86400000)));
    setTo(ymd(new Date()));
  }

  function exportCsv() {
    if (!d || d.dailySeries.length === 0) { toast.error("Татах өгөгдөл алга"); return; }
    downloadCsv(
      d.dailySeries.map((x) => ({
        Огноо: x.date, Захиалга: x.bookings, Зочид: x.guests, "Орлого (₮)": x.revenue,
      })),
      `tailan_${from}_${to}.csv`,
    );
    toast.success("CSV татаж байна");
  }

  const prevRange = useMemo(() => {
    // Build comparison hint from first vs second half of the period.
    if (!d || d.dailySeries.length < 2) return null;
    const half = Math.floor(d.dailySeries.length / 2);
    const a = d.dailySeries.slice(0, half).reduce((s, x) => s + x.revenue, 0);
    const b = d.dailySeries.slice(half).reduce((s, x) => s + x.revenue, 0);
    if (a === 0) return b > 0 ? 100 : 0;
    return Math.round(((b - a) / a) * 100);
  }, [d]);

  return (
    <div className="max-w-7xl space-y-6 report-root">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-[28px] md:text-[34px] font-bold">Тайлан</h1>
          <p className="text-muted text-[14px] mt-1">
            Орлого, захиалга, зочдын урсгал — {from} → {to} ({d?.range.days ?? 0} хоног)
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button onClick={exportCsv}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold bg-white border border-line px-3.5 py-2 rounded-full hover:border-accent transition">
            <Download size={14} /> CSV
          </button>
          <button onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold bg-ink text-white px-3.5 py-2 rounded-full hover:opacity-90 transition">
            <Printer size={14} /> Хэвлэх / PDF
          </button>
        </div>
      </div>

      {/* Date controls */}
      <div className="bg-white border border-line rounded-2xl p-3 flex items-center gap-2 flex-wrap no-print">
        <div className="flex gap-1 bg-neutral-100 rounded-full p-1">
          {PRESETS.map((p) => (
            <button key={p.days} onClick={() => applyPreset(p.days)}
              className={clsx("px-3.5 py-1.5 rounded-full text-[12px] font-bold transition",
                activePreset === p.days ? "bg-accent text-white shadow-glow" : "text-muted hover:text-ink")}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setActivePreset(0); }}
            className="bg-neutral-50 border border-line rounded-lg px-2.5 py-1.5 text-[13px]" />
          <span className="text-muted text-[12px]">→</span>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setActivePreset(0); }}
            className="bg-neutral-50 border border-line rounded-lg px-2.5 py-1.5 text-[13px]" />
        </div>
      </div>

      {loading || !d ? (
        <div className="h-64 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
      ) : (
        <>
          {/* KPI hero cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <HeroKpi
              label="Нийт орлого" value={formatMnt(d.summary.paidRevenue)}
              sub={`${d.summary.paidCount} төлсөн захиалга`} icon={<Wallet size={18} />}
              gradient="from-accent to-amber-400" trend={prevRange} />
            <HeroKpi
              label="Захиалга" value={String(d.summary.totalBookings)}
              sub={`${d.summary.cancelled} цуцлагдсан · ${d.summary.noShow} ирээгүй`} icon={<CalendarRange size={18} />}
              gradient="from-sky-500 to-cyan-400" />
            <HeroKpi
              label="Нийт зочид" value={String(d.summary.totalGuests)}
              sub={`Дундаж ${d.summary.avgPartySize.toFixed(1)} хүн/захиалга`} icon={<Users size={18} />}
              gradient="from-violet-500 to-fuchsia-400" />
            <HeroKpi
              label="Дундаж захиалга" value={formatMnt(Math.round(d.summary.avgBookingValue))}
              sub={`Төлөгдөөгүй ${formatMnt(d.summary.unpaidRevenue)}`} icon={<CreditCard size={18} />}
              gradient="from-emerald-500 to-teal-400" />
          </div>

          {/* Revenue area chart */}
          <Card title="Орлогын чиг хандлага" subtitle="Өдөр бүрийн төлсөн орлого">
            <AreaChart data={d.dailySeries} />
          </Card>

          {/* Two donuts */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Захиалгын төлөв">
              <DonutBlock
                segments={d.statusMix.map((x) => ({ label: STATUS_MN[x.key] ?? x.key, value: x.count, color: STATUS_COLOR[x.key] ?? "#a3a3a3" }))}
                centerLabel="Захиалга" centerValue={d.summary.totalBookings} />
            </Card>
            <Card title="Төлбөрийн байдал">
              <DonutBlock
                segments={d.paymentMix.map((x) => ({ label: PAY_MN[x.key] ?? x.key, value: x.count, color: PAY_COLOR[x.key] ?? "#a3a3a3" }))}
                centerLabel="Гүйлгээ" centerValue={d.paymentMix.reduce((s, x) => s + x.count, 0)} />
            </Card>
          </div>

          {/* Zone + hours */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Бүсээр" subtitle="Захиалга ба орлого">
              {d.zoneMix.length === 0 ? <Empty /> : (
                <div className="space-y-3">
                  {d.zoneMix.map((z, i) => {
                    const max = Math.max(1, ...d.zoneMix.map((x) => x.count));
                    const pct = Math.round((z.count / max) * 100);
                    return (
                      <div key={z.zone}>
                        <div className="flex items-center justify-between text-[12.5px] mb-1">
                          <span className="font-semibold inline-flex items-center gap-1.5"><MapPin size={12} className="text-accent" /> {ZONE_MN[z.zone] ?? z.zone}</span>
                          <span className="text-muted">{z.count} захиалга · <span className="font-semibold text-ink">{formatMnt(z.revenue)}</span></span>
                        </div>
                        <div className="h-2.5 rounded-full bg-neutral-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-accent to-amber-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card title="Цагийн ачаалал" subtitle="Хамгийн завгүй цагууд">
              {d.hourMix.length === 0 ? <Empty /> : <HourBars data={d.hourMix} />}
            </Card>
          </div>

          {/* Top tables + sources */}
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
            <Card title="Эрэлттэй ширээ" subtitle="Хамгийн их захиалагдсан">
              {d.topTables.length === 0 ? <Empty /> : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {d.topTables.map((t, i) => (
                    <div key={t.tableId} className={clsx("rounded-xl p-3 border text-center",
                      i === 0 ? "bg-accent/5 border-accent/30" : "bg-neutral-50 border-line")}>
                      <div className="w-8 h-8 rounded-lg bg-ink text-white grid place-items-center mx-auto mb-1.5"><Armchair size={15} /></div>
                      <div className="font-bold text-[14px]">{t.tableId}</div>
                      <div className="text-[11px] text-muted">{t.count} удаа</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Захиалгын эх сурвалж">
              {d.sourceMix.length === 0 ? <Empty /> : (
                <div className="space-y-2.5">
                  {d.sourceMix.map((s) => {
                    const total = d.sourceMix.reduce((a, x) => a + x.count, 0) || 1;
                    const pct = Math.round((s.count / total) * 100);
                    return (
                      <div key={s.key} className="flex items-center gap-3">
                        <span className="text-[13px] font-semibold w-24 flex-none">{SOURCE_MN[s.key] ?? s.key}</span>
                        <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                          <div className="h-full rounded-full bg-sky-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[12px] text-muted w-14 text-right">{s.count} · {pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <p className="text-[11px] text-muted text-center pt-2 print-only">
            Xasu ресторан · Тайлан гаргасан огноо: {new Date().toLocaleString("mn-MN")}
          </p>
        </>
      )}

      <style jsx global>{`
        @media print {
          aside, header, .no-print { display: none !important; }
          .report-root { max-width: 100% !important; }
          main { padding: 0 !important; }
          body { background: #fff !important; }
        }
        .print-only { display: none; }
        @media print { .print-only { display: block; } }
      `}</style>
    </div>
  );
}

/* ───────────────────────── components ───────────────────────── */

function HeroKpi({ label, value, sub, icon, gradient, trend }: {
  label: string; value: string; sub: string; icon: React.ReactNode; gradient: string; trend?: number | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white p-5">
      <div className={clsx("absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br", gradient)} />
      <div className="flex items-center justify-between">
        <div className={clsx("w-10 h-10 rounded-xl grid place-items-center text-white bg-gradient-to-br", gradient)}>{icon}</div>
        {typeof trend === "number" && (
          <span className={clsx("inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full",
            trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
            {trend >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-[12px] text-muted mt-3.5">{label}</div>
      <div className="font-display text-[24px] md:text-[26px] font-bold mt-0.5 leading-none">{value}</div>
      <div className="text-[11px] text-muted mt-1.5">{sub}</div>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-4 md:p-5 break-inside-avoid">
      <div className="mb-4">
        <h3 className="font-semibold text-[15px]">{title}</h3>
        {subtitle && <p className="text-[12px] text-muted mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-[13px] text-muted py-6 text-center">Энэ хугацаанд өгөгдөл алга.</p>;
}

/* Smooth Catmull-Rom path through points */
function smoothPath(pts: [number, number][]) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let dStr = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    dStr += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return dStr;
}

function AreaChart({ data }: { data: { date: string; revenue: number; bookings: number }[] }) {
  const W = 760, H = 240;
  const pad = { l: 10, r: 10, t: 18, b: 26 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max = Math.max(1, ...data.map((x) => x.revenue));
  const n = data.length;
  const xs = (i: number) => pad.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const ys = (v: number) => pad.t + innerH - (v / max) * innerH;
  const pts = data.map((x, i) => [xs(i), ys(x.revenue)] as [number, number]);
  const line = smoothPath(pts);
  const area = n > 0 ? `${line} L ${xs(n - 1).toFixed(1)} ${(pad.t + innerH).toFixed(1)} L ${xs(0).toFixed(1)} ${(pad.t + innerH).toFixed(1)} Z` : "";
  const peak = data.reduce((m, x, i) => (x.revenue > data[m].revenue ? i : m), 0);

  // Show ~6 x-axis labels max
  const labelEvery = Math.max(1, Math.ceil(n / 6));

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6A1A" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#FF6A1A" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* gridlines */}
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={pad.l} x2={W - pad.r} y1={pad.t + innerH - g * innerH} y2={pad.t + innerH - g * innerH}
            stroke="#f0f0f0" strokeWidth={1} />
        ))}
        {area && <path d={area} fill="url(#areaFill)" />}
        {line && <path d={line} fill="none" stroke="#FF6A1A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />}
        {/* points */}
        {pts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={i === peak ? 4.5 : 2.5} fill="#fff" stroke="#FF6A1A" strokeWidth={2} />
            {i === peak && data[peak].revenue > 0 && (
              <text x={x} y={y - 12} textAnchor="middle" className="fill-ink" style={{ fontSize: 11, fontWeight: 700 }}>
                {formatMnt(data[peak].revenue)}
              </text>
            )}
          </g>
        ))}
        {/* x labels */}
        {data.map((x, i) => (i % labelEvery === 0 || i === n - 1) ? (
          <text key={i} x={xs(i)} y={H - 8} textAnchor="middle" fill="#9ca3af" style={{ fontSize: 10 }}>
            {x.date.slice(5)}
          </text>
        ) : null)}
      </svg>
    </div>
  );
}

function DonutBlock({ segments, centerLabel, centerValue }: {
  segments: { label: string; value: number; color: string }[];
  centerLabel: string; centerValue: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <Empty />;
  const size = 168, stroke = 22, r = (size - stroke) / 2, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-none">
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {segments.map((seg, i) => {
            const len = (seg.value / total) * circ;
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={stroke}
                strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset} />
            );
            offset += len;
            return el;
          })}
        </g>
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-ink" style={{ fontSize: 26, fontWeight: 800 }}>{centerValue}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#9ca3af" style={{ fontSize: 11 }}>{centerLabel}</text>
      </svg>
      <ul className="flex-1 min-w-[140px] space-y-2">
        {segments.map((seg) => {
          const pct = Math.round((seg.value / total) * 100);
          return (
            <li key={seg.label} className="flex items-center gap-2 text-[13px]">
              <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: seg.color }} />
              <span className="font-medium">{seg.label}</span>
              <span className="ml-auto text-muted">{seg.value} · {pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HourBars({ data }: { data: { hour: number; count: number }[] }) {
  const max = Math.max(1, ...data.map((x) => x.count));
  return (
    <div className="flex items-end gap-1.5 h-44">
      {data.map((x) => {
        const h = Math.round((x.count / max) * 100);
        return (
          <div key={x.hour} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
            <div className="text-[10px] font-bold text-ink opacity-0 group-hover:opacity-100 transition">{x.count}</div>
            <div className="w-full bg-neutral-100 rounded-md relative overflow-hidden flex-1">
              <div className="absolute inset-x-0 bottom-0 rounded-md bg-gradient-to-t from-sky-500 to-cyan-400 transition-all"
                style={{ height: `${Math.max(4, h)}%` }} />
            </div>
            <div className="text-[9px] text-muted">{String(x.hour).padStart(2, "0")}</div>
          </div>
        );
      })}
    </div>
  );
}
