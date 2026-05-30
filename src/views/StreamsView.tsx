import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeader } from "./GraphView";
import {
  ALL_SOURCES,
  makeEvent,
  SOURCE_META,
  type StreamEvent,
  type StreamSource,
} from "../data/streamData";

/**
 * Live Data Streams — a real-time ingestion console. Multiple synthetic
 * sources (CDC, scraper, reviews, social) emit events on intervals, flowing
 * into a unified feed with per-source throughput counters. This is the
 * streaming/Kafka + CDC pillar made visual.
 */
export function StreamsView() {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [counts, setCounts] = useState<Record<StreamSource, number>>({
    cdc: 0,
    scraper: 0,
    reviews: 0,
    social: 0,
  });
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    // each source ticks at its own cadence
    const cadence: Record<StreamSource, number> = {
      cdc: 1100,
      scraper: 2600,
      reviews: 1700,
      social: 3200,
    };
    const timers = ALL_SOURCES.map((src) =>
      window.setInterval(() => {
        if (pausedRef.current) return;
        const ev = makeEvent(src);
        setEvents((prev) => [ev, ...prev].slice(0, 60));
        setCounts((prev) => ({ ...prev, [src]: prev[src] + 1 }));
      }, cadence[src])
    );
    return () => timers.forEach((t) => clearInterval(t));
  }, []);

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
              {total} events · {total > 0 ? "live" : "starting…"}
            </span>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
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
