// Brand knowledge-graph (GraphRAG) ontology. Nodes are typed entities; edges
// are typed relationships. Positions are normalized (0..1) on a radial layout
// so the graph renders deterministically without a physics engine.

export type GraphNodeType =
  | "brand"
  | "audience"
  | "rule"
  | "competitor"
  | "channel"
  | "product"
  | "insight";

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  x: number; // 0..1
  y: number; // 0..1
  detail: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  rel: string;
}

export const NODE_STYLE: Record<GraphNodeType, { color: string; glyph: string; label: string }> = {
  brand: { color: "#e879f9", glyph: "✦", label: "Brand" },
  audience: { color: "#22d3ee", glyph: "◎", label: "Audience" },
  rule: { color: "#a3e635", glyph: "⬡", label: "Brand Rule" },
  competitor: { color: "#fb923c", glyph: "△", label: "Competitor" },
  channel: { color: "#a78bfa", glyph: "◈", label: "Channel" },
  product: { color: "#f472b6", glyph: "❖", label: "Product" },
  insight: { color: "#5ce8ff", glyph: "✸", label: "Insight" },
};

export const GRAPH_NODES: GraphNode[] = [
  { id: "brand", label: "TERRA", type: "brand", x: 0.5, y: 0.5, detail: "Sustainable performance footwear brand. Confident, guilt-free, aspirational voice." },

  { id: "aud-genz", label: "Gen Z Runners", type: "audience", x: 0.5, y: 0.16, detail: "Under-25 urban runners. Value proof over claims; respond to scarcity and authenticity." },
  { id: "aud-eco", label: "Eco-Conscious", type: "audience", x: 0.75, y: 0.24, detail: "Cross-generational sustainability buyers. Reject greenwashing; reward transparency." },
  { id: "aud-athlete", label: "Urban Athletes", type: "audience", x: 0.27, y: 0.24, detail: "Performance-first buyers who refuse to trade speed for sustainability." },

  { id: "rule-tone", label: "Tone: Confident", type: "rule", x: 0.84, y: 0.5, detail: "Never preachy or guilt-driven. Lead with capability, let sustainability be the proof." },
  { id: "rule-claim", label: "No Unverified Claims", type: "rule", x: 0.8, y: 0.74, detail: "Every eco claim must map to a verifiable material or process. Compliance-gated." },
  { id: "rule-palette", label: "Palette Lock", type: "rule", x: 0.2, y: 0.76, detail: "Teal / lime / off-white only. Diffusion prompts inherit these as hard constraints." },

  { id: "comp-a", label: "Allbirds", type: "competitor", x: 0.16, y: 0.5, detail: "Owns 'comfort + natural'. Gap: weak on performance running positioning." },
  { id: "comp-b", label: "Veja", type: "competitor", x: 0.3, y: 0.72, detail: "Owns 'fashion + transparency'. Gap: limited athletic credibility." },

  { id: "chan-tiktok", label: "TikTok", type: "channel", x: 0.62, y: 0.78, detail: "Best for the proof-driven, under-25 hook. 3:1 outperformance on eco-performance angle." },
  { id: "chan-ig", label: "Instagram", type: "channel", x: 0.5, y: 0.86, detail: "Strong for aesthetic studio shots; older skew. Lead with performance, not eco." },

  { id: "prod-runner", label: "Terra Runner", type: "product", x: 0.66, y: 0.36, detail: "Hero SKU. Ocean-plastic knit + plant foam. 1,840 units ready to ship." },
  { id: "ins-hook", label: "'Perform + Eco'", type: "insight", x: 0.36, y: 0.4, detail: "RAG-surfaced: #1 unmet need is performance without sustainability compromise. +88% signal." },
];

export const GRAPH_EDGES: GraphEdge[] = [
  { from: "brand", to: "aud-genz", rel: "targets" },
  { from: "brand", to: "aud-eco", rel: "targets" },
  { from: "brand", to: "aud-athlete", rel: "targets" },
  { from: "brand", to: "rule-tone", rel: "governed by" },
  { from: "brand", to: "rule-claim", rel: "governed by" },
  { from: "brand", to: "rule-palette", rel: "governed by" },
  { from: "brand", to: "prod-runner", rel: "sells" },
  { from: "brand", to: "comp-a", rel: "competes with" },
  { from: "brand", to: "comp-b", rel: "competes with" },
  { from: "prod-runner", to: "ins-hook", rel: "validated by" },
  { from: "ins-hook", to: "aud-athlete", rel: "resonates with" },
  { from: "aud-genz", to: "chan-tiktok", rel: "reached via" },
  { from: "aud-eco", to: "chan-ig", rel: "reached via" },
  { from: "rule-palette", to: "comp-b", rel: "differentiates from" },
  { from: "prod-runner", to: "chan-tiktok", rel: "promoted on" },
  { from: "rule-claim", to: "aud-eco", rel: "protects trust of" },
];
