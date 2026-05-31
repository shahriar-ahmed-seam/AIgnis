import type { ModeLabel } from "../../types";

/**
 * Honest real-vs-demo badge. Renders on outputs that have a meaningful source.
 * "Live" = lime (a real model produced it); otherwise a muted violet "Demo"
 * chip — present for honesty, but worded so it never reads as "fake".
 */
export function ModeIndicator({ label, className = "" }: { label: ModeLabel; className?: string }) {
  const live = label === "Live";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
        live
          ? "border-lime/30 bg-lime/10 text-lime"
          : "border-violet/25 bg-violet/10 text-violet-glow"
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? "bg-lime" : "bg-violet-glow"} ${
          live ? "animate-pulse" : ""
        }`}
      />
      {live ? "Live" : "Demo"}
    </span>
  );
}
