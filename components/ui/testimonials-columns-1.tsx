"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export interface Testimonial {
  text: string;
  /** Anonymised display label, e.g. "Үйлчлүүлэгч". */
  label?: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2).fill(0)].map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, label }, i) => (
              <div
                className="relative p-8 rounded-3xl border border-line bg-white shadow-card max-w-xs w-full"
                key={i}
              >
                <Quote size={22} className="text-accent/70 absolute top-5 right-5" strokeWidth={2.4} />
                <p className="text-[14px] leading-relaxed text-neutral-700">{text}</p>
                {label && (
                  <p className="mt-5 text-[12px] font-semibold tracking-wide uppercase text-accent">{label}</p>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
