import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/* =========================================================
   Construction lines: the drafting grid behind a page.

   Every piece here is decoration: aria-hidden, pointer-events-none, and drawn
   from the two dimmest line colors so content never loses contrast.

   Pixel grid: strokes are 1px; a Node centers on a 1px hairline, so it is odd
   (9px, 4px either side of the line's pixel); straight lines are borders or
   whole-px gradients.
   ========================================================= */

/**
 * The docs' line colors. Two kinds of edge, two jobs:
 *   --rule   structure: the sidebar's edge, the top bar's. Quiet.
 *   --frame  a specimen: the square hairline frame around something on display (a live demo, a
 *            showcase cell, an index thumbnail), with a Node on its outer corners only.
 * Everything else is a Caret component doing its own job (Card, Code), with its own radius.
 */
export const SHEET: CSSProperties = {
  ["--rule" as string]: "var(--line)",
  ["--frame" as string]: "var(--line-strong)",
  ["--rule-faint" as string]: "var(--line)",
};

/** A hollow square where two lines meet. Place it with offsets; it centers on a 1px line at -4px (-5px across a border). */
export function Node({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute z-[1] size-[9px] border border-(--frame) bg-page", className)}
    />
  );
}

/** A Node on each corner of a box drawn with a 1px border (its positioned parent). */
export function Corners() {
  return (
    <>
      <Node className="-top-[5px] -left-[5px]" />
      <Node className="-top-[5px] -right-[5px]" />
      <Node className="-bottom-[5px] -left-[5px]" />
      <Node className="-right-[5px] -bottom-[5px]" />
    </>
  );
}


/* The docs sheet's reading column: its padding inside the frame lines, and the negative margin that
   lets a rule or a band run edge to edge, from frame line to frame line (or the TOC's line). */
export const COLUMN_PAD = "px-10 max-[1000px]:px-6 max-[600px]:px-4";
