import { motion } from "framer-motion";
import type { PillarStatus } from "../../types";

const PILLAR_LABEL: Record<string, string> = {
  MCP: "MCP",
  RAG: "RAG",
  Diffusion: "Diffusion",
  Agentic: "Agentic AI",
  LLM: "LLM",
};

/**
 * Persistent tech-pillar status strip (Req 11.4 / 14.1). Shows each pillar
 * with its current Execution_Mode so judges always see the tech depth.
 */
export function PillarBar({ statuses }: { statuses: PillarStatus[] }) {
  return (
    <div className="flex items-center gap-2">
      <span className="label-mono mr-1 hidden md:inline">Stack</span>
      {statuses.map((s, i) => {
        const live = s.mode === "Live";
        return (
          <motion.div
            key={s.pillar}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                live ? "bg-lime shadow-[0_0_8px_#a3e635]" : "bg-cyan/70 shadow-[0_0_8px_#22d3ee]"
              }`}
            />
            <span className="font-mono text-[11px] font-medium text-ink-300">
              {PILLAR_LABEL[s.pillar]}
            </span>
            <span
              className={`font-mono text-[9px] uppercase tracking-wider ${
                live ? "text-lime" : "text-ink-500"
              }`}
            >
              {live ? "live" : "sim"}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
