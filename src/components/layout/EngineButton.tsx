import { motion } from "framer-motion";
import type { PillarStatus } from "../../types";

/**
 * EngineButton — a compact, living "engine core" that replaces the verbose
 * tech-stack pill strip. Five pillar-colored nodes are wired together with a
 * travelling light pulse; the whole thing is one button that opens the
 * "Inside the Engine" drawer. Tech depth stays discoverable (hover reveals the
 * names, click opens the full breakdown) without cluttering the header.
 */

const PILLAR_META: Record<string, { label: string; color: string }> = {
  RAG: { label: "RAG", color: "#22d3ee" },
  MCP: { label: "MCP", color: "#a78bfa" },
  LLM: { label: "LLM", color: "#f472b6" },
  Diffusion: { label: "Diffusion", color: "#fb923c" },
  Agentic: { label: "Agentic", color: "#a3e635" },
};

export function EngineButton({
  statuses,
  onClick,
}: {
  statuses: PillarStatus[];
  onClick: () => void;
}) {
  const n = statuses.length || 5;

  return (
    <button
      onClick={onClick}
      title="Inside the Engine"
      className="group relative flex items-center gap-3 rounded-full border border-white/[0.07] bg-white/[0.02] px-4 py-2 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.04]"
    >
      {/* live constellation */}
      <span className="relative flex items-center" style={{ width: n * 18 }}>
        {/* connecting wire */}
        <span className="absolute left-1.5 right-1.5 top-1/2 h-px -translate-y-1/2 bg-white/10" />
        {/* travelling pulse */}
        <motion.span
          className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white"
          style={{ boxShadow: "0 0 8px #fff" }}
          animate={{ left: ["6%", "92%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* nodes */}
        {statuses.map((s, i) => {
          const meta = PILLAR_META[s.pillar] ?? { label: s.pillar, color: "#a78bfa" };
          return (
            <motion.span
              key={s.pillar}
              className="relative z-10 rounded-full"
              style={{
                marginLeft: i === 0 ? 0 : "auto",
                width: 9,
                height: 9,
                background: meta.color,
                boxShadow: `0 0 8px ${meta.color}`,
              }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.2, delay: i * 0.28, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}
      </span>

      <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400 transition-colors group-hover:text-ink-200 lg:inline">
        Inside the Engine
      </span>

      {/* hover tooltip: the actual stack names */}
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-void-800/95 px-3 py-1.5 opacity-0 shadow-xl backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
        <span className="flex items-center gap-2.5">
          {statuses.map((s) => {
            const meta = PILLAR_META[s.pillar] ?? { label: s.pillar, color: "#a78bfa" };
            return (
              <span key={s.pillar} className="flex items-center gap-1 font-mono text-[10px] text-ink-300">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                {meta.label}
              </span>
            );
          })}
        </span>
      </span>
    </button>
  );
}
