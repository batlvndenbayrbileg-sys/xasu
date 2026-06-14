"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import clsx from "clsx";
import { sendJson } from "@/lib/fetcher";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="pt-40 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const { t } = useI18n();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const payload = mode === "login" ? { email: form.email, password: form.password } : form;
    const { ok, error } = await sendJson(endpoint, "POST", payload);
    setLoading(false);
    if (!ok) { setError(error ?? "Something went wrong"); return; }
    router.push(redirect);
    router.refresh();
  }

  const heroLines = t("login.heroTitle").split("\n");

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="relative h-full flex flex-col justify-end p-12 text-white">
          <span className="w-12 h-12 rounded-2xl bg-accent grid place-items-center text-2xl shadow-glow">🍽️</span>
          <h2 className="font-display text-[40px] font-bold mt-6 leading-tight">
            {heroLines.map((l, i) => <span key={i}>{l}{i < heroLines.length - 1 && <br />}</span>)}
          </h2>
          <p className="text-white/80 mt-3 max-w-md">{t("login.heroSub")}</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-24 lg:py-0">
        <div className="w-full max-w-md">
          <h1 className="font-display text-[32px] font-bold">{mode === "login" ? t("login.welcomeBack") : t("login.createAccount")}</h1>
          <p className="text-muted mt-1.5">{mode === "login" ? t("login.signinSub") : t("login.signupSub")}</p>

          <div className="flex bg-neutral-100 rounded-full p-1 mt-6 mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(null); }}
                className={clsx("flex-1 py-2.5 rounded-full text-[14px] font-semibold transition",
                  mode === m ? "bg-white shadow-sm text-ink" : "text-neutral-500")}>
                {m === "login" ? t("login.signin") : t("login.signup")}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === "signup" && <Field icon={<UserIcon size={17} />} placeholder={t("login.fullName")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />}
            <Field icon={<Mail size={17} />} type="email" placeholder={t("login.email")} value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field icon={<Lock size={17} />} type="password" placeholder={t("login.password")} value={form.password} onChange={(v) => setForm({ ...form, password: v })} />

            {error && <p className="text-[13px] text-red-500 px-1">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-accent text-white font-semibold py-4 rounded-full shadow-glow hover:bg-accent-soft transition flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && <Loader2 size={17} className="animate-spin" />}
              {mode === "login" ? t("login.signin") : t("login.createAccount")}
            </button>
          </form>

          <p className="text-center text-[12px] text-neutral-400 mt-6">{t("login.terms")}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, value, onChange, type = "text" }: {
  icon: React.ReactNode; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <label className="flex items-center gap-3 bg-white border border-line rounded-xl px-4 h-12 focus-within:border-accent transition">
      <span className="text-neutral-400">{icon}</span>
      <input type={type} placeholder={placeholder} value={value} required onChange={(e) => onChange(e.target.value)} className="flex-1 bg-transparent outline-none text-[15px]" />
    </label>
  );
}
