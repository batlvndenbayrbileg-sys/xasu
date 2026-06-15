"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Save, User, Phone, CalendarDays, Clock, Users, MapPin } from "lucide-react";
import clsx from "clsx";
import { sendJson, getJson } from "@/lib/fetcher";
import { TABLES } from "@/lib/data";
import { toast } from "@/lib/toast";

const TIMES = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

export default function NewReservation() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    guestName: "", guestPhone: "",
    tableId: TABLES[0]?.id ?? "",
    partySize: 2,
    date: today,
    time: "19:00",
    notes: "",
    source: "phone",
    paymentStatus: "unpaid" as "unpaid" | "paid",
  });
  const [submitting, setSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Pull conflicts so admin sees which tables are already taken for the slot
  useEffect(() => {
    if (!form.date || !form.time) return;
    getJson<any[]>(`/api/admin/reservations?date=${form.date}`).then(({ data }) => {
      const taken = (data ?? [])
        .filter((r: any) => r.time === form.time && r.status !== "CANCELLED" && r.status !== "NO_SHOW")
        .map((r: any) => r.tableId);
      setConflicts(taken);
    });
  }, [form.date, form.time]);

  function update(k: string, v: any) { setForm({ ...form, [k]: v }); }

  const selectedTable = TABLES.find((t) => t.id === form.tableId);
  const overCap = selectedTable ? form.partySize > selectedTable.seats : false;
  const tableConflict = conflicts.includes(form.tableId);
  const canSubmit = form.guestName.trim() && !overCap && !tableConflict;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const { ok, data, error } = await sendJson<any>("/api/admin/reservations", "POST", form);
    setSubmitting(false);
    if (!ok) {
      toast.error(error === "slot_taken" ? "Table already booked at that time" : error ?? "Failed");
      return;
    }
    toast.success("Booking created");
    router.push(`/admin/reservations/${data.id}`);
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full border border-line bg-white grid place-items-center text-ink hover:border-accent transition">
          <ChevronLeft size={17} />
        </button>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted font-semibold">New booking</p>
          <h1 className="font-display text-[24px] md:text-[28px] font-bold leading-tight">Walk-in / phone reservation</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-[#14161b] border border-line rounded-2xl p-5 md:p-6 space-y-5">
        {/* Source switcher */}
        <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-100 rounded-full p-1 w-fit">
          {[["phone", "Phone"], ["walkin", "Walk-in"], ["admin", "On-site"]].map(([v, l]) => (
            <button key={v} onClick={() => update("source", v)}
              className={clsx("px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wide transition",
                form.source === v ? "bg-accent text-white" : "text-muted")}>{l}</button>
          ))}
        </div>

        {/* Guest */}
        <div className="grid sm:grid-cols-2 gap-3">
          <FieldIcon icon={<User size={14} />} label="Guest name *">
            <input value={form.guestName} onChange={(e) => update("guestName", e.target.value)}
              className="input" placeholder="e.g. Bayasaa C." />
          </FieldIcon>
          <FieldIcon icon={<Phone size={14} />} label="Phone">
            <input value={form.guestPhone} onChange={(e) => update("guestPhone", e.target.value)}
              className="input" placeholder="+976 …" />
          </FieldIcon>
        </div>

        {/* When */}
        <div className="grid sm:grid-cols-2 gap-3">
          <FieldIcon icon={<CalendarDays size={14} />} label="Date">
            <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="input" />
          </FieldIcon>
          <FieldIcon icon={<Clock size={14} />} label="Time">
            <select value={form.time} onChange={(e) => update("time", e.target.value)} className="input">
              {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FieldIcon>
        </div>

        {/* Party size */}
        <FieldIcon icon={<Users size={14} />} label="Party size">
          <div className="flex items-center gap-3">
            <button onClick={() => update("partySize", Math.max(1, form.partySize - 1))}
              className="w-10 h-10 rounded-full border border-line bg-white grid place-items-center text-ink active:scale-95">−</button>
            <span className={clsx("min-w-[36px] text-center font-bold text-[20px]", overCap && "text-red-500")}>{form.partySize}</span>
            <button onClick={() => update("partySize", form.partySize + 1)}
              className="w-10 h-10 rounded-full border border-line bg-white grid place-items-center text-ink active:scale-95">+</button>
            {selectedTable && <span className="text-[11px] text-muted ml-1">Max {selectedTable.seats}</span>}
          </div>
        </FieldIcon>

        {/* Table picker */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2 inline-flex items-center gap-1.5"><MapPin size={11} /> Choose a table</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {TABLES.map((t) => {
              const isConflict = conflicts.includes(t.id);
              const isSelected = form.tableId === t.id;
              const tooSmall = form.partySize > t.seats;
              return (
                <button key={t.id} onClick={() => !isConflict && update("tableId", t.id)}
                  disabled={isConflict}
                  className={clsx("relative p-2.5 rounded-xl border-2 text-left transition",
                    isSelected ? "bg-accent text-white border-accent" :
                    isConflict ? "bg-neutral-100 border-line opacity-50 cursor-not-allowed" :
                    "bg-white border-line hover:border-accent",
                    tooSmall && !isConflict && !isSelected && "opacity-60",
                  )}>
                  <div className="font-display font-bold text-[14px] leading-none">{t.label}</div>
                  <div className={clsx("text-[10px] mt-1", isSelected ? "text-white/85" : "text-muted")}>{t.seats} seats · {t.zone.slice(0, 6)}</div>
                  {isConflict && <span className="absolute top-1 right-1 text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-1 py-0.5 rounded">Taken</span>}
                </button>
              );
            })}
          </div>
          {overCap && <p className="text-[12px] text-red-500 mt-2">Party exceeds selected table's capacity.</p>}
        </div>

        {/* Notes */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">Notes (allergies, occasion, prefs)</p>
          <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className="input min-h-[80px] resize-y" />
        </div>

        {/* Payment */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">Deposit collected?</p>
          <div className="flex gap-2">
            {[["unpaid", "Not collected"], ["paid", "Cash · paid in person"]].map(([v, l]) => (
              <button key={v} onClick={() => update("paymentStatus", v)}
                className={clsx("px-4 py-2 rounded-lg text-[13px] font-semibold border-2 transition",
                  form.paymentStatus === v ? "bg-accent text-white border-accent" : "bg-white border-line text-neutral-700")}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="sticky bottom-0 bg-white dark:bg-[#14161b] border border-line rounded-2xl p-3 md:p-4 flex items-center justify-between gap-2">
        <p className="text-[12px] text-muted hidden sm:block">{!form.guestName ? "Add a guest name to continue" : tableConflict ? "Pick a different table" : "Ready to create"}</p>
        <button onClick={submit} disabled={!canSubmit || submitting}
          className="inline-flex items-center gap-1.5 bg-accent text-white font-semibold px-6 py-3 rounded-full shadow-glow hover:bg-accent-soft transition disabled:opacity-40">
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Create booking
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: #fff;
          border: 1px solid #eceef1;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13.5px;
          outline: none;
        }
        :global(.input:focus) { border-color: #FF6A1A; }
        :global(.dark .input) { background: #1e2128; border-color: #272b33; color: #f2f3f5; }
      `}</style>
    </div>
  );
}

function FieldIcon({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted inline-flex items-center gap-1.5">{icon} {label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
