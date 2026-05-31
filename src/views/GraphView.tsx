import { useState } from "react";
import { motion } from "framer-motion";
import {
  GRAPH_EDGES,
  GRAPH_NODES,
  NODE_STYLE,
  type GraphNode,
} from "../data/graphData";
import { ModeIndicator } from "../components/ui/ModeIndicator";
import { useGraph } from "../stores/graphStore";
import { play } from "../lib/sound";

/**
 * GraphRAG Knowledge Graph — the brand ontology as an interactive node graph.
 * Selection persists globally (graphStore) and, when the user isn't hovering,
 * an ambient "query" continuously traverses the graph — so it always looks
 * like the agents are reasoning over it. Hovering takes over the highlight.
 */
export function GraphView() {
  const selected = useGraph((s) => s.selected);
  const setSelected = useGraph((s) => s.setSelected);
  const autoQuery = useGraph((s) => s.autoQuery);
  const setUserActive = useGraph((s) => s.setUserActive);
  const [hovered, setHovered] = useState<string | null>(null);

  // hover wins; else the ambient auto-query; else the persisted selection.
  const focus = hovered ?? autoQuery ?? selected;
  const neighbors = new Set<string>();
  if (focus) {
    neighbors.add(focus);
    GRAPH_EDGES.forEach((e) => {
      if (e.from === focus) neighbors.add(e.to);
      if (e.to === focus) neighbors.add(e.from);
    });
  }

  const selectedNode = GRAPH_NODES.find((n) => n.id === selected) ?? null;
  const W = 1000;
  const H = 680;

  const nodeById = (id: string) => GRAPH_NODES.find((n) => n.id === id)!;

  // count node types for the legend/stats
  const typeCounts = GRAPH_NODES.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col px-8 py-6">
      <SectionHeader
        title="Brand Knowledge Graph"
        subtitle="GraphRAG ontology · brand rules, audiences, competitors & channels as a queryable graph"
        pillar="Neo4j-style GraphDB"
      />

      <div className="grid flex-1 grid-cols-[1fr_320px] gap-6 overflow-hidden">
        {/* graph canvas */}
        <div className="panel relative overflow-hidden">
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-1.5">
            {Object.entries(NODE_STYLE).map(([type, s]) => (
              <span
                key={type}
                className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-void-900/60 px-2 py-1 font-mono text-[10px] text-ink-300 backdrop-blur"
              >
                <span style={{ color: s.color }}>{s.glyph}</span>
                {s.label}
                <span className="text-ink-700">{typeCounts[type] ?? 0}</span>
              </span>
            ))}
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
            {/* edges */}
            {GRAPH_EDGES.map((e, i) => {
              const a = nodeById(e.from);
              const b = nodeById(e.to);
              const lit =
                focus && (neighbors.has(e.from) && neighbors.has(e.to)) &&
                (e.from === focus || e.to === focus);
              const x1 = a.x * W;
              const y1 = a.y * H;
              const x2 = b.x * W;
              const y2 = b.y * H;
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              return (
                <g key={i}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={lit ? "#a78bfa" : "rgba(255,255,255,0.08)"}
                    strokeWidth={lit ? 1.6 : 0.8}
                  />
                  {lit && (
                    <text
                      x={mx}
                      y={my - 4}
                      textAnchor="middle"
                      className="fill-violet-glow font-mono"
                      style={{ fontSize: 11 }}
                    >
                      {e.rel}
                    </text>
                  )}
                </g>
              );
            })}

            {/* nodes */}
            {GRAPH_NODES.map((n) => {
              const s = NODE_STYLE[n.type];
              const dimmed = focus ? !neighbors.has(n.id) : false;
              const isFocus = n.id === focus;
              const r = n.type === "brand" ? 34 : 24;
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x * W}, ${n.y * H})`}
                  className="cursor-pointer"
                  opacity={dimmed ? 0.3 : 1}
                  onMouseEnter={() => {
                    setHovered(n.id);
                    setUserActive(true);
                  }}
                  onMouseLeave={() => {
                    setHovered(null);
                    setUserActive(false);
                  }}
                  onClick={() => {
                    play("tick");
                    setSelected(n.id);
                  }}
                >
                  {isFocus && (
                    <circle r={r + 8} fill="none" stroke={s.color} strokeWidth={1} opacity={0.4}>
                      <animate attributeName="r" values={`${r + 4};${r + 12};${r + 4}`} dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    r={r}
                    fill={`${s.color}1f`}
                    stroke={s.color}
                    strokeWidth={isFocus ? 2.4 : 1.4}
                    style={{ filter: isFocus ? `drop-shadow(0 0 10px ${s.color})` : "none" }}
                  />
                  <text textAnchor="middle" dy="6" style={{ fontSize: r * 0.7, fill: s.color }}>
                    {s.glyph}
                  </text>
                  <text
                    textAnchor="middle"
                    dy={r + 16}
                    className="fill-ink-100 font-semibold"
                    style={{ fontSize: 13 }}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* inspector */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="panel p-5">
            <div className="label-mono mb-2">Node Inspector</div>
            {selectedNode ? (
              <NodeDetail node={selectedNode} />
            ) : (
              <p className="text-sm text-ink-500">Select a node to inspect its relationships.</p>
            )}
          </div>

          <div className="panel flex-1 overflow-y-auto p-5">
            <div className="label-mono mb-3">Why a graph?</div>
            <p className="text-sm leading-relaxed text-ink-300">
              Flat vector RAG retrieves <em>similar</em> text. A knowledge graph encodes
              <span className="text-violet-glow"> relationships</span> — so the agents never
              cross a brand rule, mismatch an audience to the wrong channel, or make an
              unverifiable claim. The Copywriter and Visual Director both traverse this graph
              before generating.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Stat label="Entities" value={`${GRAPH_NODES.length}`} />
              <Stat label="Relationships" value={`${GRAPH_EDGES.length}`} />
              <Stat label="Rule nodes" value={`${typeCounts["rule"] ?? 0}`} />
              <Stat label="Traversal depth" value="3 hops" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NodeDetail({ node }: { node: GraphNode }) {
  const s = NODE_STYLE[node.type];
  const rels = GRAPH_EDGES.filter((e) => e.from === node.id || e.to === node.id);
  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
          style={{ color: s.color, background: `${s.color}14`, border: `1px solid ${s.color}33` }}
        >
          {s.glyph}
        </div>
        <div>
          <div className="text-base font-bold text-ink-100">{node.label}</div>
          <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: s.color }}>
            {s.label}
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-300">{node.detail}</p>
      <div className="mt-3">
        <div className="label-mono mb-1.5">Relationships ({rels.length})</div>
        <div className="space-y-1">
          {rels.map((e, i) => {
            const other = e.from === node.id ? e.to : e.from;
            const dir = e.from === node.id ? "→" : "←";
            const otherNode = GRAPH_NODES.find((n) => n.id === other)!;
            return (
              <div key={i} className="flex items-center gap-2 font-mono text-[11px] text-ink-300">
                <span className="text-violet-glow">{dir}</span>
                <span className="text-ink-500">{e.rel}</span>
                <span className="text-ink-100">{otherNode.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
      <div className="label-mono">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-ink-100">{value}</div>
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  pillar,
}: {
  title: string;
  subtitle: string;
  pillar: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 flex items-end justify-between"
    >
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-100">{title}</h2>
        <p className="mt-1 text-sm text-ink-300">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] text-ink-300">
          {pillar}
        </span>
        <ModeIndicator label="Simulated" />
      </div>
    </motion.div>
  );
}
