import type { MockDataset } from "../types.js";
import { buildScript } from "./scriptBuilder.js";

// Backend mock data layer. Curated datasets to drive a complete simulated
// pipeline run with zero network. Mirrors the frontend datasets so simulated
// output matches what the UI already renders.

const sneakers: MockDataset = {
  presetId: "eco-sneakers",
  exampleLabel: "Eco-friendly sneakers",
  matchKeywords: ["shoe", "sneaker", "eco", "sustainable", "footwear"],
  tagline: "Sustainable footwear brand launch",
  palette: ["#0f766e", "#22d3ee", "#a3e635", "#e8ecf7"],
  copy: {
    headline: "Run Lighter. Tread Kinder.",
    body: "Meet TERRA — performance sneakers spun from ocean-bound plastic and plant foam. Zero compromise on speed, zero footprint left behind.",
    cta: "Claim Your First Pair",
  },
  heroImage: {
    src: "/heroes/eco-sneakers.png",
    alt: "Floating eco-friendly sneaker on a misty pastel studio backdrop",
    fallbackGradient:
      "radial-gradient(120% 120% at 30% 20%, #134e4a 0%, #0f766e 30%, #052e2b 70%), linear-gradient(135deg, #22d3ee33, #a3e63522)",
  },
  inventory: [
    { sku: "TERRA-RUN-01", name: "Terra Runner — Reef", stock: 1840, status: "ready" },
    { sku: "TERRA-RUN-02", name: "Terra Runner — Slate", stock: 320, status: "low" },
    { sku: "TERRA-TRL-01", name: "Terra Trail — Moss", stock: 0, status: "backorder" },
  ],
  agentScript: buildScript([
    { agent: "Researcher", pillar: "RAG", logs: ["retrieving 2,481 market signals across sustainable footwear…", "RAG match: 'ocean plastic' trending +210% QoQ", "top consumer pain point → 'eco but still want performance'"], handoffTo: "Analyst" },
    { agent: "Analyst", pillar: "MCP", logs: ["MCP query → local inventory: 14 SKUs, 3 ready to ship", "segmenting audience: Gen Z + urban athletes score highest", "sentiment vector locked: aspirational / guilt-free"], handoffTo: "Copywriter" },
    { agent: "Copywriter", pillar: "LLM", logs: ["drafting 6 headline candidates…", "selected: 'Run Lighter. Tread Kinder.' (resonance 0.94)", "CTA tuned for conversion intent"], handoffTo: "Visual_Director" },
    { agent: "Visual_Director", pillar: "Diffusion", logs: ["composing art direction brief: misty pastel studio, hero float", "diffusion prompt assembled → 1024×1024, brand palette locked", "rendering hero frame…"], handoffTo: "Operations" },
    { agent: "Operations", pillar: "Agentic", logs: ["assembling multimodal asset bundle", "QA pass: brand compliance ✓  contrast ✓  legibility ✓", "campaign ready for launch"] },
  ]),
};

const coldBrew: MockDataset = {
  presetId: "cold-brew",
  exampleLabel: "Cold brew coffee startup",
  matchKeywords: ["coffee", "brew", "cold brew", "drink", "beverage", "cafe"],
  tagline: "Craft beverage DTC launch",
  palette: ["#1c1917", "#f59e0b", "#a78bfa", "#e8ecf7"],
  copy: {
    headline: "Slow Brewed. Fast Living.",
    body: "NOCTURNE cold brew steeps for 20 hours so your morning takes 20 seconds. Single-origin, nitro-smooth, ridiculously awake.",
    cta: "Start Your Ritual",
  },
  heroImage: {
    src: "/heroes/cold-brew.png",
    alt: "Frosted cold brew can with condensation on a dark moody backdrop",
    fallbackGradient:
      "radial-gradient(120% 120% at 70% 20%, #422006 0%, #1c1917 45%, #0c0a09 80%), linear-gradient(135deg, #f59e0b22, #8b5cf622)",
  },
  inventory: [
    { sku: "NOCT-NITRO-12", name: "Nocturne Nitro 12pk", stock: 2600, status: "ready" },
    { sku: "NOCT-DECAF-12", name: "Nocturne Decaf 12pk", stock: 410, status: "low" },
    { sku: "NOCT-OAT-12", name: "Nocturne Oat-Milk 12pk", stock: 0, status: "backorder" },
  ],
  agentScript: buildScript([
    { agent: "Researcher", pillar: "RAG", logs: ["scanning 1,930 reviews across DTC coffee brands…", "RAG insight: 'nitro' + 'single origin' = premium signal", "gap found → nobody owns 'evening cold brew'"], handoffTo: "Analyst" },
    { agent: "Analyst", pillar: "MCP", logs: ["MCP query → roast inventory + margin table", "audience cluster: remote workers, creators, students", "price elasticity sweet spot: $3.80/can"], handoffTo: "Copywriter" },
    { agent: "Copywriter", pillar: "LLM", logs: ["generating brand voice: confident, nocturnal, witty", "headline locked: 'Slow Brewed. Fast Living.'", "microcopy + CTA generated"], handoffTo: "Visual_Director" },
    { agent: "Visual_Director", pillar: "Diffusion", logs: ["art direction: moody noir, condensation, rim light", "diffusion prompt → product hero, 4:5 social ratio", "rendering…"], handoffTo: "Operations" },
    { agent: "Operations", pillar: "Agentic", logs: ["bundling 3 channel variants (IG, TikTok, web)", "QA: legibility ✓  brand palette ✓", "campaign packaged"] },
  ]),
};

const fitnessApp: MockDataset = {
  presetId: "ai-fitness",
  exampleLabel: "AI fitness coaching app",
  matchKeywords: ["fitness", "workout", "gym", "health", "app", "coach", "training"],
  tagline: "Consumer health app launch",
  palette: ["#312e81", "#8b5cf6", "#22d3ee", "#e8ecf7"],
  copy: {
    headline: "Your Coach Never Sleeps.",
    body: "PULSE reads your recovery, mood, and schedule to build the only workout you'll actually do today. Adaptive AI training that meets you where you are.",
    cta: "Train Smarter Free",
  },
  heroImage: {
    src: "/heroes/ai-fitness.png",
    alt: "Athlete mid-motion with glowing data overlays on a dark gradient",
    fallbackGradient:
      "radial-gradient(120% 120% at 50% 10%, #1e1b4b 0%, #312e81 35%, #09090b 80%), linear-gradient(135deg, #8b5cf633, #22d3ee22)",
  },
  inventory: [
    { sku: "PULSE-FREE", name: "Pulse Free Tier", stock: 99999, status: "ready" },
    { sku: "PULSE-PRO", name: "Pulse Pro (monthly)", stock: 99999, status: "ready" },
    { sku: "PULSE-COACH", name: "Pulse + Human Coach", stock: 120, status: "low" },
  ],
  agentScript: buildScript([
    { agent: "Researcher", pillar: "RAG", logs: ["retrieving fitness-app churn studies + app-store reviews…", "RAG insight: #1 churn reason = 'plans don't adapt'", "trend: recovery-based training +180% search"], handoffTo: "Analyst" },
    { agent: "Analyst", pillar: "MCP", logs: ["MCP query → feature flags + pricing tiers", "audience: busy professionals score 0.93", "positioning: 'adaptive' over 'intense'"], handoffTo: "Copywriter" },
    { agent: "Copywriter", pillar: "LLM", logs: ["voice: motivating but never preachy", "headline locked: 'Your Coach Never Sleeps.'", "value props distilled to 3 lines"], handoffTo: "Visual_Director" },
    { agent: "Visual_Director", pillar: "Diffusion", logs: ["art direction: kinetic motion, HUD data overlays", "diffusion prompt → athlete hero, electric accents", "rendering…"], handoffTo: "Operations" },
    { agent: "Operations", pillar: "Agentic", logs: ["compiling app-store + paid-social creative set", "QA: accessibility ✓  motion-safe ✓", "launch bundle ready"] },
  ]),
};

const defaultDataset: MockDataset = {
  presetId: "default",
  exampleLabel: "Custom product idea",
  matchKeywords: [],
  tagline: "Custom brand launch",
  palette: ["#155e75", "#22d3ee", "#e879f9", "#e8ecf7"],
  copy: {
    headline: "Built For What's Next.",
    body: "AInigma turned your idea into a complete, on-brand campaign — copy, creative, and channel strategy — in a single autonomous pass.",
    cta: "Launch Campaign",
  },
  heroImage: {
    src: "/heroes/default.png",
    alt: "Abstract premium product hero on a cyan-violet gradient",
    fallbackGradient:
      "radial-gradient(120% 120% at 50% 15%, #155e75 0%, #4c1d95 45%, #09090b 82%), linear-gradient(135deg, #22d3ee33, #e879f922)",
  },
  inventory: [
    { sku: "SKU-001", name: "Core Product — A", stock: 1200, status: "ready" },
    { sku: "SKU-002", name: "Core Product — B", stock: 280, status: "low" },
    { sku: "SKU-003", name: "Core Product — C", stock: 0, status: "backorder" },
  ],
  agentScript: buildScript([
    { agent: "Researcher", pillar: "RAG", logs: ["retrieving market signals for your concept…", "RAG synthesis: 3 differentiators surfaced", "competitor whitespace identified"], handoffTo: "Analyst" },
    { agent: "Analyst", pillar: "MCP", logs: ["MCP query → local context store", "audience segments ranked by fit", "positioning angle locked"], handoffTo: "Copywriter" },
    { agent: "Copywriter", pillar: "LLM", logs: ["generating brand voice + headline options", "selecting highest-resonance variant", "CTA optimized for intent"], handoffTo: "Visual_Director" },
    { agent: "Visual_Director", pillar: "Diffusion", logs: ["art direction brief composed", "diffusion prompt assembled with brand palette", "rendering hero…"], handoffTo: "Operations" },
    { agent: "Operations", pillar: "Agentic", logs: ["assembling multimodal campaign bundle", "QA pass complete", "ready for launch"] },
  ]),
};

export const PRESETS: MockDataset[] = [sneakers, coldBrew, fitnessApp];
export const DEFAULT_DATASET = defaultDataset;

/** Resolve a dataset for a free-text idea. Always returns a dataset. */
export function resolveDataset(idea: string): MockDataset {
  const q = idea.toLowerCase();
  for (const ds of PRESETS) {
    if (ds.matchKeywords.some((k) => q.includes(k))) return ds;
  }
  return DEFAULT_DATASET;
}
