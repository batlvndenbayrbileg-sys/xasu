"use client";

import { useEffect, useState } from "react";
import { Loader2, UtensilsCrossed, Clock, CheckCheck, XCircle, Soup, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { getJson, sendJson } from "@/lib/fetcher";
import { formatMnt } from "@/lib/payments";
import { toast } from "@/lib/toast";

interface OrderItem { id: string; name: string; qty: number; unit: number; }
interface Order {
  id: string; tableId: string; items: OrderItem[];
  subtotal: number; serviceFee: number; amount: number;
  status: string; paymentStatus: string; source: string; note: string | null; createdAt: string;
}

const STATUS_FLOW = ["new", "preparing", "served", "completed"] as const;
const STATUS_MN: Record<string, string> = {
  new: "Шинэ", preparing: "Бэлтгэж байна", served: "Гарсан", completed: "Дууссан", cancelled: "Цуцлагдсан",
};
const STATUS_TINT: Record<string, string> = {
  new: "bg-amber-50 text-amber-700 border-amber-200",
  preparing: "bg-sky-50 text-sky-700 border-sky-200",
  served: "bg-violet-50 text-violet-700 border-violet-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-neutral-100 text-neutral-500 border-line",
};

const FILTERS = [
  { key: "", label: "Бүгд" },
  { key: "new", label: "Шинэ" },
  { key: "preparing", label: "Бэлтгэж буй" },
  { key: "served", label: "Гарсан" },
  { key: "completed", label: "Дууссан" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = (status: string) => {
    setOrders(null);
    getJson<Order[]>(`/api/admin/orders${status ? `?status=${status}` : ""}`).then(({ data }) => setOrders(data ?? []));
  };
  useEffect(() => { load(filter); }, [filter]);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    const { ok, error } = await sendJson("/api/admin/orders", "PATCH" as any, { id, status });
    setBusy(null);
    if (!ok) { toast.error(error ?? "Алдаа"); return; }
    toast.success(`Төлөв: ${STATUS_MN[status]}`);
    load(filter);
  }

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-[28px] md:text-[34px] font-bold">Хоолны захиалга</h1>
          <p className="text-muted text-[14px] mt-1">QR ширээ болон онлайнаар ирсэн хоолны захиалгууд.</p>
        </div>
        <button onClick={() => load(filter)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold bg-white border border-line px-3.5 py-2 rounded-full hover:border-accent transition">
          <RefreshCw size={14} /> Шинэчлэх
        </button>
      </div>

      <div className="flex gap-1 bg-neutral-100 rounded-full p-1 w-fit">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={clsx("px-4 py-1.5 rounded-full text-[12.5px] font-bold transition",
              filter === f.key ? "bg-accent text-white shadow-glow" : "text-muted hover:text-ink")}>
            {f.label}
          </button>
        ))}
      </div>

      {!orders ? (
        <div className="h-64 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl py-20 text-center">
          <Soup className="mx-auto text-neutral-300" size={40} />
          <p className="text-muted mt-3 text-[14px]">Захиалга алга.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((o) => {
            const next = STATUS_FLOW[STATUS_FLOW.indexOf(o.status as any) + 1];
            return (
              <div key={o.id} className="bg-white border border-line rounded-2xl p-4 md:p-5 flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-ink text-white grid place-items-center font-bold text-[13px]">{o.tableId}</span>
                    <div>
                      <div className="text-[12px] font-bold uppercase tracking-wide">{o.source === "qr" ? "QR ширээ" : "Онлайн"}</div>
                      <div className="text-[11px] text-muted">{new Date(o.createdAt).toLocaleString("mn-MN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                  <span className={clsx("text-[11px] font-bold px-2.5 py-1 rounded-full border", STATUS_TINT[o.status])}>{STATUS_MN[o.status] ?? o.status}</span>
                </div>

                <ul className="mt-3 space-y-1.5 flex-1">
                  {(o.items ?? []).map((it, i) => (
                    <li key={i} className="flex items-center justify-between text-[13px]">
                      <span><span className="font-bold text-accent">{it.qty}×</span> {it.name}</span>
                      <span className="text-muted">{formatMnt(it.unit * it.qty)}</span>
                    </li>
                  ))}
                </ul>

                {o.note && <p className="mt-2 text-[12px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">📝 {o.note}</p>}

                <div className="mt-3 pt-3 border-t border-line flex items-center justify-between">
                  <div>
                    <div className="font-display text-[18px] font-bold">{formatMnt(o.amount)}</div>
                    <span className={clsx("text-[11px] font-bold", o.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600")}>
                      {o.paymentStatus === "paid" ? "✓ Төлсөн" : "Төлөгдөөгүй"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {o.status !== "cancelled" && o.status !== "completed" && (
                      <button onClick={() => setStatus(o.id, "cancelled")} disabled={busy === o.id}
                        className="w-9 h-9 rounded-xl border border-line grid place-items-center text-muted hover:text-red-500 hover:border-red-200 transition" aria-label="Цуцлах">
                        <XCircle size={16} />
                      </button>
                    )}
                    {next && (
                      <button onClick={() => setStatus(o.id, next)} disabled={busy === o.id}
                        className="inline-flex items-center gap-1.5 bg-accent text-white text-[12.5px] font-bold px-3.5 py-2 rounded-xl hover:bg-accent-soft transition disabled:opacity-60">
                        {busy === o.id ? <Loader2 size={14} className="animate-spin" /> : next === "preparing" ? <Clock size={14} /> : next === "served" ? <UtensilsCrossed size={14} /> : <CheckCheck size={14} />}
                        {STATUS_MN[next]}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
