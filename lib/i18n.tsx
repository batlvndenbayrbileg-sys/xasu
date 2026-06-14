"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Lang = "mn" | "en";

/* ───────────────────────── dictionary ───────────────────────── */
const DICT = {
  // nav
  "nav.home": { mn: "Нүүр", en: "Home" },
  "nav.menu": { mn: "Цэс", en: "Menu" },
  "nav.reserve": { mn: "Захиалга", en: "Reserve" },
  "nav.myBookings": { mn: "Миний захиалга", en: "My Bookings" },
  "nav.profile": { mn: "Профайл", en: "Profile" },
  "nav.favorites": { mn: "Дуртай", en: "Favorites" },
  "nav.signIn": { mn: "Нэвтрэх", en: "Sign in" },
  "fav.title": { mn: "Дуртай хоолнууд", en: "Your favorites" },
  "fav.sub": { mn: "Та зүрх дарж тэмдэглэсэн хоолнууд.", en: "Dishes you've hearted." },
  "fav.empty": { mn: "Одоохондоо дуртай хоол алга", en: "No favorites yet" },
  "fav.emptySub": { mn: "Цэс үзээд таалагдсан хоол дээрээ зүрхийг дараарай.", en: "Browse the menu and tap the heart on dishes you love." },
  "fav.browse": { mn: "Цэс үзэх", en: "Browse menu" },
  "fav.clear": { mn: "Бүгдийг арилгах", en: "Clear all" },
  "nav.reserveBtn": { mn: "Захиалах", en: "Reserve" },
  "common.location": { mn: "Лас Крусес, НЙ", en: "Las Cruces, NY" },
  "common.confirm": { mn: "Тийм", en: "Yes" },
  "common.cancel": { mn: "Болих", en: "Cancel" },
  "common.confirmTitle": { mn: "Баталгаажуулах", en: "Please confirm" },
  "toast.booked": { mn: "Ширээ амжилттай захиалагдлаа!", en: "Table booked successfully!" },
  "toast.cancelled": { mn: "Захиалга цуцлагдлаа", en: "Reservation cancelled" },
  "toast.saved": { mn: "Дуртайд хадгаллаа", en: "Saved to favorites" },
  "toast.favCleared": { mn: "Дуртай жагсаалт цэвэрлэгдлээ", en: "Favorites cleared" },

  // home
  "home.badge": { mn: "Гэгээн Валентины тусгай цэс — захиалга нээлттэй", en: "Valentine's exclusive menu — now booking" },
  "home.heroTitle": { mn: "GourmetGrove-д\nхайраа тэмдэглэе", en: "Celebrate love at\nGourmetGrove" },
  "home.heroSub": { mn: "Улирлын амтат цэс, шагналт дарсны сан, мөн та яг хаана суухаа сонгох боломжтой амьд интерактив танхимын зураг.", en: "Seasonal tasting menus, an award-winning cellar, and a live interactive floorplan so you can pick the exact table." },
  "home.reserve": { mn: "Ширээ захиалах", en: "Reserve a table" },
  "home.explore": { mn: "Цэс үзэх", en: "Explore menu" },
  "home.statRating": { mn: "Дундаж үнэлгээ", en: "Avg rating" },
  "home.statGuests": { mn: "Үйлчлүүлэгч", en: "Guests served" },
  "home.statCity": { mn: "Хотдоо", en: "In Las Cruces" },
  "home.kicker": { mn: "Бидний гал тогооноос", en: "From our kitchen" },
  "home.specials": { mn: "Өнөөдрийн онцлох", en: "Today's specials" },
  "home.viewMenu": { mn: "Бүх цэс", en: "View full menu" },
  "home.feat1Title": { mn: "Тогоочийн улирлын цэс", en: "Chef's seasonal menu" },
  "home.feat1Desc": { mn: "Орон нутгийн фермээс ээлжлэн солигдох хоол.", en: "Rotating dishes from local farms." },
  "home.feat2Title": { mn: "Яг өөрийн ширээгээ сонго", en: "Pick your exact table" },
  "home.feat2Desc": { mn: "Амьд танхимын зураг, бодит цагийн сул орон.", en: "Live floorplan, real-time availability." },
  "home.feat3Title": { mn: "Шагналт үйлчилгээ", en: "Award-winning service" },
  "home.feat3Desc": { mn: "12,000+ зочны 4.9 үнэлгээ.", en: "Rated 4.9 across 12,000+ guests." },
  "home.tasteKicker": { mn: "Амтны урлаг", en: "The art of taste" },
  "home.tasteTitle": { mn: "Амтат\nбүрэлдэхүүн", en: "Flavorful\ncomponents" },
  "home.tasteSub": { mn: "Таваг бүр гар урлал. Улирлын шинэхэн бүрэлдэхүүнийг төгс тэнцвэрт хүргэв.", en: "Every plate is craft. Seasonal components in perfect balance." },
  "home.marquee": { mn: "Шинэхэн · Улирлын · Гар урлал · Орон нутгийн", en: "Fresh · Seasonal · Handcrafted · Locally sourced" },
  "pho.headline": { mn: "ФО\nХҮН\nБҮХЭНД", en: "SOMETHING\nPHO\nEVERYONE" },
  "pho.cta": { mn: "Шимт тэжээл", en: "Nutrition Info" },
  "pho.s1Title": { mn: "Шимт ясны шөл", en: "Nutritious Bone Broths" },
  "pho.s1Sub": { mn: "Багадаа 12 цаг буцалгасан", en: "Simmered for a minimum of 12 hours" },
  "pho.s2Title": { mn: "Олон веган сонголт", en: "Loads Of Vegan Options" },
  "pho.s2Sub": { mn: "Ургамлын гаралтай аяга, төгс хийгдсэн", en: "Plant-based bowls, done right" },
  "pho.s3Title": { mn: "Шинэхэн чанасан хоол", en: "Freshly Cooked Food" },
  "pho.s3Sub": { mn: "Хөлдөөсөн, бэлэн савласан зүйл байхгүй", en: "Nothing is frozen or pre-packaged" },
  "pho.s4Title": { mn: "Анхилуун амт", en: "Aromatic & Spiced" },
  "pho.s4Sub": { mn: "Гар аргаар тэнцвэржүүлсэн ногоо, чинжүү", en: "Hand-balanced herbs and chili" },
  "home.tBadge": { mn: "Сэтгэгдэл", en: "Testimonials" },
  "home.tTitle": { mn: "Манай зочид юу гэж хэлдэг вэ", en: "What our guests say" },
  "home.tSub": { mn: "Биднийг сонгосон зочдынхоо чин сэтгэлийн сэтгэгдлийг уншаарай.", en: "Real words from the guests who dine with us." },
  "home.events": { mn: "Удахгүй болох арга хэмжээ", en: "Upcoming events" },
  "home.event1Title": { mn: "Нууц цэсний эрх", en: "Secret Menu Access" },
  "home.event1Desc": { mn: "Гэнэтийн хоол захиалж, тогоочийн ширээ дээр бэлтгэх онцгой бүтээлийг мэдрээрэй.", en: "Order a surprise dish and enjoy a unique creation crafted tableside by our head chef." },
  "home.event1Badge": { mn: "2 суудал үлдсэн", en: "2 seats left" },
  "home.event2Title": { mn: "Нууцлаг хоолны сорилт", en: "Mystery Dish Challenge" },
  "home.event2Desc": { mn: "Энгийн цэст байхгүй онцгой хоолны эрхийг нээж, амтлах чадвараа сори.", en: "Unlock dishes not on the regular menu and test your palate." },
  "home.reserveSpot": { mn: "Суудал захиалах", en: "Reserve a spot" },
  "home.ctaTitle": { mn: "Таны ширээ хүлээж байна.", en: "Your table is waiting." },
  "home.ctaSub": { mn: "Нэг минутаас бага хугацаанд захиал — танхим, цаг, яг суудлаа сонго.", en: "Reserve in under a minute — choose your zone, time, and exact seat." },
  "home.bookNow": { mn: "Одоо захиалах", en: "Book now" },

  // menu
  "menu.kicker": { mn: "Судлах", en: "Explore" },
  "menu.title": { mn: "Бидний цэс", en: "Our Menu" },
  "menu.sub": { mn: "Улирлын, орон нутгийн бүтээгдэхүүнээр бэлтгэв. Хоол дээр дарж найрлага, харшил, хослолыг үзнэ үү.", en: "Crafted from seasonal, locally-sourced produce. Tap any dish for ingredients, allergens and pairings." },
  "menu.search": { mn: "Хоол хайх", en: "Search dishes" },
  "menu.noResults": { mn: "Хайлтад тохирох хоол алга.", en: "No dishes match your search." },

  // dish
  "dish.back": { mn: "Буцах", en: "Back" },
  "dish.kcal": { mn: "ккал", en: "kcal" },
  "dish.min": { mn: "мин", en: "min" },
  "dish.ingredients": { mn: "Гол найрлага", en: "Key ingredients" },
  "dish.allergens": { mn: "Харшил үүсгэгч", en: "Allergens" },
  "dish.reserve": { mn: "Ширээ захиалах", en: "Reserve a table" },
  "dish.backToMenu": { mn: "Цэс рүү буцах", en: "Back to menu" },
  "dish.pairsWith": { mn: "Сайн зохицдог", en: "Pairs well with" },
  "dish.save": { mn: "Хадгалах", en: "Save" },
  "dish.saved": { mn: "Хадгалсан", en: "Saved" },

  // book
  "book.step": { mn: "3-аас 2-р алхам", en: "Step 2 of 3" },
  "book.title": { mn: "Ширээ захиалах", en: "Book a table" },
  "book.selectDate": { mn: "Огноо сонгох", en: "Select date" },
  "book.selectTime": { mn: "Цаг сонгох", en: "Select time" },
  "book.floorplan": { mn: "танхимын зураг", en: "floorplan" },
  "book.available": { mn: "Сул", en: "Available" },
  "book.selected": { mn: "Сонгосон", en: "Selected" },
  "book.reserved": { mn: "Захиалсан", en: "Reserved" },
  "book.taken": { mn: "Завгүй", en: "Taken" },
  "book.yourReservation": { mn: "Таны захиалга", en: "Your reservation" },
  "book.table": { mn: "Ширээ", en: "Table" },
  "book.date": { mn: "Огноо", en: "Date" },
  "book.time": { mn: "Цаг", en: "Time" },
  "book.selectOnMap": { mn: "Зураг дээрээс сонго", en: "Select on the map" },
  "book.partySize": { mn: "Зочдын тоо", en: "Party size" },
  "book.max": { mn: "Дээд тал нь", en: "Max" },
  "book.pickFirst": { mn: "Эхлээд ширээ сонго", en: "Pick a table first" },
  "book.confirm": { mn: "Захиалга баталгаажуулах", en: "Confirm reservation" },
  "book.selectTable": { mn: "Ширээ сонгох", en: "Select a table" },
  "book.noPrepay": { mn: "Урьдчилгаа төлбөргүй.", en: "No prepayment required." },
  "book.exceeds": { mn: "Зочдын тоо ширээний багтаамжаас хэтэрсэн.", en: "Party exceeds table capacity." },
  "book.today": { mn: "Өнөөдөр", en: "Today" },
  "book.tmrw": { mn: "Маргааш", en: "Tmrw" },
  "book.seats": { mn: "суудал", en: "seats" },
  "book.watchPosition": { mn: "Ширээний байршлыг үзэх", en: "Watch table position" },
  "v360.drag": { mn: "Эргүүлж тойрон хараарай", en: "Drag to look around" },
  "v360.ar": { mn: "360° / AR үзэмж", en: "360° / AR view" },
  "v360.bookNow": { mn: "Одоо захиалах", en: "Book now" },
  "v360.here": { mn: "Таны ширээ энд", en: "Your table is here" },
  "book.next": { mn: "Үргэлжлүүлэх", en: "Next" },
  "book.bookThis": { mn: "Энэ ширээг захиалах", en: "Book this table" },
  "book.tapToSee": { mn: "Бодит зургийг харахын тулд ширээ дээр дар", en: "Tap a table to see its real photo" },
  "book.realView": { mn: "Бодит харагдац", en: "Real view" },
  "step.details": { mn: "Мэдээлэл", en: "Details" },
  "step.table": { mn: "Ширээ", en: "Table" },
  "step.confirm": { mn: "Баталгаа", en: "Confirm" },

  // confirmation
  "conf.step": { mn: "3-аас 3-р алхам", en: "Step 3 of 3" },
  "conf.title": { mn: "Захиалга баталгаажлаа!", en: "Reservation confirmed!" },
  "conf.sub": { mn: "Бид таны захиалгад хадгаллаа. Баталгаажуулалт бүртгэгдсэн.", en: "We've saved it to your bookings. A confirmation has been recorded." },
  "conf.guests": { mn: "Зочид", en: "Guests" },
  "conf.people": { mn: "хүн", en: "people" },
  "conf.no": { mn: "Баталгааны дугаар", en: "Confirmation" },
  "conf.viewBookings": { mn: "Миний захиалгыг үзэх", en: "View my bookings" },
  "conf.backHome": { mn: "Нүүр хуудас руу", en: "Back to home" },
  "conf.notFound": { mn: "Захиалга олдсонгүй.", en: "Reservation not found." },
  "conf.paid": { mn: "Төлсөн", en: "Paid" },
  "conf.unpaid": { mn: "Төлөгдөөгүй", en: "Unpaid" },

  // payment
  "pay.title": { mn: "Депозит төлөх", en: "Pay deposit" },
  "pay.step": { mn: "3-аас 3-р алхам", en: "Step 3 of 3" },
  "pay.sub": { mn: "Захиалгаа баталгаажуулахын тулд депозит төлнө үү.", en: "Pay the deposit to confirm your reservation." },
  "pay.deposit": { mn: "Депозит", en: "Deposit" },
  "pay.payWith": { mn: "QPay-ээр төлөх", en: "Pay with QPay" },
  "pay.scan": { mn: "Банкны аппаараа QR кодыг уншуулна уу", en: "Scan the QR with your banking app" },
  "pay.waiting": { mn: "Төлбөрийг хүлээж байна…", en: "Waiting for payment…" },
  "pay.success": { mn: "Төлбөр амжилттай!", en: "Payment successful!" },
  "pay.failed": { mn: "Төлбөр амжилтгүй боллоо", en: "Payment failed" },
  "pay.retry": { mn: "Дахин оролдох", en: "Try again" },
  "pay.creating": { mn: "Бэлтгэж байна…", en: "Preparing…" },
  "pay.mockNote": { mn: "Туршилтын горим — төлбөр автоматаар амжилттай болно.", en: "Demo mode — payment auto-succeeds." },
  "pay.payNow": { mn: "Төлбөр төлөх", en: "Pay now" },
  "pay.later": { mn: "Дараа төлөх", en: "Pay later" },
  "pay.redirecting": { mn: "Аюулгүй төлбөрийн хуудас руу шилжүүлж байна…", en: "Redirecting to secure checkout…" },
  "pay.verifying": { mn: "Төлбөрийг баталгаажуулж байна…", en: "Verifying your payment…" },
  "pay.errorGeneric": { mn: "Төлбөр боловсруулахад алдаа гарлаа. Дахин оролдоно уу.", en: "Something went wrong processing the payment. Please try again." },
  "pay.timeoutTitle": { mn: "Төлбөр хараахан баталгаажаагүй байна", en: "Payment not confirmed yet" },
  "pay.timeoutSub": { mn: "Хэрэв та төлбөрөө төлсөн бол доорх товчоор төлвөө дахин шалгана уу.", en: "If you've already paid, re-check the status below." },
  "pay.checkStatus": { mn: "Төлбөрийн төлөв шалгах", en: "Check payment status" },
  "pay.secure": { mn: "Таны төлбөрийг Wire Payment найдвартай боловсруулна", en: "Payments are processed securely by Wire Payment" },

  // orders
  "orders.kicker": { mn: "Таны бүртгэл", en: "Your account" },
  "orders.title": { mn: "Миний захиалга", en: "My Bookings" },
  "orders.sub": { mn: "Удахгүй болох болон өнгөрсөн захиалга.", en: "Upcoming and past reservations." },
  "orders.tabUpcoming": { mn: "Удахгүй", en: "Upcoming" },
  "orders.tabCompleted": { mn: "Дууссан", en: "Completed" },
  "orders.tabCancelled": { mn: "Цуцалсан", en: "Cancelled" },
  "orders.signInToView": { mn: "Захиалгаа үзэхийн тулд нэвтэрнэ үү", en: "Sign in to view your bookings" },
  "orders.signIn": { mn: "Нэвтрэх", en: "Sign in" },
  "orders.none": { mn: "Захиалга алга", en: "Nothing here yet" },
  "orders.noneSub": { mn: "Эхний ширээгээ захиалаад эндээс хараарай.", en: "Book your first table to see it here." },
  "orders.reserve": { mn: "Ширээ захиалах", en: "Reserve a table" },
  "orders.cancel": { mn: "Захиалга цуцлах", en: "Cancel reservation" },
  "orders.confirmCancel": { mn: "Энэ захиалгыг цуцлах уу?", en: "Cancel this reservation?" },
  "orders.stConfirmed": { mn: "Баталгаажсан", en: "Confirmed" },
  "orders.stCompleted": { mn: "Дууссан", en: "Completed" },
  "orders.stCancelled": { mn: "Цуцалсан", en: "Cancelled" },

  // profile
  "profile.notSignedIn": { mn: "Та нэвтрээгүй байна", en: "You're not signed in" },
  "profile.notSignedSub": { mn: "Профайл болон захиалгаа удирдахын тулд нэвтэрнэ үү.", en: "Sign in to manage your profile and bookings." },
  "profile.memberSince": { mn: "Гишүүн болсон", en: "Member since" },
  "profile.activity": { mn: "Үйл ажиллагаа", en: "Activity" },
  "profile.myBookings": { mn: "Миний захиалга", en: "My bookings" },
  "profile.favourites": { mn: "Дуртай", en: "Favourites" },
  "profile.settings": { mn: "Тохиргоо", en: "Settings" },
  "profile.notifications": { mn: "Мэдэгдэл", en: "Notifications" },
  "profile.help": { mn: "Тусламж & дэмжлэг", en: "Help & support" },
  "profile.signOut": { mn: "Гарах", en: "Sign out" },

  // login
  "login.welcomeBack": { mn: "Тавтай морил", en: "Welcome back" },
  "login.createAccount": { mn: "Бүртгэл үүсгэх", en: "Create account" },
  "login.signinSub": { mn: "GourmetGrove-д үргэлжлүүлэхийн тулд нэвтэрнэ үү.", en: "Sign in to continue to GourmetGrove." },
  "login.signupSub": { mn: "Хэдхэн секундэд GourmetGrove-д нэгдээрэй.", en: "Join GourmetGrove in a few seconds." },
  "login.signin": { mn: "Нэвтрэх", en: "Sign in" },
  "login.signup": { mn: "Бүртгүүлэх", en: "Sign up" },
  "login.fullName": { mn: "Бүтэн нэр", en: "Full name" },
  "login.email": { mn: "И-мэйл хаяг", en: "Email address" },
  "login.password": { mn: "Нууц үг", en: "Password" },
  "login.terms": { mn: "Үргэлжлүүлснээр та Үйлчилгээний нөхцөл, Нууцлалын бодлогыг зөвшөөрнө.", en: "By continuing you agree to our Terms & Privacy Policy." },
  "login.heroTitle": { mn: "Мартагдашгүй\nүдэш хүлээж байна.", en: "An evening to\nremember awaits." },
  "login.heroSub": { mn: "Ширээ захиалах, захиалгаа удирдах, улирлын онцгой үйл явдлуудыг нээхийн тулд нэвтэрнэ үү.", en: "Sign in to reserve your table, manage bookings, and unlock our seasonal experiences." },

  // footer
  "footer.tagline": { mn: "Лас Крусесийн зүрхэнд улирлын зэрэглэлийн хоол, Валентины онцгой үйлчилгээ.", en: "Seasonal fine dining and an exclusive Valentine's experience in the heart of Las Cruces." },
  "footer.explore": { mn: "Судлах", en: "Explore" },
  "footer.visit": { mn: "Бидэн дээр ирэх", en: "Visit us" },
  "footer.hours": { mn: "Мяг–Ня · 17:00–23:00", en: "Tue–Sun · 17:00–23:00" },
  "footer.newsletter": { mn: "Мэдээлэл аваарай", en: "Stay in the loop" },
  "footer.newsletterSub": { mn: "Улирлын цэс & арга хэмжээ.", en: "Seasonal menus & events." },
  "footer.join": { mn: "Нэгдэх", en: "Join" },
  "footer.rights": { mn: "Бүх эрх хуулиар хамгаалагдсан.", en: "All rights reserved." },
  "footer.bannerTitle": { mn: "Ширээгээ зөв аргаар захиал.", en: "Reserve your table the right way." },
  "footer.bannerSub": { mn: "Улирлын цэс болон онцгой үйл явдлуудын мэдээллийг хамгийн түрүүнд аваарай.", en: "Get seasonal menus and exclusive event updates before anyone else." },
  "footer.subscribe": { mn: "Захиалах — Үнэгүй", en: "Subscribe – Free" },
} as const;

export type DictKey = keyof typeof DICT;

const CATEGORY: Record<string, { mn: string; en: string }> = {
  Specials: { mn: "Онцлох", en: "Specials" },
  Seasonal: { mn: "Улирлын", en: "Seasonal" },
  Appetizers: { mn: "Зууш", en: "Appetizers" },
  Main: { mn: "Үндсэн хоол", en: "Main courses" },
  Desserts: { mn: "Амттан", en: "Desserts" },
};

const ZONE: Record<string, { mn: string; en: string }> = {
  Indoor: { mn: "Доторх", en: "Indoor" },
  Outdoor: { mn: "Гадаа", en: "Outdoor" },
  "Garden Terrace": { mn: "Цэцэрлэгт", en: "Garden Terrace" },
  "Private Meeting": { mn: "Хувийн өрөө", en: "Private Meeting" },
};

/* ───────────────────────── context ───────────────────────── */
interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: DictKey) => string;
  tCat: (c: string) => string;
  tZone: (z: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("mn"); // Mongolian-first

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("gg_lang")) as Lang | null;
    if (saved === "en" || saved === "mn") setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("gg_lang", l); } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = l;
  }, []);

  const toggle = useCallback(() => setLang(lang === "mn" ? "en" : "mn"), [lang, setLang]);

  const t = useCallback((key: DictKey) => DICT[key]?.[lang] ?? key, [lang]);
  const tCat = useCallback((c: string) => CATEGORY[c]?.[lang] ?? c, [lang]);
  const tZone = useCallback((z: string) => ZONE[z]?.[lang] ?? z, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, toggle, t, tCat, tZone }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
