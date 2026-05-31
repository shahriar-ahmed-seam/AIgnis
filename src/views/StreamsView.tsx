import { AnimatePresence, motion } from "framer-motion";
import { SectionHeader } from "./GraphView";
import { useStreams } from "../stores/streamsStore";
import { ALL_SOURCES, SOURCE_META } from "../data/streamData";

/**
 * Live Data Streams — a real-time ingestion console. The ingestion bus runs
 * globally from app load (see streamsStore), so the feed is already alive on
 * arrival and never resets when you switch tabs. This view is a pure reader.
 */
export function StreamsView() {
  const events = useStreams((s) => s.events);
  const counts = useStreams((s) => s.counts);
  const paused = useStreams((s) => s.paused);
  const togglePaused = useStreams((s) => s.togglePaused);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex h-full flex-col px-8 py-6">
      <SectionHeader
        title="Live Data Streams"
        subtitle="Real-time ingestion · CDC mutations, competitor scraping, review & social signals"
        pillar="Kafka-style event bus"
      />

      {/* source throughput cards */}
      <div className="mb-5 grid grid-cols-4 gap-4">
        {ALL_SOURCES.map((src) => {
          const m = SOURCE_META[src];
          return (
            <div key={src} className="panel p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-lg" style={{ color: m.color }}>
                    {m.glyph}
                  </span>
                  <span className="text-sm font-semibold text-ink-100">{m.label}</span>
                </span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }}
                />
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-ink-100">
                {counts[src]}
              </div>
              <div className="font-mono text-[10px] text-ink-500">{m.tech}</div>
            </div>
          );
        })}
      </div>

      {/* unified feed */}
      <div className="panel flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-ink-300">unified_ingest.stream</span>
            <span className="rounded bg-cyan/10 px-2 py-0.5 font-mono text-[10px] text-cyan-glow">
              {total.toLocaleString()} events · {paused ? "paused" : "live"}
            </span>
          </div>
          <button
            onClick={togglePaused}
            className="btn-ghost px-3 py-1.5 text-xs"
          >
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-4 font-mono text-[12px]">
          <AnimatePresence initial={false}>
            {events.map((ev) => {
              const m = SOURCE_META[ev.source];
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-3 py-0.5"
                >
                  <span className="select-none text-ink-700">
                    {new Date(ev.ts).toLocaleTimeString("en-US", { hour12: false })}
                  </span>
                  <span
                    className="shrink-0 rounded px-1.5 font-semibold"
                    style={{ color: m.color, background: `${m.color}14` }}
                  >
                    {m.glyph} {ev.source}
                  </span>
                  <span className="flex-1 text-ink-300">{ev.message}</span>
                  {ev.meta && <span className="text-ink-700">{ev.meta}</span>}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
