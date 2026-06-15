"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Mail, Phone, Crown, Calendar } from "lucide-react";
import clsx from "clsx";
import { getJson } from "@/lib/fetcher";
import { formatMnt } from "@/lib/payments";
import { StatusBadge, PaymentBadge } from "@/components/admin/badges";

interface Customer {
  kind: "user" | "walkin";
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  reservations: any[];
}

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [c, setC] = useState<Customer | null>(null);

  const load = useCallback(async () => {
    const { data } = await getJson<Customer>(`/api/admin/customers/${encodeURIComponent(id)}`);
    setC(data);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  if (!c) return <div className="h-64 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;

  const visits = c.reservations.filter((r) => r.status === "COMPLETED" || r.status === "ARRIVED").length;
  const spend = c.reservations.filter((r) => r.paymentStatus === "paid").reduce((s, r) => s + r.amount, 0);
  const noShows = c.reservations.filter((r) => r.status === "NO_SHOW").length;
  const avgParty = c.reservations.length ? Math.round(c.reservations.reduce((s, r) => s + r.partySize, 0) / c.reservations.length) : 0;
  const isVip = visits >= 5;

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full border border-line bg-white grid place-items-center text-ink hover:border-accent transition">
          <ChevronLeft size={17} />
        </button>
        <p className="text-[11px] uppercase tracking-widest text-muted font-semibold">Customer</p>
      </div>

      {/* Profile card */}
      <div className="bg-white dark:bg-[#14161b] border border-line rounded-3xl p-6 md:p-7 flex items-center gap-5">
        <div className={clsx("w-20 h-20 rounded-full grid place-items-center font-bold text-[28px] shrink-0", isVip ? "bg-accent text-white shadow-glow" : "bg-neutral-200 text-neutral-700")}>
          {c.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[28px] md:text-[32px] font-bold leading-tight flex items-center gap-2.5">
            {c.name}
            {isVip && <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded"><Crown size={12} /> VIP</span>}
            {c.kind === "walkin" && <span className="text-[10px] font-bold uppercase tracking-widest bg-neutral-100 text-muted px-2 py-1 rounded">Walk-in</span>}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
            {c.email && <span className="inline-flex items-center gap-1.5"><Mail size={13} /> {c.email}</span>}
            {c.phone && <span className="inline-flex items-center gap-1.5"><Phone size={13} /> {c.phone}</span>}
            <span className="inline-flex items-center gap-1.5"><Calendar size={13} /> Since {new Date(c.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Lifetime spend" value={formatMnt(spend)} tint="amber" />
        <Stat label="Visits" value={visits} tint="emerald" />
        <Stat label="Total bookings" value={c.reservations.length} tint="sky" />
        <Stat label="No-shows" value={noShows} tint={noShows > 0 ? "red" : "neutral"} />
      </div>

      {/* Reservation history */}
      <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl overflow-hidden">
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-muted px-5 pt-5">Reservation history · {c.reservations.length}</h3>
        {c.reservations.length === 0 ? (
          <div className="h-40 grid place-items-center text-muted text-[13px]">No reservations yet.</div>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {c.reservations.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/reservations/${r.id}`} className="px-5 py-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-50">
                  <div className="w-9 h-9 rounded-lg bg-ink text-white grid place-items-center font-bold text-[12px]">{r.partySize}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13.5px]">{r.tableId} · {r.zone}</div>
                    <div className="text-[11px] text-muted">{r.date} · {r.time}</div>
                  </div>
                  <StatusBadge status={r.status} />
                  <PaymentBadge status={r.paymentStatus} amount={r.amount} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Avg party size note */}
      {avgParty > 0 && (
        <div className="text-[12px] text-muted">Average party size: <strong className="text-ink">{avgParty}</strong></div>
      )}
    </div>
  );
}

function Stat({ label, value, tint }: { label: string; value: number | string; tint: string }) {
  const tints: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-600",
    neutral: "bg-neutral-100 text-neutral-600",
  };
  return (
    <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-4">
      <span className={clsx("inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded", tints[tint])}>{label}</span>
      <div className="font-display text-[24px] font-bold mt-1.5 leading-none">{value}</div>
    </div>
  );
}
