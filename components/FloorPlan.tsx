"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Eye, Star } from "lucide-react";
import clsx from "clsx";
import type { RestaurantTable, Zone } from "@/lib/types";
import { useBookingStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

/**
 * Cinematic 3D-ish top-down floorplan.
 * Dark wood stage, per-zone architecture (open kitchen, cocktail bar, VIP
 * alcove, garden beds, …), realistic tabletops with soft drop-shadows and
 * floating status pills. SVG-only — scales crisply, fast to render.
 */
export default function FloorPlan({ tables, zone, hideInspector = false }: { tables: RestaurantTable[]; zone: Zone; hideInspector?: boolean }) {
  const { selectedTableId, selectTable } = useBookingStore();
  const { t, tZone } = useI18n();
  const [hoverId, setHoverId] = useState<string | null>(null);

  const inspectId = hoverId ?? selectedTableId;
  const inspected = useMemo(
    () => (hideInspector ? null : tables.find((x) => x.id === inspectId) ?? null),
    [tables, inspectId, hideInspector],
  );

  return (
    <div className="relative rounded-2xl overflow-hidden border border-line bg-[#f7f3ed] shadow-inner">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="w-full h-[420px] md:h-[640px]">
        <defs>
          {/* Subtle architectural grid — premium gallery look */}
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#e3dcd0" strokeWidth=".15" />
          </pattern>
          {/* Soft warm spotlight from above */}
          <radialGradient id="spot" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffd9a8" stopOpacity=".28" />
            <stop offset="100%" stopColor="#ffd9a8" stopOpacity="0" />
          </radialGradient>
          {/* Accent corner glow */}
          <radialGradient id="cornerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6A1A" stopOpacity=".08" />
            <stop offset="100%" stopColor="#FF6A1A" stopOpacity="0" />
          </radialGradient>
          {/* Wood tabletop (round) — warm walnut */}
          <radialGradient id="topWood" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#a87850" />
            <stop offset="55%" stopColor="#7a5236" />
            <stop offset="100%" stopColor="#4a3220" />
          </radialGradient>
          {/* Marble tabletop (rect/square) — crisp white */}
          <linearGradient id="topMarble" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f0ebe2" />
            <stop offset="100%" stopColor="#d6cebf" />
          </linearGradient>
          {/* Velvet booth — rich burgundy */}
          <linearGradient id="topBooth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9a4a62" />
            <stop offset="100%" stopColor="#4f2030" />
          </linearGradient>
          {/* Chair — light olive */}
          <radialGradient id="chair" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#c8c0b0" />
            <stop offset="100%" stopColor="#8c8576" />
          </radialGradient>
          {/* Drop-shadow filter */}
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation=".7" />
            <feOffset dx="0" dy=".4" />
            <feComponentTransfer><feFuncA type="linear" slope=".35" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>

        {/* floor + lighting */}
        <rect width="100" height="100" fill="#faf6ef" />
        <rect width="100" height="100" fill="url(#grid)" />
        <rect width="100" height="100" fill="url(#spot)" />
        <circle cx="15" cy="85" r="40" fill="url(#cornerGlow)" />
        <circle cx="85" cy="15" r="40" fill="url(#cornerGlow)" />

        {/* per-zone architecture */}
        <Architecture zone={zone} tZone={tZone} />

        {/* tables */}
        {tables.map((tbl) => (
          <TableNode key={tbl.id} table={tbl}
            selected={selectedTableId === tbl.id}
            hovered={hoverId === tbl.id}
            onHover={setHoverId}
            onSelect={() => tbl.status === "available" && selectTable(tbl.id === selectedTableId ? null : tbl.id)} />
        ))}
      </svg>

      {/* legend */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-x-3 gap-y-1.5 items-center bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-semibold text-neutral-700 shadow-card border border-line">
        <LegendDot color="#34d399" label={t("book.available")} />
        <LegendDot color="#fbbf24" label={t("book.reserved")} />
        <LegendDot color="#ef4444" label={t("book.taken")} />
        <LegendDot color="#FF6A1A" label={t("book.selected")} />
      </div>

      {/* compass */}
      <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-line grid place-items-center text-neutral-700 shadow-card">
        <div className="text-[8px] font-bold absolute top-1">N</div>
        <Compass size={14} />
      </div>

      {/* hint */}
      {!inspected && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 bg-white/95 backdrop-blur text-[12px] text-neutral-700 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-line shadow-card font-medium">
          <Eye size={13} className="text-accent" /> {t("book.tapToSee")}
        </div>
      )}

      {/* inspector with REAL photo */}
      <AnimatePresence>
        {inspected && (
          <motion.div key={inspected.id}
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute left-3 right-3 bottom-3 bg-white/97 backdrop-blur rounded-2xl shadow-2xl border border-line overflow-hidden">
            <div className="flex gap-3 p-2.5">
              <div className="relative w-28 h-24 md:w-40 md:h-28 rounded-xl overflow-hidden flex-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={inspected.image} alt={inspected.label} className="w-full h-full object-cover" />
                <span className="absolute top-1.5 left-1.5 bg-white/95 text-ink text-[10px] font-bold px-1.5 py-0.5 rounded">{t("book.realView")}</span>
              </div>
              <div className="flex-1 min-w-0 py-0.5 text-ink">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[14px] md:text-[16px] font-bold">{inspected.label} · {tZone(inspected.zone)}</div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                    <Star size={11} className="fill-amber-500 text-amber-500" /> 4.{(inspected.seats * 13) % 9 + 1}
                  </span>
                </div>
                <div className="text-[11px] md:text-[12px] text-muted mt-0.5">{inspected.position}</div>
                <div className="flex items-center gap-3 mt-2 text-[12px]">
                  <span className="font-semibold">{inspected.seats} {t("book.seats")}</span>
                  <span className="capitalize text-muted">{inspected.shape}</span>
                  <span className="ml-auto"><StatusPill status={inspected.status} t={t} /></span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────── architecture per zone ─────────── */
function Architecture({ zone, tZone }: { zone: Zone; tZone: (z: string) => string }) {
  if (zone === "Indoor") {
    return (
      <g>
        {/* open kitchen island, top — soft taupe */}
        <rect x="22" y="3" width="56" height="11" rx="1.5" fill="#e8dfd0" stroke="#c5b8a2" strokeWidth=".2" />
        <rect x="24" y="5" width="52" height="6" rx=".8" fill="#f5efe3" />
        {/* hanging spotlights */}
        {[32, 42, 52, 62, 72].map((x) => (
          <g key={x}>
            <circle cx={x} cy="8" r=".5" fill="#FF6A1A" opacity=".75" />
            <circle cx={x} cy="8" r="1.6" fill="#FF6A1A" opacity=".18" />
          </g>
        ))}
        <rect x="38" y="6.5" width="24" height="4" rx=".8" fill="#1f1a14" />
        <text x="50" y="9.4" textAnchor="middle" fontSize="2" fontWeight="700" fill="#f5efe3" letterSpacing=".15">OPEN KITCHEN</text>

        {/* cocktail bar, bottom-left — light walnut counter */}
        <path d="M2 88 h32 a3 3 0 0 1 3 3 v4 a3 3 0 0 1 -3 3 H2 z"
              fill="#d4c1a3" stroke="#a88e62" strokeWidth=".25" />
        <path d="M2 88 h32 a3 3 0 0 1 3 3 v.6 H2 z" fill="#bda282" />
        {[6, 9, 12, 15, 18, 21, 24, 27, 30].map((x) => (
          <rect key={x} x={x} y="89" width=".9" height="2.2" fill="#FF6A1A" opacity=".6" rx=".15" />
        ))}
        <text x="20" y="96.4" textAnchor="middle" fontSize="2" fontWeight="700" fill="#5a3e1c" letterSpacing=".15">COCKTAIL BAR</text>

        {/* VIP alcove, bottom-right — cream with burgundy accent */}
        <rect x="68" y="86" width="30" height="13" rx="1.2" fill="#f1e9da" stroke="#c5b8a2" strokeWidth=".25" />
        <path d="M68 86 q1.5 6 0 13" stroke="#9a4a62" strokeWidth="1.2" fill="none" opacity=".85" />
        <path d="M98 86 q-1.5 6 0 13" stroke="#9a4a62" strokeWidth="1.2" fill="none" opacity=".85" />
        <rect x="72" y="89" width="22" height="8" rx=".6" fill="#9a4a62" opacity=".18" />
        <circle cx="72" cy="87.5" r=".7" fill="#FF6A1A" />
        <circle cx="94" cy="87.5" r=".7" fill="#FF6A1A" />
        <text x="83" y="94.6" textAnchor="middle" fontSize="2" fontWeight="700" fill="#5a2a1c" letterSpacing=".15">VIP AREA</text>

        {/* corner plants */}
        {[[3, 18], [97, 18], [3, 75], [97, 75]].map(([x, y]) => <Plant key={`p${x}${y}`} x={x} y={y} />)}

        {/* floating zone labels — soft taupe */}
        <text x="50" y="48" textAnchor="middle" fontSize="2.4" fontWeight="700" fill="#a89876" opacity=".55" letterSpacing=".25">MAIN HALL</text>
        <text x="14" y="44" textAnchor="middle" fontSize="1.7" fontWeight="600" fill="#a89876" opacity=".5" letterSpacing=".2">WINDOW AREA</text>
      </g>
    );
  }
  if (zone === "Outdoor") {
    return (
      <g>
        {/* sky / ocean strip at top — soft sky blue */}
        <rect x="2" y="3" width="96" height="8" rx="1" fill="#cfe3ee" />
        <rect x="2" y="3" width="96" height="2" rx="1" fill="#a9cad9" />
        <circle cx="84" cy="7" r="1.6" fill="#fff5d6" />
        {/* string lights */}
        <path d="M4 16 Q50 22 96 16" stroke="#FF6A1A" strokeWidth=".15" fill="none" opacity=".6" />
        {Array.from({ length: 18 }).map((_, i) => (
          <circle key={i} cx={6 + i * 5} cy={16 + Math.sin(i) * 0.6} r=".55" fill="#FF6A1A" opacity=".85" />
        ))}
        <text x="50" y="48" textAnchor="middle" fontSize="2.4" fontWeight="700" fill="#7a8a99" opacity=".5" letterSpacing=".25">OCEAN VIEW PATIO</text>
        {[[5, 35], [95, 35], [5, 80], [95, 80]].map(([x, y]) => <Plant key={`p${x}${y}`} x={x} y={y} />)}
      </g>
    );
  }
  if (zone === "Garden Terrace") {
    return (
      <g>
        {[[8, 8], [50, 6], [92, 8], [8, 50], [92, 50], [8, 92], [50, 94], [92, 92]].map(([x, y], i) => <Plant key={i} x={x} y={y} large />)}
        {/* central fountain — soft stone */}
        <circle cx="50" cy="50" r="4" fill="#e8e1d3" stroke="#c5b8a2" strokeWidth=".2" />
        <circle cx="50" cy="50" r="1.6" fill="#a9cad9" opacity=".8" />
        <text x="50" y="22" textAnchor="middle" fontSize="2.2" fontWeight="700" fill="#6a8c70" opacity=".55" letterSpacing=".25">GARDEN TERRACE</text>
      </g>
    );
  }
  return (
    <g>
      {/* private room wall */}
      <rect x="14" y="14" width="72" height="72" rx="2" fill="#ece4d3" stroke="#c5b8a2" strokeWidth=".25" />
      {/* burgundy rug */}
      <rect x="22" y="22" width="56" height="56" rx="1.5" fill="#9a4a62" opacity=".18" />
      {[[14, 14], [86, 14], [14, 86], [86, 86]].map(([x, y]) => (
        <g key={`s${x}${y}`}>
          <circle cx={x} cy={y} r=".8" fill="#FF6A1A" />
          <circle cx={x} cy={y} r="2" fill="#FF6A1A" opacity=".18" />
        </g>
      ))}
      <text x="50" y="11" textAnchor="middle" fontSize="2.2" fontWeight="700" fill="#5a2a1c" opacity=".75" letterSpacing=".25">PRIVATE ROOM</text>
    </g>
  );
}

function Plant({ x, y, large = false }: { x: number; y: number; large?: boolean }) {
  const r = large ? 2.6 : 1.8;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy={r * 0.6} rx={r} ry={r * 0.35} fill="#000" opacity=".12" />
      <circle r={r} fill="#5a8466" />
      <circle r={r * 0.75} cx={-r * 0.3} cy={-r * 0.2} fill="#6fa07c" />
      <circle r={r * 0.55} cx={r * 0.35} cy={-r * 0.35} fill="#86b793" opacity=".95" />
    </g>
  );
}

/* ─────────── table ─────────── */
function TableNode({ table, selected, hovered, onHover, onSelect }: {
  table: RestaurantTable; selected: boolean; hovered: boolean;
  onHover: (id: string | null) => void; onSelect: () => void;
}) {
  const r = sizeFor(table.shape, table.seats);
  const statusColor =
    table.status === "occupied" ? "#ef4444" :
    table.status === "reserved" ? "#fbbf24" : "#34d399";
  const isAvailable = table.status === "available";
  const opacity = table.status === "occupied" ? 0.75 : 1;
  const topId =
    table.shape === "round" ? "url(#topWood)" :
    table.shape === "booth" ? "url(#topBooth)" : "url(#topMarble)";

  return (
    <g transform={`translate(${table.x} ${table.y}) rotate(${table.rotation})`}
       style={{ cursor: isAvailable ? "pointer" : "not-allowed" }}
       onMouseEnter={() => onHover(table.id)} onMouseLeave={() => onHover(null)} onClick={onSelect}
       opacity={opacity}>

      {/* drop shadow */}
      <ellipse cx="0.4" cy="0.8" rx={r * 1.4} ry={r * 0.55} fill="#000" opacity=".55" filter="url(#glow)" />

      {/* selection halo */}
      {selected && <circle r={r + 3} fill="none" stroke="#FF6A1A" strokeWidth=".4" className="animate-pulse" />}
      {hovered && !selected && <circle r={r + 2.2} fill="none" stroke="#fff" strokeWidth=".25" opacity=".4" />}

      {/* chairs */}
      <Chairs seats={table.seats} shape={table.shape} radius={r} />

      {/* tabletop */}
      {table.shape === "round" && (
        <g filter="url(#softShadow)">
          <circle r={r} fill={topId} />
          <circle r={r * 0.96} fill="none" stroke="#000" strokeWidth=".15" opacity=".4" />
          <circle r=".5" cx="0" cy="0" fill="#000" opacity=".25" />
        </g>
      )}
      {table.shape === "rect" && (
        <g filter="url(#softShadow)">
          <rect x={-r * 1.4} y={-r * 0.8} width={r * 2.8} height={r * 1.6} rx=".8" fill={topId} />
          <rect x={-r * 1.35} y={-r * 0.76} width={r * 2.7} height={r * 1.5} rx=".6" fill="none" stroke="#fff" strokeWidth=".1" opacity=".25" />
        </g>
      )}
      {table.shape === "square" && (
        <g filter="url(#softShadow)">
          <rect x={-r} y={-r} width={r * 2} height={r * 2} rx=".6" fill={topId} />
          <rect x={-r * 0.96} y={-r * 0.96} width={r * 1.92} height={r * 1.92} rx=".4" fill="none" stroke="#fff" strokeWidth=".1" opacity=".22" />
        </g>
      )}
      {table.shape === "booth" && (
        <g filter="url(#softShadow)">
          <path d={`M ${-r * 1.5} ${-r} h ${r * 3} a 1 1 0 0 1 1 1 v ${r * 1.2} a 1 1 0 0 1 -1 1 h ${-r * 3} a 1 1 0 0 1 -1 -1 v ${-r * 1.2} a 1 1 0 0 1 1 -1 z`} fill={topId} />
        </g>
      )}

      {/* floating status pill ABOVE the table */}
      <g transform={`translate(0 ${-r - 4})`}>
        <rect x="-5" y="-2" width="10" height="3.4" rx="1.7" fill={statusColor} />
        <text x="0" y=".4" textAnchor="middle" fontSize="2.1" fontWeight="700" fill="#0c1018">{table.label}</text>
      </g>

      {/* seat people indicators BELOW the table */}
      <g transform={`translate(0 ${r + 4.2})`}>
        {Array.from({ length: Math.min(table.seats, 7) }).map((_, i) => {
          const total = Math.min(table.seats, 7);
          const x = (i - (total - 1) / 2) * 1.6;
          return (
            <g key={i} transform={`translate(${x} 0)`}>
              <circle cy="-.5" r=".55" fill={statusColor} />
              <path d="M-.75 1.2 a.75 .75 0 0 1 1.5 0 v .4 h-1.5 z" fill={statusColor} />
            </g>
          );
        })}
      </g>
    </g>
  );
}

function Chairs({ seats, shape, radius }: { seats: number; shape: string; radius: number }) {
  if (shape === "round") {
    return (<>{Array.from({ length: seats }).map((_, i) => {
      const a = (i / seats) * Math.PI * 2 - Math.PI / 2;
      const cx = Math.cos(a) * (radius + 1.6);
      const cy = Math.sin(a) * (radius + 1.6);
      // petal: rotate so back faces outward
      const rot = (a * 180) / Math.PI + 90;
      return (
        <g key={i} transform={`translate(${cx} ${cy}) rotate(${rot})`}>
          <ellipse cy=".15" rx="1.2" ry="1.5" fill="url(#chair)" />
          <ellipse cy="-.2" rx="1" ry="1.2" fill="#1d2a22" />
        </g>
      );
    })}</>);
  }
  const isBooth = shape === "booth";
  const w = radius * (shape === "rect" || isBooth ? 2.8 : 2);
  const h = radius * (shape === "rect" || isBooth ? 1.6 : 2);
  const perSide = Math.ceil(seats / 2);
  const items: JSX.Element[] = [];
  for (let i = 0; i < perSide && items.length < seats; i++) {
    const x = -w / 2 + (w / (perSide + 1)) * (i + 1);
    items.push(
      <g key={`t${i}`} transform={`translate(${x} ${-h / 2 - 1.4})`}>
        {isBooth
          ? <rect x="-1.4" y="-.6" width="2.8" height="1.2" rx=".25" fill="url(#chair)" />
          : <ellipse rx="1.05" ry="1.3" fill="url(#chair)" />}
      </g>
    );
    if (items.length < seats)
      items.push(
        <g key={`b${i}`} transform={`translate(${x} ${h / 2 + 1.4})`}>
          {isBooth
            ? <rect x="-1.4" y="-.6" width="2.8" height="1.2" rx=".25" fill="url(#chair)" />
            : <ellipse rx="1.05" ry="1.3" fill="url(#chair)" />}
        </g>
      );
  }
  return <>{items}</>;
}

/* ─────────── small UI bits ─────────── */
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />{label}
    </span>
  );
}

function StatusPill({ status, t }: { status: RestaurantTable["status"]; t: (k: any) => string }) {
  const map = {
    available: { bg: "bg-emerald-50", text: "text-emerald-700", key: "book.available" },
    reserved: { bg: "bg-amber-50", text: "text-amber-700", key: "book.reserved" },
    occupied: { bg: "bg-red-50", text: "text-red-600", key: "book.taken" },
  } as const;
  const m = map[status];
  return <span className={clsx("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", m.bg, m.text)}>{t(m.key)}</span>;
}

function sizeFor(shape: string, seats: number) {
  const base = shape === "rect" || shape === "booth" ? 3 : 3.5;
  return base + seats * 0.35;
}
