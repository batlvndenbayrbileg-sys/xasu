"use client";

import { useEffect } from "react";
import { RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production wire this to your error tracker (Sentry, etc.)
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] grid place-items-center px-6 pt-24">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 grid place-items-center mx-auto text-3xl">⚠️</div>
        <h1 className="font-display text-[28px] md:text-[36px] font-bold mt-6">Алдаа гарлаа</h1>
        <p className="text-muted mt-2">Уучлаарай, ямар нэг зүйл буруудлаа. Дахин оролдоно уу. <span className="opacity-70">(Something went wrong)</span></p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
          <button onClick={reset} className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-7 py-3.5 rounded-full shadow-glow hover:bg-accent-soft transition">
            <RotateCcw size={17} /> Дахин оролдох
          </button>
          <Link href="/" className="inline-flex items-center justify-center gap-2 bg-white border border-line font-semibold px-7 py-3.5 rounded-full hover:bg-neutral-50 transition">
            <Home size={17} /> Нүүр хуудас
          </Link>
        </div>
      </div>
    </div>
  );
}
