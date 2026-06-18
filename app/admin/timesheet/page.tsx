"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2, Plus, X, Save, Trash2, Download, Users, Clock, CalendarPlus,
  CheckCircle2, AlertCircle, Edit3, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { getJson, sendJson } from "@/lib/fetcher";
import { formatMnt } from "@/lib/payments";
import { downloadCsv } from "@/lib/csv";
import { toast } from "@/lib/toast";

interface Employee {
  id: string; name: string; pin: string; role: string;
  hourlyRate: number; active: boolean;
  isClockedIn: boolean; currentShiftStart: string | null;
}
interface Shift {
  id: string; employeeId: string; employeeName: string;
  clockIn: string; clockOut: string | null; minutes: number | null; note: string | null;
}
interface PayrollTotal {
  employeeId: string; name: string; role: string;
  hourlyRate: number; minutes: number; pay: number; shifts: number;
}
interface ScheduledShift {
  id: string; employeeId: string; date: string; startTime: string; endTime: string; notes: string | null;
  employee: { id: string; name: string; role: string };
}

const ROLE_MN: Record<string, string> = {
  staff: "Ажилтан", server: "Зөөгч", cook: "Тогооч", manager: "Менежер",
};

function ymd(d: Date) {
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AdminTimesheet() {
  const today = new Date();
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);

  const [tab, setTab] = useState<"overview" | "shifts" | "schedule" | "employees">("overview");
  const [from, setFrom] = useState(ymd(weekAgo));
  const [to, setTo] = useState(ymd(today));

  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [totals, setTotals] = useState<PayrollTotal[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledShift[]>([]);

  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [creatingEmp, setCreatingEmp] = useState(false);
  const [creatingShift, setCreatingShift] = useState(false);

  const loadEmployees = useCallback(async () => {
    const { data } = await getJson<Employee[]>("/api/admin/employees");
    setEmployees(data ?? []);
  }, []);
  const loadShifts = useCallback(async () => {
    const { data } = await getJson<{ shifts: Shift[]; totals: PayrollTotal[] }>(`/api/admin/shifts?from=${from}&to=${to}`);
    setShifts((data as any)?.shifts ?? []);
    setTotals((data as any)?.totals ?? []);
  }, [from, to]);
  const loadScheduled = useCallback(async () => {
    const { data } = await getJson<ScheduledShift[]>(`/api/admin/scheduled-shifts?from=${from}&to=${to}`);
    setScheduled(data ?? []);
  }, [from, to]);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);
  useEffect(() => { loadShifts(); loadScheduled(); }, [loadShifts, loadScheduled]);
  useEffect(() => {
    const id = setInterval(loadEmployees, 30_000);
    return () => clearInterval(id);
  }, [loadEmployees]);

  const activeCount = employees?.filter((e) => e.active).length ?? 0;
  const clockedInCount = employees?.filter((e) => e.isClockedIn).length ?? 0;
  const totalPay = useMemo(() => totals.reduce((s, t) => s + t.pay, 0), [totals]);
  const totalHours = useMemo(() => totals.reduce((s, t) => s + t.minutes, 0) / 60, [totals]);

  function exportCsv() {
    if (totals.length === 0) { toast.error("Гаргах өгөгдөл алга"); return; }
    downloadCsv(
      totals.map((t) => ({
        Нэр: t.name,
        Үүрэг: ROLE_MN[t.role] ?? t.role,
        "Цагийн хөлс": t.hourlyRate,
        "Ажилласан цаг": (t.minutes / 60).toFixed(2),
        "Ээлжийн тоо": t.shifts,
        "Цалин (₮)": t.pay,
      })),
      `payroll_${from}_${to}.csv`,
    );
  }

  async function deleteShift(id: string) {
    if (!confirm("Энэ ээлжийг устгах уу?")) return;
    const { ok } = await sendJson(`/api/admin/shifts/${id}`, "DELETE" as any);
    if (!ok) { toast.error("Устгаж чадсангүй"); return; }
    toast.success("Устгалаа");
    loadShifts();
  }

  async function deleteEmployee(id: string) {
    if (!confirm("Энэ ажилтныг устгах уу? Ээлжийн түүх нь бас устана.")) return;
    const { ok } = await sendJson(`/api/admin/employees/${id}`, "DELETE" as any);
    if (!ok) { toast.error("Устгаж чадсангүй"); return; }
    toast.success("Устгалаа");
    loadEmployees();
  }

  async function deleteScheduled(id: string) {
    if (!confirm("Энэ хуваарийг устгах уу?")) return;
    const { ok } = await sendJson(`/api/admin/scheduled-shifts/${id}`, "DELETE" as any);
    if (!ok) { toast.error("Устгаж чадсангүй"); return; }
    toast.success("Устгалаа");
    loadScheduled();
  }

  return (
    <div className="max-w-7xl space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-[28px] md:text-[34px] font-bold">Ажилчдын цаг бүртгэл</h1>
          <p className="text-muted text-[14px] mt-1">Ажилтан удирдах, цагийн бүртгэл, хуваарь, цалин тооцоо.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/timesheet" target="_blank"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold bg-white border border-line px-3 py-1.5 rounded-full hover:border-accent transition">
            <ExternalLink size={13} /> Терминал нээх
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Идэвхтэй ажилтан" value={activeCount} icon={<Users size={15} />} tint="sky" />
        <Kpi label="Одоо ажиллаж байгаа" value={clockedInCount} icon={<Clock size={15} />} tint="emerald" />
        <Kpi label={`Цаг (${from.slice(5)} → ${to.slice(5)})`} value={totalHours.toFixed(1)} icon={<Clock size={15} />} tint="amber" />
        <Kpi label="Нийт цалин" value={formatMnt(totalPay)} icon={<CheckCircle2 size={15} />} tint="accent" />
      </div>

      <div className="flex gap-1 bg-white border border-line rounded-full p-1 w-fit">
        {([
          ["overview","Тойм"],
          ["shifts","Ээлж"],
          ["schedule","Хуваарь"],
          ["employees","Ажилтан"],
        ] as const).map(([k, lbl]) => (
          <button key={k} onClick={() => setTab(k)}
            className={clsx("px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wide transition",
              tab === k ? "bg-accent text-white" : "text-muted")}>{lbl}</button>
        ))}
      </div>

      {/* Date range */}
      {tab !== "employees" && (
        <div className="bg-white border border-line rounded-xl p-3 flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-bold text-muted uppercase tracking-wider mr-1">Хугацаа:</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-neutral-50 border border-line rounded-md px-2 py-1.5 text-[13px]" />
          <span className="text-muted text-[12px]">→</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-neutral-50 border border-line rounded-md px-2 py-1.5 text-[13px]" />
          <div className="ml-auto flex items-center gap-2">
            {tab === "overview" && (
              <button onClick={exportCsv} className="inline-flex items-center gap-1.5 text-[12px] font-bold bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full transition">
                <Download size={12} /> CSV татах
              </button>
            )}
            {tab === "shifts" && (
              <button onClick={() => setCreatingShift(true)} className="inline-flex items-center gap-1.5 text-[12px] font-bold bg-accent text-white px-3 py-1.5 rounded-full">
                <Plus size={12} /> Гар бүртгэл нэмэх
              </button>
            )}
            {tab === "schedule" && (
              <button onClick={() => setCreatingShift(true)} className="inline-flex items-center gap-1.5 text-[12px] font-bold bg-accent text-white px-3 py-1.5 rounded-full">
                <CalendarPlus size={12} /> Хуваарь нэмэх
              </button>
            )}
          </div>
        </div>
      )}

      {tab === "overview" && (
        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-line text-[11px] font-bold uppercase tracking-widest text-muted">
            Цалингийн тооцоолол — {from} → {to}
          </div>
          {totals.length === 0 ? (
            <div className="h-40 grid place-items-center text-muted text-[13px]">Энэ хугацаанд бүртгэгдсэн ажил алга.</div>
          ) : (
            <ul className="divide-y divide-line">
              {totals.map((t) => (
                <li key={t.employeeId} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent text-white grid place-items-center font-bold text-[13px]">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] truncate">{t.name}</div>
                    <div className="text-[11px] text-muted">{ROLE_MN[t.role] ?? t.role} · {formatMnt(t.hourlyRate)}/цаг</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[14px]">{(t.minutes / 60).toFixed(1)}ц</div>
                    <div className="text-[11px] text-muted">{t.shifts} ээлж</div>
                  </div>
                  <div className="text-right min-w-[110px]">
                    <div className="font-display font-bold text-[16px] text-accent">{formatMnt(t.pay)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "shifts" && (
        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-line text-[11px] font-bold uppercase tracking-widest text-muted">
            Ээлжийн бүртгэл · {shifts.length}
          </div>
          {shifts.length === 0 ? (
            <div className="h-40 grid place-items-center text-muted text-[13px]">Бүртгэл алга. PIN-ээр терминалд бүртгүүлснээр энд харагдана.</div>
          ) : (
            <ul className="divide-y divide-line">
              {shifts.map((s) => (
                <li key={s.id} className="px-4 py-3 flex items-center gap-3 text-[13px]">
                  <div className="font-semibold flex-1 min-w-0 truncate">{s.employeeName}</div>
                  <div className="text-muted text-[12px] tabular-nums">
                    {new Date(s.clockIn).toLocaleString("mn-MN", { dateStyle: "short", timeStyle: "short" })}
                    {" → "}
                    {s.clockOut ? new Date(s.clockOut).toLocaleString("mn-MN", { timeStyle: "short" }) : <span className="text-emerald-600 font-bold">Ажиллаж байна</span>}
                  </div>
                  <div className="text-right w-[80px] font-bold">
                    {s.minutes != null ? `${Math.floor(s.minutes / 60)}ц ${s.minutes % 60}м` : "—"}
                  </div>
                  <button onClick={() => deleteShift(s.id)} className="text-neutral-400 hover:text-red-500"><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "schedule" && (
        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-line text-[11px] font-bold uppercase tracking-widest text-muted">
            Урьдчилсан хуваарь
          </div>
          {scheduled.length === 0 ? (
            <div className="h-40 grid place-items-center text-muted text-[13px]">Хуваарь алга. Дээрх "Хуваарь нэмэх" товчоор оруулна.</div>
          ) : (
            <ul className="divide-y divide-line">
              {scheduled.map((s) => (
                <li key={s.id} className="px-4 py-3 flex items-center gap-3 text-[13px]">
                  <div className="font-mono font-bold text-muted text-[12px] w-24">{s.date}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{s.employee.name}</div>
                    <div className="text-[11px] text-muted">{ROLE_MN[s.employee.role] ?? s.employee.role}{s.notes ? ` · ${s.notes}` : ""}</div>
                  </div>
                  <div className="text-[13px] font-bold tabular-nums">{s.startTime} – {s.endTime}</div>
                  <button onClick={() => deleteScheduled(s.id)} className="text-neutral-400 hover:text-red-500"><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "employees" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setCreatingEmp(true)}
              className="inline-flex items-center gap-1.5 bg-accent text-white font-semibold px-4 py-2 rounded-full shadow-glow text-[13px]">
              <Plus size={14} /> Шинэ ажилтан
            </button>
          </div>

          <div className="bg-white border border-line rounded-2xl overflow-hidden">
            {!employees ? (
              <div className="h-40 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>
            ) : employees.length === 0 ? (
              <div className="h-40 grid place-items-center text-muted text-[13px]">Ажилтан бүртгэгдээгүй байна.</div>
            ) : (
              <ul className="divide-y divide-line">
                {employees.map((e) => (
                  <li key={e.id} className="px-4 py-3 flex items-center gap-3 text-[13px]">
                    <div className={clsx("w-9 h-9 rounded-full grid place-items-center font-bold text-[13px]",
                      e.active ? "bg-accent text-white" : "bg-neutral-200 text-neutral-500")}>
                      {e.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate flex items-center gap-1.5">
                        {e.name}
                        {e.isClockedIn && <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">● Ажиллаж байна</span>}
                        {!e.active && <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">Идэвхгүй</span>}
                      </div>
                      <div className="text-[11px] text-muted">{ROLE_MN[e.role] ?? e.role} · PIN: <span className="font-mono">{e.pin}</span> · {formatMnt(e.hourlyRate)}/цаг</div>
                    </div>
                    <button onClick={() => setEditingEmp(e)} className="text-neutral-500 hover:text-accent p-1"><Edit3 size={14} /></button>
                    <button onClick={() => deleteEmployee(e.id)} className="text-neutral-500 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {(editingEmp || creatingEmp) && (
        <EmployeeEditor employee={editingEmp} onClose={() => { setEditingEmp(null); setCreatingEmp(false); }}
          onSaved={() => { setEditingEmp(null); setCreatingEmp(false); loadEmployees(); }} />
      )}

      {creatingShift && (
        <ShiftCreator employees={employees ?? []} mode={tab === "schedule" ? "scheduled" : "manual"}
          onClose={() => setCreatingShift(false)}
          onSaved={() => { setCreatingShift(false); loadShifts(); loadScheduled(); }} />
      )}
    </div>
  );
}

function Kpi({ label, value, icon, tint }: { label: string; value: number | string; icon: React.ReactNode; tint: string }) {
  const tints: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <div className="bg-white border border-line rounded-2xl p-4">
      <div className={clsx("w-8 h-8 rounded-lg grid place-items-center", tints[tint])}>{icon}</div>
      <div className="text-[12px] text-muted mt-2.5">{label}</div>
      <div className="font-display text-[22px] font-bold mt-0.5 leading-none">{value}</div>
    </div>
  );
}

function EmployeeEditor({ employee, onClose, onSaved }: { employee: Employee | null; onClose: () => void; onSaved: () => void }) {
  const isNew = !employee;
  const [form, setForm] = useState({
    name: employee?.name ?? "",
    pin: employee?.pin ?? "",
    role: employee?.role ?? "staff",
    hourlyRate: employee?.hourlyRate ?? 0,
    active: employee?.active ?? true,
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.name.trim()) { toast.error("Нэр шаардлагатай"); return; }
    if (!/^\d{4,6}$/.test(form.pin)) { toast.error("PIN 4-6 оронтой тоо байх ёстой"); return; }
    setBusy(true);
    if (isNew) {
      const { ok, error } = await sendJson("/api/admin/employees", "POST", form);
      setBusy(false);
      if (!ok) { toast.error(error === "pin_taken" ? "Энэ PIN өөр ажилтанд бүртгэгдсэн байна" : "Үүсгэж чадсангүй"); return; }
      toast.success("Нэмэгдлээ");
    } else {
      const { ok } = await sendJson(`/api/admin/employees/${employee!.id}`, "PATCH" as any, form);
      setBusy(false);
      if (!ok) { toast.error("Хадгалж чадсангүй"); return; }
      toast.success("Шинэчиллээ");
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/55 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[20px] font-bold">{isNew ? "Шинэ ажилтан" : "Ажилтан засах"}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          <Field label="Нэр *"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="ts-input" placeholder="Б. Батаа" /></Field>
          <Field label="PIN (4-6 орон) *">
            <input value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })} className="ts-input font-mono tracking-widest" placeholder="1234" />
          </Field>
          <Field label="Үүрэг">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="ts-input">
              <option value="staff">Ажилтан</option>
              <option value="server">Зөөгч</option>
              <option value="cook">Тогооч</option>
              <option value="manager">Менежер</option>
            </select>
          </Field>
          <Field label="Цагийн хөлс (₮)">
            <input type="number" min={0} step={500} value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: parseInt(e.target.value) || 0 })} className="ts-input" />
          </Field>
          {!isNew && (
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Идэвхтэй (терминалд PIN ажиллана)
            </label>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-line text-[13px] font-semibold">Болих</button>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 bg-accent text-white px-5 py-2 rounded-lg font-semibold text-[13px] shadow-glow disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {isNew ? "Нэмэх" : "Хадгалах"}
          </button>
        </div>

        <style jsx>{`
          :global(.ts-input) { width: 100%; background: #fff; border: 1px solid #eceef1; border-radius: 8px; padding: 8px 10px; font-size: 13px; outline: none; }
          :global(.ts-input:focus) { border-color: #FF6A1A; }
        `}</style>
      </div>
    </div>
  );
}

function ShiftCreator({ employees, mode, onClose, onSaved }: { employees: Employee[]; mode: "manual" | "scheduled"; onClose: () => void; onSaved: () => void }) {
  const today = new Date();
  const [form, setForm] = useState({
    employeeId: employees[0]?.id ?? "",
    date: ymd(today),
    startTime: "09:00",
    endTime: "17:00",
    notes: "",
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.employeeId) { toast.error("Ажилтан сонгоно уу"); return; }
    setBusy(true);
    if (mode === "scheduled") {
      const { ok } = await sendJson("/api/admin/scheduled-shifts", "POST", form);
      setBusy(false);
      if (!ok) { toast.error("Хадгалж чадсангүй"); return; }
      toast.success("Хуваарь нэмэгдлээ");
    } else {
      const clockIn = new Date(`${form.date}T${form.startTime}:00`);
      const clockOut = new Date(`${form.date}T${form.endTime}:00`);
      const { ok } = await sendJson("/api/admin/shifts", "POST", {
        employeeId: form.employeeId,
        clockIn: clockIn.toISOString(),
        clockOut: clockOut.toISOString(),
        note: form.notes || null,
      });
      setBusy(false);
      if (!ok) { toast.error("Хадгалж чадсангүй"); return; }
      toast.success("Ээлж нэмэгдлээ");
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/55 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[20px] font-bold">{mode === "scheduled" ? "Хуваарь нэмэх" : "Гар бүртгэл"}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        {employees.length === 0 ? (
          <div className="text-[13px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3 inline-flex gap-2 items-start">
            <AlertCircle size={14} className="mt-0.5 flex-none" />
            Эхлээд ажилтан нэмнэ үү.
          </div>
        ) : (
          <div className="space-y-3">
            <Field label="Ажилтан *">
              <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="ts-input">
                {employees.filter((e) => e.active).map((e) => <option key={e.id} value={e.id}>{e.name} · {ROLE_MN[e.role] ?? e.role}</option>)}
              </select>
            </Field>
            <Field label="Огноо *">
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="ts-input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Эхлэх цаг *">
                <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="ts-input" />
              </Field>
              <Field label="Дуусах цаг *">
                <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="ts-input" />
              </Field>
            </div>
            <Field label="Тэмдэглэл">
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="ts-input" placeholder="Сонголтоор" />
            </Field>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-line text-[13px] font-semibold">Болих</button>
          <button onClick={save} disabled={busy || employees.length === 0} className="inline-flex items-center gap-1.5 bg-accent text-white px-5 py-2 rounded-lg font-semibold text-[13px] shadow-glow disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Хадгалах
          </button>
        </div>

        <style jsx>{`
          :global(.ts-input) { width: 100%; background: #fff; border: 1px solid #eceef1; border-radius: 8px; padding: 8px 10px; font-size: 13px; outline: none; }
          :global(.ts-input:focus) { border-color: #FF6A1A; }
        `}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span><div className="mt-1">{children}</div></label>;
}
