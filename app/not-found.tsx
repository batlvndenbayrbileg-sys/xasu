import Link from "next/link";
import { Home, UtensilsCrossed } from "lucide-react";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] grid place-items-center px-6 pt-24">
      <div className="text-center max-w-md">
        <span className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-accent text-white shadow-glow">
          <Logo size={36} />
        </span>
        <h1 className="font-display text-[64px] md:text-[88px] font-bold leading-none mt-6">404</h1>
        <p className="text-[17px] font-semibold mt-2">Хуудас олдсонгүй</p>
        <p className="text-muted mt-1.5">Таны хайсан хуудас байхгүй эсвэл зөөгдсөн байна. <span className="opacity-70">(Page not found)</span></p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
          <Link href="/" className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-7 py-3.5 rounded-full shadow-glow hover:bg-accent-soft transition">
            <Home size={17} /> Нүүр хуудас
          </Link>
          <Link href="/menu" className="inline-flex items-center justify-center gap-2 bg-white border border-line font-semibold px-7 py-3.5 rounded-full hover:bg-neutral-50 transition">
            <UtensilsCrossed size={17} /> Цэс үзэх
          </Link>
        </div>
      </div>
    </div>
  );
}
