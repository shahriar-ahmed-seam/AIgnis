import { create } from "zustand";

// ---------------------------------------------------------------------------
// /docs visibility + scheduling control (admin-managed).
// The public /docs page is visible only when enabled AND inside the scheduled
// window. Default window: June 10 (00:00) → June 14 (23:59), per spec.
// Persisted to localStorage; later this moves to the backend so it's global.
// ---------------------------------------------------------------------------

export type DocsMode = "scheduled" | "always" | "off";

interface DocsSettings {
  mode: DocsMode; // scheduled = use window; always = always on; off = hidden
  startISO: string; // window start (local datetime-local string)
  endISO: string; // window end
}

interface DocsStore extends DocsSettings {
  setMode: (m: DocsMode) => void;
  setStart: (v: string) => void;
  setEnd: (v: string) => void;
  reset: () => void;
  isPubliclyVisible: () => boolean;
}

const STORAGE_KEY = "aignis.docs.settings";

// Default — docs are publicly open (unlocked for judging). Switch back to
// "scheduled" with the window below to gate visibility again.
const YEAR = new Date().getFullYear();
const DEFAULTS: DocsSettings = {
  mode: "always",
  startISO: `${YEAR}-06-10T00:00`,
  endISO: `${YEAR}-06-14T23:59`,
};

function load(): DocsSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as DocsSettings) };
  } catch {
    /* ignore */
  }
  return DEFAULTS;
}

function save(s: DocsSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

const initial = load();

export const useDocs = create<DocsStore>((set, get) => ({
  ...initial,

  setMode: (mode) => {
    set({ mode });
    save({ mode, startISO: get().startISO, endISO: get().endISO });
  },
  setStart: (startISO) => {
    set({ startISO });
    save({ mode: get().mode, startISO, endISO: get().endISO });
  },
  setEnd: (endISO) => {
    set({ endISO });
    save({ mode: get().mode, startISO: get().startISO, endISO });
  },
  reset: () => {
    set({ ...DEFAULTS });
    save(DEFAULTS);
  },

  isPubliclyVisible: () => {
    const { mode, startISO, endISO } = get();
    if (mode === "off") return false;
    if (mode === "always") return true;
    const now = Date.now();
    const start = new Date(startISO).getTime();
    const end = new Date(endISO).getTime();
    return now >= start && now <= end;
  },
}));

/** Human-readable window status for the admin bar. */
export function windowStatus(s: DocsSettings): { label: string; live: boolean } {
  if (s.mode === "off") return { label: "Hidden", live: false };
  if (s.mode === "always") return { label: "Always public", live: true };
  const now = Date.now();
  const start = new Date(s.startISO).getTime();
  const end = new Date(s.endISO).getTime();
  if (now < start) return { label: "Scheduled — not yet open", live: false };
  if (now > end) return { label: "Window closed", live: false };
  return { label: "Live now", live: true };
}
