import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AgentEvent } from "../types";
import { AGENT_META } from "../types";

/**
 * Live streaming console of agent events. Auto-scrolls, color-codes by agent,
 * and renders distinct styles for active / log / handoff / complete kinds.
 */
export function LogStream({ events }: { events: AgentEvent[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [events.length]);

  return (
    <div className="panel flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-magenta/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-lime/70" />
          </span>
          <span className="ml-2 font-mono text-xs text-ink-300">agent_swarm.log</span>
        </div>
        <span className="label-mono">streaming</span>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto px-5 py-4 font-mono text-[13px]">
        <AnimatePresence initial={false}>
          {events.map((evt) => {
            const meta = AGENT_META[evt.agent];
            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-2 leading-relaxed"
              >
                <span className="select-none text-ink-700">
                  {String(Math.round(evt.timestamp)).padStart(5, "0")}
                </span>
                <span
                  className="shrink-0 font-semibold"
                  style={{ color: meta.color }}
                >
                  {meta.label.replace(" ", "_").toLowerCase()}
                </span>
                <LogBody evt={evt} />
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </div>
  );
}

function LogBody({ evt }: { evt: AgentEvent }) {
  if (evt.kind === "handoff") {
    return (
      <span className="text-ink-300">
        <span className="text-violet-glow">→ handoff </span>
        {evt.message}
      </span>
    );
  }
  if (evt.kind === "active") {
    return <span className="text-cyan-glow">{evt.message}</span>;
  }
  if (evt.kind === "complete") {
    return <span className="text-lime">✓ {evt.message}</span>;
  }
  return <span className="text-ink-300">{evt.message}</span>;
}
