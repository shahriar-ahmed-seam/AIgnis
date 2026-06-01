import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ImageRef, MarketingCopy, ReelSpec } from "../../types";
import { ChannelIcon } from "../ui/ChannelIcon";

/**
 * Rendered video reel preview with a visible STILL → MOTION transformation:
 *   1. the hero still appears (the frame the Visual Director rendered),
 *   2. a "rendering motion" scan sweep passes over it,
 *   3. it cross-fades into the playing reel — a real MP4 if one exists
 *      (poster = the still, so you literally see the picture come to life),
 *      otherwise an animated Ken-Burns + kinetic-caption preview.
 *
 * This makes the modality handoff explicit: the image becomes the video,
 * instead of the video silently never appearing.
 */

type Phase = "still" | "rendering" | "motion";

export function VideoReel({
  spec,
  hero,
  copy,
  presetId,
  reelVideo,
  playing,
}: {
  spec: ReelSpec;
  hero: ImageRef;
  copy: MarketingCopy;
  presetId: string;
  reelVideo?: string;
  playing: boolean;
}) {
  const captions = [copy.headline, copy.body, copy.cta];
  const [beat, setBeat] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasMp4, setHasMp4] = useState(false);
  const [phase, setPhase] = useState<Phase>("still");
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSrc = reelVideo
    ? encodeURI(reelVideo)
    : `/video/reels/${presetId}-${spec.format}.mp4`;

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

  // the still → rendering → motion sequence (re-runs when format/playing change)
  useEffect(() => {
    if (!playing) {
      setPhase("motion"); // when paused/replaying, just hold the motion frame
      return;
    }
    setPhase("still");
    const toRender = window.setTimeout(() => setPhase("rendering"), 700);
    const toMotion = window.setTimeout(() => setPhase("motion"), 1900);
    return () => {
      clearTimeout(toRender);
      clearTimeout(toMotion);
    };
  }, [playing, presetId, spec.format]);

  // start/replay the real video when entering motion
  useEffect(() => {
    if (phase === "motion" && hasMp4 && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [phase, hasMp4]);

  // kinetic caption sequencing + progress (only for the non-MP4 preview)
  useEffect(() => {
    if (phase !== "motion" || hasMp4) return;
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
  }, [phase, hasMp4, presetId, spec.format]);

  const showMotion = phase === "motion";

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black"
      style={{ aspectRatio: spec.aspect, maxHeight: "60vh" }}
    >
      {/* ---- the still (poster frame) — always underneath, fades out when motion takes over ---- */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: showMotion && hasMp4 ? 0 : 1 }}
        transition={{ duration: 0.6 }}
      >
        <ReelImage hero={hero} />
        {!showMotion && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        )}
      </motion.div>

      {/* ---- real MP4 reel: poster=still, cross-fades in on motion ---- */}
      {hasMp4 && (
        <motion.video
          ref={videoRef}
          src={videoSrc}
          poster={hero.src}
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: showMotion ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* ---- non-MP4 preview: Ken Burns + kinetic captions, shown on motion ---- */}
      {!hasMp4 && showMotion && (
        <>
          <motion.div
            className="absolute inset-0"
            animate={playing ? { scale: [1.15, 1.28], x: [0, -14], y: [0, -10] } : { scale: 1.15 }}
            transition={{ duration: 6, ease: "easeInOut" }}
          >
            <ReelImage hero={hero} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
          <div className="absolute inset-0 mix-blend-overlay" style={{ background: "linear-gradient(120deg,#22d3ee22,#e879f922)" }} />
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
                  <h3 className="font-display text-3xl font-extrabold leading-tight text-white drop-shadow-lg">{captions[0]}</h3>
                )}
                {beat === 1 && (
                  <p className="text-lg font-medium leading-snug text-white/90 drop-shadow">{captions[1]}</p>
                )}
                {beat === 2 && (
                  <span className="inline-block rounded-full bg-hero-sheen px-6 py-3 font-display text-xl font-bold text-void-900 shadow-lg">
                    {captions[2]} →
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="absolute inset-x-3 bottom-3 h-1 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress * 100}%`, transition: "width 0.1s linear" }} />
          </div>
        </>
      )}

      {/* ---- "rendering motion" overlay: a scan sweep + label over the still ---- */}
      <AnimatePresence>
        {phase === "rendering" && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* scan sweep */}
            <motion.div
              className="absolute inset-x-0 h-1/3"
              style={{ background: "linear-gradient(180deg, transparent, rgba(92,232,255,0.35), transparent)" }}
              initial={{ top: "-33%" }}
              animate={{ top: "120%" }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur">
                <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-transparent border-t-cyan-glow border-r-cyan-glow" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/90">
                  Animating still → reel
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* phase chip (top-right) so the modality state is explicit */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 backdrop-blur">
        <span
          className={`h-1.5 w-1.5 rounded-full ${phase === "motion" ? "bg-lime" : "bg-cyan-glow"} ${
            phase !== "motion" ? "animate-pulse" : ""
          }`}
        />
        <span className="font-mono text-[9px] uppercase tracking-wider text-white/80">
          {phase === "still" ? "still" : phase === "rendering" ? "rendering" : "reel · live"}
        </span>
      </div>

      {/* channel chrome */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur">
        <ChannelIcon id={spec.channel} size={16} />
        <span className="font-mono text-[10px] text-white/80">{spec.label}</span>
      </div>
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
