import { motion } from "framer-motion";
import { usePipeline } from "../stores/pipelineStore";
import { AgentGraph } from "../components/features/AgentGraph";
import { LogStream } from "../components/features/LogStream";
import { IntelRail } from "../components/features/IntelRail";
import type { AgentName } from "../types";

const SPEEDS = [1, 2, 4];

/**
 * Agent Activity — the centerpiece. Three columns:
 *   left   : the live node-graph swarm
 *   center : the streaming agent console
 *   right  : the live RAG/MCP intelligence rail
 * A progress rail + speed control (Req 3.6) sit above.
 */
export function AgentActivityView() {
  const {
    visibleEvents,
    activeAgent,
    completedAgents,
    speed,
    setSpeed,
    progress,
    productIdea,
    dataset,
  } = usePipeline();

  // derive the current handoff edge from the latest handoff event
  const lastHandoff = [...visibleEvents].reverse().find((e) => e.kind === "handoff");
  const handoffEdge: [AgentName, AgentName] | null =
    lastHandoff && lastHandoff.handoffTo
      ? [lastHandoff.agent, lastHandoff.handoffTo]
      : null;

  // gate the intel rail on which agents have begun working
  const seen = (name: AgentName) =>
    visibleEvents.some((e) => e.agent === name) || completedAgents.includes(name);
  const revealSignals = seen("Researcher");
  const revealInventory = seen("Analyst");

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col px-8 py-6">
      {/* top bar: idea + speed */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="label-mono mb-1">Forging campaign for</div>
          <h2 className="font-display text-2xl font-bold text-ink-100">“{productIdea}”</h2>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1.5">
          <span className="label-mono px-2">Speed</span>
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded-lg px-3 py-1.5 font-mono text-sm transition-all ${
                speed === s
                  ? "bg-violet/20 text-violet-glow shadow-glow-violet"
                  : "text-ink-500 hover:text-ink-300"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* progress rail */}
      <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg,#22d3ee,#8b5cf6,#e879f9)" }}
          animate={{ width: `${Math.round(progress * 100)}%` }}
          transition={{ ease: "easeOut", duration: 0.4 }}
        />
      </div>

      {/* main three-column split */}
      <div className="grid min-h-[520px] flex-1 grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr_0.8fr]">
        {/* graph */}
        <div className="panel flex items-center justify-center p-6">
          <AgentGraph
            activeAgent={activeAgent}
            completedAgents={completedAgents}
            handoffEdge={handoffEdge}
          />
        </div>

        {/* log */}
        <LogStream events={visibleEvents} />

        {/* intel rail */}
        {dataset && (
          <IntelRail
            intel={dataset.intel}
            revealSignals={revealSignals}
            revealInventory={revealInventory}
          />
        )}
      </div>
    </div>
  );
}
