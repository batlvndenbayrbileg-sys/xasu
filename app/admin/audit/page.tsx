"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Shield, ChevronRight, ChevronDown, RefreshCw, Filter } from "lucide-react";
import clsx from "clsx";
import { getJson } from "@/lib/fetcher";

interface Entry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string | null;
  diff: { before: any; after: any };
  createdAt: string;
}

const ACTION_TINTS: Record<string, string> = {
  "reservation.update": "bg-sky-50 text-sky-700",
  "reservation.delete": "bg-red-50 text-red-600",
  "settings.update": "bg-violet-50 text-violet-700",
  "dish.toggle": "bg-amber-50 text-amber-700",
};

export default function AdminAudit() {
  const [rows, setRows] = useState<Entry[] | null>(null);
  const [entity, setEntity] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRows(null);
    const qs = new URLSearchParams();
    if (entity !== "all") qs.set("entity", entity);
    const { data } = await getJson<Entry[]>(`/api/admin/audit?${qs}`);
    setRows(data ?? []);
  }, [entity]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-[28px] md:text-[34px] font-bold inline-flex items-center gap-2">
            <Shield size={22} className="text-accent" /> Үйлдлийн лог
          </h1>
          <p className="text-muted text-[14px] mt-1">Бүх admin өөрчлөлтүүд өмнөх/дараах төлөвтэй хадгалагдана.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink transition">
          <RefreshCw size={13} /> Сэргээх
        </button>
      </div>

      {/* filters */}
      <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-3 flex items-center gap-2 flex-wrap">
        <Filter size={13} className="text-muted ml-1" />
        {[["all", "All"], ["reservation", "Reservations"], ["settings", "Settings"], ["dish", "Menu"]].map(([v, l]) => (
          <button key={v} onClick={() => setEntity(v)}
            className={clsx("px-3 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wide transition",
              entity === v ? "bg-ink text-white" : "bg-neutral-100 text-muted hover:text-ink")}>{l}</button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl overflow-hidden">
        {!rows ? (
          <div className="h-48 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
        ) : rows.length === 0 ? (
          <div className="h-48 grid place-items-center text-muted text-[13px]">No audit entries yet.</div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((r) => {
              const isOpen = openId === r.id;
              return (
                <li key={r.id}>
                  <button onClick={() => setOpenId(isOpen ? null : r.id)}
                    className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-50">
                    <div className="w-9 h-9 rounded-lg bg-accent text-white grid place-items-center font-bold text-[12px]">
                      {r.actorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{r.actorName}</span>
                        <span className={clsx("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded", ACTION_TINTS[r.action] ?? "bg-neutral-100 text-neutral-600")}>{r.action}</span>
                        {r.entityId && <span className="text-[11px] text-muted font-mono">#{r.entityId.slice(0, 8)}</span>}
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                    {isOpen ? <ChevronDown size={15} className="text-muted" /> : <ChevronRight size={15} className="text-muted" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 bg-neutral-50 dark:bg-neutral-50">
                      <Diff before={r.diff?.before} after={r.diff?.after} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Side-by-side diff: only show changed keys, highlight before red / after green. */
function Diff({ before, after }: { before: any; after: any }) {
  if (!before && !after) return <p className="text-[12px] text-muted">No data.</p>;
  if (before == null) return <pre className="text-[11px] bg-emerald-50 text-emerald-800 p-3 rounded-lg overflow-x-auto">+ Created\n{JSON.stringify(after, null, 2)}</pre>;
  if (after == null) return <pre className="text-[11px] bg-red-50 text-red-800 p-3 rounded-lg overflow-x-auto">- Deleted\n{JSON.stringify(before, null, 2)}</pre>;

  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  const changes = keys.filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
  if (changes.length === 0) return <p className="text-[12px] text-muted">No changes recorded.</p>;

  return (
    <div className="space-y-2">
      {changes.map((k) => (
        <div key={k} className="text-[12px]">
          <div className="font-mono font-bold text-ink mb-1">{k}</div>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="bg-red-50 border border-red-100 rounded p-2">
              <div className="text-[9px] font-bold uppercase tracking-widest text-red-700 mb-1">Before</div>
              <pre className="text-[11px] text-red-900 whitespace-pre-wrap break-all">{JSON.stringify(before[k], null, 2)}</pre>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded p-2">
              <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 mb-1">After</div>
              <pre className="text-[11px] text-emerald-900 whitespace-pre-wrap break-all">{JSON.stringify(after[k], null, 2)}</pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
