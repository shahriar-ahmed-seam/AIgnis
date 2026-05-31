import { create } from "zustand";

// ---------------------------------------------------------------------------
// LLMOPS TELEMETRY — global, always-on.
// Token/cost/latency counters accumulate from app load (started once in
// App.tsx) so the Observability view always shows a running platform whose
// numbers only ever climb — never resetting to a baseline on tab switch.
// ---------------------------------------------------------------------------

export interface LatencyPoint {
  t: number;
  ms: number;
}

interface TelemetryStore {
  tokens: number;
  cost: number;
  latency: number;
  cacheHit: number;
  series: LatencyPoint[];
  started: boolean;
  start: () => void;
  _timer?: number;
}

const SERIES_LEN = 24;

function seedSeries(): LatencyPoint[] {
  return Array.from({ length: SERIES_LEN }, (_, i) => ({ t: i, ms: 380 + Math.random() * 120 }));
}

export const useTelemetry = create<TelemetryStore>((set, get) => ({
  // start mid-session so it feels like the platform has been up for a while
  tokens: 1_284_000,
  cost: 4.82,
  latency: 412,
  cacheHit: 41,
  series: seedSeries(),
  started: false,
  _timer: undefined,

  start: () => {
    if (get().started) return; // idempotent
    const id = window.setInterval(() => {
      set((s) => ({
        tokens: s.tokens + Math.floor(Math.random() * 4000 + 800),
        cost: +(s.cost + Math.random() * 0.04).toFixed(2),
        latency: Math.round(360 + Math.random() * 160),
        cacheHit: Math.round(38 + Math.random() * 10),
        series: [
          ...s.series.slice(1),
          { t: s.series[s.series.length - 1].t + 1, ms: 360 + Math.random() * 180 },
        ],
      }));
    }, 1500);
    set({ started: true, _timer: id });
  },
}));
