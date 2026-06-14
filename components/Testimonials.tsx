"use client";

import { motion } from "framer-motion";
import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns-1";
import { useI18n } from "@/lib/i18n";

/** Anonymised guest reviews — no names, no photos, just the words. */
const DATA: { mn: string; en: string }[] = [
  {
    mn: "Төрсөн өдрөө энд тэмдэглэсэн юм. Ширээгээ урьдчилж сонгоод захиалсан нь үнэхээр тухтай байсан. Хоол, үйлчилгээ хоёулаа гайхалтай — заавал дахин ирнэ.",
    en: "I celebrated my birthday here. Picking and booking the exact table in advance was so convenient. Both the food and the service were wonderful — I'll definitely be back.",
  },
  {
    mn: "Захиалгын систем нь маш ойлгомжтой. Танхимын зургаас яг хүссэн ширээгээ сонгоод 360°-аар нь харах боломжтой нь үнэхээр сонирхолтой.",
    en: "The booking system is so intuitive. Choosing my exact table from the floorplan and viewing it in 360° was genuinely fun.",
  },
  {
    mn: "Найзуудтайгаа цугларахад тохиромжтой газар олдлоо. Веган сонголт ихтэй, амт нь гайхалтай. Үйлчлэгчид найрсаг, анхаарал халамжтай.",
    en: "Found the perfect spot to gather with friends. Loads of vegan options and the flavours are amazing. The staff are warm and attentive.",
  },
  {
    mn: "Ажлын уулзалтаа энд хийсэн. Хувийн өрөө нь чимээгүй, тухтай. Захиалга өөрчлөх, цуцлах нь ч хялбар.",
    en: "Hosted a work meeting here. The private room is quiet and comfortable, and changing or cancelling a booking is effortless.",
  },
  {
    mn: "12 цаг буцалгасан ясны шөл нь үнэхээр амттай, шим тэжээллэг. Шинэхэн орц найрлагатай нь мэдрэгддэг.",
    en: "The 12-hour bone broth is so rich and nourishing — you can taste how fresh the ingredients are.",
  },
  {
    mn: "Орчин нь үнэхээр гоё, гэрэл зураг авахад тохиромжтой. Хоол бүр уран бүтээл шиг тавигдаж ирдэг.",
    en: "The atmosphere is beautiful and very photogenic. Every dish is plated like a work of art.",
  },
  {
    mn: "Үнэ цэнэ нь үнэхээр зохистой. Дуртай хоолоо хадгалаад дараа нь амархан олдог болсон нь маш таалагдсан.",
    en: "Genuinely good value. I love that I can save my favourite dishes and find them again easily.",
  },
  {
    mn: "Үйлчилгээний хурд нь гайхалтай. Захиалга өгснөөс хойш бараг хүлээлгүй. Ажилтнууд хоол бүрийн талаар дэлгэрэнгүй тайлбарладаг.",
    en: "The speed of service is excellent — almost no waiting after ordering. I really appreciate how the staff explain each dish in detail.",
  },
  {
    mn: "Ширээ захиалах систем нь ухаалаг бөгөөд найдвартай. Хэзээ ч давхар захиалга гарч байгаагүй. Дизайн, технологи хоёрыг гоё хослуулсан байна.",
    en: "The reservation system is smart and reliable — never a double-booking. They've blended design and technology beautifully.",
  },
];

export default function Testimonials() {
  const { t, lang } = useI18n();
  const label = t("home.guest");
  const items: Testimonial[] = DATA.map((d) => ({ text: d[lang], label }));
  const first = items.slice(0, 3);
  const second = items.slice(3, 6);
  const third = items.slice(6, 9);

  return (
    <section className="mt-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[560px] mx-auto text-center"
        >
          <span className="border border-line py-1 px-4 rounded-lg text-[13px] font-medium text-accent">{t("home.tBadge")}</span>
          <h2 className="font-display text-[32px] md:text-[42px] font-bold tracking-tight mt-5">{t("home.tTitle")}</h2>
          <p className="mt-4 text-muted">{t("home.tSub")}</p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-12 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={first} duration={15} />
          <TestimonialsColumn testimonials={second} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={third} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
}
