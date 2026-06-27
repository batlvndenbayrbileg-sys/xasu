"use client";

/**
 * Public clock-in terminal — no auth. The screen lives on a dedicated tablet
 * in the back-of-house and employees punch in/out with their 4-6 digit PIN.
 */

import { useEffect, useRef, useState } from "react";
import { Delete, LogIn, LogOut, Loader2 } from "lucide-react";
import { sendJson } from "@/lib/fetcher";

interface ClockResult {
  action: "clock_in" | "clock_out";
  employee: { id: string; name: string; role: string };
  durationMinutes?: number;
}

export default function TimesheetTerminal() {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ClockResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  function digit(n: string) {
    if (busy || result) return;
    if (pin.length >= 6) return;
    setPin((p) => p + n);
    setError(null);
  }
  function backspace() {
    if (busy || result) return;
    setPin((p) => p.slice(0, -1));
    setError(null);
  }
  function clear() { setPin(""); setError(null); }

  async function submit() {
    if (pin.length < 4) { setError("PIN хамгийн багадаа 4 оронтой"); return; }
    setBusy(true);
    const { ok, data, error: e } = await sendJson<ClockResult>("/api/timesheet/clock", "POST", { pin });
    setBusy(false);
    if (!ok || !data) {
      setError(
        e === "invalid_pin" ? "PIN буруу байна"
        : e === "too_many" ? "Хэт олон оролдлого — түр хүлээнэ үү"
        : "Алдаа гарлаа",
      );
      setPin("");
      return;
    }
    setResult(data);
    setPin("");
    resetRef.current = setTimeout(() => setResult(null), 5000);
  }

  useEffect(() => () => { if (resetRef.current) clearTimeout(resetRef.current); }, []);

  return (
    <div className="min-h-screen bg-neutral-50 grid place-items-center p-4 pt-20">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-line">
        <div className="px-6 py-5 bg-ink text-white text-center">
          <div className="text-[11px] uppercase tracking-widest opacity-70">Цаг бүртгэл</div>
          <div className="text-[28px] font-display font-bold mt-1 tabular-nums">
            {now.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="text-[12px] opacity-70 mt-0.5">
            {now.toLocaleDateString("mn-MN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>

        {result ? (
          <div className="p-8 text-center">
            <div className={`w-16 h-16 rounded-full grid place-items-center mx-auto ${result.action === "clock_in" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
              {result.action === "clock_in" ? <LogIn size={28} /> : <LogOut size={28} />}
            </div>
            <h2 className="font-display text-[22px] font-bold mt-4">{result.employee.name}</h2>
            <p className="text-muted text-[13px] mt-1">{result.employee.role}</p>
            <p className="mt-4 text-[16px] font-semibold">
              {result.action === "clock_in" ? "Ажилд орлоо" : "Ажлаа дуусгалаа"}
            </p>
            {result.action === "clock_out" && result.durationMinutes != null && (
              <p className="text-muted text-[13px] mt-1">
                Ажилласан: {Math.floor(result.durationMinutes / 60)}ц {result.durationMinutes % 60}мин
              </p>
            )}
            <button onClick={() => { setResult(null); if (resetRef.current) clearTimeout(resetRef.current); }}
              className="mt-6 px-5 py-2 rounded-full border border-line text-[13px] font-semibold">
              Үргэлжлүүлэх
            </button>
          </div>
        ) : (
          <div className="p-6">
            <p className="text-center text-[13px] text-muted mb-3">PIN кодоо оруулна уу</p>
            <div className="flex items-center justify-center gap-2 h-12 mb-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className={`w-3.5 h-3.5 rounded-full ${i < pin.length ? "bg-accent" : "bg-neutral-200"}`} />
              ))}
            </div>
            <div className="h-5 text-center text-[12px] text-red-500">{error}</div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              {["1","2","3","4","5","6","7","8","9"].map((n) => (
                <button key={n} onClick={() => digit(n)}
                  className="h-16 rounded-2xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-[24px] font-bold transition">
                  {n}
                </button>
              ))}
              <button onClick={clear} className="h-16 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-[12px] font-bold text-neutral-600">
                АРИЛГА
              </button>
              <button onClick={() => digit("0")} className="h-16 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-[24px] font-bold transition">
                0
              </button>
              <button onClick={backspace} className="h-16 rounded-2xl bg-neutral-100 hover:bg-neutral-200 grid place-items-center">
                <Delete size={20} />
              </button>
            </div>

            <button onClick={submit} disabled={busy || pin.length < 4}
              className="mt-4 w-full h-14 rounded-2xl bg-accent text-white font-bold text-[16px] shadow-glow hover:bg-accent-soft transition disabled:opacity-50 inline-flex items-center justify-center gap-2">
              {busy ? <Loader2 className="animate-spin" /> : <>Баталгаажуулах</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
