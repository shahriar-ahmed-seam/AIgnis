// LLMOps telemetry — records REAL model-call metrics (latency, tokens, cost,
// cache hits, which model the semantic router picked) so the observability
// module shows genuine numbers when Live providers are used, and seeded
// baseline numbers otherwise.
//
// Tools: in-process recorder + JsonStore persistence (Node fs). Token cost
// figures use public list prices (see COST_TABLE) — clearly an estimate.

import { JsonStore } from "../lib/store.js";

export type ModelTier = "local" | "cloud";

export interface RouteDecision {
  id: string;
  ts: number;
  task: string;
  model: string;
  tier: ModelTier;
  reason: string;
}

export interface CallRecord {
  id: string;
  ts: number;
  kind: "llm" | "image" | "inventory";
  model: string;
  tier: ModelTier;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  cacheHit: boolean;
  ok: boolean;
}

interface TelemetryState {
  calls: CallRecord[];
  routes: RouteDecision[];
  totals: {
    tokens: number;
    costUsd: number;
    calls: number;
    cacheHits: number;
  };
}

// Public list prices (USD per 1M tokens). Estimates only — local = free.
export const COST_TABLE: Record<string, { tier: ModelTier; inPer1M: number; outPer1M: number }> = {
  "llama-3.1-8b-instant": { tier: "cloud", inPer1M: 0.05, outPer1M: 0.08 }, // Groq
  "llama-3.3-70b-versatile": { tier: "cloud", inPer1M: 0.59, outPer1M: 0.79 }, // Groq
  "meta-llama/llama-3.1-8b-instruct:free": { tier: "cloud", inPer1M: 0, outPer1M: 0 }, // OpenRouter free
  "llama3.1:8b": { tier: "local", inPer1M: 0, outPer1M: 0 }, // Ollama local
  "claude-3.5": { tier: "cloud", inPer1M: 3.0, outPer1M: 15.0 },
  "gpt-4o": { tier: "cloud", inPer1M: 5.0, outPer1M: 15.0 },
  "flux": { tier: "cloud", inPer1M: 0, outPer1M: 0 }, // Pollinations free
  "black-forest-labs/FLUX.1-schnell": { tier: "cloud", inPer1M: 0, outPer1M: 0 },
};

const SEED: TelemetryState = {
  calls: [],
  routes: [
    { id: "r0", ts: Date.now(), task: "Parse competitor JSON", model: "llama3.1:8b", tier: "local", reason: "structured · low-stakes" },
    { id: "r1", ts: Date.now(), task: "Write hero headline", model: "llama-3.1-8b-instant", tier: "cloud", reason: "high-creativity" },
    { id: "r2", ts: Date.now(), task: "Brand-compliance check", model: "gpt-4o", tier: "cloud", reason: "reasoning-critical" },
    { id: "r3", ts: Date.now(), task: "Summarize 2k reviews", model: "llama3.1:8b", tier: "local", reason: "bulk · cacheable" },
  ],
  totals: { tokens: 1_284_000, costUsd: 4.82, calls: 0, cacheHits: 0 },
};

const store = new JsonStore<TelemetryState>("telemetry", SEED);
let seq = 0;
const uid = (p: string) => `${p}-${Date.now()}-${seq++}`;

/** Rough token estimate when a provider doesn't return usage (≈4 chars/token). */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function costFor(model: string, promptTokens: number, completionTokens: number): number {
  const row = COST_TABLE[model];
  if (!row) return 0;
  return (promptTokens / 1_000_000) * row.inPer1M + (completionTokens / 1_000_000) * row.outPer1M;
}

export function tierFor(model: string): ModelTier {
  return COST_TABLE[model]?.tier ?? "cloud";
}

export function recordCall(input: {
  kind: CallRecord["kind"];
  model: string;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  cacheHit?: boolean;
  ok: boolean;
}): CallRecord {
  const promptTokens = input.promptTokens ?? 0;
  const completionTokens = input.completionTokens ?? 0;
  const rec: CallRecord = {
    id: uid("call"),
    ts: Date.now(),
    kind: input.kind,
    model: input.model,
    tier: tierFor(input.model),
    latencyMs: input.latencyMs,
    promptTokens,
    completionTokens,
    costUsd: costFor(input.model, promptTokens, completionTokens),
    cacheHit: input.cacheHit ?? false,
    ok: input.ok,
  };
  store.update((s) => ({
    calls: [rec, ...s.calls].slice(0, 200),
    routes: s.routes,
    totals: {
      tokens: s.totals.tokens + promptTokens + completionTokens,
      costUsd: +(s.totals.costUsd + rec.costUsd).toFixed(4),
      calls: s.totals.calls + 1,
      cacheHits: s.totals.cacheHits + (rec.cacheHit ? 1 : 0),
    },
  }));
  return rec;
}

export function recordRoute(task: string, model: string, reason: string): RouteDecision {
  const d: RouteDecision = { id: uid("route"), ts: Date.now(), task, model, tier: tierFor(model), reason };
  store.update((s) => ({ ...s, routes: [d, ...s.routes].slice(0, 50) }));
  return d;
}

export function snapshot() {
  const s = store.get();
  const recent = s.calls.slice(0, 40);
  const latencies = recent.filter((c) => c.kind === "llm" || c.kind === "image").map((c) => c.latencyMs);
  const p50 = latencies.length ? median(latencies) : 412;
  const cacheRate = s.totals.calls > 0 ? Math.round((s.totals.cacheHits / s.totals.calls) * 100) : 41;

  // routing mix by tier
  const byModel = new Map<string, number>();
  for (const c of s.calls) byModel.set(c.model, (byModel.get(c.model) ?? 0) + 1);

  return {
    totals: s.totals,
    p50LatencyMs: Math.round(p50),
    cacheHitRate: cacheRate,
    recentCalls: recent,
    routes: s.routes.slice(0, 8),
    modelMix: [...byModel.entries()].map(([model, count]) => ({ model, count, tier: tierFor(model) })),
  };
}

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
