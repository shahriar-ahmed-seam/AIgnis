import { create } from "zustand";

// ---------------------------------------------------------------------------
// BRAND WORKSPACE — global, persistent brand memory.
// Seeded with a baseline, then grows over the session: confidence on existing
// learnings drifts upward slowly, and completing a campaign appends a history
// entry (wired from the pipeline). Persists to localStorage so it survives
// reloads — the product feels stateful across sessions, not a fresh demo.
// ---------------------------------------------------------------------------

export interface Learning {
  conf: number;
  text: string;
}

export interface HistoryEntry {
  date: string;
  name: string;
  result: string;
  status: "optimized" | "live" | "archived";
  color: string;
}

interface WorkspaceStore {
  learnings: Learning[];
  history: HistoryEntry[];
  memoryDepth: number;
  started: boolean;
  start: () => void;
  /** Called when a campaign run completes — deepens brand memory. */
  recordCampaign: (idea: string) => void;
  _timer?: number;
}

const SEED_LEARNINGS: Learning[] = [
  { conf: 94, text: "Your audience skews eco-conscious and under-25; they reward proof over claims." },
  { conf: 88, text: "Best-performing tone is confident, not playful. Guilt-driven angles underperform by ~40%." },
  { conf: 82, text: "TikTok consistently outperforms Instagram ~3:1 for your performance-led hooks." },
  { conf: 76, text: "Scarcity framing ('first 500 pairs') lifts conversion; broad value props stall." },
];

const SEED_HISTORY: HistoryEntry[] = [
  { date: "Day 1", name: "Terra Runner launch", result: "+38% CTR vs benchmark", status: "optimized", color: "#a3e635" },
  { date: "Day 1", name: "Trail line teaser", result: "Strong saves, low installs", status: "live", color: "#22d3ee" },
  { date: "Day 0", name: "Brand voice calibration", result: "Voice profile locked", status: "archived", color: "#6b748f" },
];

const STORAGE_KEY = "aignis.workspace";

function load(): { learnings: Learning[]; history: HistoryEntry[]; memoryDepth: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(s: { learnings: Learning[]; history: HistoryEntry[]; memoryDepth: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

const persisted = load();

function titleFor(idea: string): string {
  const clean = idea.trim().replace(/\s+/g, " ");
  const short = clean.length > 36 ? clean.slice(0, 36) + "…" : clean;
  return short ? short.charAt(0).toUpperCase() + short.slice(1) : "New campaign";
}

const RESULTS = [
  "+34% CTR vs benchmark",
  "Strong early saves",
  "+28% reach lift",
  "High intent, low CAC",
  "Outperformed on TikTok",
];

export const useWorkspace = create<WorkspaceStore>((set, get) => ({
  learnings: persisted?.learnings ?? SEED_LEARNINGS,
  history: persisted?.history ?? SEED_HISTORY,
  memoryDepth: persisted?.memoryDepth ?? 12,
  started: false,
  _timer: undefined,

  start: () => {
    if (get().started) return;
    // gently nudge confidence on learnings so the panel feels alive
    const id = window.setInterval(() => {
      set((s) => {
        const learnings = s.learnings.map((l) => ({
          ...l,
          conf: Math.min(99, l.conf + (Math.random() < 0.5 ? 1 : 0)),
        }));
        return { learnings };
      });
    }, 9000);
    set({ started: true, _timer: id });
  },

  recordCampaign: (idea) => {
    set((s) => {
      const entry: HistoryEntry = {
        date: "Just now",
        name: titleFor(idea),
        result: RESULTS[Math.floor(Math.random() * RESULTS.length)],
        status: "live",
        color: "#22d3ee",
      };
      const history = [entry, ...s.history].slice(0, 12);
      const memoryDepth = s.memoryDepth + 1;
      const next = { learnings: s.learnings, history, memoryDepth };
      save(next);
      return { history, memoryDepth };
    });
  },
}));
