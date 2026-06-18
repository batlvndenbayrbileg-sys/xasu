"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Eye, EyeOff, Plus, X, Save, Trash2, Edit3 } from "lucide-react";
import clsx from "clsx";
import { getJson, sendJson } from "@/lib/fetcher";
import { DISHES } from "@/lib/data";
import { formatDishPrice } from "@/lib/payments";
import { toast } from "@/lib/toast";

interface CustomDish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  calories: number;
  prepMinutes: number;
  rating: number;
  available: boolean;
}

const CATEGORIES = ["Specials", "Seasonal", "Appetizers", "Main", "Desserts", "Drinks", "Snacks"];
const CAT_MN: Record<string, string> = {
  Specials: "Онцлох",
  Seasonal: "Улирлын",
  Appetizers: "Зууш",
  Main: "Үндсэн хоол",
  Drinks: "Ундаа",
  Snacks: "Зууш ундаа",
  Desserts: "Амттан",
};

export default function AdminMenu() {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [customs, setCustoms] = useState<CustomDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<CustomDish | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: ov }, { data: cd }] = await Promise.all([
      getJson<Record<string, boolean>>("/api/admin/dishes"),
      getJson<CustomDish[]>("/api/admin/custom-dishes"),
    ]);
    setOverrides(ov ?? {});
    setCustoms(cd ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function toggleStatic(dishId: string, available: boolean) {
    setBusy(dishId);
    const { ok, error } = await sendJson("/api/admin/dishes", "POST", { dishId, available });
    setBusy(null);
    if (!ok) { toast.error(error ?? "Алдаа гарлаа"); return; }
    setOverrides((m) => ({ ...m, [dishId]: available }));
    toast.success(available ? "Идэвхтэй болголоо" : "Нуулаа");
  }

  async function deleteCustom(id: string) {
    if (!confirm("Энэ хоолыг устгах уу?")) return;
    setBusy(id);
    const { ok } = await sendJson(`/api/admin/custom-dishes/${id}`, "DELETE" as any);
    setBusy(null);
    if (!ok) { toast.error("Устгаж чадсангүй"); return; }
    setCustoms((c) => c.filter((x) => x.id !== id));
    toast.success("Устгалаа");
  }

  async function toggleCustomAvailable(id: string, available: boolean) {
    setBusy(id);
    const { ok } = await sendJson(`/api/admin/custom-dishes/${id}`, "PATCH" as any, { available });
    setBusy(null);
    if (!ok) { toast.error("Алдаа гарлаа"); return; }
    setCustoms((c) => c.map((x) => x.id === id ? { ...x, available } : x));
  }

  const isAvailable = (id: string) => overrides[id] ?? true;
  const categories = Array.from(new Set([...DISHES.map((d) => d.category), ...customs.map((c) => c.category)]));

  return (
    <div className="max-w-7xl space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-[28px] md:text-[34px] font-bold">Цэс</h1>
          <p className="text-muted text-[14px] mt-1">Хоолоо нэмэх, устгах, нуух. Өөрчлөлт шууд зочдод харагдана.</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 bg-accent text-white font-semibold px-4 py-2 rounded-full shadow-glow text-[13px]">
          <Plus size={14} /> Шинэ хоол нэмэх
        </button>
      </div>

      {loading ? (
        <div className="h-48 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
      ) : (
        <div className="space-y-7">
          {categories.map((cat) => {
            const staticOnes = DISHES.filter((d) => d.category === cat);
            const customOnes = customs.filter((c) => c.category === cat);
            if (staticOnes.length + customOnes.length === 0) return null;
            return (
              <section key={cat}>
                <h2 className="text-[11px] uppercase tracking-widest text-muted font-bold mb-3">
                  {CAT_MN[cat] ?? cat} <span className="text-muted/60">· {staticOnes.length + customOnes.length}</span>
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {staticOnes.map((d) => {
                    const on = isAvailable(d.id);
                    return (
                      <div key={d.id}
                        className={clsx("bg-white border rounded-2xl overflow-hidden flex transition", on ? "border-line" : "border-neutral-200 opacity-70")}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={d.image} alt={d.name} className={clsx("w-24 h-24 object-cover flex-none", !on && "grayscale")} />
                        <div className="flex-1 p-3 flex flex-col">
                          <div className="font-semibold text-[14px] leading-tight">{d.name}</div>
                          <div className="text-[12px] text-accent font-bold mt-0.5">{formatDishPrice(d.price)}</div>
                          <button onClick={() => toggleStatic(d.id, !on)} disabled={busy === d.id}
                            className={clsx("mt-auto self-start inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition",
                              on ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                              busy === d.id && "opacity-50")}>
                            {busy === d.id ? <Loader2 size={11} className="animate-spin" /> : on ? <Eye size={11} /> : <EyeOff size={11} />}
                            {on ? "Идэвхтэй" : "Нуусан"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {customOnes.map((d) => (
                    <div key={d.id}
                      className={clsx("bg-white border rounded-2xl overflow-hidden flex transition relative", d.available ? "border-accent/30" : "border-neutral-200 opacity-70")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={d.image} alt={d.name} className={clsx("w-24 h-24 object-cover flex-none", !d.available && "grayscale")} />
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider bg-accent text-white px-1.5 py-0.5 rounded">Шинэ</span>
                      <div className="flex-1 p-3 flex flex-col">
                        <div className="font-semibold text-[14px] leading-tight">{d.name}</div>
                        <div className="text-[12px] text-accent font-bold mt-0.5">{formatDishPrice(d.price)}</div>
                        <div className="mt-auto flex items-center gap-1">
                          <button onClick={() => toggleCustomAvailable(d.id, !d.available)} disabled={busy === d.id}
                            className={clsx("inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md transition",
                              d.available ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600")}>
                            {d.available ? <Eye size={11} /> : <EyeOff size={11} />}
                          </button>
                          <button onClick={() => setEditing(d)} className="text-neutral-500 hover:text-accent p-1"><Edit3 size={13} /></button>
                          <button onClick={() => deleteCustom(d.id)} disabled={busy === d.id} className="text-neutral-500 hover:text-red-500 p-1"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {(editing || creating) && (
        <DishEditor
          dish={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); load(); }}
        />
      )}
    </div>
  );
}

function DishEditor({ dish, onClose, onSaved }: { dish: CustomDish | null; onClose: () => void; onSaved: () => void }) {
  const isNew = !dish;
  const [form, setForm] = useState({
    name: dish?.name ?? "",
    description: dish?.description ?? "",
    price: dish?.price ?? 10,
    category: dish?.category ?? "Main",
    image: dish?.image ?? "",
    calories: dish?.calories ?? 0,
    prepMinutes: dish?.prepMinutes ?? 10,
    rating: dish?.rating ?? 4.7,
  });
  const [busy, setBusy] = useState(false);

  function update(k: string, v: any) { setForm({ ...form, [k]: v }); }

  async function save() {
    if (!form.name.trim()) { toast.error("Нэр шаардлагатай"); return; }
    if (!form.price || form.price <= 0) { toast.error("Үнэ зөв оруулна уу"); return; }
    setBusy(true);
    if (isNew) {
      const { ok } = await sendJson("/api/admin/custom-dishes", "POST", form);
      setBusy(false);
      if (!ok) { toast.error("Үүсгэж чадсангүй"); return; }
      toast.success("Нэмэгдлээ");
    } else {
      const { ok } = await sendJson(`/api/admin/custom-dishes/${dish!.id}`, "PATCH" as any, form);
      setBusy(false);
      if (!ok) { toast.error("Хадгалж чадсангүй"); return; }
      toast.success("Шинэчиллээ");
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/55 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[20px] font-bold">{isNew ? "Шинэ хоол" : "Хоол засах"}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field label="Нэр *"><input value={form.name} onChange={(e) => update("name", e.target.value)} className="dish-input" placeholder="Жишээ: Tom Yum шөл" /></Field></div>
          <div className="col-span-2"><Field label="Тайлбар"><textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="dish-input" rows={3} placeholder="Найрлага, амтны тайлбар…" /></Field></div>
          <Field label="Үнэ ($ нэгжээр) *"><input type="number" min={1} step={1} value={form.price} onChange={(e) => update("price", parseFloat(e.target.value) || 0)} className="dish-input" /></Field>
          <Field label="Ангилал">
            <select value={form.category} onChange={(e) => update("category", e.target.value)} className="dish-input">
              {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_MN[c] ?? c}</option>)}
            </select>
          </Field>
          <Field label="Илчлэг (ккал)"><input type="number" min={0} value={form.calories} onChange={(e) => update("calories", parseInt(e.target.value) || 0)} className="dish-input" /></Field>
          <Field label="Бэлтгэх (мин)"><input type="number" min={1} value={form.prepMinutes} onChange={(e) => update("prepMinutes", parseInt(e.target.value) || 1)} className="dish-input" /></Field>
          <div className="col-span-2"><Field label="Зургийн URL"><input value={form.image} onChange={(e) => update("image", e.target.value)} className="dish-input" placeholder="https://images.unsplash.com/…" /></Field></div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-line text-[13px] font-semibold">Болих</button>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 bg-accent text-white px-5 py-2 rounded-lg font-semibold text-[13px] shadow-glow disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {isNew ? "Нэмэх" : "Хадгалах"}
          </button>
        </div>
      </div>

      <style jsx>{`
        :global(.dish-input) { width: 100%; background: #fff; border: 1px solid #eceef1; border-radius: 8px; padding: 8px 10px; font-size: 13px; outline: none; }
        :global(.dish-input:focus) { border-color: #FF6A1A; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span><div className="mt-1">{children}</div></label>;
}
