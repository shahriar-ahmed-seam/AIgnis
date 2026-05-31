import { create } from "zustand";
import { probeBackend } from "../lib/api";
import { play } from "../lib/sound";

// ---------------------------------------------------------------------------
// Connection mode. "Live" drives runs from the backend; "Demo" runs the local
// in-browser engine. We probe the backend on load: if it's there, default to
// Live; otherwise Demo. The user can flip the switch any time, and a failed
// Live attempt automatically falls back to Demo so the app never stalls.
// ---------------------------------------------------------------------------

export type ConnectionMode = "Live" | "Demo";

interface ConnectionStore {
  mode: ConnectionMode;
  backendAvailable: boolean;
  probed: boolean;
  setMode: (m: ConnectionMode) => void;
  /** Probe the backend once and pick a sensible default mode. */
  init: () => Promise<void>;
  /** Called when a Live run fails — drop to Demo without a hard error. */
  markBackendDown: () => void;
}

const STORAGE_KEY = "aignis.connection.mode";

function loadPreferred(): ConnectionMode | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "Live" || v === "Demo" ? v : null;
  } catch {
    return null;
  }
}

function savePreferred(m: ConnectionMode) {
  try {
    localStorage.setItem(STORAGE_KEY, m);
  } catch {
    /* ignore */
  }
}

export const useConnection = create<ConnectionStore>((set, get) => ({
  mode: "Demo",
  backendAvailable: false,
  probed: false,

  setMode: (mode) => {
    play("tick");
    savePreferred(mode);
    set({ mode });
  },

  init: async () => {
    const available = await probeBackend();
    const preferred = loadPreferred();
    // Respect an explicit user choice; otherwise default to Live when available.
    const mode: ConnectionMode = preferred ?? (available ? "Live" : "Demo");
    set({ backendAvailable: available, probed: true, mode: available ? mode : "Demo" });
  },

  markBackendDown: () => {
    if (get().backendAvailable || get().mode === "Live") {
      set({ backendAvailable: false, mode: "Demo" });
    }
  },
}));
