// Core domain types for the AInigma demo frontend.
// These mirror the spec's data models (design.md) but trimmed to what the
// Phase 1 frontend needs to run a complete pipeline from mock data.

export type ModeLabel = "Live" | "Simulated";
export type ExecutionMode = "Simulated" | "Live";
export type TechPillar = "MCP" | "RAG" | "Diffusion" | "Agentic" | "LLM";
export type PipelineState = "idle" | "running" | "complete";

export type AgentName =
  | "Researcher"
  | "Analyst"
  | "Copywriter"
  | "Visual_Director"
  | "Operations";

export type AgentEventKind = "log" | "active" | "complete" | "handoff";

export interface AgentEvent {
  id: string;
  agent: AgentName;
  timestamp: number; // simulated ms offset from run start; ordering key
  kind: AgentEventKind;
  message: string;
  handoffTo?: AgentName;
  pillar?: TechPillar;
}

export interface MarketingCopy {
  headline: string;
  body: string;
  cta: string;
}

export interface ImageRef {
  /** local path under /public or a remote URL when Live */
  src: string;
  alt: string;
  /** CSS gradient fallback shown when the real asset isn't present yet */
  fallbackGradient: string;
}

export interface CreativeAsset {
  copy: MarketingCopy;
  copyLabel: ModeLabel;
  hero: ImageRef;
  heroLabel: ModeLabel;
  palette: string[]; // brand palette swatches derived for the campaign
}

export type ReelFormat = "reel" | "square" | "wide";

export interface ReelSpec {
  format: ReelFormat;
  label: string; // e.g. "TikTok / Reels 9:16"
  aspect: string; // css aspect-ratio
  channel: ChannelId;
}

export const REEL_SPECS: ReelSpec[] = [
  { format: "reel", label: "TikTok / Reels", aspect: "9 / 16", channel: "tiktok" },
  { format: "square", label: "Instagram Feed", aspect: "1 / 1", channel: "instagram" },
  { format: "wide", label: "Web / YouTube", aspect: "16 / 9", channel: "web" },
];

export interface MetricPoint {
  x: string;
  y: number;
}

export interface MetricSeries {
  id: string;
  title: string;
  xLabel: string;
  yLabel: string;
  points: MetricPoint[];
  accent: string;
}

export interface KpiStat {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}

export interface AnalyticsBundle {
  kpis: KpiStat[];
  market: MetricSeries;
  audience: MetricSeries;
  predictedPerformance: MetricSeries;
  label: ModeLabel;
}

export interface MarketSignal {
  label: string;
  detail: string;
  trend: string; // e.g. "+210%"
}

export interface ReviewSnippet {
  source: string;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
}

export interface InventoryRecord {
  sku: string;
  name: string;
  stock: number;
  status: "ready" | "low" | "backorder";
}

export interface IntelBundle {
  signals: MarketSignal[]; // RAG retrieval
  reviews: ReviewSnippet[]; // RAG over reviews
  inventory: InventoryRecord[]; // MCP context
}

export type ChannelId = "instagram" | "tiktok" | "web";

export type Sentiment = "positive" | "neutral" | "negative";

export interface ChannelComment {
  handle: string;
  text: string;
  sentiment: Sentiment;
}

export interface ChannelMetrics {
  impressions: number;
  engagementRate: number; // percent
  ctr: number; // percent
  conversions: number;
}

export interface ChannelPulse {
  id: ChannelId;
  name: string;
  handle: string;
  /** baseline metrics shown right after deploy */
  base: ChannelMetrics;
  /** improved metrics after the optimization loop */
  optimized: ChannelMetrics;
  comments: ChannelComment[];
  /** trend sparkline points (impressions over time) */
  spark: number[];
}

export interface PulseBundle {
  channels: ChannelPulse[];
  /** Analyst-agent plain-language commentary on what's happening */
  narrativeBase: string[];
  /** Analyst-agent commentary after optimization */
  narrativeOptimized: string[];
  /** what the optimization loop changed */
  optimizationActions: string[];
  /** rewritten headline the Copywriter produces during optimization */
  optimizedHeadline: string;
  label: ModeLabel;
}

export interface MockDataset {
  presetId: string;
  exampleLabel: string;
  matchKeywords: string[];
  tagline: string;
  agentScript: AgentEvent[];
  copy: MarketingCopy;
  heroImage: ImageRef;
  /** optional pre-rendered reel (a real MP4 under /public) used by the Video
   *  step as the "exported" social video for this campaign. */
  reelVideo?: string;
  analytics: AnalyticsBundle;
  intel: IntelBundle;
  pulse: PulseBundle;
}

export interface PillarStatus {
  pillar: TechPillar;
  mode: ExecutionMode;
}

export const AGENT_META: Record<
  AgentName,
  { label: string; role: string; color: string; pillar: TechPillar; glyph: string }
> = {
  Researcher: {
    label: "Researcher",
    role: "Market & trend retrieval",
    color: "#22d3ee",
    pillar: "RAG",
    glyph: "◎",
  },
  Analyst: {
    label: "Analyst",
    role: "Audience & sentiment",
    color: "#a78bfa",
    pillar: "MCP",
    glyph: "◈",
  },
  Copywriter: {
    label: "Copywriter",
    role: "Narrative & messaging",
    color: "#f472b6",
    pillar: "LLM",
    glyph: "✦",
  },
  Visual_Director: {
    label: "Visual Director",
    role: "Art direction & render",
    color: "#fb923c",
    pillar: "Diffusion",
    glyph: "❖",
  },
  Operations: {
    label: "Operations",
    role: "Assembly & deploy",
    color: "#a3e635",
    pillar: "Agentic",
    glyph: "⬡",
  },
};

export const AGENT_ORDER: AgentName[] = [
  "Researcher",
  "Analyst",
  "Copywriter",
  "Visual_Director",
  "Operations",
];

export const PILLAR_ORDER: TechPillar[] = [
  "MCP",
  "RAG",
  "Diffusion",
  "Agentic",
  "LLM",
];

export const PILLAR_META: Record<
  TechPillar,
  { label: string; tagline: string; detail: string; tech: string; color: string; glyph: string }
> = {
  MCP: {
    label: "Model Context Protocol",
    tagline: "Secure access to live enterprise context",
    detail:
      "An MCP server exposes local inventory, pricing and brand-guideline files directly to the agents — without piping private data to a public cloud. The Analyst agent queries it for real-time stock and margin context.",
    tech: "@modelcontextprotocol/sdk · local JSON/SQLite",
    color: "#a78bfa",
    glyph: "◈",
  },
  RAG: {
    label: "Retrieval-Augmented Generation",
    tagline: "Grounded market & sentiment intelligence",
    detail:
      "Scraped competitor data and customer reviews are embedded into a vector store. The Researcher agent runs semantic retrieval to surface trending hooks and consumer pain points before any copy is written.",
    tech: "pgvector · embeddings · semantic search",
    color: "#22d3ee",
    glyph: "◎",
  },
  Diffusion: {
    label: "Diffusion Image Generation",
    tagline: "On-brand hero creative, rendered to spec",
    detail:
      "The Visual Director composes an art-direction brief and prompts a diffusion model to render the hero image at the campaign's palette and aspect ratio — pixel output mapped to the brief.",
    tech: "Flux / SDXL · hosted inference",
    color: "#fb923c",
    glyph: "❖",
  },
  Agentic: {
    label: "Agentic Orchestration",
    tagline: "A stateful swarm that coordinates the loop",
    detail:
      "Five specialized agents hand context to one another through a stateful graph — research → analysis → copy → visual → assembly — each step gated and logged, the whole run autonomous end to end.",
    tech: "LangGraph-style state machine · event stream",
    color: "#a3e635",
    glyph: "⬡",
  },
  LLM: {
    label: "Large Language Model",
    tagline: "Brand voice, narrative & messaging",
    detail:
      "The Copywriter agent generates and ranks headline candidates, body copy and CTAs tuned to the retrieved audience signals, selecting the highest-resonance variant for the creative.",
    tech: "instruction-tuned LLM · structured output",
    color: "#f472b6",
    glyph: "✦",
  },
};
