"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { getJson, sendJson } from "@/lib/fetcher";
import { DISHES } from "@/lib/data";
import { formatDishPrice } from "@/lib/payments";
import { toast } from "@/lib/toast";

export default function AdminMenu() {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getJson<Record<string, boolean>>("/api/admin/dishes");
    setOverrides(data ?? {});
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function toggle(dishId: string, available: boolean) {
    setBusy(dishId);
    const { ok, error } = await sendJson("/api/admin/dishes", "POST", { dishId, available });
    setBusy(null);
    if (!ok) { toast.error(error ?? "Failed"); return; }
    setOverrides((m) => ({ ...m, [dishId]: available }));
    toast.success(available ? "Marked available" : "Marked unavailable");
  }

  const isAvailable = (id: string) => overrides[id] ?? true;
  const categories = Array.from(new Set(DISHES.map((d) => d.category)));

  return (
    <div className="max-w-7xl space-y-5">
      <div>
        <h1 className="font-display text-[28px] md:text-[34px] font-bold">Menu</h1>
        <p className="text-muted text-[14px] mt-1">Toggle dish availability. Unavailable dishes are hidden from guests in real time.</p>
      </div>

      <div className="bg-amber-50 border border-amber-100 text-amber-800 text-[12px] rounded-xl p-3 flex items-start gap-2">
        <AlertCircle size={14} className="mt-0.5 flex-none" />
        <p>Adding new dishes / editing prices requires the menu DB migration — coming in v2. For now you can mark any existing dish out of stock.</p>
      </div>

      {loading ? (
        <div className="h-48 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
      ) : (
        <div className="space-y-7">
          {categories.map((cat) => (
            <section key={cat}>
              <h2 className="text-[11px] uppercase tracking-widest text-muted font-bold mb-3">{cat}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DISHES.filter((d) => d.category === cat).map((d) => {
                  const on = isAvailable(d.id);
                  return (
                    <div key={d.id}
                      className={clsx("bg-white dark:bg-[#14161b] border rounded-2xl overflow-hidden flex transition",
                        on ? "border-line" : "border-neutral-200 opacity-70")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={d.image} alt={d.name} className={clsx("w-24 h-24 object-cover flex-none", !on && "grayscale")} />
                      <div className="flex-1 p-3 flex flex-col">
                        <div className="font-semibold text-[14px] leading-tight">{d.name}</div>
                        <div className="text-[12px] text-accent font-bold mt-0.5">{formatDishPrice(d.price)}</div>
                        <button onClick={() => toggle(d.id, !on)} disabled={busy === d.id}
                          className={clsx("mt-auto self-start inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition",
                            on ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                            busy === d.id && "opacity-50")}>
                          {busy === d.id ? <Loader2 size={11} className="animate-spin" /> : on ? <Eye size={11} /> : <EyeOff size={11} />}
                          {on ? "Available" : "Hidden"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
