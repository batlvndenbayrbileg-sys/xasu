"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Plus, Save, Trash2, Edit3, X, Move, MapPin, Users as UsersIcon, Shapes } from "lucide-react";
import clsx from "clsx";
import { getJson, sendJson } from "@/lib/fetcher";
import { toast } from "@/lib/toast";

interface Table {
  id: string; label: string; zone: string; shape: string; seats: number;
  x: number; y: number; rotation: number; position: string; image: string;
  disabled: boolean; sortOrder: number;
}

const SHAPES = ["round", "square", "rect", "booth"];
const ZONES = ["Indoor", "Outdoor", "Garden Terrace", "Private Meeting"];

export default function AdminTables() {
  const [tables, setTables] = useState<Table[] | null>(null);
  const [zone, setZone] = useState<string>("Indoor");
  const [editing, setEditing] = useState<Table | null>(null);
  const [creating, setCreating] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const load = useCallback(async () => {
    const { data } = await getJson<Table[]>("/api/admin/tables");
    setTables(data ?? []);
    setDirty(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const zoneTables = (tables ?? []).filter((t) => t.zone === zone);

  function onPointerDown(e: React.PointerEvent, tbl: Table) {
    const rect = planRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { id: tbl.id, offsetX: e.clientX - rect.left - (tbl.x / 100) * rect.width, offsetY: e.clientY - rect.top - (tbl.y / 100) * rect.height };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    const rect = planRef.current?.getBoundingClientRect();
    if (!d || !rect || !tables) return;
    const x = ((e.clientX - rect.left - d.offsetX) / rect.width) * 100;
    const y = ((e.clientY - rect.top - d.offsetY) / rect.height) * 100;
    setTables(tables.map((t) => t.id === d.id ? { ...t, x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) } : t));
    setDirty(true);
  }
  function onPointerUp(e: React.PointerEvent) {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
  }

  async function savePositions() {
    if (!tables) return;
    setSaving(true);
    const positions = zoneTables.map((t) => ({ id: t.id, x: t.x, y: t.y }));
    const { ok, error } = await sendJson("/api/admin/tables", "PATCH" as any, { positions });
    setSaving(false);
    if (!ok) { toast.error(error ?? "Save failed"); return; }
    toast.success("Layout saved");
    setDirty(false);
  }

  async function deleteTable(id: string) {
    if (!confirm("Delete this table? This is permanent.")) return;
    const { ok } = await sendJson(`/api/admin/tables/${id}`, "DELETE" as any);
    if (!ok) { toast.error("Delete failed"); return; }
    toast.success("Deleted");
    load();
  }

  return (
    <div className="max-w-7xl space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-[28px] md:text-[34px] font-bold">Floor & tables</h1>
          <p className="text-muted text-[14px] mt-1">Drag tables to lay out your floor. Click to edit a table.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 bg-accent text-white font-semibold px-4 py-2 rounded-full shadow-glow text-[13px]">
            <Plus size={14} /> Add table
          </button>
        </div>
      </div>

      {/* Zone tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {ZONES.map((z) => (
          <button key={z} onClick={() => setZone(z)}
            className={clsx("whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wide transition",
              zone === z ? "bg-ink text-white" : "bg-white border border-line text-muted hover:text-ink")}>{z}</button>
        ))}
      </div>

      {/* Floor plan editor */}
      {!tables ? (
        <div className="h-96 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
      ) : (
        <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted inline-flex items-center gap-1.5">
              <Move size={11} /> Drag to position · {zoneTables.length} tables
            </div>
            {dirty && (
              <button onClick={savePositions} disabled={saving}
                className="inline-flex items-center gap-1.5 bg-accent text-white font-semibold px-3.5 py-1.5 rounded-full text-[12px] shadow-glow hover:bg-accent-soft transition disabled:opacity-50">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save layout
              </button>
            )}
          </div>

          <div ref={planRef} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
            className="relative h-[60vh] min-h-[420px] rounded-xl bg-gradient-to-br from-[#0c1018] to-[#1a1f2c] overflow-hidden select-none"
          >
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)", backgroundSize: "5% 5%" }} />

            {zoneTables.map((tbl) => {
              const size = tbl.shape === "rect" || tbl.shape === "booth" ? "w-16 h-10" : "w-12 h-12";
              return (
                <div key={tbl.id}
                  onPointerDown={(e) => onPointerDown(e, tbl)}
                  onDoubleClick={() => setEditing(tbl)}
                  style={{ left: `${tbl.x}%`, top: `${tbl.y}%`, transform: `translate(-50%, -50%) rotate(${tbl.rotation}deg)` }}
                  className={clsx("absolute group cursor-move", tbl.disabled && "opacity-50")}
                >
                  <div className={clsx(
                    "relative grid place-items-center text-white font-bold text-[11px] shadow-2xl ring-2 ring-white/15 transition-all group-hover:ring-accent group-hover:scale-105",
                    size,
                    tbl.shape === "round" && "rounded-full bg-gradient-to-br from-[#5b3a22] to-[#2e1c10]",
                    tbl.shape === "square" && "rounded-md bg-gradient-to-br from-[#aea49a] to-[#7c736b] text-ink",
                    tbl.shape === "rect" && "rounded-md bg-gradient-to-br from-[#aea49a] to-[#7c736b] text-ink",
                    tbl.shape === "booth" && "rounded-md bg-gradient-to-br from-[#7a3a52] to-[#3f1a2a]",
                  )}>
                    {tbl.label}
                  </div>
                  <button onClick={() => setEditing(tbl)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-ink grid place-items-center opacity-0 group-hover:opacity-100 transition shadow-lg" aria-label="Edit">
                    <Edit3 size={11} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gradient-to-br from-[#5b3a22] to-[#2e1c10]" /> Round (wood)</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gradient-to-br from-[#aea49a] to-[#7c736b]" /> Square/rect (marble)</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gradient-to-br from-[#7a3a52] to-[#3f1a2a]" /> Booth (velvet)</span>
            <span className="ml-auto">Double-click to edit · drag to move</span>
          </div>
        </div>
      )}

      {/* Per-table list */}
      <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl">
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-muted px-5 pt-5">All {zone} tables · {zoneTables.length}</h3>
        <ul className="mt-2 divide-y divide-line">
          {zoneTables.map((t) => (
            <li key={t.id} className="px-5 py-3 flex items-center gap-3 text-[13px]">
              <span className="font-mono font-bold w-12">{t.label}</span>
              <span className="text-muted text-[12px] inline-flex items-center gap-1"><UsersIcon size={11} /> {t.seats} seats</span>
              <span className="text-muted text-[12px] inline-flex items-center gap-1"><Shapes size={11} /> {t.shape}</span>
              <span className="text-muted text-[11px] truncate hidden md:inline-flex items-center gap-1"><MapPin size={11} /> {t.position}</span>
              <button onClick={() => setEditing(t)} className="ml-auto text-[12px] font-bold text-accent">Edit</button>
              <button onClick={() => deleteTable(t.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit / create modal */}
      {(editing || creating) && (
        <TableEditor
          table={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); load(); }}
          defaultZone={zone}
        />
      )}
    </div>
  );
}

function TableEditor({ table, onClose, onSaved, defaultZone }: { table: Table | null; onClose: () => void; onSaved: () => void; defaultZone: string }) {
  const isNew = !table;
  const [form, setForm] = useState({
    id: table?.id ?? "",
    label: table?.label ?? "",
    zone: table?.zone ?? defaultZone,
    shape: table?.shape ?? "round",
    seats: table?.seats ?? 4,
    position: table?.position ?? "",
    image: table?.image ?? "",
    rotation: table?.rotation ?? 0,
    disabled: table?.disabled ?? false,
  });
  const [busy, setBusy] = useState(false);

  function update(k: string, v: any) { setForm({ ...form, [k]: v }); }

  async function save() {
    setBusy(true);
    if (isNew) {
      if (!form.id || !form.label) { toast.error("ID and label required"); setBusy(false); return; }
      const { ok, error } = await sendJson("/api/admin/tables", "POST", { ...form, x: 50, y: 50 });
      setBusy(false);
      if (!ok) { toast.error(error === "id_taken" ? "Table ID already exists" : "Create failed"); return; }
      toast.success("Created");
      onSaved();
    } else {
      const { ok, error } = await sendJson(`/api/admin/tables/${table!.id}`, "PATCH" as any, form);
      setBusy(false);
      if (!ok) { toast.error(error ?? "Save failed"); return; }
      toast.success("Updated");
      onSaved();
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/55 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#14161b] rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[20px] font-bold">{isNew ? "Add table" : `Edit ${table!.label}`}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="ID *"><input value={form.id} onChange={(e) => update("id", e.target.value)} className="input" disabled={!isNew} placeholder="t13" /></Field>
          <Field label="Label *"><input value={form.label} onChange={(e) => update("label", e.target.value)} className="input" placeholder="T-13" /></Field>
          <Field label="Zone">
            <select value={form.zone} onChange={(e) => update("zone", e.target.value)} className="input">
              {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </Field>
          <Field label="Shape">
            <select value={form.shape} onChange={(e) => update("shape", e.target.value)} className="input">
              {SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Seats"><input type="number" min={1} value={form.seats} onChange={(e) => update("seats", parseInt(e.target.value) || 1)} className="input" /></Field>
          <Field label="Rotation (°)"><input type="number" value={form.rotation} onChange={(e) => update("rotation", parseFloat(e.target.value) || 0)} className="input" /></Field>
          <div className="col-span-2">
            <Field label="Position description"><input value={form.position} onChange={(e) => update("position", e.target.value)} className="input" placeholder="Window-side · Quiet corner" /></Field>
          </div>
          <div className="col-span-2">
            <Field label="Image URL"><input value={form.image} onChange={(e) => update("image", e.target.value)} className="input" placeholder="https://…" /></Field>
          </div>
          {!isNew && (
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-[13px]">
                <input type="checkbox" checked={form.disabled} onChange={(e) => update("disabled", e.target.checked)} />
                Temporarily disabled (hide from bookings)
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-line text-[13px] font-semibold">Cancel</button>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 bg-accent text-white px-5 py-2 rounded-lg font-semibold text-[13px] shadow-glow disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {isNew ? "Create" : "Save"}
          </button>
        </div>
      </div>

      <style jsx>{`
        :global(.input) { width: 100%; background: #fff; border: 1px solid #eceef1; border-radius: 8px; padding: 8px 10px; font-size: 13px; outline: none; }
        :global(.input:focus) { border-color: #FF6A1A; }
        :global(.input:disabled) { background: #f7f7f7; color: #999; }
        :global(.dark .input) { background: #1e2128; border-color: #272b33; color: #f2f3f5; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span><div className="mt-1">{children}</div></label>;
}
