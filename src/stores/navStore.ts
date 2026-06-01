import { create } from "zustand";
import { play } from "../lib/sound";

// Top-level platform sections. "studio" hosts the campaign pipeline flow
// (landing → activity → creative → pulse); the rest are platform modules.
export type Section =
  | "studio"
  | "command"
  | "graph"
  | "streams"
  | "observability"
  | "workspace"
  | "published"
  | "pricing"
  | "docs";

interface NavStore {
  section: Section;
  setSection: (s: Section) => void;
}

export const useNav = create<NavStore>((set) => ({
  section: "studio",
  setSection: (s) => {
    play("tick");
    set({ section: s });
  },
}));
