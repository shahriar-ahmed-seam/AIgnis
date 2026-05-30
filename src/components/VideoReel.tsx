import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ImageRef, MarketingCopy, ReelSpec } from "../types";
import { ChannelIcon } from "./ChannelIcon";

/**
 * Rendered video reel preview. Animates the hero image (Ken Burns zoom/pan)
 * with kinetic, sequenced captions and a progress bar to simulate an exported
 * social video — in the channel's aspect ratio. If a real MP4 exists at
 * /video/reels/<presetId>-<format>.mp4 it plays that instead.
 *
 * This is a "rendered preview" (clearly framed as such): true text-to-video
 * needs heavy GPU/paid services, out of scope for a live demo.
 */
export function VideoReel({
  spec,
  hero,
  copy,
  presetId,
  playing,
}: {
  spec: ReelSpec;
  hero: ImageRef;
  copy: MarketingCopy;
  presetId: string;
  playing: boolean;
}) {
  const captions = [copy.headline, copy.body, copy.cta];
  const [beat, setBeat] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasMp4, setHasMp4] = useState(false);
  const videoSrc = `/video/reels/${presetId}-${spec.format}.mp4`;

  // probe for a real exported MP4
  useEffect(() => {
    let cancelled = false;
    fetch(videoSrc, { method: "HEAD" })
      .then((r) => !cancelled && setHasMp4(r.ok))
      .catch(() => !cancelled && setHasMp4(false));
    return () => {
      cancelled = true;
    };
  }, [videoSrc]);

  // caption sequencing + progress when "playing"
  useEffect(() => {
    if (!playing || hasMp4) return;
    setBeat(0);
    setProgress(0);
    const dur = 6000;
    const start = performance.now();
    const beatTimers = [
      window.setTimeout(() => setBeat(1), 2200),
      window.setTimeout(() => setBeat(2), 4200),
    ];
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setBeat(0);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      beatTimers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, [playing, hasMp4, presetId, spec.format]);

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black"
      style={{ aspectRatio: spec.aspect, maxHeight: "60vh" }}
    >
      {hasMp4 ? (
        <video src={videoSrc} autoPlay={playing} muted loop playsInline className="h-full w-full object-cover" />
      ) : (
        <>
          {/* Ken Burns animated hero */}
          <motion.div
            className="absolute inset-0"
            animate={
              playing
                ? { scale: [1.15, 1.28], x: [0, -14], y: [0, -10] }
                : { scale: 1.15 }
            }
            transition={{ duration: 6, ease: "easeInOut" }}
          >
            <ReelImage hero={hero} />
          </motion.div>

          {/* cinematic grade + scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
          <div className="absolute inset-0 mix-blend-overlay" style={{ background: "linear-gradient(120deg,#22d3ee22,#e879f922)" }} />

          {/* kinetic captions */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={beat}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -24, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-[90%]"
              >
                {beat === 0 && (
                  <h3 className="font-display text-3xl font-extrabold leading-tight text-white drop-shadow-lg">
                    {captions[0]}
                  </h3>
                )}
                {beat === 1 && (
                  <p className="text-lg font-medium leading-snug text-white/90 drop-shadow">
                    {captions[1]}
                  </p>
                )}
                {beat === 2 && (
                  <span className="inline-block rounded-full bg-hero-sheen px-6 py-3 font-display text-xl font-bold text-void-900 shadow-lg">
                    {captions[2]} →
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* channel chrome */}
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur">
            <ChannelIcon id={spec.channel} size={16} />
            <span className="font-mono text-[10px] text-white/80">{spec.label}</span>
          </div>

          {/* progress bar */}
          <div className="absolute inset-x-3 bottom-3 h-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${progress * 100}%`, transition: "width 0.1s linear" }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function ReelImage({ hero }: { hero: ImageRef }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.src = hero.src;
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(false);
  }, [hero.src]);

  if (loaded) {
    return <img src={hero.src} alt={hero.alt} className="h-full w-full object-cover" />;
  }
  return <div className="h-full w-full" style={{ background: hero.fallbackGradient }} />;
}
