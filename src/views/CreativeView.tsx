import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePipeline } from "../stores/pipelineStore";
import { HeroImage } from "../components/features/HeroImage";
import { TypedText } from "../components/ui/TypedText";
import { AnalyticsDashboard } from "../components/features/AnalyticsDashboard";
import { ModeIndicator } from "../components/ui/ModeIndicator";

/**
 * Creative Renderer — the payoff (Req 4). Left: the finished ad creative
 * (hero image + typed copy in an on-brand layout). Right: synthetic
 * analytics. A restart control loops the demo.
 */
export function CreativeView() {
  const { asset, dataset, productIdea, reset, goToVideo } = usePipeline();
  const [launched, setLaunched] = useState(false);
  if (!asset || !dataset) return null;

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col px-8 py-6">
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex items-center justify-between"
      >
        <div>
          <div className="label-mono mb-1 flex items-center gap-2">
            <span className="text-lime">✓</span> Campaign forged
          </div>
          <h2 className="font-display text-2xl font-bold text-ink-100">“{productIdea}”</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={goToVideo} className="btn-primary flex items-center gap-2 text-sm">
            <span>❖</span> Make video reels
          </button>
          <button onClick={reset} className="btn-ghost flex items-center gap-2">
            <span>↻</span> Run another idea
          </button>
        </div>
      </motion.div>

      {/* split: creative + analytics */}
      <div className="grid min-h-[560px] flex-1 grid-cols-1 gap-8 lg:grid-cols-[1.35fr_1fr]">
        {/* the ad creative */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="panel flex flex-col overflow-hidden p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="font-display text-sm font-bold text-ink-100">
              Hero Creative
            </span>
            <div className="flex items-center gap-2">
              <span className="label-mono">Diffusion</span>
              <ModeIndicator label={asset.heroLabel} />
            </div>
          </div>

          {/* on-brand ad layout: image with overlaid copy */}
          <div className="relative min-h-[440px] flex-1 overflow-hidden rounded-2xl">
            <HeroImage image={asset.hero} />

            {/* legibility scrim — stronger at bottom-left where copy sits */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/85 via-black/40 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* copy overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-lg"
              >
                <h3 className="font-display text-4xl font-extrabold leading-tight text-white drop-shadow-lg">
                  <TypedText text={asset.copy.headline} speed={32} startDelay={500} />
                </h3>
                <p className="mt-3 text-base leading-relaxed text-white/85 drop-shadow">
                  <TypedText text={asset.copy.body} speed={10} startDelay={1400} />
                </p>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.6 }}
                  onClick={() => {
                    setLaunched(true);
                    window.setTimeout(() => goToVideo(), 1200);
                  }}
                  className="btn-primary mt-5"
                >
                  {asset.copy.cta} →
                </motion.button>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                  ↑ AI-generated call-to-action · continues to video export
                </div>
              </motion.div>
            </div>

            {/* launch confirmation toast — gives the generated CTA a satisfying
                response so it never feels dead during a demo */}
            <AnimatePresence>
              {launched && (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="absolute left-1/2 top-6 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-lime/30 bg-void-900/85 px-4 py-2 backdrop-blur-md"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime text-[11px] font-bold text-void-900">
                    ✓
                  </span>
                  <span className="font-mono text-xs text-ink-100">
                    Campaign deployed to 3 channels
                  </span>
                  <ModeIndicator label="Simulated" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* copy + palette footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="label-mono">Copy</span>
              <ModeIndicator label={asset.copyLabel} />
              <span className="label-mono ml-2">LLM-generated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="label-mono">Palette</span>
              <div className="flex gap-1.5">
                {asset.palette.map((c) => (
                  <span
                    key={c}
                    className="h-5 w-5 rounded-md border border-white/10"
                    style={{ background: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* analytics */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <AnalyticsDashboard data={dataset.analytics} />
        </motion.div>
      </div>
    </div>
  );
}
