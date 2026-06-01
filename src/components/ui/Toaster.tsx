import { AnimatePresence, motion } from "framer-motion";
import { useToast, type ToastTone } from "../../stores/toastStore";

// Glass toast stack, bottom-right. Mounted once at the app root.

const TONE: Record<ToastTone, { color: string; glyph: string }> = {
  success: { color: "#a3e635", glyph: "✓" },
  info: { color: "#22d3ee", glyph: "›" },
  violet: { color: "#a78bfa", glyph: "✦" },
};

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[110] flex w-80 flex-col gap-3">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const tone = TONE[t.tone];
          const glyph = t.glyph ?? tone.glyph;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={() => dismiss(t.id)}
              className="pointer-events-auto cursor-pointer overflow-hidden rounded-xl border border-white/[0.08] bg-void-800/85 backdrop-blur-2xl"
              style={{ boxShadow: "0 20px 50px -20px rgba(0,0,0,0.8)" }}
            >
              <div className="flex items-start gap-3 p-3.5">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                  style={{ color: "#05060a", background: tone.color }}
                >
                  {glyph}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink-100">{t.title}</div>
                  {t.detail && <div className="mt-0.5 text-xs leading-relaxed text-ink-400">{t.detail}</div>}
                </div>
              </div>
              {/* timer bar */}
              <motion.div
                className="h-0.5"
                style={{ background: tone.color }}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4.2, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
