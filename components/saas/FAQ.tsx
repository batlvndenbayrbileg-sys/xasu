"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const FAQS = [
  {
    q: { mn: "Хэдэн өдрийн дотор амжилттай нэвтрэх вэ?", en: "How long does it take to go live?" },
    a: { mn: "Дунд хугацаа 7 хоног. Бид цэс, ширээний зураг, ажилчдын тохиргоог оруулж өгнө. Том сүлжээ 30 хоног.", en: "Typical go-live is 7 days. We handle menu import, floor plan, staff onboarding. Large chains ~30 days." },
  },
  {
    q: { mn: "Хуучин POS-тойгоо хэрэгцээтэй юу?", en: "Do I need to keep my current POS?" },
    a: { mn: "Үгүй. Xasu өөрт POS багтсан. Хэрэв Toast, Square ашигладаг бол хоёр чигт sync хийдэг.", en: "No — POS is built in. We also sync bidirectionally with Toast, Square if you keep them." },
  },
  {
    q: { mn: "Картын төлбөр аюулгүй юу?", en: "Is card processing safe?" },
    a: { mn: "PCI DSS Level 1 баталгаажуулсан. Картын мэдээллийг бид хадгалдаггүй — tokenize хийгээд орхино.", en: "PCI DSS Level 1 certified. We never store card data — it's tokenised at our processor." },
  },
  {
    q: { mn: "Гэрээ заавал жилийн юм уу?", en: "Are contracts annual?" },
    a: { mn: "Сар бүр төлж болно. Жилээр төлбөл 20% хямдрах болно.", en: "Month-to-month works. Annual saves 20%." },
  },
  {
    q: { mn: "Өгөгдлөө хэдийд ч экспортолж болох уу?", en: "Can I export my data anytime?" },
    a: { mn: "Тийм. CSV, API, эсвэл шууд Postgres backup. Та өгөгдлийнхөө эзэн.", en: "Yes — CSV, API, or a direct Postgres dump. You own your data." },
  },
  {
    q: { mn: "Multi-салбар хэрхэн ажилладаг?", en: "How does multi-venue work?" },
    a: { mn: "Нэг dashboard, олон салбар. Менежер бүр тус тусын зөвшөөрөлтэй.", en: "One dashboard, many venues. Per-venue permissions and per-venue staff." },
  },
];

export default function FAQ() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-[#fafaf7] py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[12px] font-bold tracking-[0.2em] text-accent">{t("saas.faqKicker").toUpperCase()}</p>
          <h2 className="font-display text-[36px] md:text-[52px] font-bold tracking-tight mt-3 leading-[1.05]">{t("saas.faqTitle")}</h2>
        </div>

        <div className="mt-12 bg-white border border-line rounded-3xl divide-y divide-line overflow-hidden shadow-card">
          {FAQS.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-start gap-4 text-left p-5 md:p-6 hover:bg-neutral-50 transition"
                >
                  <span className="font-display text-[14px] font-bold text-accent tracking-widest mt-1">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 font-semibold text-[16px] md:text-[17px]">{q[lang]}</span>
                  <ChevronDown size={18} className={`transition-transform mt-1 text-muted ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 md:px-6 pb-5 md:pb-6 pl-[64px] md:pl-[68px] text-[14.5px] text-neutral-700 leading-relaxed">{a[lang]}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
