"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Plus, X, Sparkles, Phone, Mail, MapPin, Building2, Calendar, Wallet, Users as UsersIcon } from "lucide-react";
import clsx from "clsx";
import { getJson, sendJson } from "@/lib/fetcher";
import { formatMnt } from "@/lib/payments";
import { toast } from "@/lib/toast";

const DOW: { k: string; mn: string; en: string }[] = [
  { k: "mon", mn: "Дав", en: "Mon" }, { k: "tue", mn: "Мяг", en: "Tue" },
  { k: "wed", mn: "Лха", en: "Wed" }, { k: "thu", mn: "Пүр", en: "Thu" },
  { k: "fri", mn: "Баа", en: "Fri" }, { k: "sat", mn: "Бям", en: "Sat" },
  { k: "sun", mn: "Ням", en: "Sun" },
];

interface Settings {
  venueName: string; venueAddress: string; contactPhone: string; contactEmail: string;
  hours: Record<string, { open: string; close: string; closed: boolean }>;
  depositMnt: number; maxPartySize: number;
  blackoutDates: string[];
  bookingWindow: number;
}

export default function AdminSettings() {
  const [s, setS] = useState<Settings | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await getJson<Settings>("/api/admin/settings");
    setS(data);
    setDirty(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  function update<K extends keyof Settings>(k: K, v: Settings[K]) { setS((cur) => cur && { ...cur, [k]: v }); setDirty(true); }
  function updHours(day: string, patch: any) {
    if (!s) return;
    update("hours", { ...s.hours, [day]: { ...s.hours[day], ...patch } });
  }
  function addBlackout(date: string) { if (!s || !date || s.blackoutDates.includes(date)) return; update("blackoutDates", [...s.blackoutDates, date].sort()); }
  function rmBlackout(date: string) { if (!s) return; update("blackoutDates", s.blackoutDates.filter((d) => d !== date)); }

  async function save() {
    if (!s) return;
    setSaving(true);
    const { ok, error } = await sendJson("/api/admin/settings", "PATCH" as any, s);
    setSaving(false);
    if (!ok) { toast.error(error ?? "Failed"); return; }
    toast.success("Settings saved");
    load();
  }

  if (!s) return <div className="h-64 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;

  return (
    <div className="max-w-7xl space-y-5 pb-24">
      <div>
        <h1 className="font-display text-[28px] md:text-[34px] font-bold">Тохиргоо</h1>
        <p className="text-muted text-[14px] mt-1">Ажиллах цаг, депозит, холбоо барих, хаалттай өдрүүд. Баруун талд урьдчилан үзэх.</p>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <div className="space-y-5">
          {/* Venue */}
          <Card icon={<Building2 size={14} />} title="Venue">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Name"><input value={s.venueName} onChange={(e) => update("venueName", e.target.value)} className="input" /></Field>
              <Field label="Address"><input value={s.venueAddress} onChange={(e) => update("venueAddress", e.target.value)} className="input" /></Field>
              <Field label="Phone"><input value={s.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} className="input" placeholder="+976 …" /></Field>
              <Field label="Email"><input type="email" value={s.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className="input" placeholder="hello@xasu.shop" /></Field>
            </div>
          </Card>

          {/* Hours */}
          <Card icon={<Calendar size={14} />} title="Opening hours">
            <ul className="divide-y divide-line">
              {DOW.map((d) => {
                const h = s.hours[d.k] ?? { open: "17:00", close: "23:00", closed: false };
                return (
                  <li key={d.k} className="py-2.5 flex items-center gap-3">
                    <div className="w-12 font-bold text-[13px] uppercase tracking-wider text-muted">{d.en}</div>
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" value={h.open} onChange={(e) => updHours(d.k, { open: e.target.value })} disabled={h.closed} className={clsx("input w-28", h.closed && "opacity-40")} />
                      <span className="text-muted text-[13px]">→</span>
                      <input type="time" value={h.close} onChange={(e) => updHours(d.k, { close: e.target.value })} disabled={h.closed} className={clsx("input w-28", h.closed && "opacity-40")} />
                    </div>
                    <button onClick={() => updHours(d.k, { closed: !h.closed })}
                      className={clsx("text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition",
                        h.closed ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700")}>
                      {h.closed ? "Closed" : "Open"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Deposit + policy */}
          <Card icon={<Wallet size={14} />} title="Booking policy">
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Deposit (MNT)">
                <input type="number" value={s.depositMnt} onChange={(e) => update("depositMnt", parseInt(e.target.value) || 0)} className="input" />
                <p className="text-[10px] text-muted mt-1">{formatMnt(s.depositMnt)}</p>
              </Field>
              <Field label="Max party size">
                <input type="number" min={1} value={s.maxPartySize} onChange={(e) => update("maxPartySize", parseInt(e.target.value) || 1)} className="input" />
              </Field>
              <Field label="Booking window (days)">
                <input type="number" min={1} value={s.bookingWindow} onChange={(e) => update("bookingWindow", parseInt(e.target.value) || 1)} className="input" />
                <p className="text-[10px] text-muted mt-1">Accept reservations up to {s.bookingWindow} days ahead</p>
              </Field>
            </div>
          </Card>

          {/* Blackout dates */}
          <Card icon={<X size={14} />} title="Blackout dates" subtitle="Holidays, private events, closed days — block all bookings.">
            <div className="flex gap-2">
              <input type="date" id="blackout-input" className="input flex-1" />
              <button onClick={() => {
                const el = document.getElementById("blackout-input") as HTMLInputElement;
                addBlackout(el.value);
                el.value = "";
              }} className="inline-flex items-center gap-1 bg-ink text-white font-semibold px-4 py-2.5 rounded-lg text-[13px]">
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.blackoutDates.length === 0 && <p className="text-[12px] text-muted">No blackout dates set.</p>}
              {s.blackoutDates.map((d) => (
                <span key={d} className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-[12px] font-semibold px-2.5 py-1 rounded-full">
                  {d}
                  <button onClick={() => rmBlackout(d)} className="hover:text-red-900"><X size={11} /></button>
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT — live preview */}
        <div className="space-y-4">
          <div className="sticky top-4 space-y-4">
            <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-accent to-amber-400 text-white p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1"><Sparkles size={11} /> Guest preview</p>
                <h3 className="font-display text-[20px] font-bold mt-1">{s.venueName}</h3>
                <div className="mt-2 space-y-1 text-[12px] text-white/85">
                  {s.venueAddress && <p className="inline-flex items-center gap-1.5"><MapPin size={11} /> {s.venueAddress}</p>}
                  {s.contactPhone && <p className="inline-flex items-center gap-1.5"><Phone size={11} /> {s.contactPhone}</p>}
                  {s.contactEmail && <p className="inline-flex items-center gap-1.5"><Mail size={11} /> {s.contactEmail}</p>}
                </div>
              </div>
              <div className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-2">Hours</p>
                <ul className="space-y-1 text-[13px]">
                  {DOW.map((d) => {
                    const h = s.hours[d.k] ?? { open: "17:00", close: "23:00", closed: false };
                    const isToday = (() => { const dy = new Date().getDay(); const map = ["sun","mon","tue","wed","thu","fri","sat"]; return map[dy] === d.k; })();
                    return (
                      <li key={d.k} className={clsx("flex items-center justify-between", isToday && "bg-accent/10 -mx-2 px-2 py-0.5 rounded")}>
                        <span className={clsx("font-semibold", isToday && "text-accent")}>{d.en}{isToday && " · today"}</span>
                        {h.closed ? <span className="text-muted">Closed</span> : <span className="font-mono text-[12px]">{h.open} — {h.close}</span>}
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 pt-4 border-t border-line space-y-1.5 text-[12px]">
                  <Row label="Deposit"><strong>{formatMnt(s.depositMnt)}</strong> / booking</Row>
                  <Row label="Max party"><strong>{s.maxPartySize}</strong> guests</Row>
                  <Row label="Booking window"><strong>{s.bookingWindow}</strong> days</Row>
                  <Row label="Blackouts"><strong>{s.blackoutDates.length}</strong> day(s)</Row>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted text-center">Preview updates as you type.</p>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
        <div className={clsx("bg-white dark:bg-[#14161b] border border-line rounded-full shadow-2xl flex items-center gap-3 px-3 py-2 transition-all",
          dirty ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
          <span className="text-[12px] font-semibold text-amber-600 pl-3 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Unsaved changes
          </span>
          <button onClick={() => load()} className="text-[12px] font-semibold text-muted hover:text-ink px-3 py-1.5">Discard</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 bg-accent text-white font-semibold px-4 py-2 rounded-full text-[13px] shadow-glow hover:bg-accent-soft transition disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save settings
          </button>
        </div>
      </div>

      <style jsx>{`
        :global(.input) { width: 100%; background: #fff; border: 1px solid #eceef1; border-radius: 8px; padding: 8px 10px; font-size: 13px; outline: none; }
        :global(.input:focus) { border-color: #FF6A1A; }
        :global(.dark .input) { background: #1e2128; border-color: #272b33; color: #f2f3f5; }
      `}</style>
    </div>
  );
}

function Card({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-5 md:p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-7 h-7 rounded-md bg-accent/10 text-accent grid place-items-center">{icon}</span>
        <div>
          <h3 className="font-semibold text-[15px]">{title}</h3>
          {subtitle && <p className="text-[12px] text-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span><div className="mt-1">{children}</div></label>;
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between"><span className="text-muted">{label}</span><span>{children}</span></div>;
}
