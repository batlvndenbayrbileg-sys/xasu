"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, CreditCard, Trash2 } from "lucide-react";
import clsx from "clsx";
import { getJson, sendJson } from "@/lib/fetcher";
import { formatMnt } from "@/lib/payments";
import { PaymentBadge } from "@/components/admin/badges";
import { toast } from "@/lib/toast";

interface Row {
  id: string; tableId: string; zone: string; date: string; time: string;
  partySize: number; status: string; paymentStatus: string; amount: number;
  user: { name: string; email: string } | null;
}

export default function AdminPayments() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [tab, setTab] = useState<"paid" | "unpaid" | "all">("paid");

  const load = useCallback(async () => {
    setRows(null);
    const qs = new URLSearchParams({ payment: tab });
    const { data } = await getJson<Row[]>(`/api/admin/reservations?${qs}`);
    setRows(data ?? []);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  async function runCleanup() {
    if (!confirm("Хадгалалтын бодлогын дагуу хуучин захиалгуудыг устгах уу? (төлөгдөөгүй 7+ хоног, төлсөн 1 жил+)")) return;
    const { ok, data, error } = await sendJson<any>("/api/admin/cleanup", "POST");
    if (!ok) { toast.error(error ?? "Алдаа гарлаа"); return; }
    toast.success(`Цэвэрлэлээ — Төлөгдөөгүй: ${data.deletedUnpaid}, Төлсөн (хуучин): ${data.deletedPaid}`);
    load();
  }

  const totalPaid = rows?.filter((r) => r.paymentStatus === "paid").reduce((s, r) => s + r.amount, 0) ?? 0;
  const totalUnpaid = rows?.filter((r) => r.paymentStatus === "unpaid").reduce((s, r) => s + r.amount, 0) ?? 0;

  return (
    <div className="max-w-7xl space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-[28px] md:text-[34px] font-bold">Төлбөр</h1>
          <p className="text-muted text-[14px] mt-1">Wire Payment · QPay-ээр хийгдсэн гүйлгээ.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={runCleanup} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full transition">
            <Trash2 size={13} /> Цэвэрлэх (төлөгдөөгүй 7+ хоног, төлсөн 1 жил+)
          </button>
          <button onClick={load} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink transition">
            <RefreshCw size={13} /> Сэргээх
          </button>
        </div>
      </div>

      <div className="bg-sky-50 border border-sky-100 text-sky-900 text-[12px] rounded-xl p-3">
        <strong>Хадгалалтын бодлого:</strong> Төлөгдөөгүй захиалга 7 хоногийн дараа автоматаар устгагдана. Төлсөн захиалга 1 жил хадгалагдана. Цэвэрлэлт өдөр бүр 03:00-д ажиллана.
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Kpi label="Цуглуулсан (харагдаж буй)" value={formatMnt(totalPaid)} tint="emerald" />
        <Kpi label="Төлөгдөөгүй үлдэгдэл" value={formatMnt(totalUnpaid)} tint="amber" />
        <Kpi label="Гүйлгээний тоо" value={rows?.length ?? 0} tint="sky" />
      </div>

      {/* tabs */}
      <div className="flex gap-1 bg-white dark:bg-[#14161b] border border-line rounded-full p-1 w-fit">
        {(["paid", "unpaid", "all"] as const).map((t) => {
          const lbl = t === "paid" ? "Төлсөн" : t === "unpaid" ? "Төлөгдөөгүй" : "Бүгд";
          return (
            <button key={t} onClick={() => setTab(t)}
              className={clsx("px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wide transition",
                tab === t ? "bg-accent text-white" : "text-muted")}>{lbl}</button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl overflow-hidden">
        {!rows ? (
          <div className="h-48 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
        ) : rows.length === 0 ? (
          <div className="h-48 grid place-items-center text-muted text-[13px]">Энэ шүүлтэд тохирох гүйлгээ алга.</div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.id} className="px-4 py-3 flex items-center gap-3">
                <div className={clsx("w-10 h-10 rounded-xl grid place-items-center", r.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                  <CreditCard size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold truncate">{r.user?.name ?? "—"}</div>
                  <div className="text-[11px] text-muted truncate">{r.user?.email} · {r.tableId} · {r.date} {r.time}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-[16px] font-bold">{formatMnt(r.amount)}</div>
                  <PaymentBadge status={r.paymentStatus} amount={r.amount} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, tint }: { label: string; value: number | string; tint: string }) {
  const tints: Record<string, string> = {
    emerald: "from-emerald-50 to-white text-emerald-700",
    amber: "from-amber-50 to-white text-amber-700",
    sky: "from-sky-50 to-white text-sky-700",
  };
  return (
    <div className={clsx("bg-gradient-to-br border border-line rounded-2xl p-4 md:p-5", tints[tint])}>
      <div className="text-[12px] font-semibold">{label}</div>
      <div className="font-display text-[24px] md:text-[28px] font-bold mt-1 leading-none text-ink">{value}</div>
    </div>
  );
}
