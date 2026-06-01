import { create } from "zustand";

// ⌘K command palette open/close state. Kept tiny and global so any component
// (header hint, keyboard handler) can toggle it.
interface CommandStore {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

export const useCommand = create<CommandStore>((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set({ open: !get().open }),
}));
