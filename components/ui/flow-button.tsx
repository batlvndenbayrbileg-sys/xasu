"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { forwardRef } from "react";
import clsx from "clsx";

interface FlowButtonProps {
  text: string;
  /** Tonal variant — `dark` for light bgs, `accent` for orange hover, `light` for dark bgs. */
  variant?: "dark" | "accent" | "light";
  className?: string;
  /** Optional Next link — when provided the button renders as an `<a>` so it can navigate. */
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}

/** Flow-style call-to-action: pill that morphs into a rounded rect on hover
 *  while a coloured circle wipes from center and the label slides right. */
export const FlowButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, FlowButtonProps>(
  ({ text, variant = "dark", className, href, type = "button", onClick, disabled }, ref) => {
    const tones =
      variant === "accent"
        ? {
            border: "border-accent/50",
            text: "text-ink",
            circle: "bg-accent",
            arrowStroke: "stroke-ink group-hover:stroke-white",
            hoverText: "hover:text-white",
          }
        : variant === "light"
        ? {
            border: "border-white/40",
            text: "text-white",
            circle: "bg-white",
            arrowStroke: "stroke-white group-hover:stroke-ink",
            hoverText: "hover:text-ink",
          }
        : {
            border: "border-[#333333]/40",
            text: "text-[#111111]",
            circle: "bg-[#111111]",
            arrowStroke: "stroke-[#111111] group-hover:stroke-white",
            hoverText: "hover:text-white",
          };

    const base = clsx(
      "group relative inline-flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] bg-transparent px-8 py-3 text-sm font-semibold cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:rounded-[12px] active:scale-[0.95] disabled:opacity-50 disabled:pointer-events-none",
      tones.border, tones.text, tones.hoverText, className,
    );

    const body = (
      <>
        <ArrowRight className={clsx(
          "absolute w-4 h-4 left-[-25%] fill-none z-[9] group-hover:left-4 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          tones.arrowStroke,
        )} />
        <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
          {text}
        </span>
        <span className={clsx(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full opacity-0 group-hover:w-[260px] group-hover:h-[260px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]",
          tones.circle,
        )} />
        <ArrowRight className={clsx(
          "absolute w-4 h-4 right-4 fill-none z-[9] group-hover:right-[-25%] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          tones.arrowStroke,
        )} />
      </>
    );

    if (href) {
      return (
        <Link href={href} ref={ref as React.Ref<HTMLAnchorElement>} className={base}>
          {body}
        </Link>
      );
    }
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type={type} onClick={onClick} disabled={disabled} className={base}>
        {body}
      </button>
    );
  },
);
FlowButton.displayName = "FlowButton";
