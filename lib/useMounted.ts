"use client";
import { useEffect, useState } from "react";

/** Returns true only after the first client render — guards against hydration
 *  mismatches when reading client-only state (localStorage-backed stores). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
