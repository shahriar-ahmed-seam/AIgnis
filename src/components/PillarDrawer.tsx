import { AnimatePresence, motion } from "framer-motion";
import { PILLAR_META, PILLAR_ORDER } from "../types";
import type { PillarStatus } from "../types";
import { ModeIndicator } from "./ModeIndicator";

/**
 * "Inside the Engine" — a slide-in drawer that explains each of the 5 tech
 * pillars with its current Execution_Mode (Req 11.4 / 14). This is the panel
 * technical judges open during Q&A to interrogate the stack.
 */
export function PillarDrawer({
  open,
  onClose,
  statuses,
}: {
  open: boolean;
  onClose: () => void;
  statuses: PillarStatus[];
}) {
  const modeOf = (pillar: string) =>
    statuses.find((s) => s.pillar === pillar)?.mode ?? "Simulated";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[460px] flex-col border-l border-white/10 bg-void-800/95 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <div>
                <div className="label-mono mb-1">Architecture</div>
                <h3 className="font-display text-xl font-bold text-ink-100">Inside the Engine</h3>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink-300 transition-colors hover:border-white/25 hover:text-ink-100"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-6">
              {PILLAR_ORDER.map((pillar, i) => {
                const meta = PILLAR_META[pillar];
                return (
                  <motion.div
                    key={pillar}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                          style={{
                            color: meta.color,
                            background: `${meta.color}14`,
                            border: `1px solid ${meta.color}33`,
                          }}
                        >
                          {meta.glyph}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-ink-100">{meta.label}</div>
                          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                            {pillar}
                          </div>
                        </div>
                      </div>
                      <ModeIndicator label={modeOf(pillar) === "Live" ? "Live" : "Simulated"} />
                    </div>

                    <p className="mt-3 text-sm font-medium" style={{ color: meta.color }}>
                      {meta.tagline}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-300">{meta.detail}</p>
                    <div className="mt-3 inline-block rounded-md bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-ink-500">
                      {meta.tech}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="border-t border-white/[0.06] px-6 py-4">
              <p className="text-xs leading-relaxed text-ink-500">
                This is a prototype. Pillars marked{" "}
                <span className="text-violet-glow">Simulated</span> run from a curated mock layer
                for a stable demo; <span className="text-lime">Live</span> pillars perform a real
                model call on request.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
