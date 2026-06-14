"use client";

import { motion } from "framer-motion";
import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns-1";
import { useI18n } from "@/lib/i18n";

/** Mongolian guest reviews. Portrait photos are stock placeholders — swap for
 *  real customer photos before launch. */
const DATA: { name: string; image: string; text: { mn: string; en: string }; role: { mn: string; en: string } }[] = [
  {
    name: "Болормаа Б.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
    text: {
      mn: "Төрсөн өдрөө энд тэмдэглэсэн юм. Ширээгээ урьдчилж сонгоод захиалсан нь үнэхээр тухтай байсан. Хоол, үйлчилгээ хоёулаа гайхалтай — заавал дахин ирнэ.",
      en: "I celebrated my birthday here. Picking and booking the exact table in advance was so convenient. Both the food and the service were wonderful — I'll definitely be back.",
    },
    role: { mn: "Байнгын үйлчлүүлэгч", en: "Regular guest" },
  },
  {
    name: "Тэмүүлэн Г.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80",
    text: {
      mn: "Захиалгын систем нь маш ойлгомжтой. Танхимын зургаас яг хүссэн ширээгээ сонгоод 360°-аар нь харах боломжтой нь үнэхээр сонирхолтой. Бүх зүйл хормын дотор болсон.",
      en: "The booking system is so intuitive. Choosing my exact table from the floorplan and viewing it in 360° was genuinely fun. Everything took just seconds.",
    },
    role: { mn: "Программ хангамжийн инженер", en: "Software engineer" },
  },
  {
    name: "Сараа Д.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
    text: {
      mn: "Найзуудтайгаа цугларахад тохиромжтой газар олдлоо. Веган сонголт ихтэй, амт нь гайхалтай. Үйлчлэгчид найрсаг, анхаарал халамжтай.",
      en: "Found the perfect spot to gather with friends. Loads of vegan options and the flavours are amazing. The staff are warm and attentive.",
    },
    role: { mn: "Маркетингийн менежер", en: "Marketing manager" },
  },
  {
    name: "Ганзориг Б.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
    text: {
      mn: "Ажлын уулзалтаа энд хийсэн. Хувийн өрөө нь чимээгүй, тухтай. Захиалга өөрчлөх, цуцлах нь ч хялбар. Бизнесийн уулзалтад үнэхээр тохиромжтой.",
      en: "Hosted a work meeting here. The private room is quiet and comfortable, and changing or cancelling a booking is effortless. Great for business.",
    },
    role: { mn: "Гүйцэтгэх захирал", en: "CEO" },
  },
  {
    name: "Уранцэцэг М.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200&q=80",
    text: {
      mn: "12 цаг буцалгасан ясны шөл нь үнэхээр амттай, шим тэжээллэг. Шинэхэн орц найрлагатай нь мэдрэгддэг. Гэр бүлээрээ байнга ирдэг боллоо.",
      en: "The 12-hour bone broth is so rich and nourishing — you can taste how fresh the ingredients are. My family now comes regularly.",
    },
    role: { mn: "Эмч", en: "Doctor" },
  },
  {
    name: "Батбаяр Т.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80",
    text: {
      mn: "Орчин нь үнэхээр гоё, гэрэл зураг авахад тохиромжтой. Хоол бүр уран бүтээл шиг тавигдаж ирдэг. Дотрын засал, гэрэлтүүлэг бүгд төгс.",
      en: "The atmosphere is beautiful and very photogenic. Every dish is plated like a work of art. The interior and lighting are just perfect.",
    },
    role: { mn: "Гэрэл зурагчин", en: "Photographer" },
  },
  {
    name: "Номинжин Э.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
    text: {
      mn: "Үнэ цэнэ нь үнэхээр зохистой. Дуртай хоолоо хадгалаад дараа нь амархан олдог болсон нь маш таалагдсан. Найзаа дагуулж ирэх дуртай газар.",
      en: "Genuinely good value. I love that I can save my favourite dishes and find them again easily. My go-to place to bring friends.",
    },
    role: { mn: "Оюутан", en: "Student" },
  },
  {
    name: "Мөнхтуяа С.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&h=200&q=80",
    text: {
      mn: "Үйлчилгээний хурд нь гайхалтай. Захиалга өгснөөс хойш бараг хүлээлгүй. Ажилтнууд хоол бүрийн талаар дэлгэрэнгүй тайлбарладаг нь сайшаалтай.",
      en: "The speed of service is excellent — almost no waiting after ordering. I really appreciate how the staff explain each dish in detail.",
    },
    role: { mn: "Худалдааны менежер", en: "Sales manager" },
  },
  {
    name: "Энхтайван Б.",
    image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&h=200&q=80",
    text: {
      mn: "Ширээ захиалах систем нь ухаалаг бөгөөд найдвартай. Хэзээ ч давхар захиалга гарч байгаагүй. Дизайн, технологи хоёрыг гоё хослуулсан байна.",
      en: "The reservation system is smart and reliable — never a double-booking. They've blended design and technology beautifully.",
    },
    role: { mn: "Архитектор", en: "Architect" },
  },
];

export default function Testimonials() {
  const { t, lang } = useI18n();
  const items: Testimonial[] = DATA.map((d) => ({
    name: d.name, image: d.image, text: d.text[lang], role: d.role[lang],
  }));
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
