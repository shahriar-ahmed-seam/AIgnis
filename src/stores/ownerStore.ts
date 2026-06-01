import { create } from "zustand";
import { usePublish } from "./publishStore";

// ---------------------------------------------------------------------------
// OWNER'S COMMAND CENTER — the post-launch "what happened & what's it worth"
// view that turns AIgnis from a generator into a product a founder pays for.
//
// Tracks every published post's performance climbing over time (a global timer,
// consistent with the other always-on stores), derives a plain-language Analyst
// read, and projects revenue / MRR. All synthetic but internally consistent and
// persisted, so it feels like a real, stateful business dashboard.
// ---------------------------------------------------------------------------

export interface PostPerf {
  postId: string;
  /** rolling impressions series (oldest → newest) */
  series: number[];
  impressions: number;
  engagements: number;
  clicks: number;
  conversions: number;
}

interface OwnerStore {
  perf: Record<string, PostPerf>;
  started: boolean;
  start: () => void;
  /** total estimated revenue across all posts (USD) */
  revenue: () => number;
  /** projected MRR if the founder keeps this cadence */
  projectedMrr: () => number;
  _timer?: number;
}

// economics knobs (clearly synthetic but sensible)
const AOV = 42; // avg order value $
const CADENCE_PER_MONTH = 12; // campaigns/mo a founder might run

function seedPerf(postId: string, base: number): PostPerf {
  const series = Array.from({ length: 10 }, (_, i) =>
    Math.round(base * (0.35 + (i / 9) * 0.65) * (0.9 + Math.random() * 0.2))
  );
  const impressions = series[series.length - 1];
  const engagements = Math.round(impressions * (0.04 + Math.random() * 0.03));
  const clicks = Math.round(impressions * (0.018 + Math.random() * 0.02));
  const conversions = Math.round(clicks * (0.06 + Math.random() * 0.05));
  return { postId, series, impressions, engagements, clicks, conversions };
}

export const useOwner = create<OwnerStore>((set, get) => ({
  perf: {},
  started: false,
  _timer: undefined,

  start: () => {
    if (get().started) return;

    const sync = () => {
      const posts = usePublish.getState().posts;
      set((s) => {
        const perf = { ...s.perf };
        for (const p of posts) {
          if (!perf[p.id]) {
            // seed from the post's headline-driven baseline (its views)
            perf[p.id] = seedPerf(p.id, Math.max(8000, p.views));
          } else {
            // grow it a little each tick — the campaign keeps performing
            const cur = perf[p.id];
            const next = Math.round(cur.impressions * (1 + 0.015 + Math.random() * 0.02));
            const series = [...cur.series.slice(1), next];
            perf[p.id] = {
              ...cur,
              series,
              impressions: next,
              engagements: cur.engagements + Math.round(Math.random() * 40),
              clicks: cur.clicks + Math.round(Math.random() * 18),
              conversions: cur.conversions + (Math.random() < 0.5 ? 1 : 0),
            };
          }
        }
        // drop perf for posts that no longer exist
        for (const id of Object.keys(perf)) {
          if (!posts.find((p) => p.id === id)) delete perf[id];
        }
        return { perf };
      });
    };

    sync();
    const id = window.setInterval(sync, 2500);
    set({ started: true, _timer: id });
  },

  revenue: () => {
    const perf = get().perf;
    const conv = Object.values(perf).reduce((a, p) => a + p.conversions, 0);
    return conv * AOV;
  },

  projectedMrr: () => {
    const perf = get().perf;
    const posts = Object.values(perf).length || 1;
    const conv = Object.values(perf).reduce((a, p) => a + p.conversions, 0);
    const avgConvPerPost = conv / posts;
    return Math.round(avgConvPerPost * CADENCE_PER_MONTH * AOV);
  },
}));
