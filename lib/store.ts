"use client";
import { create } from "zustand";
import type { Zone } from "./types";

interface BookingState {
  zone: Zone;
  selectedTableId: string | null;
  partySize: number;
  date: string | null;      // YYYY-MM-DD
  time: string | null;      // HH:mm
  setZone: (z: Zone) => void;
  selectTable: (id: string | null) => void;
  setPartySize: (n: number) => void;
  setDate: (d: string) => void;
  setTime: (t: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  zone: "Indoor",
  selectedTableId: null,
  partySize: 2,
  date: null,
  time: null,
  setZone: (zone) => set({ zone, selectedTableId: null }),
  selectTable: (selectedTableId) => set({ selectedTableId }),
  setPartySize: (partySize) => set({ partySize }),
  setDate: (date) => set({ date }),
  setTime: (time) => set({ time }),
  reset: () => set({ selectedTableId: null, date: null, time: null, partySize: 2 }),
}));
