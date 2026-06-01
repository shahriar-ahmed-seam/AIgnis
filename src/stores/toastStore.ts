import { create } from "zustand";

// Lightweight global toast system. Fire from anywhere with
// useToast.getState().push({ ... }); auto-dismisses.

export type ToastTone = "success" | "info" | "violet";

export interface Toast {
  id: number;
  title: string;
  detail?: string;
  tone: ToastTone;
  glyph?: string;
}

interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

let tid = 0;

export const useToast = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = tid++;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    window.setTimeout(() => get().dismiss(id), 4200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience helper. */
export const toast = (t: Omit<Toast, "id">) => useToast.getState().push(t);
