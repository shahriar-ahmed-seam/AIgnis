import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandMark } from "./BrandMark";
import { PILLAR_ORDER, PILLAR_META } from "../../types";

// ---------------------------------------------------------------------------
// Boot splash — a brief (~1.6s) branded init shown once per session, so when a
// judge walks up the screen already looks intentional. Logo glows in, the five
// tech pillars "check in" one by one, then it fades to the app. Skipped on
// subsequent loads via sessionStorage so re-runs aren't slowed.
// ---------------------------------------------------------------------------

const SESSION_KEY = "aignis.booted";

export function BootSplash() {
  const [show, setShow] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const [checked, setChecked] = useState(0);

  useEffect(() => {
    if (!show) return;
    // tick the pillar checks
    const per = 220;
    const timers = PILLAR_ORDER.map((_, i) =>
      window.setTimeout(() => setChecked(i + 1), 300 + i * per)
    );
    const done = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      setShow(false);
    }, 300 + PILLAR_ORDER.length * per + 500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-void-900"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ambient glow */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.22), rgba(34,211,238,0.12) 50%, transparent 72%)" }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <BrandMark size={72} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative mt-6 font-display text-2xl font-extrabold"
          >
            <span className="text-ink-100">AI</span>
            <span className="text-gradient">gnis</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
            className="relative mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-500"
          >
            Initializing agent swarm
          </motion.div>

          {/* pillar checks */}
          <div className="relative mt-8 flex items-center gap-2">
            {PILLAR_ORDER.map((pillar, i) => {
              const on = i < checked;
              const meta = PILLAR_META[pillar];
              return (
                <motion.div
                  key={pillar}
                  className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
                  animate={{
                    borderColor: on ? `${meta.color}66` : "rgba(255,255,255,0.08)",
                    color: on ? meta.color : "rgba(107,116,143,0.7)",
                    opacity: on ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span animate={{ scale: on ? 1 : 0.6 }} transition={{ duration: 0.2 }}>
                    {on ? "✓" : "○"}
                  </motion.span>
                  {pillar}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
