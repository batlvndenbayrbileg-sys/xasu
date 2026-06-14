"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, CheckCircle2, QrCode, ArrowRight, AlertCircle } from "lucide-react";
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

type Phase = "loading" | "redirecting" | "waiting" | "verifying" | "success" | "timeout" | "error";

const POLL_INTERVAL = 2500;
const MAX_POLLS = 40; // ~100s before we surface a "not confirmed yet" state

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

  // Map an API error code to a friendly, localized message (never show raw codes).
  const messageFor = useCallback(
    (code?: string | null) => {
      switch (code) {
        case "not_found":
          return t("conf.notFound");
        default:
          return t("pay.errorGeneric");
      }
    },
    [t]
  );

  const finish = useCallback(() => {
    setPhase("success");
    toast.success(t("pay.success"));
    setTimeout(() => router.push(`/confirmation?id=${reservationId}`), 1100);
  }, [router, reservationId, t]);

  const goLogin = useCallback(() => {
    const back = `/pay?r=${reservationId}${isReturn ? "&return=1" : ""}`;
    router.push(`/login?redirect=${encodeURIComponent(back)}`);
  }, [router, reservationId, isReturn]);

  // Create the intent and either redirect to hosted checkout or show the mock QR.
  const start = useCallback(async () => {
    if (!reservationId) { setPhase("error"); setError(t("pay.errorGeneric")); return; }
    setPhase("loading"); setError(null);
    const { ok, status, data, error } = await sendJson<any>("/api/payments/intent", "POST", { reservationId });
    if (status === 401) return goLogin();
    if (!ok || !data) { setPhase("error"); setError(messageFor(error)); return; }
    setAmount(data.amount ?? 0); setMock(!!data.mock);
    if (data.status === "succeeded") return finish();
    if (data.checkoutUrl) { setPhase("redirecting"); window.location.href = data.checkoutUrl; return; }
    // mock mode: inline QR
    setQr(data.nextAction?.qr_image ?? null);
    setPhase("waiting");
  }, [reservationId, finish, goLogin, messageFor, t]);

  useEffect(() => {
    // Re-run whenever the reservation changes — the App Router reuses this
    // component across /pay?r=… navigations, so we must reset stale state and
    // re-initialise for the new reservation rather than keep the old one's.
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setQr(null); setError(null); setAmount(0); setMock(false);

    if (isReturn) {
      // Returning from hosted checkout — verify status, don't create a new session.
      if (!reservationId) { setPhase("error"); setError(t("pay.errorGeneric")); return; }
      setPhase("verifying");
      return;
    }
    start();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [reservationId, isReturn]);

  // Poll for completion while waiting (mock QR) or verifying (return from checkout).
  useEffect(() => {
    if (phase !== "waiting" && phase !== "verifying") return;
    let cancelled = false;
    let attempts = 0;

    const check = async () => {
      attempts++;
      const { ok, status, data } = await getJson<any>(`/api/payments/intent?reservationId=${reservationId}`);
      if (cancelled) return;
      if (status === 401) { stop(); goLogin(); return; }
      if (ok && (data?.status === "succeeded" || data?.paymentStatus === "paid")) { stop(); finish(); return; }
      if (ok && data?.status === "canceled") { stop(); setPhase("error"); setError(t("pay.failed")); return; }
      if (attempts >= MAX_POLLS) { stop(); setPhase("timeout"); }
    };
    const stop = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

    check();
    pollRef.current = setInterval(check, POLL_INTERVAL);
    return () => { cancelled = true; stop(); };
  }, [phase, reservationId, finish, goLogin, t]);

  const busy = phase === "loading" || phase === "redirecting";

  return (
    <div className="pt-20 md:pt-32 min-h-[80vh] pb-12">
      <div className="mx-auto max-w-md px-4 sm:px-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="GourmetGrove" className="h-12 md:h-14 w-auto mx-auto mb-5" />
        <p className="text-accent font-semibold text-[13px] md:text-[14px] tracking-wide uppercase">{t("pay.step")}</p>
        <h1 className="font-display text-[28px] md:text-[40px] font-bold mt-1">{t("pay.title")}</h1>
        <p className="text-muted mt-2 text-[14px] md:text-[16px]">{t("pay.sub")}</p>

        <div className="mt-6 md:mt-7 bg-white border border-line rounded-3xl shadow-card p-5 md:p-6">
          {/* amount */}
          <div className="flex items-center justify-between pb-5 border-b border-line">
            <span className="text-muted text-[14px]">{t("pay.deposit")}</span>
            <span className="font-display text-[26px] font-bold">{formatMnt(amount || 20000)}</span>
          </div>

          {busy && (
            <div className="py-12 grid place-items-center text-neutral-400">
              <Loader2 className="animate-spin" />
              <span className="text-[13px] mt-3">
                {phase === "redirecting" ? t("pay.redirecting") : t("pay.creating")}
              </span>
            </div>
          )}

          {phase === "verifying" && (
            <div className="py-12 grid place-items-center text-neutral-500">
              <Loader2 className="animate-spin text-accent" />
              <span className="text-[13px] mt-3">{t("pay.verifying")}</span>
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
              <AlertCircle size={40} className="text-red-500" />
              <p className="text-red-500 font-medium mt-3">{error ?? t("pay.failed")}</p>
              <button onClick={start} className="mt-5 w-full sm:w-auto bg-accent text-white font-semibold px-7 py-4 sm:py-3 rounded-full shadow-glow hover:bg-accent-soft active:scale-[0.98] transition">
                {t("pay.retry")}
              </button>
            </div>
          )}

          {phase === "timeout" && (
            <div className="py-10 grid place-items-center">
              <AlertCircle size={40} className="text-amber-500" />
              <p className="font-semibold mt-3">{t("pay.timeoutTitle")}</p>
              <p className="text-[13px] text-muted mt-1.5 max-w-[18rem]">{t("pay.timeoutSub")}</p>
              <button onClick={() => setPhase("verifying")} className="mt-5 w-full sm:w-auto bg-accent text-white font-semibold px-7 py-4 sm:py-3 rounded-full shadow-glow hover:bg-accent-soft active:scale-[0.98] transition">
                {t("pay.checkStatus")}
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
          <ShieldCheck size={14} className="text-emerald-500" /> {t("pay.secure")}
        </div>

        {phase !== "success" && phase !== "redirecting" && (
          <button onClick={() => router.push("/orders")} className="mt-4 text-[13px] font-semibold text-muted hover:text-ink transition inline-flex items-center gap-1">
            {t("pay.later")} <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
