import { create } from "zustand";
import {
  ALL_SOURCES,
  makeEvent,
  type StreamEvent,
  type StreamSource,
} from "../data/streamData";

// ---------------------------------------------------------------------------
// LIVE DATA STREAMS — global, always-on.
// The ingestion bus runs from app load (started once in App.tsx), not when the
// Streams tab is opened. Timers live in this module-level store, so switching
// tabs never resets the feed or the counters. The view is a pure reader.
// ---------------------------------------------------------------------------

interface StreamsStore {
  events: StreamEvent[];
  counts: Record<StreamSource, number>;
  paused: boolean;
  started: boolean;
  togglePaused: () => void;
  start: () => void;
  _timers: number[];
}

// Per-source cadence (ms). Each source emits on its own rhythm.
const CADENCE: Record<StreamSource, number> = {
  cdc: 1100,
  scraper: 2600,
  reviews: 1700,
  social: 3200,
};

// Seed a few events so the feed already looks alive the first time it's shown.
function seedEvents(): { events: StreamEvent[]; counts: Record<StreamSource, number> } {
  const counts: Record<StreamSource, number> = { cdc: 0, scraper: 0, reviews: 0, social: 0 };
  const events: StreamEvent[] = [];
  // 12 backdated events across sources
  for (let i = 0; i < 12; i++) {
    const src = ALL_SOURCES[i % ALL_SOURCES.length];
    const ev = makeEvent(src);
    ev.ts = Date.now() - (12 - i) * 1400;
    events.unshift(ev);
    counts[src] += 1;
  }
  // bump counters so throughput totals look like the bus has been running
  counts.cdc += 40;
  counts.scraper += 12;
  counts.reviews += 27;
  counts.social += 9;
  return { events, counts };
}

export const useStreams = create<StreamsStore>((set, get) => {
  const seeded = seedEvents();
  return {
    events: seeded.events,
    counts: seeded.counts,
    paused: false,
    started: false,
    _timers: [],

    togglePaused: () => set((s) => ({ paused: !s.paused })),

    start: () => {
      if (get().started) return; // idempotent
      const timers = ALL_SOURCES.map((src) =>
        window.setInterval(() => {
          if (get().paused) return;
          const ev = makeEvent(src);
          set((s) => ({
            events: [ev, ...s.events].slice(0, 60),
            counts: { ...s.counts, [src]: s.counts[src] + 1 },
          }));
        }, CADENCE[src])
      );
      set({ started: true, _timers: timers });
    },
  };
});
