import { motion } from "framer-motion";

/**
 * Animated AInigma brand mark — a rotating hexagonal "infinity core" with a
 * gradient stroke. Pure SVG, no assets.
 */
export function BrandMark({ size = 34 }: { size?: number }) {
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
      <BrandMark />
      <div className="leading-none">
        <div className="font-display text-lg font-extrabold tracking-tight">
          <span className="text-ink-100">AI</span>
          <span className="text-gradient">gnis</span>
        </div>
        <div className="label-mono mt-1">Multimodal Content Engine</div>
      </div>
    </div>
  );
}
