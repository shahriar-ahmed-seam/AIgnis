import { create } from "zustand";

// Top-level public screen routing (before the authenticated app).
//   welcome -> marketing landing
//   auth    -> login / register
// Once authenticated, App renders the full platform (AppShell + sections).
//
// We push a browser history entry when entering auth, so the browser Back
// button (and our own back controls) return to the landing page instead of
// leaving the site. App.tsx listens for popstate to sync this.
export type PublicScreen = "welcome" | "auth";

interface ScreenStore {
  screen: PublicScreen;
  authMode: "login" | "register";
  goWelcome: (fromHistory?: boolean) => void;
  goAuth: (mode?: "login" | "register") => void;
  setAuthMode: (mode: "login" | "register") => void;
}

export const useScreen = create<ScreenStore>((set, get) => ({
  screen: "welcome",
  authMode: "register",

  goAuth: (mode = "register") => {
    if (get().screen !== "auth") {
      try {
        window.history.pushState({ aignisScreen: "auth" }, "");
      } catch {
        /* ignore */
      }
    }
    set({ screen: "auth", authMode: mode });
  },

  // fromHistory = true when triggered by the browser Back button (popstate),
  // so we don't try to manipulate history again.
  goWelcome: (fromHistory = false) => {
    if (!fromHistory && get().screen === "auth") {
      // consume the entry we pushed when entering auth
      try {
        window.history.back();
        return; // popstate handler will set the screen
      } catch {
        /* fall through */
      }
    }
    set({ screen: "welcome" });
  },

  setAuthMode: (mode) => set({ authMode: mode }),
}));
