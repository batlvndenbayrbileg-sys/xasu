"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search, RefreshCw, X, ChevronDown, Plus } from "lucide-react";
import clsx from "clsx";
import { getJson, sendJson } from "@/lib/fetcher";
import { formatMnt } from "@/lib/payments";
import { StatusBadge, PaymentBadge } from "@/components/admin/badges";
import { toast } from "@/lib/toast";

interface Row {
  id: string; tableId: string; zone: string;
  date: string; time: string; partySize: number;
  status: string; paymentStatus: string; amount: number;
  source?: string;
  createdAt: string;
  user: { name: string; email: string } | null;
  guestName?: string | null; guestPhone?: string | null;
}

const STATUSES = ["CONFIRMED", "ARRIVED", "COMPLETED", "CANCELLED", "NO_SHOW"];
const PAYMENTS = ["unpaid", "paid", "refunded", "failed"];

export default function AdminReservations() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const [date, setDate] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ status, payment });
    if (date) qs.set("date", date);
    if (q) qs.set("q", q);
    const { data } = await getJson<Row[]>(`/api/admin/reservations?${qs}`);
    setRows(data ?? []);
    setLoading(false);
  }, [status, payment, date, q]);

  useEffect(() => { load(); }, [load]);

  async function patch(id: string, body: Partial<{ status: string; paymentStatus: string }>) {
    const { ok, error } = await sendJson(`/api/admin/reservations/${id}`, "PATCH" as any, body);
    if (!ok) { toast.error(error ?? "Failed"); return; }
    toast.success("Updated");
    load();
  }

  return (
    <div className="max-w-7xl space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-[28px] md:text-[34px] font-bold">Reservations</h1>
          <p className="text-muted text-[14px] mt-1">All bookings, filterable. Click a status pill to update.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink transition">
            <RefreshCw size={13} /> Refresh
          </button>
          <Link href="/admin/reservations/new"
            className="inline-flex items-center gap-1.5 bg-accent text-white font-semibold px-4 py-2 rounded-full shadow-glow hover:bg-accent-soft transition text-[13px]">
            <Plus size={14} /> New booking
          </Link>
        </div>
      </div>

      {/* filters */}
      <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-3 md:p-4 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by table, name or email…"
            className="w-full bg-neutral-50 dark:bg-neutral-50 border border-line rounded-lg h-10 pl-9 pr-3 text-[13px] outline-none focus:border-accent" />
        </div>
        <Select value={status} onChange={setStatus} options={[{ v: "all", l: "All statuses" }, ...STATUSES.map((s) => ({ v: s, l: s }))]} />
        <Select value={payment} onChange={setPayment} options={[{ v: "all", l: "All payments" }, ...PAYMENTS.map((s) => ({ v: s, l: s }))]} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="bg-neutral-50 dark:bg-neutral-50 border border-line rounded-lg h-10 px-3 text-[13px] outline-none focus:border-accent" />
        {date && <button onClick={() => setDate("")} className="text-muted hover:text-ink"><X size={14} /></button>}
      </div>

      {/* table / list */}
      <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl overflow-hidden">
        {loading || !rows ? (
          <div className="h-48 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
        ) : rows.length === 0 ? (
          <div className="h-48 grid place-items-center text-muted text-[13px]">No reservations match.</div>
        ) : (
          <>
            {/* desktop table */}
            <table className="hidden md:table w-full text-[13px]">
              <thead className="bg-neutral-50 dark:bg-neutral-50 text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <Th>Guest</Th>
                  <Th>Table</Th>
                  <Th>Date / Time</Th>
                  <Th>Party</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-50">
                    <Td>
                      <Link href={`/admin/reservations/${r.id}`} className="block">
                        <div className="font-semibold inline-flex items-center gap-2">
                          {r.guestName ?? r.user?.name ?? "—"}
                          {!r.user && <span className="text-[9px] font-bold uppercase tracking-widest bg-neutral-100 text-muted px-1.5 py-0.5 rounded">Walk-in</span>}
                        </div>
                        <div className="text-[11px] text-muted">{r.user?.email ?? r.guestPhone ?? ""}</div>
                      </Link>
                    </Td>
                    <Td>
                      <span className="font-mono text-[12px]">{r.tableId}</span>
                      <div className="text-[11px] text-muted">{r.zone}</div>
                    </Td>
                    <Td>
                      <div>{r.date}</div>
                      <div className="text-[11px] text-muted">{r.time}</div>
                    </Td>
                    <Td>{r.partySize}</Td>
                    <Td><StatusSelect current={r.status} onPick={(s) => patch(r.id, { status: s })} /></Td>
                    <Td><PaymentSelect current={r.paymentStatus} amount={r.amount} onPick={(s) => patch(r.id, { paymentStatus: s })} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* mobile cards */}
            <ul className="md:hidden divide-y divide-line">
              {rows.map((r) => (
                <li key={r.id} className="p-4 space-y-2">
                  <Link href={`/admin/reservations/${r.id}`} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-ink text-white grid place-items-center font-bold text-[13px] flex-none">{r.partySize}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14px] truncate">{r.guestName ?? r.user?.name ?? "—"}</div>
                      <div className="text-[11px] text-muted truncate">{r.user?.email ?? r.guestPhone}</div>
                    </div>
                  </Link>
                  <div className="text-[12px] text-muted">{r.tableId} · {r.zone} · {r.date} · {r.time}</div>
                  <div className="flex gap-2">
                    <StatusSelect current={r.status} onPick={(s) => patch(r.id, { status: s })} />
                    <PaymentSelect current={r.paymentStatus} amount={r.amount} onPick={(s) => patch(r.id, { paymentStatus: s })} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left font-semibold">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-neutral-50 dark:bg-neutral-50 border border-line rounded-lg h-10 pl-3 pr-8 text-[13px] outline-none focus:border-accent">
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
    </div>
  );
}

const STATUS_TINTS: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  ARRIVED: "bg-sky-50 text-sky-700 border-sky-100",
  COMPLETED: "bg-violet-50 text-violet-700 border-violet-100",
  CANCELLED: "bg-neutral-100 text-neutral-500 border-neutral-200",
  NO_SHOW: "bg-red-50 text-red-600 border-red-100",
};
const PAYMENT_TINTS: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
  unpaid: "bg-amber-50 text-amber-700 border-amber-100",
  refunded: "bg-sky-50 text-sky-700 border-sky-100",
  failed: "bg-red-50 text-red-600 border-red-100",
};

function StatusSelect({ current, onPick }: { current: string; onPick: (s: string) => void }) {
  return (
    <select value={current} onChange={(e) => onPick(e.target.value)}
      className={clsx("text-[10px] uppercase tracking-wider font-bold border rounded-md px-2 py-1 cursor-pointer outline-none focus:ring-2 focus:ring-accent/40", STATUS_TINTS[current] ?? "bg-neutral-100")}>
      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

function PaymentSelect({ current, amount, onPick }: { current: string; amount: number; onPick: (s: string) => void }) {
  return (
    <select value={current} onChange={(e) => onPick(e.target.value)}
      className={clsx("text-[10px] uppercase tracking-wider font-bold border rounded-md px-2 py-1 cursor-pointer outline-none focus:ring-2 focus:ring-accent/40", PAYMENT_TINTS[current] ?? "bg-neutral-100")}>
      {PAYMENTS.map((s) => <option key={s} value={s}>{s === "paid" ? `Paid · ${formatMnt(amount)}` : s}</option>)}
    </select>
  );
}
