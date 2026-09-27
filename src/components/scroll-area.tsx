import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { motion } from "motion/react";
import type { ReactNode, UIEventHandler } from "react";
import { cn } from "@/lib/cn";

/*
 * Scroll area. Native scrolling with thin, token-colored bars that stay
 * visible whenever there's more to see (state is visible), and darken on
 * hover and while scrolling. No fades at the edges unless you ask (`fade`).
 */

export interface ScrollAreaProps {
  children: ReactNode;
  /** Size the root (height/width); the viewport fills it. */
  className?: string;
  contentClassName?: string;
  /** Accessible name for the scrollable region; makes it a focusable, keyboard-scrollable landmark. */
  "aria-label"?: string;
  onScroll?: UIEventHandler<HTMLDivElement>;
  /**
   * Fade the top and bottom edges while there's more to see that way.
   * For long lists whose edge isn't otherwise marked, like a sidebar.
   */
  fade?: boolean;
  /**
   * The viewport is the scroll container for shared layout animations inside it
   * (e.g. a NavGroup's gliding highlight), so they measure through the scroll.
   */
  layoutScroll?: boolean;
}

const bar = cn(
  "flex touch-none p-0.5 select-none transition-opacity duration-quick",
  "opacity-70 data-hovering:opacity-100 data-scrolling:opacity-100",
  "data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col",
);
const thumb = cn(
  "rounded-[3px] bg-line-strong transition-colors duration-instant hover:bg-ink-3 active:bg-ink-3",
  "data-[orientation=vertical]:w-full data-[orientation=horizontal]:h-full",
  "data-scrolling:bg-ink-3",
);

export function ScrollArea({ children, className, contentClassName, onScroll, fade, layoutScroll, ...aria }: ScrollAreaProps) {
  return (
    <BaseScrollArea.Root className={cn("relative min-h-0 overflow-hidden", className)}>
      <BaseScrollArea.Viewport
        render={layoutScroll ? <motion.div layoutScroll /> : undefined}
        tabIndex={aria["aria-label"] ? 0 : undefined}
        role={aria["aria-label"] ? "region" : undefined}
        aria-label={aria["aria-label"]}
        onScroll={onScroll}
        className={cn("size-full overscroll-contain rounded-[inherit] -outline-offset-2", fade && "scroll-fade-y")}
      >
        <BaseScrollArea.Content className={contentClassName}>{children}</BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar orientation="vertical" className={bar}>
        <BaseScrollArea.Thumb className={thumb} />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Scrollbar orientation="horizontal" className={bar}>
        <BaseScrollArea.Thumb className={thumb} />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Corner />
    </BaseScrollArea.Root>
  );
}
