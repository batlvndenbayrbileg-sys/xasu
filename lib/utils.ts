import { clsx, type ClassValue } from "clsx";

/** shadcn-style className combiner. (clsx-only — no tailwind-merge dependency.) */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
