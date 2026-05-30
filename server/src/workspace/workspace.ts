// Brand Workspace — persistent brand memory: profile, confidence-ranked
// "learnings", and campaign history. This is what makes AInigma feel like a
// product (state that compounds over time) rather than a one-shot tool.
//
// Tools: JsonStore persistence (Node fs).

import { JsonStore } from "../lib/store.js";

export interface BrandProfile {
  name: string;
  tagline: string;
  voice: string;
  palette: string[];
}

export interface Learning {
  id: string;
  confidence: number; // 0..100
  text: string;
  learnedAt: number;
}

export interface HistoryEntry {
  id: string;
  campaignId: string;
  name: string;
  result: string;
  status: "live" | "optimized" | "archived";
  at: number;
}

export interface Workspace {
  profile: BrandProfile;
  learnings: Learning[];
  history: HistoryEntry[];
}

const SEED: Workspace = {
  profile: {
    name: "TERRA",
    tagline: "Sustainable performance footwear",
    voice: "Confident · guilt-free · aspirational",
    palette: ["#0f766e", "#22d3ee", "#a3e635", "#e8ecf7"],
  },
  learnings: [
    { id: "l1", confidence: 94, text: "Your audience skews eco-conscious and under-25; they reward proof over claims.", learnedAt: Date.now() },
    { id: "l2", confidence: 88, text: "Best-performing tone is confident, not playful. Guilt-driven angles underperform by ~40%.", learnedAt: Date.now() },
    { id: "l3", confidence: 82, text: "TikTok consistently outperforms Instagram ~3:1 for your performance-led hooks.", learnedAt: Date.now() },
    { id: "l4", confidence: 76, text: "Scarcity framing ('first 500 pairs') lifts conversion; broad value props stall.", learnedAt: Date.now() },
  ],
  history: [
    { id: "h1", campaignId: "seed-1", name: "Terra Runner launch", result: "+38% CTR vs benchmark", status: "optimized", at: Date.now() },
    { id: "h2", campaignId: "seed-2", name: "Trail line teaser", result: "Strong saves, low installs", status: "live", at: Date.now() },
    { id: "h3", campaignId: "seed-0", name: "Brand voice calibration", result: "Voice profile locked", status: "archived", at: Date.now() },
  ],
};

const store = new JsonStore<Workspace>("workspace", SEED);

export function getWorkspace(): Workspace {
  return store.get();
}

let seq = 0;
const uid = (p: string) => `${p}-${Date.now()}-${seq++}`;

/** Record a new campaign into history (called after a run completes). */
export function addHistory(entry: Omit<HistoryEntry, "id" | "at">): HistoryEntry {
  const h: HistoryEntry = { ...entry, id: uid("h"), at: Date.now() };
  store.update((w) => ({ ...w, history: [h, ...w.history].slice(0, 50) }));
  return h;
}

/** Add a learning (memory deepens over time). */
export function addLearning(text: string, confidence: number): Learning {
  const l: Learning = { id: uid("l"), text, confidence, learnedAt: Date.now() };
  store.update((w) => ({ ...w, learnings: [l, ...w.learnings].slice(0, 30) }));
  return l;
}

export function updateProfile(patch: Partial<BrandProfile>): BrandProfile {
  const updated = store.update((w) => ({ ...w, profile: { ...w.profile, ...patch } }));
  return updated.profile;
}
