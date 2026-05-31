import { useState } from "react";
import { motion } from "framer-motion";

/**
 * AIgnis brand mark. Uses the brain-forge logo at /public/logo.png when present
 * (with a soft glow halo so the dark logo lifts off the near-black UI), and
 * falls back to an animated gradient hexagon if the image is missing.
 */
export function BrandMark({ size = 48 }: { size?: number }) {
  const [imgOk, setImgOk] = useState(true);

  if (imgOk) {
    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* glow halo so the dark navy logo pops on black */}
        <span
          className="absolute inset-0 rounded-full blur-md"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.45), rgba(139,92,246,0.25) 55%, transparent 72%)" }}
        />
        <motion.img
          src="/logo.png"
          alt="AIgnis"
          onError={() => setImgOk(false)}
          className="relative z-10 h-full w-full object-contain drop-shadow-[0_0_6px_rgba(92,232,255,0.35)]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>
    );
  }

  // fallback: animated gradient hexagon
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="bm-grad" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#5ce8ff" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
        </defs>
        <motion.polygon
          points="24,3 42,13.5 42,34.5 24,45 6,34.5 6,13.5"
          stroke="url(#bm-grad)"
          strokeWidth="1.6"
          fill="rgba(139,92,246,0.06)"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />
        <motion.circle
          cx="24"
          cy="24"
          r="6.5"
          fill="url(#bm-grad)"
          animate={{ scale: [1, 1.18, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
        />
      </svg>
    </div>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark size={52} />
      <div className="leading-none">
        <div className="font-display text-xl font-extrabold tracking-tight">
          <span className="text-ink-100">AI</span>
          <span className="text-gradient">gnis</span>
        </div>
        <div className="label-mono mt-1">Multimodal Content Engine</div>
      </div>
    </div>
  );
}
