import { motion } from "framer-motion";
import type { AgentName } from "../types";
import { AGENT_META, AGENT_ORDER } from "../types";

// Pentagon layout positions (percentages of the square canvas).
const NODE_POS: Record<AgentName, { x: number; y: number }> = {
  Researcher: { x: 50, y: 12 },
  Analyst: { x: 86, y: 40 },
  Copywriter: { x: 72, y: 84 },
  Visual_Director: { x: 28, y: 84 },
  Operations: { x: 14, y: 40 },
};

// Sequential pipeline edges (Researcher -> Analyst -> ... -> Operations)
const EDGES: [AgentName, AgentName][] = [
  ["Researcher", "Analyst"],
  ["Analyst", "Copywriter"],
  ["Copywriter", "Visual_Director"],
  ["Visual_Director", "Operations"],
];

interface Props {
  activeAgent: AgentName | null;
  completedAgents: AgentName[];
  /** the current handoff edge to animate a pulse along, if any */
  handoffEdge: [AgentName, AgentName] | null;
}

/**
 * The signature visual: 5 agent nodes on a pentagon, connected by edges.
 * Active node glows + scales, completed nodes show a check, and a pulse of
 * light travels the active handoff edge. SVG lines + HTML nodes overlaid.
 */
export function AgentGraph({ activeAgent, completedAgents, handoffEdge }: Props) {
  return (
    <div className="relative aspect-square w-full max-w-[560px]">
      {/* edges */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="edge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {EDGES.map(([from, to], i) => {
          const a = NODE_POS[from];
          const b = NODE_POS[to];
          const isActiveEdge =
            handoffEdge && handoffEdge[0] === from && handoffEdge[1] === to;
          const done = completedAgents.includes(from);
          return (
            <g key={i}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={done || isActiveEdge ? "url(#edge-grad)" : "rgba(255,255,255,0.08)"}
                strokeWidth={isActiveEdge ? 0.9 : 0.5}
                strokeLinecap="round"
              />
              {isActiveEdge && (
                <motion.circle
                  r="1.4"
                  fill="#5ce8ff"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ cx: [a.x, b.x], cy: [a.y, b.y] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: "drop-shadow(0 0 3px #5ce8ff)" }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* center core */}
      <motion.div
        className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.25), rgba(34,211,238,0.08) 60%, transparent)",
        }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">core</div>
      </motion.div>

      {/* nodes */}
      {AGENT_ORDER.map((name) => {
        const pos = NODE_POS[name];
        const meta = AGENT_META[name];
        const isActive = activeAgent === name;
        const isDone = completedAgents.includes(name);
        return (
          <div
            key={name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <motion.div
              animate={{
                scale: isActive ? 1.12 : 1,
                opacity: isDone && !isActive ? 0.7 : 1,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="relative flex h-16 w-16 items-center justify-center rounded-2xl border backdrop-blur-md"
                style={{
                  borderColor: isActive ? meta.color : "rgba(255,255,255,0.08)",
                  background: isActive
                    ? `${meta.color}1a`
                    : "rgba(255,255,255,0.02)",
                  boxShadow: isActive ? `0 0 26px -4px ${meta.color}` : "none",
                }}
              >
                <span className="text-2xl" style={{ color: meta.color }}>
                  {meta.glyph}
                </span>

                {/* active ring */}
                {isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-2xl border"
                    style={{ borderColor: meta.color }}
                    animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                  />
                )}

                {/* completion check */}
                {isDone && !isActive && (
                  <span
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-void-900"
                    style={{ background: meta.color }}
                  >
                    ✓
                  </span>
                )}
              </div>
              <div className="text-center">
                <div
                  className="text-xs font-semibold"
                  style={{ color: isActive ? meta.color : "#aab2c8" }}
                >
                  {meta.label}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-ink-500">
                  {meta.pillar}
                </div>
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
