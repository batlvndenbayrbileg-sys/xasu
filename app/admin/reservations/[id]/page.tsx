"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ChevronLeft, Save, Trash2, Phone, Mail, MapPin, Users, Clock, CalendarDays } from "lucide-react";
import { getJson, sendJson } from "@/lib/fetcher";
import { formatMnt } from "@/lib/payments";
import { TABLES } from "@/lib/data";
import { toast } from "@/lib/toast";
import { StatusBadge, PaymentBadge } from "@/components/admin/badges";

const STATUSES = ["CONFIRMED", "ARRIVED", "COMPLETED", "CANCELLED", "NO_SHOW"];
const PAYMENTS = ["unpaid", "paid", "refunded", "failed"];
const TIMES = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

interface Res {
  id: string; tableId: string; zone: string; date: string; time: string;
  partySize: number; status: string; paymentStatus: string; amount: number;
  source: string; notes: string | null;
  createdAt: string; updatedAt: string;
  user: { id: string; name: string; email: string; createdAt: string } | null;
  guestName: string | null; guestPhone: string | null;
  paymentIntentId: string | null;
}

export default function AdminReservationDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [r, setR] = useState<Res | null>(null);
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    const { data } = await getJson<Res>(`/api/admin/reservations/${id}`);
    setR(data);
    if (data) setForm({
      tableId: data.tableId, partySize: data.partySize, date: data.date, time: data.time,
      status: data.status, paymentStatus: data.paymentStatus, notes: data.notes ?? "",
      guestName: data.guestName ?? "", guestPhone: data.guestPhone ?? "",
    });
    setDirty(false);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  if (!r || !form) return <div className="h-64 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;

  function update(k: string, v: any) { setForm({ ...form, [k]: v }); setDirty(true); }

  async function save() {
    setSaving(true);
    const tbl = TABLES.find((t) => t.id === form.tableId);
    if (tbl && form.partySize > tbl.seats) { toast.error("Exceeds capacity"); setSaving(false); return; }
    const { ok, error } = await sendJson(`/api/admin/reservations/${id}`, "PATCH" as any, form);
    setSaving(false);
    if (!ok) { toast.error(error ?? "Save failed"); return; }
    toast.success("Saved");
    load();
  }

  async function del() {
    if (!confirm("Permanently delete this reservation?")) return;
    const { ok } = await sendJson(`/api/admin/reservations/${id}`, "DELETE" as any);
    if (!ok) { toast.error("Delete failed"); return; }
    toast.success("Deleted");
    router.push("/admin/reservations");
  }

  const customerName = r.guestName ?? r.user?.name ?? "—";

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full border border-line bg-white grid place-items-center text-ink hover:border-accent transition">
          <ChevronLeft size={17} />
        </button>
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-widest text-muted font-semibold">Reservation · {r.id.slice(0, 8)}</p>
          <h1 className="font-display text-[24px] md:text-[28px] font-bold leading-tight">{customerName}</h1>
        </div>
        <StatusBadge status={r.status} />
        <PaymentBadge status={r.paymentStatus} amount={r.amount} />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
        {/* LEFT — edit panel */}
        <div className="space-y-5">
          <Card title="Booking details">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="input" />
              </Field>
              <Field label="Time">
                <select value={form.time} onChange={(e) => update("time", e.target.value)} className="input">
                  {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Table">
                <select value={form.tableId} onChange={(e) => update("tableId", e.target.value)} className="input">
                  {TABLES.map((t) => <option key={t.id} value={t.id}>{t.label} · {t.zone} · {t.seats} seats</option>)}
                </select>
              </Field>
              <Field label="Party size">
                <input type="number" min={1} value={form.partySize} onChange={(e) => update("partySize", parseInt(e.target.value) || 1)} className="input" />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => update("status", e.target.value)} className="input">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Payment">
                <select value={form.paymentStatus} onChange={(e) => update("paymentStatus", e.target.value)} className="input">
                  {PAYMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </Card>

          <Card title="Guest">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name">
                <input value={form.guestName} onChange={(e) => update("guestName", e.target.value)} className="input" placeholder={r.user?.name} />
              </Field>
              <Field label="Phone">
                <input value={form.guestPhone} onChange={(e) => update("guestPhone", e.target.value)} className="input" placeholder="—" />
              </Field>
            </div>
            {r.user && (
              <p className="text-[12px] text-muted mt-3 inline-flex items-center gap-1.5">
                <Mail size={12} /> {r.user.email} ·
                <Link href={`/admin/customers/${r.user.id}`} className="text-accent font-semibold">View customer profile →</Link>
              </p>
            )}
          </Card>

          <Card title="Notes">
            <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className="input min-h-[120px] resize-y"
              placeholder="Allergies, special requests, occasion notes…" />
          </Card>

          {/* Sticky action bar */}
          <div className="sticky bottom-0 -mx-4 md:mx-0 bg-white dark:bg-[#14161b] border-t border-line p-3 md:p-4 rounded-b-2xl md:rounded-2xl flex items-center justify-between gap-2">
            <button onClick={del} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition">
              <Trash2 size={14} /> Delete
            </button>
            <div className="flex items-center gap-2">
              {dirty && <span className="text-[12px] text-amber-600 font-semibold">Unsaved changes</span>}
              <button onClick={save} disabled={!dirty || saving}
                className="inline-flex items-center gap-1.5 bg-accent text-white font-semibold px-5 py-2.5 rounded-full shadow-glow hover:bg-accent-soft transition disabled:opacity-40">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save changes
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — meta / quick actions */}
        <div className="space-y-4">
          <Card title="At a glance">
            <ul className="space-y-2.5 text-[13px]">
              <Meta icon={<CalendarDays size={13} />} label="Date" value={`${r.date} · ${new Date(r.date).toLocaleDateString("en-US", { weekday: "long" })}`} />
              <Meta icon={<Clock size={13} />} label="Time" value={r.time} />
              <Meta icon={<MapPin size={13} />} label="Table" value={`${r.tableId} · ${r.zone}`} />
              <Meta icon={<Users size={13} />} label="Party" value={String(r.partySize)} />
              {r.guestPhone && <Meta icon={<Phone size={13} />} label="Phone" value={r.guestPhone} />}
              <Meta icon={null} label="Source" value={<span className="uppercase tracking-wider text-[11px] font-bold">{r.source}</span>} />
              <Meta icon={null} label="Deposit" value={formatMnt(r.amount)} />
              {r.paymentIntentId && <Meta icon={null} label="Payment ID" value={<code className="text-[11px]">{r.paymentIntentId.slice(0, 16)}…</code>} />}
            </ul>
          </Card>

          <Card title="Quick actions">
            <div className="space-y-2">
              {form.status === "CONFIRMED" && (
                <button onClick={() => { update("status", "ARRIVED"); }}
                  className="w-full text-left bg-emerald-50 text-emerald-700 font-semibold px-4 py-2.5 rounded-lg hover:bg-emerald-100 transition text-[13px]">
                  Mark as arrived (seated)
                </button>
              )}
              {form.status === "ARRIVED" && (
                <button onClick={() => { update("status", "COMPLETED"); }}
                  className="w-full text-left bg-violet-50 text-violet-700 font-semibold px-4 py-2.5 rounded-lg hover:bg-violet-100 transition text-[13px]">
                  Mark as completed
                </button>
              )}
              {form.status === "CONFIRMED" && (
                <button onClick={() => { update("status", "NO_SHOW"); }}
                  className="w-full text-left bg-red-50 text-red-600 font-semibold px-4 py-2.5 rounded-lg hover:bg-red-100 transition text-[13px]">
                  Mark as no-show
                </button>
              )}
              {form.paymentStatus === "paid" && (
                <button onClick={() => { update("paymentStatus", "refunded"); }}
                  className="w-full text-left bg-sky-50 text-sky-700 font-semibold px-4 py-2.5 rounded-lg hover:bg-sky-100 transition text-[13px]">
                  Mark deposit refunded
                </button>
              )}
              <p className="text-[11px] text-muted text-center pt-1">Click an action then press Save changes</p>
            </div>
          </Card>

          <Card title="Audit">
            <ul className="space-y-1.5 text-[11px] text-muted">
              <li>Created · {new Date(r.createdAt).toLocaleString()}</li>
              <li>Updated · {new Date(r.updatedAt).toLocaleString()}</li>
            </ul>
          </Card>
        </div>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: #fff;
          border: 1px solid #eceef1;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13.5px;
          outline: none;
        }
        :global(.input:focus) { border-color: #FF6A1A; }
        :global(.dark .input) { background: #1e2128; border-color: #272b33; color: #f2f3f5; }
      `}</style>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-5">
      <h3 className="text-[11px] uppercase tracking-widest font-bold text-muted mb-3">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</span><div className="mt-1.5">{children}</div></label>;
}
function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      {icon && <span className="w-7 h-7 rounded-md bg-neutral-50 grid place-items-center text-muted">{icon}</span>}
      <span className="text-[11px] uppercase tracking-wider text-muted font-semibold min-w-[60px]">{label}</span>
      <span className="flex-1 font-semibold text-right truncate">{value}</span>
    </li>
  );
}
