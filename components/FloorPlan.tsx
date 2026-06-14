"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, Compass, Eye } from "lucide-react";
import clsx from "clsx";
import type { RestaurantTable, Zone } from "@/lib/types";
import { useBookingStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

/**
 * Creative interactive floorplan.
 * Top-down SVG plan (resolution-independent 100×100 grid). Selecting a table
 * reveals a realistic photo of that exact table in the inspector, plus seats,
 * zone and position metadata. Pulsing ring marks the selection.
 */
export default function FloorPlan({ tables, zone }: { tables: RestaurantTable[]; zone: Zone }) {
  const { selectedTableId, selectTable } = useBookingStore();
  const { t, tZone } = useI18n();
  const [hoverId, setHoverId] = useState<string | null>(null);

  const inspectId = hoverId ?? selectedTableId;
  const inspected = useMemo(() => tables.find((x) => x.id === inspectId) ?? null, [tables, inspectId]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-line bg-gradient-to-b from-[#fafbfc] to-[#eef1f4]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-[400px] md:h-[600px]">
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#e7e9ec" strokeWidth=".25" />
          </pattern>
          <radialGradient id="spot" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        <rect width="100" height="100" fill="url(#spot)" />

        <ArchitectureLayer zone={zone} tZone={tZone} />

        {tables.map((tbl) => (
          <TableNode key={tbl.id} table={tbl}
            selected={selectedTableId === tbl.id}
            hovered={hoverId === tbl.id}
            onHover={setHoverId}
            onSelect={() => tbl.status === "available" && selectTable(tbl.id === selectedTableId ? null : tbl.id)} />
        ))}
      </svg>

      <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-medium text-neutral-500 bg-white/70 backdrop-blur px-2 py-1 rounded-md">
        <Compass size={11} /> N
      </div>

      {/* hint when nothing chosen */}
      {!inspected && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 bg-white/80 backdrop-blur text-[12px] text-neutral-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Eye size={13} className="text-accent" /> {t("book.tapToSee")}
        </div>
      )}

      {/* inspector with REAL photo */}
      <AnimatePresence>
        {inspected && (
          <motion.div key={inspected.id}
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute left-3 right-3 bottom-3 bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-line overflow-hidden">
            <div className="flex gap-3 p-2.5">
              {/* real photo */}
              <div className="relative w-28 h-24 md:w-40 md:h-28 rounded-xl overflow-hidden flex-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={inspected.image} alt={inspected.label} className="w-full h-full object-cover" />
                <span className="absolute top-1.5 left-1.5 bg-white/85 text-[10px] font-bold px-1.5 py-0.5 rounded">{t("book.realView")}</span>
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[14px] md:text-[16px] font-bold">{inspected.label} · {tZone(inspected.zone)}</div>
                  <StatusBadge status={inspected.status} t={t} />
                </div>
                <div className="text-[11px] md:text-[12px] text-muted flex items-center gap-1 mt-0.5">
                  <MapPin size={11} /> {inspected.position}
                </div>
                <div className="flex items-center gap-4 mt-2 text-[12px] text-neutral-700">
                  <span className="inline-flex items-center gap-1 font-semibold"><Users size={13} /> {inspected.seats} {t("book.seats")}</span>
                  <span className="capitalize text-muted">{inspected.shape}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────── subcomponents ─────────── */
function TableNode({ table, selected, hovered, onHover, onSelect }: {
  table: RestaurantTable; selected: boolean; hovered: boolean;
  onHover: (id: string | null) => void; onSelect: () => void;
}) {
  const fill =
    table.status === "occupied" ? "#cbd0d6" :
    table.status === "reserved" ? "#fbbf24" :
    selected ? "#FF6A1A" : "#1b1d22";
  const seatColor = table.status === "available" ? "#9aa0a6" : "#cbd0d6";
  const r = sizeFor(table.shape, table.seats);

  return (
    <g transform={`translate(${table.x} ${table.y}) rotate(${table.rotation})`}
      style={{ cursor: table.status === "available" ? "pointer" : "not-allowed" }}
      onMouseEnter={() => onHover(table.id)} onMouseLeave={() => onHover(null)} onClick={onSelect}>
      <Chairs seats={table.seats} shape={table.shape} radius={r} color={seatColor} />
      {selected && <circle r={r + 2.5} fill="none" stroke="#FF6A1A" strokeWidth="0.4" className="animate-pulse-ring" />}
      {(hovered && !selected) && <circle r={r + 1.8} fill="none" stroke="#1b1d22" strokeWidth="0.3" opacity="0.4" />}

      {table.shape === "round" && <circle r={r} fill={fill} opacity={table.status === "occupied" ? 0.5 : 1} />}
      {table.shape === "rect" && <rect x={-r * 1.4} y={-r * 0.8} width={r * 2.8} height={r * 1.6} rx="1" fill={fill} opacity={table.status === "occupied" ? 0.5 : 1} />}
      {table.shape === "square" && <rect x={-r} y={-r} width={r * 2} height={r * 2} rx=".8" fill={fill} opacity={table.status === "occupied" ? 0.5 : 1} />}
      {table.shape === "booth" && <path d={`M ${-r * 1.5} ${-r} h ${r * 3} a 1 1 0 0 1 1 1 v ${r * 1.2} a 1 1 0 0 1 -1 1 h ${-r * 3} a 1 1 0 0 1 -1 -1 v ${-r * 1.2} a 1 1 0 0 1 1 -1 z`} fill={fill} opacity={table.status === "occupied" ? 0.5 : 1} />}

      <text textAnchor="middle" dominantBaseline="central" fontSize="2.4" fontWeight="700" fill="#fff">{table.seats}</text>
      <text y={r + 3.5} textAnchor="middle" fontSize="1.6" fontWeight="600"
        fill={selected ? "#FF6A1A" : hovered ? "#111" : "#6b7280"}>{table.label}</text>
    </g>
  );
}

function Chairs({ seats, shape, radius, color }: { seats: number; shape: string; radius: number; color: string }) {
  if (shape === "round") {
    return (<>{Array.from({ length: seats }).map((_, i) => {
      const a = (i / seats) * Math.PI * 2 - Math.PI / 2;
      return <circle key={i} cx={Math.cos(a) * (radius + 1.5)} cy={Math.sin(a) * (radius + 1.5)} r="0.9" fill={color} />;
    })}</>);
  }
  const perSide = Math.ceil(seats / 2);
  const w = radius * (shape === "rect" || shape === "booth" ? 2.8 : 2);
  const h = radius * (shape === "rect" || shape === "booth" ? 1.6 : 2);
  const spots: { x: number; y: number }[] = [];
  for (let i = 0; i < perSide; i++) {
    const x = -w / 2 + (w / (perSide + 1)) * (i + 1);
    spots.push({ x, y: -h / 2 - 1.4 });
    spots.push({ x, y: h / 2 + 1.4 });
  }
  return (<>{spots.slice(0, seats).map((p, i) => (
    <rect key={i} x={p.x - 0.9} y={p.y - 0.6} width="1.8" height="1.2" rx=".3" fill={color} />
  ))}</>);
}

function ArchitectureLayer({ zone, tZone }: { zone: Zone; tZone: (z: string) => string }) {
  if (zone === "Indoor") {
    return (<>
      <rect x="42" y="2" width="16" height="5" rx="1" fill="#dfe3e7" />
      <text x="50" y="5.5" textAnchor="middle" fontSize="2" fontWeight="700" fill="#6b7280">KITCHEN</text>
      <rect x="2" y="92" width="18" height="5" rx="1" fill="#dfe3e7" />
      <text x="11" y="95.5" textAnchor="middle" fontSize="2" fontWeight="700" fill="#6b7280">BAR</text>
      <line x1="0" y1="50" x2="100" y2="50" stroke="#e7e9ec" strokeDasharray="1 1.5" />
    </>);
  }
  if (zone === "Outdoor") {
    return (<>
      <rect x="2" y="2" width="96" height="3" rx="1.5" fill="#cfe8d4" />
      <text x="50" y="4.4" textAnchor="middle" fontSize="1.8" fontWeight="700" fill="#3f7a4d">OCEAN VIEW</text>
      <circle cx="14" cy="60" r="6" fill="#cfe8d4" opacity=".6" />
      <circle cx="88" cy="22" r="5" fill="#cfe8d4" opacity=".6" />
    </>);
  }
  if (zone === "Garden Terrace") {
    return (<>
      {[15, 30, 45, 60, 75, 90].map((x) => <circle key={x} cx={x} cy="10" r="4" fill="#bfe2c6" opacity=".7" />)}
      {[20, 40, 60, 80].map((x) => <circle key={`b${x}`} cx={x} cy="90" r="4" fill="#bfe2c6" opacity=".7" />)}
    </>);
  }
  return (<>
    <rect x="10" y="10" width="80" height="80" rx="3" fill="none" stroke="#d9dde2" strokeDasharray="2 1.5" />
    <text x="50" y="8" textAnchor="middle" fontSize="2" fontWeight="700" fill="#9aa0a6">PRIVATE ROOM</text>
  </>);
}

function StatusBadge({ status, t }: { status: RestaurantTable["status"]; t: (k: any) => string }) {
  const map = {
    available: { bg: "bg-emerald-50", text: "text-emerald-700", key: "book.available" },
    reserved: { bg: "bg-amber-50", text: "text-amber-700", key: "book.reserved" },
    occupied: { bg: "bg-neutral-100", text: "text-neutral-500", key: "book.taken" },
  } as const;
  const m = map[status];
  return <span className={clsx("text-[10px] font-semibold px-2 py-1 rounded-full", m.bg, m.text)}>{t(m.key)}</span>;
}

function sizeFor(shape: string, seats: number) {
  const base = shape === "rect" || shape === "booth" ? 3 : 3.5;
  return base + seats * 0.35;
}
