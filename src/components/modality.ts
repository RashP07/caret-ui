import { useRef } from "react";
import type { Transition } from "motion/react";
import { instant, settle } from "@/lib/motion";

/*
 * Which input caused the last change inside a group. Shared-layout indicators
 * glide when you point, and snap when you use the keyboard: keyboard changes
 * are repeated constantly, and motion there only reads as delay.
 *
 * Spread `handlers` on the group's root; read `transition()` while rendering
 * the element that carries the layoutId.
 */
export function useModalityTransition(glide: Transition = settle) {
  const keyboard = useRef(false);
  return {
    handlers: {
      onKeyDownCapture: () => {
        keyboard.current = true;
      },
      onPointerDownCapture: () => {
        keyboard.current = false;
      },
    },
    transition: (): Transition => (keyboard.current ? instant : glide),
  };
}

/** Press feedback for small pressables that aren't a Button: transform only, instant, strong ease-out. Full-width rows and cards answer in color instead. */
export const pressClass = "active:scale-[.98]";

/**
 * Transition for pressables whose hover changes color: color on `ease` (hover), scale on the strong
 * ease-out (press). Lists match `transition-property` order.
 */
export const pressColorTransition =
  "transition-[color,background-color,scale] duration-instant [transition-timing-function:var(--ease-hover),var(--ease-hover),var(--ease-out)]";
