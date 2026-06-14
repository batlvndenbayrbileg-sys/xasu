"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, CheckCircle2, QrCode, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getJson, sendJson } from "@/lib/fetcher";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { formatMnt } from "@/lib/payments";

export default function PayPage() {
  return (
    <Suspense fallback={<div className="pt-40 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>}>
      <PayInner />
    </Suspense>
  );
}

type Phase = "loading" | "action" | "waiting" | "success" | "error";

function PayInner() {
  const router = useRouter();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("r") ?? "";
  const isReturn = searchParams.get("return") === "1";
  const [phase, setPhase] = useState<Phase>("loading");
  const [amount, setAmount] = useState(0);
  const [qr, setQr] = useState<string | null>(null);
  const [mock, setMock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finish = useCallback(() => {
    setPhase("success");
    toast.success(t("pay.success"));
    setTimeout(() => router.push(`/confirmation?id=${reservationId}`), 1100);
  }, [router, reservationId, t]);

  const start = useCallback(async () => {
    if (!reservationId) { setPhase("error"); setError("Missing reservation"); return; }
    setPhase("loading"); setError(null);
    const { ok, status, data, error } = await sendJson<any>("/api/payments/intent", "POST", { reservationId });
    if (status === 401) { router.push(`/login?redirect=/pay?r=${reservationId}`); return; }
    if (!ok || !data) { setPhase("error"); setError(error ?? "Payment error"); return; }
    setAmount(data.amount); setMock(!!data.mock);
    if (data.status === "succeeded") return finish();
    if (data.checkoutUrl) { window.location.href = data.checkoutUrl; return; }
    setQr(data.nextAction?.qr_image ?? null);
    setPhase("waiting");
  }, [reservationId, router, finish]);

  useEffect(() => {
    // Returning from hosted checkout: don't create a new session, just poll status.
    if (isReturn) {
      if (!reservationId) { setPhase("error"); setError("Missing reservation"); return; }
      setPhase("waiting");
      return;
    }
    start();
    /* eslint-disable-next-line */
  }, []);

  // poll for completion
  useEffect(() => {
    if (phase !== "waiting") return;
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 40; // ~100s

    const check = async () => {
      attempts++;
      const { ok, status, data } = await getJson<any>(`/api/payments/intent?reservationId=${reservationId}`);
      if (cancelled) return;
      if (status === 401) {
        if (pollRef.current) clearInterval(pollRef.current);
        router.push(`/login?redirect=${encodeURIComponent(`/pay?r=${reservationId}${isReturn ? "&return=1" : ""}`)}`);
        return;
      }
      if (ok && data?.status === "succeeded") {
        if (pollRef.current) clearInterval(pollRef.current);
        finish();
        return;
      }
      if (ok && data?.status === "canceled") {
        if (pollRef.current) clearInterval(pollRef.current);
        setPhase("error"); setError(t("pay.failed"));
        return;
      }
      if (attempts >= MAX_ATTEMPTS) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPhase("error"); setError(t("pay.failed"));
      }
    };

    check();
    pollRef.current = setInterval(check, 2500);
    return () => { cancelled = true; if (pollRef.current) clearInterval(pollRef.current); };
  }, [phase, reservationId, finish, isReturn, router, t]);

  return (
    <div className="pt-24 md:pt-32 min-h-[80vh]">
      <div className="mx-auto max-w-md px-4 sm:px-6 text-center">
        <p className="text-accent font-semibold text-[14px] tracking-wide uppercase">{t("pay.step")}</p>
        <h1 className="font-display text-[30px] md:text-[40px] font-bold mt-1">{t("pay.title")}</h1>
        <p className="text-muted mt-2">{t("pay.sub")}</p>

        <div className="mt-7 bg-white border border-line rounded-3xl shadow-card p-6">
          {/* amount */}
          <div className="flex items-center justify-between pb-5 border-b border-line">
            <span className="text-muted text-[14px]">{t("pay.deposit")}</span>
            <span className="font-display text-[26px] font-bold">{formatMnt(amount || 20000)}</span>
          </div>

          {phase === "loading" && (
            <div className="py-12 grid place-items-center text-neutral-400">
              <Loader2 className="animate-spin" /><span className="text-[13px] mt-3">{t("pay.creating")}</span>
            </div>
          )}

          {phase === "success" && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-12 grid place-items-center">
              <CheckCircle2 size={56} className="text-emerald-500" />
              <p className="font-semibold mt-3">{t("pay.success")}</p>
            </motion.div>
          )}

          {phase === "error" && (
            <div className="py-10 grid place-items-center">
              <p className="text-red-500 font-medium">{error ?? t("pay.failed")}</p>
              <button onClick={start} className="mt-5 bg-accent text-white font-semibold px-7 py-3 rounded-full shadow-glow hover:bg-accent-soft transition">
                {t("pay.retry")}
              </button>
            </div>
          )}

          {phase === "waiting" && (
            <div className="pt-6">
              <div className="mx-auto w-[200px] h-[200px] rounded-2xl border border-line grid place-items-center overflow-hidden bg-white">
                {qr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr} alt="QR" className="w-full h-full object-contain p-2" />
                ) : (
                  <QrCode size={120} className="text-ink" />
                )}
              </div>
              <p className="text-[13px] text-muted mt-4 flex items-center justify-center gap-1.5">
                <Loader2 size={14} className="animate-spin" /> {t("pay.waiting")}
              </p>
              <p className="text-[13px] mt-1">{t("pay.scan")}</p>
              {mock && <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg py-2 px-3 mt-4">{t("pay.mockNote")}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[12px] text-muted mt-4">
          <ShieldCheck size={14} className="text-emerald-500" /> Wire Payment · QPay
        </div>

        {phase !== "success" && (
          <button onClick={() => router.push("/orders")} className="mt-4 text-[13px] font-semibold text-muted hover:text-ink transition inline-flex items-center gap-1">
            {t("pay.later")} <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
