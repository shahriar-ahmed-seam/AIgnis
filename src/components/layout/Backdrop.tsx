import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Ambient Command Center background.
 * Layers (back to front):
 *   1. deep void base
 *   2. drifting aurora blobs (always on — also the fallback if video fails)
 *   3. looping ambient video (fades in when it can play; self-healing)
 *   4. dark scrim to keep UI/text legible over the video
 *   5. faint dot grid + top radial glow + vignette
 */
export function Backdrop() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Keep the ambient video playing. Browsers throttle/pause muted background
  // video on tab-blur or power-saving; these listeners + a watchdog resume it
  // automatically so it never silently stops.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = () => {
      // play() can reject if interrupted; swallow — the watchdog retries.
      v.play().catch(() => {});
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") tryPlay();
    };

    v.addEventListener("pause", tryPlay);
    v.addEventListener("stalled", tryPlay);
    v.addEventListener("suspend", tryPlay);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", tryPlay);

    // watchdog: if the video isn't advancing, nudge it back to life
    let lastTime = 0;
    const watchdog = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (v.paused || v.ended) {
        tryPlay();
      } else if (v.currentTime === lastTime) {
        // frozen but not "paused" — reload the play head
        tryPlay();
      }
      lastTime = v.currentTime;
    }, 3000);

    tryPlay();

    return () => {
      v.removeEventListener("pause", tryPlay);
      v.removeEventListener("stalled", tryPlay);
      v.removeEventListener("suspend", tryPlay);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", tryPlay);
      window.clearInterval(watchdog);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 1. base */}
      <div className="absolute inset-0 bg-void-900" />

      {/* 2. drifting aurora blobs (fallback + subtle enrichment under the video) */}
      <motion.div
        className="absolute -left-40 top-1/4 h-[40rem] w-[40rem] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.22), transparent 60%)" }}
        animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-40 top-1/3 h-[44rem] w-[44rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2), transparent 60%)" }}
        animate={{ x: [0, -70, 0], y: [0, 60, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(232,121,249,0.12), transparent 60%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 3. ambient video */}
      <motion.video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        preload="auto"
        onCanPlay={() => setVideoReady(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: videoReady ? 0.4 : 0 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/video/ambient.mp4" type="video/mp4" />
      </motion.video>

      {/* 4. dark scrim over the video so panels/text stay readable */}
      <div className="absolute inset-0 bg-void-900/55" />

      {/* 5. dot grid + top glow + vignette */}
      <div className="absolute inset-0 bg-dotgrid opacity-50" />
      <div className="absolute inset-x-0 top-0 h-[60vh] bg-radial-glow" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_40%,transparent_55%,rgba(0,0,0,0.65)_100%)]" />
    </div>
  );
}
