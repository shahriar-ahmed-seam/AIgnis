import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from its previous value to the target. Used for the pulse
 * metrics so they visibly climb (especially after optimization).
 */
export function CountUp({
  value,
  duration = 900,
  decimals = 0,
  suffix = "",
  format = false,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  format?: boolean; // thousands separators / K-M compaction
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number>();

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <>{formatNum(display, decimals, format) + suffix}</>;
}

function formatNum(n: number, decimals: number, compact: boolean): string {
  if (compact) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return Math.round(n).toLocaleString();
  }
  return n.toFixed(decimals);
}
