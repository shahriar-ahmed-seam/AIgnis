import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AgentEvent } from "../../types";
import { AGENT_META } from "../../types";

/**
 * Live streaming console of agent events. Auto-scrolls, color-codes by agent,
 * and renders distinct styles for active / log / handoff / complete kinds.
 * The newest log line types in character-by-character for a real-terminal feel.
 */
export function LogStream({ events }: { events: AgentEvent[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [events.length]);

  const lastId = events[events.length - 1]?.id;

  return (
    <div className="panel flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-lime shadow-[0_0_8px_#a3e635]" />
          <span className="font-mono text-xs text-ink-300">agent_swarm.log</span>
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
                <LogBody evt={evt} typing={evt.id === lastId} />
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </div>
  );
}

/** Types a string in char-by-char. Used only for the newest log line. */
function useTyped(text: string, enabled: boolean, speed = 14) {
  const [n, setN] = useState(enabled ? 0 : text.length);
  useEffect(() => {
    if (!enabled) {
      setN(text.length);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, enabled, speed]);
  return text.slice(0, n);
}

function LogBody({ evt, typing }: { evt: AgentEvent; typing: boolean }) {
  // only "log" lines type in; status lines (active/handoff/complete) appear whole
  const isLog = evt.kind === "log";
  const shown = useTyped(evt.message, typing && isLog);

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
  return (
    <span className="text-ink-300">
      {shown}
      {typing && shown.length < evt.message.length && (
        <span className="ml-0.5 inline-block h-3.5 w-[6px] -translate-y-px animate-pulse bg-cyan align-middle" />
      )}
    </span>
  );
}
