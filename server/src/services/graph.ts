// GraphRAG brand knowledge graph. An in-memory typed property graph with
// neighbor + breadth-first traversal queries. This is the "Neo4j-style" pillar
// implemented without a graph DB dependency (a real deployment would back this
// with Neo4j / the Cypher driver — the query shape here mirrors that).
//
// Tools: pure TypeScript graph structures (no external dependency).

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
  detail: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  rel: string;
}

const NODES: GraphNode[] = [
  { id: "brand", label: "TERRA", type: "brand", detail: "Sustainable performance footwear brand. Confident, guilt-free, aspirational voice." },
  { id: "aud-genz", label: "Gen Z Runners", type: "audience", detail: "Under-25 urban runners. Value proof over claims; respond to scarcity and authenticity." },
  { id: "aud-eco", label: "Eco-Conscious", type: "audience", detail: "Cross-generational sustainability buyers. Reject greenwashing; reward transparency." },
  { id: "aud-athlete", label: "Urban Athletes", type: "audience", detail: "Performance-first buyers who refuse to trade speed for sustainability." },
  { id: "rule-tone", label: "Tone: Confident", type: "rule", detail: "Never preachy or guilt-driven. Lead with capability, let sustainability be the proof." },
  { id: "rule-claim", label: "No Unverified Claims", type: "rule", detail: "Every eco claim must map to a verifiable material or process. Compliance-gated." },
  { id: "rule-palette", label: "Palette Lock", type: "rule", detail: "Teal / lime / off-white only. Diffusion prompts inherit these as hard constraints." },
  { id: "comp-a", label: "Allbirds", type: "competitor", detail: "Owns 'comfort + natural'. Gap: weak on performance running positioning." },
  { id: "comp-b", label: "Veja", type: "competitor", detail: "Owns 'fashion + transparency'. Gap: limited athletic credibility." },
  { id: "chan-tiktok", label: "TikTok", type: "channel", detail: "Best for the proof-driven, under-25 hook. 3:1 outperformance on eco-performance angle." },
  { id: "chan-ig", label: "Instagram", type: "channel", detail: "Strong for aesthetic studio shots; older skew. Lead with performance, not eco." },
  { id: "prod-runner", label: "Terra Runner", type: "product", detail: "Hero SKU. Ocean-plastic knit + plant foam. 1,840 units ready to ship." },
  { id: "ins-hook", label: "'Perform + Eco'", type: "insight", detail: "RAG-surfaced: #1 unmet need is performance without sustainability compromise. +88% signal." },
];

const EDGES: GraphEdge[] = [
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

const nodeById = new Map(NODES.map((n) => [n.id, n]));

export function getGraph() {
  return { nodes: NODES, edges: EDGES };
}

export function getNode(id: string): GraphNode | undefined {
  return nodeById.get(id);
}

/** Direct neighbors of a node with the connecting relationship + direction. */
export function neighbors(id: string) {
  if (!nodeById.has(id)) return null;
  const out = EDGES.filter((e) => e.from === id).map((e) => ({
    direction: "out" as const,
    rel: e.rel,
    node: nodeById.get(e.to)!,
  }));
  const inc = EDGES.filter((e) => e.to === id).map((e) => ({
    direction: "in" as const,
    rel: e.rel,
    node: nodeById.get(e.from)!,
  }));
  return { node: nodeById.get(id)!, neighbors: [...out, ...inc] };
}

/** Breadth-first traversal up to `depth` hops (mirrors a Cypher var-length path). */
export function traverse(startId: string, depth: number) {
  if (!nodeById.has(startId)) return null;
  const visited = new Set<string>([startId]);
  const layers: { hop: number; ids: string[] }[] = [{ hop: 0, ids: [startId] }];
  let frontier = [startId];

  for (let hop = 1; hop <= depth; hop++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const e of EDGES) {
        const other = e.from === id ? e.to : e.to === id ? e.from : null;
        if (other && !visited.has(other)) {
          visited.add(other);
          next.push(other);
        }
      }
    }
    if (next.length === 0) break;
    layers.push({ hop, ids: next });
    frontier = next;
  }

  return {
    start: nodeById.get(startId)!,
    depth,
    layers: layers.map((l) => ({ hop: l.hop, nodes: l.ids.map((id) => nodeById.get(id)!) })),
  };
}

/**
 * Brand-rule gate: given a candidate creative idea, return which rule nodes are
 * relevant. Used by the Copywriter/Visual agents to avoid rule violations.
 */
export function applicableRules(text: string) {
  const t = text.toLowerCase();
  const rules = NODES.filter((n) => n.type === "rule");
  return rules.map((r) => ({
    rule: r,
    triggered:
      (r.id === "rule-claim" && /(eco|sustain|green|recycl|ocean)/.test(t)) ||
      (r.id === "rule-tone" && /(guilt|save the planet|preach)/.test(t)) ||
      (r.id === "rule-palette" && /(color|colour|palette|red|blue|pink)/.test(t)),
  }));
}
