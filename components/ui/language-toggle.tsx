"use client"

import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { useTheme } from "@/lib/theme"

interface LanguageToggleProps {
  className?: string
}

/** Sliding-pill toggle matching ThemeToggle, but switches МН / EN.
 *  Container appearance follows the theme; the knob position follows the language. */
export function LanguageToggle({ className }: LanguageToggleProps) {
  const { lang, toggle } = useI18n()
  const { isDark } = useTheme()
  const isMn = lang === "mn"

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
        isDark
          ? "bg-zinc-950 border border-zinc-800"
          : "bg-white border border-zinc-200",
        className
      )}
      onClick={toggle}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle() }}
      role="button"
      tabIndex={0}
      aria-label="Toggle language"
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full text-[10px] font-bold transition-transform duration-300",
            isMn
              ? "transform translate-x-0 bg-accent text-white"
              : "transform translate-x-8 bg-gray-200 text-gray-700"
          )}
        >
          {isMn ? "МН" : "EN"}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full text-[10px] font-bold transition-transform duration-300",
            isMn
              ? "bg-transparent text-gray-400"
              : "transform -translate-x-8 text-zinc-400"
          )}
        >
          {isMn ? "EN" : "МН"}
        </div>
      </div>
    </div>
  )
}
