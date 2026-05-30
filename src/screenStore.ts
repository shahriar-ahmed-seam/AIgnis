import { create } from "zustand";

// Top-level public screen routing (before the authenticated app).
//   welcome -> marketing landing
//   auth    -> login / register
// Once authenticated, App renders the full platform (AppShell + sections).
export type PublicScreen = "welcome" | "auth";

interface ScreenStore {
  screen: PublicScreen;
  authMode: "login" | "register";
  goWelcome: () => void;
  goAuth: (mode?: "login" | "register") => void;
  setAuthMode: (mode: "login" | "register") => void;
}

export const useScreen = create<ScreenStore>((set) => ({
  screen: "welcome",
  authMode: "register",
  goWelcome: () => set({ screen: "welcome" }),
  goAuth: (mode = "register") => set({ screen: "auth", authMode: mode }),
  setAuthMode: (mode) => set({ authMode: mode }),
}));
