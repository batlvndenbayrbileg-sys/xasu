"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search, Users, Crown } from "lucide-react";
import clsx from "clsx";
import { getJson } from "@/lib/fetcher";
import { formatMnt } from "@/lib/payments";

interface Customer {
  kind: "user";
  id: string;
  name: string;
  email: string;
  phone: string | null;
  visits: number;
  spend: number;
  lastVisit: string | null;
  bookings: number;
  createdAt: string;
}

export default function AdminCustomers() {
  const [rows, setRows] = useState<Customer[] | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setRows(null);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const { data } = await getJson<Customer[]>(`/api/admin/customers?${params}`);
    setRows(data ?? []);
  }, [q]);

  useEffect(() => {
    const id = setTimeout(load, 220);
    return () => clearTimeout(id);
  }, [load]);

  const total = rows?.length ?? 0;
  const totalSpend = rows?.reduce((s, r) => s + r.spend, 0) ?? 0;
  const totalVisits = rows?.reduce((s, r) => s + r.visits, 0) ?? 0;
  const vipCount = rows?.filter((r) => r.visits >= 5).length ?? 0;

  return (
    <div className="max-w-7xl space-y-5">
      <div>
        <h1 className="font-display text-[28px] md:text-[34px] font-bold">Үйлчлүүлэгчид</h1>
        <p className="text-muted text-[14px] mt-1">Бүртгэлтэй зочид, орж ирэгсэд — захиалгын түүх, нийт зарцуулалт.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Нийт зочин" value={total} />
        <Kpi label="VIP (5+ удаа)" value={vipCount} accent />
        <Kpi label="Нийт ирэлт" value={totalVisits} />
        <Kpi label="Нийт зарцуулалт" value={formatMnt(totalSpend)} />
      </div>

      <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, phone…"
            className="w-full bg-neutral-50 dark:bg-neutral-50 border border-line rounded-lg h-10 pl-9 pr-3 text-[13px] outline-none focus:border-accent" />
        </div>
      </div>

      <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl overflow-hidden">
        {!rows ? (
          <div className="h-48 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
        ) : rows.length === 0 ? (
          <div className="h-48 grid place-items-center text-muted text-[13px]">No customers match.</div>
        ) : (
          <>
            <table className="hidden md:table w-full text-[13px]">
              <thead className="bg-neutral-50 dark:bg-neutral-50 text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <Th>Guest</Th>
                  <Th>Contact</Th>
                  <Th>Bookings</Th>
                  <Th>Visits</Th>
                  <Th>Lifetime spend</Th>
                  <Th>Last visit</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((c) => {
                  const isVip = c.visits >= 5;
                  return (
                    <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-50">
                      <Td>
                        <Link href={`/admin/customers/${encodeURIComponent(c.id)}`} className="flex items-center gap-2">
                          <div className={clsx("w-9 h-9 rounded-full grid place-items-center font-bold text-[13px]", isVip ? "bg-accent text-white" : "bg-neutral-200 text-neutral-700")}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold inline-flex items-center gap-1.5">
                              {c.name}
                              {isVip && <Crown size={12} className="text-accent" />}
                              {c.id.startsWith("walkin:") && <span className="text-[9px] font-bold uppercase tracking-widest bg-neutral-100 text-muted px-1.5 py-0.5 rounded">Walk-in</span>}
                            </div>
                          </div>
                        </Link>
                      </Td>
                      <Td>
                        <div>{c.email || "—"}</div>
                        {c.phone && <div className="text-[11px] text-muted">{c.phone}</div>}
                      </Td>
                      <Td>{c.bookings}</Td>
                      <Td><span className={clsx("font-semibold", c.visits > 0 && "text-emerald-700")}>{c.visits}</span></Td>
                      <Td><span className="font-semibold">{formatMnt(c.spend)}</span></Td>
                      <Td className="text-muted">{c.lastVisit ?? "—"}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <ul className="md:hidden divide-y divide-line">
              {rows.map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/customers/${encodeURIComponent(c.id)}`} className="p-4 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-50">
                    <div className={clsx("w-10 h-10 rounded-full grid place-items-center font-bold", c.visits >= 5 ? "bg-accent text-white" : "bg-neutral-200")}>{c.name.charAt(0).toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14px]">{c.name}</div>
                      <div className="text-[11px] text-muted truncate">{c.email || c.phone || "—"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-bold">{formatMnt(c.spend)}</div>
                      <div className="text-[10px] text-muted">{c.visits} visits</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={clsx("border rounded-2xl p-4", accent ? "bg-accent/10 border-accent/30" : "bg-white dark:bg-[#14161b] border-line")}>
      <div className="text-[11px] text-muted font-semibold">{label}</div>
      <div className={clsx("font-display text-[24px] font-bold mt-1.5 leading-none", accent && "text-accent")}>{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="px-4 py-3 text-left font-semibold">{children}</th>; }
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <td className={clsx("px-4 py-3 align-middle", className)}>{children}</td>; }
