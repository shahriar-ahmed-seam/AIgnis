// Campaign Pulse — post-launch performance + the self-optimization loop.
// Per-channel metrics with a deterministic "lift" applied when optimized, plus
// an Analyst-agent narrative. Persisted per campaign so it survives restarts.
//
// Tools: in-process model + JsonStore persistence (Node fs).

import { JsonStore } from "../lib/store.js";

export type ChannelId = "instagram" | "tiktok" | "web";

export interface ChannelMetrics {
  impressions: number;
  engagementRate: number;
  ctr: number;
  conversions: number;
}

export interface ChannelComment {
  handle: string;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
}

export interface ChannelPulse {
  id: ChannelId;
  name: string;
  handle: string;
  base: ChannelMetrics;
  optimized: ChannelMetrics;
  comments: ChannelComment[];
  spark: number[];
}

export interface PulseBundle {
  campaignId: string;
  presetId: string;
  optimized: boolean;
  channels: ChannelPulse[];
  narrativeBase: string[];
  narrativeOptimized: string[];
  optimizationActions: string[];
  optimizedHeadline: string;
  label: "Simulated" | "Live";
}

function improve(m: ChannelMetrics, lift: number): ChannelMetrics {
  return {
    impressions: Math.round(m.impressions * (1 + lift * 0.6)),
    engagementRate: +(m.engagementRate * (1 + lift)).toFixed(1),
    ctr: +(m.ctr * (1 + lift * 0.9)).toFixed(1),
    conversions: Math.round(m.conversions * (1 + lift * 1.2)),
  };
}

// preset pulse templates keyed by dataset presetId
interface ChannelSeed extends Omit<ChannelPulse, "optimized"> {
  lift: number;
}
interface PulseTemplate {
  channels: ChannelSeed[];
  narrativeBase: string[];
  narrativeOptimized: string[];
  optimizationActions: string[];
  optimizedHeadline: string;
}

const TEMPLATES: Record<string, PulseTemplate> = {
  "eco-sneakers": {
    optimizedHeadline: "Run Lighter. Leave Nothing Behind.",
    narrativeBase: [
      "Launch is live across 3 channels. TikTok is outperforming Instagram ~3:1 on the eco-performance hook.",
      "Under-25 viewers are the strongest responders; comments cluster around 'finally performance + sustainable'.",
      "Web landing CTR is healthy but bounce is high — the hero loads slower than the social creatives.",
    ],
    narrativeOptimized: [
      "Reallocated 40% of spend to TikTok and rewrote the Instagram hook to lead with performance.",
      "Engagement up across the board; the rewritten headline lifted Instagram CTR by ~70%.",
      "Web conversions climbed after surfacing the recycled-materials proof point above the fold.",
    ],
    optimizationActions: [
      "Shifted 40% budget Instagram → TikTok",
      "Rewrote Instagram headline (performance-first)",
      "Promoted 'ocean-plastic' proof point on web",
    ],
    channels: [
      { id: "tiktok", name: "TikTok", handle: "@terra.run", lift: 0.35, base: { impressions: 412000, engagementRate: 7.2, ctr: 3.1, conversions: 1840 }, spark: [20, 35, 48, 70, 88, 120, 160], comments: [
        { handle: "@maya.runs", text: "ok the ocean plastic thing is actually genius", sentiment: "positive" },
        { handle: "@sneakerhead_99", text: "but do they last though?? need durability proof", sentiment: "neutral" },
        { handle: "@ecoluke", text: "bought instantly. this is the future of footwear", sentiment: "positive" },
      ] },
      { id: "instagram", name: "Instagram", handle: "@terra.official", lift: 0.5, base: { impressions: 268000, engagementRate: 3.4, ctr: 1.6, conversions: 720 }, spark: [30, 32, 34, 33, 36, 38, 40], comments: [
        { handle: "@cityrunner", text: "love the look but the caption didn't grab me", sentiment: "neutral" },
        { handle: "@green.steps", text: "the pastel studio shots are gorgeous", sentiment: "positive" },
      ] },
      { id: "web", name: "Web Banner", handle: "terra.run", lift: 0.28, base: { impressions: 156000, engagementRate: 2.1, ctr: 2.4, conversions: 540 }, spark: [40, 44, 46, 45, 48, 52, 55], comments: [
        { handle: "analytics", text: "High intent traffic; bounce rate 58% on mobile.", sentiment: "neutral" },
      ] },
    ],
  },
};

// generic template used for any preset without a specific one
function genericTemplate(presetId: string): PulseTemplate {
  return {
    optimizedHeadline: "Optimized & Outperforming.",
    narrativeBase: [
      "Campaign is live across 3 channels. Short-form video is carrying early reach and engagement.",
      "TikTok leads on reach; web converts best per visit; Instagram engagement is softer.",
      "Opportunity: the broad message underperforms vs a single sharp differentiator.",
    ],
    narrativeOptimized: [
      `Sharpened the message for ${presetId} and rewrote the weakest-performing creative.`,
      "Engagement and CTR improved across all channels after the rewrite.",
      "Web conversions rose once the key proof point moved above the fold.",
    ],
    optimizationActions: ["Sharpened core message", "Rewrote underperforming headline", "Reordered web proof points"],
    channels: [
      { id: "tiktok", name: "TikTok", handle: "@yourbrand", lift: 0.34, base: { impressions: 320000, engagementRate: 6.0, ctr: 2.9, conversions: 1400 }, spark: [22, 38, 55, 78, 100, 130, 165], comments: [
        { handle: "@earlyadopter", text: "this is exactly what i've been looking for", sentiment: "positive" },
        { handle: "@curious_cat", text: "interesting but how is it different really?", sentiment: "neutral" },
      ] },
      { id: "instagram", name: "Instagram", handle: "@yourbrand", lift: 0.46, base: { impressions: 210000, engagementRate: 3.1, ctr: 1.5, conversions: 640 }, spark: [30, 31, 32, 31, 33, 35, 37], comments: [
        { handle: "@design.daily", text: "clean visuals, message didn't quite click for me", sentiment: "neutral" },
      ] },
      { id: "web", name: "Web Banner", handle: "yourbrand.com", lift: 0.3, base: { impressions: 138000, engagementRate: 2.2, ctr: 2.7, conversions: 520 }, spark: [38, 41, 43, 45, 47, 49, 53], comments: [
        { handle: "analytics", text: "Good intent signal; conversion sensitive to headline clarity.", sentiment: "neutral" },
      ] },
    ],
  };
}

const store = new JsonStore<Record<string, PulseBundle>>("pulse", {});

function buildBundle(campaignId: string, presetId: string, optimized: boolean): PulseBundle {
  const tpl = TEMPLATES[presetId] ?? genericTemplate(presetId);
  return {
    campaignId,
    presetId,
    optimized,
    label: "Simulated",
    narrativeBase: tpl.narrativeBase,
    narrativeOptimized: tpl.narrativeOptimized,
    optimizationActions: tpl.optimizationActions,
    optimizedHeadline: tpl.optimizedHeadline,
    channels: tpl.channels.map((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      base: c.base,
      optimized: improve(c.base, c.lift),
      comments: c.comments,
      spark: c.spark,
    })),
  };
}

/** Get-or-create a pulse bundle for a campaign. */
export function getPulse(campaignId: string, presetId: string): PulseBundle {
  const all = store.get();
  if (!all[campaignId]) {
    store.update((s) => ({ ...s, [campaignId]: buildBundle(campaignId, presetId, false) }));
  }
  return store.get()[campaignId];
}

/** Run the optimization loop — flips the bundle to its optimized variant. */
export function optimizePulse(campaignId: string): PulseBundle | null {
  const all = store.get();
  const existing = all[campaignId];
  if (!existing) return null;
  const updated: PulseBundle = { ...existing, optimized: true };
  store.update((s) => ({ ...s, [campaignId]: updated }));
  return updated;
}
