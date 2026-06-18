"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TableSessionState {
  /** Table ID selected in this dining session (from QR scan or manual pick). */
  tableId: string | null;
  /** "qr" => locked from URL, "manual" => user picked from website */
  source: "qr" | "manual" | null;
  setTable: (id: string, source: "qr" | "manual") => void;
  clear: () => void;
}

export const useTableSession = create<TableSessionState>()(
  persist(
    (set) => ({
      tableId: null,
      source: null,
      setTable: (id, source) => set({ tableId: id, source }),
      clear: () => set({ tableId: null, source: null }),
    }),
    { name: "xasu-table-session", storage: createJSONStorage(() => localStorage) },
  ),
);
