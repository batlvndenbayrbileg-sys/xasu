"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

export default function CartSuccess() {
  const { t } = useI18n();
  const clear = useCart((s) => s.clear);

  useEffect(() => { clear(); }, [clear]);

  return (
    <div className="pt-32 min-h-[80vh] grid place-items-center">
      <div className="max-w-md text-center px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="w-20 h-20 rounded-full bg-emerald-500 grid place-items-center shadow-[0_10px_40px_rgba(16,185,129,0.4)] mx-auto">
          <CheckCircle2 size={48} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <h1 className="font-display text-[28px] md:text-[32px] font-bold mt-6">{t("cart.success")}</h1>
        <p className="text-muted mt-3">Бид таны захиалгыг хүлээн авлаа. Удахгүй кухи рүү дамжуулна.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/menu" className="bg-accent text-white font-semibold px-7 py-3.5 rounded-full shadow-glow hover:bg-accent-soft transition">
            Дахин захиалах
          </Link>
          <Link href="/" className="bg-white border border-line text-ink font-semibold px-7 py-3.5 rounded-full hover:bg-neutral-50 transition">
            Нүүр буцах
          </Link>
        </div>
      </div>
    </div>
  );
}
