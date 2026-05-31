import { motion } from "framer-motion";
import type { AgentName } from "../../types";
import { AGENT_META, AGENT_ORDER } from "../../types";

// ---------------------------------------------------------------------------
// AgentGraph — an orbital constellation. Five agent "planets" sit evenly on a
// ring around a glowing CORE (72° apart for perfect radial symmetry). Each
// planet links to the core with a curved arc; the active handoff arc carries a
// travelling light pulse. A slow orbit ring, drifting stars, and a faint
// nebula backdrop make it feel like a living system rather than a boxed graph.
// ---------------------------------------------------------------------------

// viewBox is 100x100; core at center. Nodes on a circle, Researcher at top,
// then clockwise in pipeline order — so the swarm reads as one rotation.
const CX = 50;
const CY = 50;
const R = 36; // orbit radius

function nodePos(index: number, total: number) {
  // start at -90° (top), go clockwise
  const angle = (-90 + (360 / total) * index) * (Math.PI / 180);
  return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle), angle };
}

const POS: Record<AgentName, { x: number; y: number; angle: number }> = AGENT_ORDER.reduce(
  (acc, name, i) => {
    acc[name] = nodePos(i, AGENT_ORDER.length);
    return acc;
  },
  {} as Record<AgentName, { x: number; y: number; angle: number }>
);

// A gentle quadratic curve from the core to a node, bowed perpendicular to the
// radius so arcs fan out symmetrically instead of being straight spokes.
function corePath(to: { x: number; y: number }) {
  const mx = (CX + to.x) / 2;
  const my = (CY + to.y) / 2;
  // perpendicular offset for the bow
  const dx = to.x - CX;
  const dy = to.y - CY;
  const len = Math.hypot(dx, dy) || 1;
  const bow = 7;
  const ox = (-dy / len) * bow;
  const oy = (dx / len) * bow;
  return `M ${CX} ${CY} Q ${mx + ox} ${my + oy} ${to.x} ${to.y}`;
}

interface Props {
  activeAgent: AgentName | null;
  completedAgents: AgentName[];
  /** the current handoff edge to animate a pulse along, if any */
  handoffEdge: [AgentName, AgentName] | null;
}

export function AgentGraph({ activeAgent, completedAgents }: Props) {
  return (
    <div className="relative aspect-square w-full max-w-[560px]">
      {/* drifting stars */}
      <Stars />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="arc-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
          <radialGradient id="core-grad">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#22d3ee" stopOpacity="0.18" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="soft-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* orbit ring */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.3" strokeDasharray="0.6 1.8" />

        {/* a second, slowly rotating dashed ring for life */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={R + 4}
          fill="none"
          stroke="rgba(139,92,246,0.18)"
          strokeWidth="0.2"
          strokeDasharray="1 3"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50% 50%" }}
        />

        {/* core->node arcs */}
        {AGENT_ORDER.map((name) => {
          const meta = AGENT_META[name];
          const to = POS[name];
          const lit = completedAgents.includes(name) || activeAgent === name;
          const active = activeAgent === name;
          const d = corePath(to);
          return (
            <g key={`arc-${name}`}>
              <path
                d={d}
                fill="none"
                stroke={lit ? "url(#arc-grad)" : "rgba(255,255,255,0.08)"}
                strokeWidth={active ? 0.7 : 0.45}
                strokeLinecap="round"
                opacity={lit ? 0.9 : 0.5}
              />
              {/* dash flow + travelling pulse on the active arc */}
              {active && (
                <>
                  <path d={d} fill="none" stroke={meta.color} strokeWidth="0.7" strokeLinecap="round" strokeDasharray="1.4 2.6" opacity="0.9">
                    <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.9s" repeatCount="indefinite" />
                  </path>
                  <circle r="0.9" fill="#fff" filter="url(#soft-glow)">
                    <animateMotion dur="1.1s" repeatCount="indefinite" rotate="auto" path={d} />
                  </circle>
                </>
              )}
            </g>
          );
        })}

        {/* core */}
        <circle cx={CX} cy={CY} r="13" fill="url(#core-grad)" />
      </svg>

      {/* pulsing core label */}
      <motion.div
        className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.span
          className="absolute inset-0 rounded-full border border-violet/30"
          animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-300">core</span>
        <span className="mt-0.5 h-1 w-1 rounded-full bg-violet-glow shadow-[0_0_8px_#a78bfa]" />
      </motion.div>

      {/* nodes */}
      {AGENT_ORDER.map((name) => {
        const pos = POS[name];
        const meta = AGENT_META[name];
        const isActive = activeAgent === name;
        const isDone = completedAgents.includes(name);
        // labels above for the top half, below for the bottom half
        const above = pos.y < CY;
        return (
          <div
            key={name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <motion.div
              animate={{ scale: isActive ? 1.14 : 1, opacity: isDone && !isActive ? 0.78 : 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="relative flex flex-col items-center"
            >
              {/* label above (top nodes) */}
              {above && <NodeLabel meta={meta} isActive={isActive} className="mb-2" />}

              {/* planet */}
              <div className="relative flex h-14 w-14 items-center justify-center">
                {/* soft halo */}
                <span
                  className="absolute inset-0 rounded-full blur-md transition-opacity duration-300"
                  style={{ background: meta.color, opacity: isActive ? 0.4 : isDone ? 0.18 : 0.1 }}
                />
                {/* orbiting ring around the active planet */}
                {isActive && (
                  <motion.span
                    className="absolute rounded-full border"
                    style={{ inset: -6, borderColor: `${meta.color}88` }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <span
                      className="absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                      style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }}
                    />
                  </motion.span>
                )}
                {/* expanding pulse */}
                {isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-full border"
                    style={{ borderColor: meta.color }}
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                {/* the planet body */}
                <div
                  className="relative flex h-full w-full items-center justify-center rounded-full border backdrop-blur-sm"
                  style={{
                    borderColor: isActive ? meta.color : isDone ? `${meta.color}66` : "rgba(255,255,255,0.12)",
                    background: isActive
                      ? `radial-gradient(circle at 35% 30%, ${meta.color}55, ${meta.color}14 70%)`
                      : "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.06), rgba(255,255,255,0.02) 70%)",
                    boxShadow: isActive ? `0 0 24px -4px ${meta.color}` : "none",
                  }}
                >
                  <span className="text-xl" style={{ color: meta.color }}>
                    {meta.glyph}
                  </span>
                  {isDone && !isActive && (
                    <span
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-void-900"
                      style={{ background: meta.color }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              </div>

              {/* label below (bottom nodes) */}
              {!above && <NodeLabel meta={meta} isActive={isActive} className="mt-2" />}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

function NodeLabel({
  meta,
  isActive,
  className = "",
}: {
  meta: { label: string; pillar: string; color: string };
  isActive: boolean;
  className?: string;
}) {
  return (
    <div className={`whitespace-nowrap text-center ${className}`}>
      <div className="text-xs font-semibold" style={{ color: isActive ? meta.color : "#aab2c8" }}>
        {meta.label}
      </div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-ink-500">{meta.pillar}</div>
    </div>
  );
}

/** Subtle drifting stars layer behind the constellation. */
function Stars() {
  const stars = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${(i * 47) % 100}%`,
    top: `${(i * 71) % 100}%`,
    size: 1 + (i % 3) * 0.6,
    dur: 5 + (i % 6),
    delay: (i % 5) * 0.6,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-white/40"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
          animate={{ opacity: [0.1, 0.6, 0.1], scale: [1, 1.4, 1] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
