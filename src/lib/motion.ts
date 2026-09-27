import type { Transition } from "motion/react";
import { useSyncExternalStore } from "react";

/*
 * Motion tokens for `motion/react`, mirroring the CSS tokens in tokens.css.
 * CSS transitions still handle hover, press and color (--d-instant / --d-quick).
 * Motion handles things that move from one place to another: shared-layout
 * indicators, thumbs, anything with a layoutId.
 */

export const duration = { instant: 0.09, quick: 0.16, settle: 0.26 } as const;

export const ease = {
  /** entering / exiting */
  out: [0.23, 1, 0.32, 1],
  /** moving across the screen */
  inOut: [0.77, 0, 0.175, 1],
  /** sheets */
  drawer: [0.32, 0.72, 0, 1],
  /** small arrivals with a little life */
  spring: [0.34, 1.4, 0.5, 1],
} as const;

/** No motion: for changes the keyboard made, and for scroll-driven updates. */
export const instant: Transition = { duration: 0 };

/** Things that arrive or glide to a new place: tab ink, nav highlight, seg pill. */
export const settle: Transition = { type: "spring", visualDuration: duration.settle, bounce: 0.12 };

/** Small, quick travel with a little life: switch thumbs. */
export const snap: Transition = { type: "spring", visualDuration: duration.quick, bounce: 0.2 };

/** A highlight following you through a list (nav, files): quick and exact, no bounce. */
export const glide: Transition = { type: "spring", visualDuration: duration.quick, bounce: 0 };

/* ---------- Slow-motion review ----------
 * Motion has no global time scale, so the shared transitions above are the
 * single source of truth: components pass `settle` / `snap` by reference, and
 * motion reads them when an animation starts. `setMotionScale(5)` stretches
 * them (and the CSS `--d-*` tokens via `--motion-scale`) for reviewing timing
 * frame by frame. Never ship a scale other than 1.
 */

const BASE = {
  settle: duration.settle,
  snap: duration.quick,
  glide: duration.quick,
} as const;

let motionScale = 1;
const listeners = new Set<() => void>();

export function getMotionScale() {
  return motionScale;
}

export function setMotionScale(k: number) {
  motionScale = k;
  (settle as { visualDuration: number }).visualDuration = BASE.settle * k;
  (snap as { visualDuration: number }).visualDuration = BASE.snap * k;
  (glide as { visualDuration: number }).visualDuration = BASE.glide * k;
  if (typeof document !== "undefined") {
    if (k === 1) document.documentElement.style.removeProperty("--motion-scale");
    else document.documentElement.style.setProperty("--motion-scale", String(k));
  }
  listeners.forEach((l) => l());
}

export function subscribeMotionScale(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

/** Scale an ad-hoc transition (one not built from `settle` / `snap`) by the review scale. */
export function scaled(t: Transition): Transition {
  const k = motionScale;
  if (k === 1) return t;
  const out = { ...t } as Record<string, unknown>;
  for (const key of ["duration", "visualDuration", "delay"]) {
    if (typeof out[key] === "number") out[key] = (out[key] as number) * k;
  }
  return out as Transition;
}

/** The current review scale (1 or 5), for readouts and toggles. */
export function useMotionScale() {
  return useSyncExternalStore(subscribeMotionScale, getMotionScale, () => 1);
}
