"use client";
import { create } from "zustand";

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  danger: boolean;
  _resolve?: (v: boolean) => void;
  ask: (opts: { title?: string; message: string; danger?: boolean }) => Promise<boolean>;
  resolve: (v: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  title: "",
  message: "",
  danger: false,
  ask: ({ title = "", message, danger = false }) =>
    new Promise<boolean>((res) => {
      set({ open: true, title, message, danger, _resolve: res });
    }),
  resolve: (v) => {
    get()._resolve?.(v);
    set({ open: false, _resolve: undefined });
  },
}));

/** Promise-based confirm dialog usable anywhere. */
export function confirmDialog(opts: { title?: string; message: string; danger?: boolean }) {
  return useConfirmStore.getState().ask(opts);
}
