"use client";

import { motion } from "framer-motion";
import { Shield, Server, Lock, KeyRound, FileCheck, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const PILLARS = [
  { icon: Shield, mn: ["SOC 2 Type II", "Гадны аудитор баталгаажуулсан"], en: ["SOC 2 Type II", "Independently audited"] },
  { icon: Server, mn: ["99.99% uptime SLA", "Multi-region кластер"], en: ["99.99% uptime SLA", "Multi-region failover"] },
  { icon: Lock, mn: ["End-to-end encryption", "AES-256, TLS 1.3"], en: ["End-to-end encryption", "AES-256, TLS 1.3"] },
  { icon: KeyRound, mn: ["RBAC + SSO", "SAML, Google Workspace"], en: ["RBAC + SSO", "SAML, Google Workspace"] },
  { icon: FileCheck, mn: ["Audit log", "Бүх үйлдэл хадгалагдана"], en: ["Audit log", "Every action recorded"] },
  { icon: CheckCircle2, mn: ["PCI DSS L1", "Картын аюулгүй боловсруулалт"], en: ["PCI DSS Level 1", "Secure card processing"] },
];

export default function TrustSection() {
  const { t, lang } = useI18n();

  return (
    <section className="bg-[#0a0a14] text-white py-24 md:py-32 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[12px] font-bold tracking-[0.2em] text-emerald-400">{t("saas.trustKicker").toUpperCase()}</p>
          <h2 className="font-display text-[36px] md:text-[52px] font-bold tracking-tight mt-3 leading-[1.05]">{t("saas.trustTitle")}</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-12">
          {PILLARS.map(({ icon: Icon, mn, en }, i) => {
            const [t1, t2] = lang === "mn" ? mn : en;
            return (
              <motion.div
                key={t1}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-5 md:p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-300 grid place-items-center">
                  <Icon size={18} />
                </div>
                <h3 className="font-semibold text-[15px] mt-4">{t1}</h3>
                <p className="text-[13px] text-white/55 mt-1.5">{t2}</p>
              </motion.div>
            );
          })}
        </div>

        {/* compliance strip */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-[12px] text-white/55 font-bold tracking-widest uppercase">
          <span className="text-white/30">Compliance</span>
          {["SOC 2", "PCI DSS L1", "GDPR", "ISO 27001", "CCPA", "HIPAA-ready"].map((c) => (
            <span key={c} className="text-white/65">{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
