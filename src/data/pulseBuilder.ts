import type {
  ChannelComment,
  ChannelMetrics,
  ChannelPulse,
  PulseBundle,
} from "../types";

// Helper to author a per-dataset PulseBundle without repeating boilerplate.
// `lift` controls how much the optimization loop improves each channel.

interface ChannelSeed {
  id: ChannelPulse["id"];
  name: string;
  handle: string;
  base: ChannelMetrics;
  /** multiplier applied to base to get optimized metrics (per channel) */
  lift: number;
  comments: ChannelComment[];
  spark: number[];
}

interface PulseSeed {
  channels: ChannelSeed[];
  narrativeBase: string[];
  narrativeOptimized: string[];
  optimizationActions: string[];
  optimizedHeadline: string;
}

function improve(m: ChannelMetrics, lift: number): ChannelMetrics {
  return {
    impressions: Math.round(m.impressions * (1 + lift * 0.6)),
    engagementRate: +(m.engagementRate * (1 + lift)).toFixed(1),
    ctr: +(m.ctr * (1 + lift * 0.9)).toFixed(1),
    conversions: Math.round(m.conversions * (1 + lift * 1.2)),
  };
}

export function buildPulse(seed: PulseSeed): PulseBundle {
  return {
    label: "Simulated",
    narrativeBase: seed.narrativeBase,
    narrativeOptimized: seed.narrativeOptimized,
    optimizationActions: seed.optimizationActions,
    optimizedHeadline: seed.optimizedHeadline,
    channels: seed.channels.map((c) => ({
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
