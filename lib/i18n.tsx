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
  "nav.cart": { mn: "Сагс", en: "Cart" },
  "cart.title": { mn: "Таны сагс", en: "Your cart" },
  "cart.sub": { mn: "Захиалсан хоолоо шалгаад төлбөрөө онлайнаар төлнө үү.", en: "Review your selection and pay securely online." },
  "cart.empty": { mn: "Сагс хоосон байна", en: "Your cart is empty" },
  "cart.emptySub": { mn: "Цэснээс хоол сонгож сагсандаа нэмээрэй.", en: "Pick something from the menu to get started." },
  "cart.browse": { mn: "Цэс үзэх", en: "Browse menu" },
  "cart.subtotal": { mn: "Дэд дүн", en: "Subtotal" },
  "cart.serviceFee": { mn: "Үйлчилгээний төлбөр (10%)", en: "Service fee (10%)" },
  "cart.total": { mn: "Нийт", en: "Total" },
  "cart.checkout": { mn: "Төлбөр төлөх", en: "Checkout" },
  "cart.processing": { mn: "Боловсруулж байна…", en: "Processing…" },
  "cart.qty": { mn: "Тоо", en: "Qty" },
  "cart.continue": { mn: "Цааш сонгох", en: "Add more" },
  "cart.itemRemoved": { mn: "Хоолыг сагснаас хаслаа", en: "Item removed" },
  "cart.success": { mn: "Захиалга амжилттай!", en: "Order placed!" },
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
  "home.badge": { mn: "Шинэ — Онлайн ширээ захиалга, амьд танхимын зураг", en: "New — Online table booking with live floor plan" },
  "home.heroTitle": { mn: "Зочлох ширээгээ\nөөрөө сонгож захиал", en: "Pick your table.\nBook in seconds." },
  "home.heroSub": { mn: "Хоол хүртэх дуртай ширээгээ танхимын зургаас сонгож, 360°-аар үзээд онлайнаар захиалаарай. Цаг алдалгүй, утсаар ярилгүйгээр — нэг минутын дотор баталгаажна.", en: "Browse our floor plan, view tables in 360°, and lock in your favourite spot online. No phone calls — confirmed in under a minute." },
  "home.reserve": { mn: "Ширээ захиалах", en: "Reserve a table" },
  "home.explore": { mn: "Цэс үзэх", en: "Explore menu" },
  "home.statRating": { mn: "Дундаж үнэлгээ", en: "Avg rating" },
  "home.statGuests": { mn: "Үйлчлүүлэгч", en: "Guests served" },
  "home.statCity": { mn: "Хотдоо", en: "In Las Cruces" },
  "home.kicker": { mn: "Шинэхэн цэс", en: "Fresh menu" },
  "home.specials": { mn: "Бэлэн захиалах хоол", en: "Ready to order" },
  "home.viewMenu": { mn: "Бүх цэс үзэх", en: "View full menu" },
  "home.feat1Title": { mn: "Танхимын зургаас шууд сонго", en: "Choose from a live floor plan" },
  "home.feat1Desc": { mn: "Бодит цагт сул, захиалагдсан ширээ хармагц харагдана. Дуртай булан, цонхны хажуу — хүссэн газраа эзэгнэ.", en: "See which tables are free, reserved or taken — right now. Window seat, quiet corner, you choose." },
  "home.feat2Title": { mn: "360°-аар орчныг шалга", en: "Preview in 360°" },
  "home.feat2Desc": { mn: "Ширээ бүрийг бодит зураг, эргэлдэх 360 видеогоор үзэж, очихоосоо өмнө сонголтоо шалгана.", en: "Real photos and a 360° walkthrough of every table — check before you commit." },
  "home.feat3Title": { mn: "Аюулгүй онлайн төлбөр", en: "Secure online payment" },
  "home.feat3Desc": { mn: "20,000₮ урьдчилгаагаа QPay-ээр хормын дотор төлж, захиалгаа баталгаажуулна. Зочлохдоо зочдодоо төвөг өгөхгүй.", en: "Pay your ₮20,000 deposit via QPay in seconds. Confirmed instantly, no awkward hand-offs at the door." },
  "home.tasteKicker": { mn: "Амтны урлаг", en: "The art of taste" },
  "home.tasteTitle": { mn: "Гар хийцийн\nүнэт амт", en: "Handcrafted\nflavour" },
  "home.tasteSub": { mn: "Таваг бүрийг манай тогооч өөрөө угсардаг. Орон нутгийн шинэхэн орцоор, улирал бүрт өөрчлөгдөх 30+ хоолтой.", en: "Every plate is built by our head chef using fresh local ingredients. Our menu rotates by season — 30+ dishes always evolving." },
  "home.experienceKicker": { mn: "Манай танхим", en: "Our dining room" },
  "home.experienceTitle": { mn: "Хоол шигээ\nүзэсгэлэнтэй\nорчин", en: "An ambience\nas crafted as\nthe food" },
  "home.experienceSub": { mn: "Дулаан гэрэлтүүлэг, зөөлөн хөгжим, нямбай тавьсан ширээ. Та зөвхөн хоолоо төдийгүй үдшийнхээ хамгийн сайхан мэдрэмжийг авч явна.", en: "Warm lighting, soft music, immaculate tables. You won't just remember the meal — you'll remember the evening." },
  "home.orderFood": { mn: "Хоол захиалах", en: "Order food" },
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
  "home.tTitle": { mn: "Зочдын яриа", en: "What guests say" },
  "home.tSub": { mn: "Бидэн дээр зочлоод сэтгэл хангалуун явсан үйлчлүүлэгчдийн жинхэнэ үг.", en: "Real words from guests who left full and happy." },
  "home.guest": { mn: "Үйлчлүүлэгч", en: "Guest" },
  "profile.shortcuts": { mn: "Хурдан холбоос", en: "Quick links" },

  /* ───────── SaaS landing (Xasu — Restaurant OS) ───────── */
  "saas.kicker": { mn: "AI-аар ажилладаг ресторан платформ", en: "AI-powered restaurant platform" },
  "saas.heroTitle": { mn: "Орчин үеийн ресторанд\nзориулсан үйлдлийн систем", en: "The operating system for\nmodern restaurants" },
  "saas.heroSub": { mn: "Захиалга, ширээ, төлбөр, харилцагч, ажилчид, шинжилгээ — бүгдийг нэг платформоос. Дундаж ресторан 6 сард 28%+ орлогын өсөлт авдаг.", en: "Reservations, tables, payments, customers, staff, analytics — all on one platform. The average restaurant sees 28%+ revenue lift in 6 months." },
  "saas.bookDemo": { mn: "Demo захиалах", en: "Book a demo" },
  "saas.watchTour": { mn: "Product tour үзэх", en: "Watch product tour" },
  "saas.trustedBy": { mn: "ИТГЭН АШИГЛАДАГ", en: "TRUSTED BY" },
  /* Problem */
  "saas.probKicker": { mn: "Асуудал", en: "The problem" },
  "saas.probTitle": { mn: "Орчин үеийн ресторанд хэт олон систем", en: "Modern restaurants run on too many disconnected systems" },
  "saas.probSub": { mn: "Захиалга нэг газар, төлбөр нөгөө газар, цэс гуравтаа, харилцагчийн түүх алга. Үр дүн — алдагдсан орлого.", en: "Bookings here, payments there, menu somewhere else, customer history nowhere. Result: lost revenue." },
  /* Modules */
  "saas.modKicker": { mn: "Платформ", en: "Platform" },
  "saas.modTitle": { mn: "Нэг платформ. 12 модуль.", en: "One platform. 12 modules." },
  "saas.modSub": { mn: "Ресторанд хэрэгтэй бүх зүйл нэг систем дотор, нэгдсэн өгөгдөлтэй.", en: "Everything a restaurant needs — in one system, on one shared data layer." },
  /* Tables */
  "saas.tableKicker": { mn: "Үндсэн боломж", en: "Flagship feature" },
  "saas.tableTitle": { mn: "Бодит цагийн ширээний удирдлага", en: "Real-time table management" },
  "saas.tableSub": { mn: "Танхимаа дэлгэцэн дээрээс нэг товчоор. Захиалсан, суусан, цэвэрлэгдэж буй ширээнүүдийг шууд харна.", en: "Run your floor from a single screen. See reserved, occupied, and cleaning tables update live." },
  /* Journey */
  "saas.journeyKicker": { mn: "Хэрэглэгчийн аялал", en: "Customer journey" },
  "saas.journeyTitle": { mn: "Захиалснаас үнэнч зочин болтол", en: "From first booking to loyal regular" },
  /* Dashboard */
  "saas.dashKicker": { mn: "Менежерийн dashboard", en: "Manager dashboard" },
  "saas.dashTitle": { mn: "Орлого, бөглөөсөл, тэнгийн харахад", en: "Revenue, occupancy, and forecast — at a glance" },
  /* AI */
  "saas.aiKicker": { mn: "AI боломж", en: "AI capabilities" },
  "saas.aiTitle": { mn: "AI таны үйл ажиллагааг тооцоолоход тусална", en: "AI that runs the numbers for you" },
  /* Mobile */
  "saas.mobKicker": { mn: "Гар утасны апп", en: "Mobile apps" },
  "saas.mobTitle": { mn: "Эзэн, менежер, зөөгч, зочин — бүгдэд апп", en: "Apps for owners, managers, servers, and guests" },
  /* Case */
  "saas.caseKicker": { mn: "Амжилтын түүх", en: "Case studies" },
  "saas.caseTitle": { mn: "Бодит ресторан. Бодит үр дүн.", en: "Real restaurants. Real results." },
  /* Trust */
  "saas.trustKicker": { mn: "Enterprise-grade", en: "Enterprise-grade" },
  "saas.trustTitle": { mn: "Найдвартай байдал. Аюулгүй байдал. Хяналт.", en: "Reliability. Security. Control." },
  /* Pricing */
  "saas.priceKicker": { mn: "Үнэ", en: "Pricing" },
  "saas.priceTitle": { mn: "Ресторан бүрд тохирох төлөвлөгөө", en: "A plan for every restaurant" },
  /* FAQ */
  "saas.faqKicker": { mn: "Түгээмэл асуултууд", en: "FAQ" },
  "saas.faqTitle": { mn: "Бид ийм асуултанд хариулдаг", en: "We get asked these often" },
  /* Final */
  "saas.finalTitle": { mn: "Рестораныхаа ирээдүйг өнөөдөр эхлүүл.", en: "Modernise your restaurant. Today." },
  "saas.finalSub": { mn: "30 минутын demo дотор бид яаж 6 сард 28% орлогын өсөлтөд хүрэхийг үзүүлнэ.", en: "In a 30-minute demo we'll show you exactly how restaurants reach 28% revenue lift in 6 months." },
  /* Nav */
  "saas.navPlatform": { mn: "Платформ", en: "Platform" },
  "saas.navPricing": { mn: "Үнэ", en: "Pricing" },
  "saas.navCustomers": { mn: "Хэрэглэгчид", en: "Customers" },
  "saas.navDemo": { mn: "Туршиж үзэх", en: "Live demo" },
  "home.events": { mn: "Удахгүй болох арга хэмжээ", en: "Upcoming events" },
  "home.event1Title": { mn: "Нууц цэсний эрх", en: "Secret Menu Access" },
  "home.event1Desc": { mn: "Гэнэтийн хоол захиалж, тогоочийн ширээ дээр бэлтгэх онцгой бүтээлийг мэдрээрэй.", en: "Order a surprise dish and enjoy a unique creation crafted tableside by our head chef." },
  "home.event1Badge": { mn: "2 суудал үлдсэн", en: "2 seats left" },
  "home.event2Title": { mn: "Нууцлаг хоолны сорилт", en: "Mystery Dish Challenge" },
  "home.event2Desc": { mn: "Энгийн цэст байхгүй онцгой хоолны эрхийг нээж, амтлах чадвараа сори.", en: "Unlock dishes not on the regular menu and test your palate." },
  "home.reserveSpot": { mn: "Суудал захиалах", en: "Reserve a spot" },
  "home.event3Title": { mn: "Валентины онцгой үдэш", en: "Valentine's Night Gala" },
  "home.event3Desc": { mn: "Лааны гэрэлд 6 хоолны тасрах хүртэлх амтат аялал, хосуудад зориулсан анхилуун коктейль.", en: "A 6-course tasting menu by candlelight, paired cocktails for couples." },
  "home.event3Badge": { mn: "Маш цөөн суудал", en: "Selling fast" },
  "home.event4Title": { mn: "Дарсны ширээ — Тоскана", en: "Wine Table — Tuscany" },
  "home.event4Desc": { mn: "Италийн өргөн сан хүлээж буй сомелиертэй уулзаж 5 төрлийн дарсыг амслана.", en: "Meet our sommelier and taste 5 Italian wines paired with regional bites." },
  "home.event5Title": { mn: "Тогоочийн ширээ — Live", en: "Chef's Table — Live" },
  "home.event5Desc": { mn: "Зөвхөн 8 зочин. Тогооч таны нүдэн дээр хоолоо бүтээж тайлбарлана.", en: "Just 8 seats. The chef cooks in front of you and tells the story of each plate." },
  "home.event5Badge": { mn: "Хязгаарлагдмал", en: "Limited" },
  "home.event6Title": { mn: "Бямба гарагийн жаз бранч", en: "Saturday Jazz Brunch" },
  "home.event6Desc": { mn: "Шинэхэн бранч цэс, амьд жаз гурвал — өглөөнөөс үдээс хойш хүртэл.", en: "Fresh brunch menu with a live jazz trio — morning into afternoon." },
  "home.eventDetails": { mn: "Дэлгэрэнгүй", en: "Details" },
  "home.eventPrev": { mn: "Өмнөх", en: "Previous" },
  "home.eventNext": { mn: "Дараах", en: "Next" },
  "home.ctaTitle": { mn: "Энэ оройн ширээгээ\nодоо л захиал.", en: "Lock in tonight's table\nright now." },
  "home.ctaSub": { mn: "Танхимын зургаас өөрийн дуртай ширээгээ хармагц сонгоод 20,000₮ урьдчилгаагаа төлвөл захиалга баталгаажлаа. Бүгд нэг минутын дотор.", en: "Pick your favourite spot from the live floor plan, pay the ₮20,000 deposit, and you're confirmed — under a minute, end-to-end." },
  "home.bookNow": { mn: "Захиалга хийх", en: "Book a table" },
  "home.ctaLive": { mn: "Шууд", en: "Live" },
  "home.ctaOpen": { mn: "Нээлттэй", en: "Open now" },
  "home.ctaSeats": { mn: "Өнөө орой сул", en: "Free tonight" },
  "home.ctaWait": { mn: "Хүлээх дундаж", en: "Avg wait" },
  "home.ctaMin": { mn: "минут", en: "min" },
  "home.ctaCall": { mn: "Утсаар захиалах", en: "Call to reserve" },
  "home.ctaUntil": { mn: "23:00 хүртэл", en: "until 23:00" },

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
  "book.noPrepay": { mn: "Урьдчилгаа: ₮20,000 · Захиалга баталгаажуулах учиртай", en: "Deposit: ₮20,000 · Required to confirm" },
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
  "book.stepOf": { mn: "{n}-ээс {i}-р алхам", en: "Step {i} of {n}" },
  "book.stepDate": { mn: "Огноо, цагаа сонго", en: "Pick date & time" },
  "book.stepTable": { mn: "Ширээ сонгох", en: "Choose a table" },
  "book.stepGuests": { mn: "Зочдын тоо", en: "Guests" },
  "book.stepReview": { mn: "Шалгаад баталгаажуулах", en: "Review & confirm" },
  "book.back": { mn: "Буцах", en: "Back" },
  "book.continueWith": { mn: "Үргэлжлүүлэх", en: "Continue" },
  "book.addFoodTitle": { mn: "Хоолоо одоо нэмэх үү?", en: "Add food now?" },
  "book.addFoodDesc": { mn: "Дуртай хоолоо сонгож, ширээн дээрээ ирэхэд бэлэн байг. Эсвэл одоо ширээгээ баталгаажуулаад дараа цэснээс сонгоход болно.", en: "Pre-select dishes so they're ready when you arrive — or just confirm now and order at the table." },
  "book.skipFood": { mn: "Дараа сонгоно", en: "Skip for now" },
  "book.pickFood": { mn: "Хоол сонгох", en: "Pick dishes" },
  "book.tableOk": { mn: "Энэ ширээг сонгох", en: "Choose this table" },
  "book.view360": { mn: "360° орчин", en: "360° view" },
  "book.tapTable": { mn: "Танхимаас ширээ дээр дар", en: "Tap a table on the plan" },
  "book.couldNotReserve": { mn: "Захиалга үүсгэж чадсангүй", en: "Could not create the reservation" },
  "book.bookedToast": { mn: "Ширээ амжилттай захиалагдлаа!", en: "Table booked successfully!" },
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
  "login.signinSub": { mn: "Xasu-д үргэлжлүүлэхийн тулд нэвтэрнэ үү.", en: "Sign in to continue to Xasu." },
  "login.signupSub": { mn: "Хэдхэн секундэд Xasu-д нэгдээрэй.", en: "Join Xasu in a few seconds." },
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
  "footer.emailPlaceholder": { mn: "Имэйл хаягаа оруулна уу", en: "Enter your email" },
  "footer.subscribeShort": { mn: "Бүртгүүлэх", en: "Subscribe" },
  "footer.subscribed": { mn: "Баярлалаа! Бид удахгүй холбоо барина.", en: "Thanks! We'll be in touch soon." },
} as const;

export type DictKey = keyof typeof DICT;

const CATEGORY: Record<string, { mn: string; en: string }> = {
  Specials: { mn: "Онцлох", en: "Specials" },
  Seasonal: { mn: "Улирлын", en: "Seasonal" },
  Appetizers: { mn: "Зууш", en: "Appetizers" },
  Main: { mn: "Үндсэн хоол", en: "Main courses" },
  Drinks: { mn: "Ундаа", en: "Drinks" },
  Snacks: { mn: "Зууш ундаа", en: "Snacks" },
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
