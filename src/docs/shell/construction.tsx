import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useLayoutEffect, useRef, type ComponentProps, type CSSProperties } from "react";
import { cn } from "@/lib/cn";

/* =========================================================
   Construction lines: the drafting grid behind a page.

   Every piece here is decoration: aria-hidden, pointer-events-none, and drawn
   from the two dimmest line colors so content never loses contrast. The only
   accent is the Crosshair's `+`.

   Pixel grid: strokes are 1px; a Node centers on a 1px hairline, so it is odd
   (9px, 4px either side of the line's pixel); straight lines are borders or
   whole-px gradients; moving lines translate by rounded px only.
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

/** A column framed by 1px hairlines on both sides, with optional nodes where a rule meets its top or bottom edge. */
export function Frame({
  nodes,
  className,
  children,
  ...props
}: ComponentProps<"div"> & { nodes?: "top" | "bottom" | "both" }) {
  const top = nodes === "top" || nodes === "both";
  const bottom = nodes === "bottom" || nodes === "both";
  return (
    <div className={cn("relative border-x border-(--rule)", className)} {...props}>
      {top && (
        <>
          <Node className="-top-[5px] -left-[5px]" />
          <Node className="-top-[5px] -right-[5px]" />
        </>
      )}
      {bottom && (
        <>
          <Node className="-bottom-[5px] -left-[5px]" />
          <Node className="-bottom-[5px] -right-[5px]" />
        </>
      )}
      {children}
    </div>
  );
}

/** A 1px horizontal rule inside a Frame. `bleed` runs it past the frame into the margins; `nodes` marks where it crosses the frame. */
export function Rule({ bleed = true, nodes = true, className }: { bleed?: boolean; nodes?: boolean; className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none relative h-px", className)}>
      <span className={cn("absolute inset-y-0 bg-(--rule)", bleed ? "-inset-x-[100vw]" : "inset-x-0")} />
      {nodes && (
        <>
          <Node className="-top-1 -left-[5px]" />
          <Node className="-top-1 -right-[5px]" />
        </>
      )}
    </div>
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

/** A specimen frame: square, a 1px `--frame` hairline, a Node on each corner. Nothing clips inside it. */
export function Cell({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("relative min-w-0 border border-(--frame)", className)} {...props}>
      <Corners />
      {children}
    </div>
  );
}

/* The docs sheet's reading column: its padding inside the frame lines, and the negative margin that
   lets a rule or a band run edge to edge, from frame line to frame line (or the TOC's line). */
export const COLUMN_PAD = "px-10 max-[1000px]:px-6 max-[600px]:px-4";
export const COLUMN_BLEED = "-mx-10 max-[1000px]:-mx-6 max-[600px]:-mx-4";

/** A rule across the docs reading column, with Nodes where it meets the frame lines on either side. */
export function ColumnRule({ className }: { className?: string }) {
  return <Rule bleed={false} className={cn(COLUMN_BLEED, className)} />;
}

/**
 * Dashed column guides, centered in the gaps of a grid with the same `columns` and `gap`.
 * Fills its positioned parent; inset it to the grid's content box with `className`.
 */
export function Guides({ columns, gap = 16, className }: { columns: number; gap?: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 inset-y-0 grid", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, columnGap: gap }}
    >
      {Array.from({ length: columns }, (_, i) => (
        <span key={i} className="relative">
          {i > 0 && <span className="absolute inset-y-0 border-l border-dashed border-(--rule-faint)" style={{ left: -gap / 2 }} />}
        </span>
      ))}
    </div>
  );
}

/**
 * Ruler ticks, a short one every 8px and a long one every 64px. `frame` (the default) hangs them
 * down the outside of a Frame's left edge; `edge` down the right edge of its positioned parent,
 * the far right of the page when that parent is full width.
 */
export function Ruler({ at = "frame", className }: { at?: "frame" | "edge"; className?: string }) {
  const ticks = (color: string, every: number) =>
    `repeating-linear-gradient(to bottom, ${color} 0 1px, transparent 1px ${every}px)`;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-y-0 z-[1] w-2 bg-no-repeat", className)}
      style={{
        right: at === "edge" ? 0 : "calc(100% + 1px)",
        backgroundImage: `${ticks("var(--rule-faint)", 8)}, ${ticks("var(--rule)", 64)}`,
        backgroundSize: "4px 100%, 8px 100%",
        backgroundPosition: "right top, right top",
      }}
    />
  );
}

/* One 128px cell of the margin grid as a mask: a dashed vertical on the side nearest the frame, a
   dashed horizontal on the bottom. Each margin's tile starts on the frame's border pixel, which the
   panel then clips off, so the first guide falls a full cell out and none doubles the border. */
const cell = (x: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><path d='M${x} 0V128M0 127.5H128' stroke='black' stroke-dasharray='4 4' fill='none'/></svg>`,
  )}")`;

/**
 * A dashed 128px grid in both margins of a Frame, square to its edges, in `--rule-faint` toned toward the page. Fills the
 * frame's height; the page's horizontal clip trims it at the viewport. Render it first in the Frame.
 */
export function MarginGrid({ className }: { className?: string }) {
  // Toned toward the page: a whole margin of dashes reads heavier than one guide in the same color.
  const panel = "pointer-events-none absolute inset-y-0 w-[100vw] bg-[color-mix(in_oklab,var(--rule-faint)_60%,var(--page))]";
  return (
    <div aria-hidden className={cn("contents", className)}>
      <span
        className={cn(panel, "right-full [clip-path:inset(0_1px_0_0)]")}
        style={{ maskImage: cell(127.5), maskPosition: "right top", maskSize: "128px 128px" }}
      />
      <span
        className={cn(panel, "left-full [clip-path:inset(0_0_0_1px)]")}
        style={{ maskImage: cell(0.5), maskPosition: "left top", maskSize: "128px 128px" }}
      />
    </div>
  );
}

const FADE = {
  "to-bottom-left": { corner: "top-0 right-0", x: "to left", y: "to bottom", mask: "to bottom left" },
  "to-bottom-right": { corner: "top-0 left-0", x: "to right", y: "to bottom", mask: "to bottom right" },
  "to-top-left": { corner: "bottom-0 right-0", x: "to left", y: "to top", mask: "to top left" },
  "to-top-right": { corner: "bottom-0 left-0", x: "to right", y: "to top", mask: "to top right" },
} as const;

/**
 * A patch of graph paper (8px squares, 1px `--rule-faint` lines) in one corner of its positioned
 * parent, fading out along the diagonal named by `fade`: `to-bottom-left` sits top right. Lines are
 * counted from that corner, 8px in, so the parent's own edge lines close the first row of squares.
 * Size it with `className` in multiples of 8px; the default is 384 × 256.
 */
export function GraphPaper({
  fade = "to-bottom-left",
  className,
}: {
  fade?: keyof typeof FADE;
  className?: string;
}) {
  const f = FADE[fade];
  const lines = (dir: string) => `repeating-linear-gradient(${dir}, transparent 0 7px, var(--rule-faint) 7px 8px)`;
  const mask = `linear-gradient(${f.mask}, black, transparent 75%)`;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute h-64 w-96", f.corner, className)}
      style={{ backgroundImage: `${lines(f.x)}, ${lines(f.y)}`, maskImage: mask, WebkitMaskImage: mask }}
    />
  );
}

/**
 * A diamond glyph drawn as construction lines, stretched to fill its positioned parent: a flat table
 * along the top, a short crown of four facets, the girdle running edge to edge at `girdle` (a fraction
 * of the height), and a pavilion closing on the culet at the middle of the bottom edge, where a
 * Crosshair resting at { x: 0.5, y: 1 } meets it. One 1px stroke in three tiers: the silhouette and
 * girdle in `--rule`, facets in `--rule-faint`, one short glint on the table a step brighter.
 * `clear` fades the lines out in a soft ellipse around the middle, so text set over it never fights them.
 */
export function DiamondFigure({
  girdle = 0.34,
  clear = true,
  className,
}: {
  girdle?: number;
  clear?: boolean;
  className?: string;
}) {
  const G = Math.round(girdle * 1000);
  const mask = "radial-gradient(ellipse 38% 50% at 50% 46%, transparent 45%, black 100%)";
  const stroke = { fill: "none", strokeWidth: 1, vectorEffect: "non-scaling-stroke" } as const;
  // The box takes the insets and the mask; the svg fills it (an absolute svg alone keeps its intrinsic size).
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={clear ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
    >
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="size-full overflow-visible">
        {/* Crown facets from the table down to the girdle's quarter points, then the pavilion's two mains. */}
        <path
          d={`M300 0L250 ${G}L500 0L750 ${G}L700 0 M250 ${G}L500 1000L750 ${G}`}
          stroke="var(--rule-faint)"
          strokeLinejoin="miter"
          {...stroke}
        />
        <path d={`M300 0H700L1000 ${G}L500 1000L0 ${G}Z M0 ${G}H1000`} stroke="var(--rule)" strokeLinejoin="miter" {...stroke} />
        {/* Where the light catches: the table's front-left edge. */}
        <path d="M300 0H420" stroke="color-mix(in oklab, var(--ink) 40%, transparent)" {...stroke} />
      </svg>
    </div>
  );
}

/**
 * A prism seen from above, stretched to fill its positioned parent: one large upward triangle with
 * its apex at the top centre and its base on the parent's bottom edge (left undrawn: the rule below
 * is the base), and a concentric triangle at half scale, its corners joined to the outer ones.
 * The outer sides are `--rule`; the inner triangle and its joins `--rule-faint`, with one short
 * highlight a step brighter on the inner left edge. `clear` dims the lines in a soft ellipse around
 * the middle (to a fifth, not out), so text set over it never fights them yet the figure still reads.
 */
export function PrismFigure({ clear = true, className }: { clear?: boolean; className?: string }) {
  // Inner triangle: the outer one scaled by half about its centroid (500, 667).
  const [l, r, top, base] = [250, 750, 333, 833];
  const mask = "radial-gradient(ellipse 38% 50% at 50% 46%, rgb(0 0 0 / .2) 45%, black 100%)";
  const stroke = { fill: "none", strokeWidth: 1, strokeLinejoin: "miter", vectorEffect: "non-scaling-stroke" } as const;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={clear ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
    >
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="size-full overflow-visible">
        <path
          d={`M${l} ${base}L500 ${top}L${r} ${base}Z M0 1000L${l} ${base} M500 0V${top} M1000 1000L${r} ${base}`}
          stroke="var(--rule-faint)"
          {...stroke}
        />
        <path d="M0 1000L500 0L1000 1000" stroke="var(--rule)" {...stroke} />
        {/* Where the light catches: the upper part of the inner left edge. */}
        <path
          d={`M500 ${top}L${500 - (500 - l) * 0.3} ${top + (base - top) * 0.3}`}
          stroke="color-mix(in oklab, var(--ink) 40%, transparent)"
          {...stroke}
        />
      </svg>
    </div>
  );
}

/**
 * The upper half of a regular polygon on its parent's bottom edge, as wide as fits: the
 * drafted figure behind a hero. `facets` is how many straight edges span the half:
 * 2 is a diamond's peak, 4 half an octagon (the default), 6 half a dodecagon.
 * Straight facets instead of a compass curve, so it reads as construction, not ornament.
 */
export function ConstructionArc({
  facets = 4,
  variant = "polygon",
  className,
}: {
  facets?: number;
  /** `golden`: a golden rectangle cut into its shrinking squares, all straight lines. */
  variant?: "polygon" | "golden";
  className?: string;
}) {
  if (variant === "golden") return <GoldenFigure className={className} />;
  const points = Array.from({ length: facets + 1 }, (_, i) => {
    const a = Math.PI - (i * Math.PI) / facets;
    return `${(500 + 500 * Math.cos(a)).toFixed(1)},${(500 - 500 * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 500"
      preserveAspectRatio="xMidYMax meet"
      className={cn("pointer-events-none absolute inset-0 size-full overflow-visible text-(--rule-faint)", className)}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const PHI = (1 + Math.sqrt(5)) / 2;

/**
 * A golden rectangle (1000 × 618) on its parent's bottom edge, cut into the squares of the
 * golden spiral, turning clockwise: left, top, right, bottom, and so on, eight cuts deep.
 * Straight lines only (the spiral itself is implied, never drawn).
 */
function GoldenFigure({ className }: { className?: string }) {
  const W = 1000;
  const H = W / PHI;
  const cuts: string[] = [];
  let [x, y, w, h] = [0, 0, W, H];
  for (let i = 0; i < 8; i++) {
    const s = Math.min(w, h);
    switch (i % 4) {
      case 0: x += s; w -= s; cuts.push(`M${x} ${y}V${y + h}`); break; // square on the left
      case 1: y += s; h -= s; cuts.push(`M${x} ${y}H${x + w}`); break; // on top
      case 2: w -= s; cuts.push(`M${x + w} ${y}V${y + h}`); break; // on the right
      case 3: h -= s; cuts.push(`M${x} ${y + h}H${x + w}`); break; // on the bottom
    }
  }
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H.toFixed(1)}`}
      preserveAspectRatio="xMidYMax meet"
      className={cn("pointer-events-none absolute inset-0 size-full overflow-visible text-(--rule-faint)", className)}
    >
      <path
        d={`M0 0H${W}V${H}H0Z ${cuts.join(" ")}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        shapeRendering="crispEdges"
      />
    </svg>
  );
}

/** One long diagonal off the top-right corner of its parent, out through the right margin. */
export function Diagonal({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute top-0 left-full size-[100vw] overflow-visible text-(--rule-faint)", className)}
    >
      <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* Critically damped (damping = 2√(stiffness × mass)): it settles fast and never overshoots. */
const SPRING = { stiffness: 400, damping: 40, mass: 1 };

/**
 * Two full-length guides crossing at an accent `+`. They rest at `rest` (fractions of the
 * parent, rounded to whole px). With `track`, they follow a mouse inside the parent on a
 * spring; never on touch or under reduced motion, and they snap back when the pointer leaves.
 */
export function Crosshair({
  rest = { x: 0.5, y: 0.5 },
  track = false,
  className,
}: {
  rest?: { x: number; y: number };
  track?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // Targets in px; the springs chase them, and a snap jumps both.
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const x = useSpring(tx, SPRING);
  const y = useSpring(ty, SPRING);
  // Springs land between pixels; the lines only ever move by whole px.
  const px = useTransform(x, Math.round);
  const py = useTransform(y, Math.round);

  useLayoutEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    let following = false;
    const snap = () => {
      const r = el.getBoundingClientRect();
      const rx = Math.round(r.width * rest.x);
      const ry = Math.round(r.height * rest.y);
      tx.jump(rx);
      ty.jump(ry);
      x.jump(rx);
      y.jump(ry);
    };
    // After the first paint, once the lines are subscribed to their values.
    const raf = requestAnimationFrame(snap);
    const ro = new ResizeObserver(() => !following && snap());
    ro.observe(el);
    if (!track || reduce) {
      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
      };
    }

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !fine.matches) return;
      following = true;
      const r = el.getBoundingClientRect();
      tx.set(Math.round(e.clientX - r.left));
      ty.set(Math.round(e.clientY - r.top));
    };
    const leave = () => {
      following = false;
      snap();
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, [track, reduce, rest.x, rest.y, tx, ty, x, y]);

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <motion.span style={{ x: px }} className="absolute inset-y-0 left-0 w-px bg-(--rule-faint)" />
      <motion.span style={{ y: py }} className="absolute inset-x-0 top-0 h-px bg-(--rule-faint)" />
      {/* 11px: odd, so its 1px arms center on the guides' pixel. */}
      <motion.span style={{ x: px, y: py }} className="absolute -top-[5px] -left-[5px] z-[2] size-[11px]">
        <span className="absolute inset-x-0 top-[5px] h-px bg-accent" />
        <span className="absolute inset-y-0 left-[5px] w-px bg-accent" />
      </motion.span>
    </div>
  );
}
