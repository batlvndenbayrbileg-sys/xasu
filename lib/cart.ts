"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CartItem {
  id: string;
  qty: number;
}
interface CartState {
  items: CartItem[];
  add: (id: string) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

/** Persistent food cart — survives refresh, cleared after successful checkout. */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (id) => set((s) => {
        const ex = s.items.find((x) => x.id === id);
        if (ex) return { items: s.items.map((x) => x.id === id ? { ...x, qty: x.qty + 1 } : x) };
        return { items: [...s.items, { id, qty: 1 }] };
      }),
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      setQty: (id, qty) => set((s) => ({
        items: qty <= 0 ? s.items.filter((x) => x.id !== id) : s.items.map((x) => x.id === id ? { ...x, qty } : x),
      })),
      clear: () => set({ items: [] }),
    }),
    { name: "xasu-cart", storage: createJSONStorage(() => localStorage) },
  ),
);
