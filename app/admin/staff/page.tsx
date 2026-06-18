"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, X, UserPlus, Shield, ChevronDown, Trash2, Crown } from "lucide-react";
import clsx from "clsx";
import { getJson, sendJson } from "@/lib/fetcher";
import { toast } from "@/lib/toast";

interface Staff { id: string; name: string; email: string; role: string; createdAt?: string }

const ROLES = ["ADMIN", "MANAGER", "SERVER", "HOST"] as const;
const ROLE_DESC: Record<string, string> = {
  ADMIN: "Full access — settings, staff, audit, refunds",
  MANAGER: "Operations — reservations, tables, menu, payments, reports",
  SERVER: "Today view, update reservation status, view customers",
  HOST: "Today view, create/edit reservations, customers",
};
const ROLE_TINT: Record<string, string> = {
  ADMIN: "bg-accent/10 text-accent",
  MANAGER: "bg-sky-50 text-sky-700",
  SERVER: "bg-emerald-50 text-emerald-700",
  HOST: "bg-violet-50 text-violet-700",
};

export default function AdminStaff() {
  const [rows, setRows] = useState<Staff[] | null>(null);
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
    const { data } = await getJson<Staff[]>("/api/admin/staff");
    setRows(data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function changeRole(id: string, role: string) {
    const { ok, error } = await sendJson(`/api/admin/staff/${id}`, "PATCH" as any, { role });
    if (!ok) { toast.error(error === "cannot_demote_self" ? "You can't demote yourself" : error ?? "Failed"); return; }
    toast.success(`Role → ${role}`);
    load();
  }

  async function revoke(id: string) {
    if (!confirm("Revoke staff access? They become a regular customer.")) return;
    const { ok, error } = await sendJson(`/api/admin/staff/${id}`, "DELETE" as any);
    if (!ok) { toast.error(error ?? "Failed"); return; }
    toast.success("Access revoked");
    load();
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-[28px] md:text-[34px] font-bold inline-flex items-center gap-2">
            <Shield size={22} className="text-accent" /> Ажилчид (системийн)
          </h1>
          <p className="text-muted text-[14px] mt-1">Системд нэвтрэх эрхтэй ажилчдыг урих. Зөвхөн ADMIN энэ хуудсыг харна.</p>
        </div>
        <button onClick={() => setInviting(true)}
          className="inline-flex items-center gap-1.5 bg-accent text-white font-semibold px-4 py-2 rounded-full shadow-glow text-[13px]">
          <UserPlus size={14} /> Урих
        </button>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ROLES.map((r) => (
          <div key={r} className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-4">
            <span className={clsx("inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded", ROLE_TINT[r])}>
              {r === "ADMIN" && <Crown size={10} />} {r}
            </span>
            <p className="text-[12px] text-muted mt-2 leading-snug">{ROLE_DESC[r]}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl overflow-hidden">
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-muted px-5 pt-5">Team · {rows?.length ?? 0}</h3>
        {!rows ? (
          <div className="h-32 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
        ) : rows.length === 0 ? (
          <div className="h-32 grid place-items-center text-muted text-[13px]">No staff yet.</div>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {rows.map((u) => (
              <li key={u.id} className="px-5 py-3 flex items-center gap-3">
                <div className={clsx("w-10 h-10 rounded-full grid place-items-center font-bold text-[14px]", ROLE_TINT[u.role])}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px]">{u.name}</div>
                  <div className="text-[11px] text-muted">{u.email}</div>
                </div>
                <div className="relative">
                  <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}
                    className={clsx("appearance-none text-[11px] uppercase tracking-wider font-bold border rounded-md px-2.5 py-1 pr-7 cursor-pointer outline-none focus:ring-2 focus:ring-accent/40", ROLE_TINT[u.role])}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-current pointer-events-none" />
                </div>
                <button onClick={() => revoke(u.id)} className="text-red-500 hover:text-red-700" aria-label="Revoke">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {inviting && <InviteModal onClose={() => setInviting(false)} onSaved={() => { setInviting(false); load(); }} />}
    </div>
  );
}

function InviteModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", role: "SERVER", password: "" });
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!form.name || !form.email || !form.password) { toast.error("Fill all fields"); return; }
    if (form.password.length < 6) { toast.error("Password must be 6+ chars"); return; }
    setBusy(true);
    const { ok, error } = await sendJson("/api/admin/staff", "POST", form);
    setBusy(false);
    if (!ok) { toast.error(error === "email_taken" ? "Email already exists" : error ?? "Failed"); return; }
    toast.success(`Staff invited as ${form.role}`);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/55 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#14161b] rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[20px] font-bold inline-flex items-center gap-2"><UserPlus size={20} className="text-accent" /> Invite staff</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          <Field label="Full name *"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></Field>
          <Field label="Email *"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></Field>
          <Field label="Initial password *"><input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" placeholder="Share securely with the teammate" /></Field>
          <Field label="Role">
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button key={r} onClick={() => setForm({ ...form, role: r })}
                  className={clsx("text-left p-3 rounded-lg border-2 transition", form.role === r ? "border-accent bg-accent/5" : "border-line hover:border-accent/40")}>
                  <span className={clsx("inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded", ROLE_TINT[r])}>{r}</span>
                  <p className="text-[11px] text-muted mt-1.5 leading-snug">{ROLE_DESC[r]}</p>
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-line text-[13px] font-semibold">Cancel</button>
          <button onClick={submit} disabled={busy} className="inline-flex items-center gap-1.5 bg-accent text-white px-5 py-2 rounded-lg font-semibold text-[13px] shadow-glow disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Invite
          </button>
        </div>

        <style jsx>{`
          :global(.input) { width: 100%; background: #fff; border: 1px solid #eceef1; border-radius: 8px; padding: 8px 10px; font-size: 13px; outline: none; }
          :global(.input:focus) { border-color: #FF6A1A; }
          :global(.dark .input) { background: #1e2128; border-color: #272b33; color: #f2f3f5; }
        `}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span><div className="mt-1">{children}</div></label>;
}
