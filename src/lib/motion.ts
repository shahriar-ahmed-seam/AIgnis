// Shared motion system — one vocabulary for entrances across the whole app, so
// every view animates in with the same rhythm and easing. Pro UIs feel
// deliberate because their motion is consistent, not because it's busy.

import type { Variants, Transition } from "framer-motion";

/** The house easing curve (also used by App.tsx page transitions). */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** One stagger step for cascading lists/grids. */
export const STAGGER = 0.06;

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3, ease: EASE } },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

/** Parent container that cascades its children using `fadeUp` (or any child). */
export const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: STAGGER } },
};

/** A child item for use inside a `staggerContainer`. */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/** Spring used for snappy interactive elements (toggles, node pops). */
export const snappy: Transition = { type: "spring", stiffness: 320, damping: 24 };
