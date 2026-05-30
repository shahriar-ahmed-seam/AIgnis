import { AnimatePresence, motion } from "framer-motion";
import type { IntelBundle } from "../types";
import { ModeIndicator } from "./ModeIndicator";

/**
 * Live intelligence rail shown during the agent run. Makes the RAG and MCP
 * pillars tangible: market signals + review sentiment (RAG) reveal as the
 * Researcher works; inventory records (MCP) reveal as the Analyst works.
 *
 * `revealSignals` / `revealInventory` gate visibility so the data appears in
 * sync with the corresponding agent rather than all at once.
 */
export function IntelRail({
  intel,
  revealSignals,
  revealInventory,
}: {
  intel: IntelBundle;
  revealSignals: boolean;
  revealInventory: boolean;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      {/* RAG: market signals */}
      <div className="panel flex flex-1 flex-col overflow-hidden">
        <RailHeader title="RAG · Market Retrieval" accent="#22d3ee" />
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          <AnimatePresence>
            {revealSignals ? (
              intel.signals.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink-100">{s.label}</span>
                    <span className="rounded-md bg-cyan/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-glow">
                      {s.trend}
                    </span>
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-ink-300">{s.detail}</div>
                </motion.div>
              ))
            ) : (
              <Waiting label="retrieving market signals…" />
            )}
          </AnimatePresence>

          {revealSignals && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-1.5 pt-1"
            >
              <div className="label-mono">Review sentiment</div>
              {intel.reviews.map((r) => (
                <div key={r.text} className="flex items-start gap-2 text-xs">
                  <span
                    className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                      r.sentiment === "positive"
                        ? "bg-lime"
                        : r.sentiment === "negative"
                          ? "bg-magenta"
                          : "bg-ink-500"
                    }`}
                  />
                  <span className="text-ink-300">
                    <span className="font-mono text-ink-500">{r.source}:</span> “{r.text}”
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* MCP: inventory */}
      <div className="panel flex flex-1 flex-col overflow-hidden">
        <RailHeader title="MCP · Live Inventory" accent="#a78bfa" />
        <div className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {revealInventory ? (
            intel.inventory.map((rec, i) => (
              <motion.div
                key={rec.sku}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-ink-100">{rec.name}</div>
                  <div className="font-mono text-[10px] text-ink-500">{rec.sku}</div>
                </div>
                <div className="flex items-center gap-2 pl-2">
                  <span className="font-mono text-xs text-ink-300">
                    {rec.stock.toLocaleString()}
                  </span>
                  <StockBadge status={rec.status} />
                </div>
              </motion.div>
            ))
          ) : (
            <Waiting label="awaiting MCP query…" />
          )}
        </div>
      </div>
    </div>
  );
}

function RailHeader({ title, accent }: { title: string; accent: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
        <span className="font-mono text-xs font-medium text-ink-300">{title}</span>
      </div>
      <ModeIndicator label="Simulated" />
    </div>
  );
}

function StockBadge({ status }: { status: "ready" | "low" | "backorder" }) {
  const map = {
    ready: { c: "#a3e635", t: "ready" },
    low: { c: "#fb923c", t: "low" },
    backorder: { c: "#f472b6", t: "backorder" },
  }[status];
  return (
    <span
      className="rounded-md px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
      style={{ background: `${map.c}1a`, color: map.c }}
    >
      {map.t}
    </span>
  );
}

function Waiting({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center py-6">
      <div className="flex items-center gap-2 font-mono text-xs text-ink-500">
        <span className="inline-block h-3 w-3 animate-spin-slow rounded-full border border-ink-700 border-t-violet-glow" />
        {label}
      </div>
    </div>
  );
}
