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

/** Sets the two line colors for everything inside. `--rule` is the frame; `--rule-faint` the construction. */
export const SHEET: CSSProperties = {
  ["--rule" as string]: "var(--line)",
  ["--rule-faint" as string]: "color-mix(in oklab, var(--line) 60%, var(--page))",
};

/** A hollow square where two lines meet. Place it with offsets; it centers on a 1px line at -4px (-5px across a border). */
export function Node({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute z-[1] size-[9px] border border-(--rule) bg-page", className)}
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

/** Ruler ticks down the outside of a Frame's left edge: a short tick every 8px, a long one every 64px. */
export function Ruler({ className }: { className?: string }) {
  const ticks = (color: string, every: number) =>
    `repeating-linear-gradient(to bottom, ${color} 0 1px, transparent 1px ${every}px)`;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-y-0 w-2 bg-no-repeat", className)}
      style={{
        right: "calc(100% + 1px)",
        backgroundImage: `${ticks("var(--rule-faint)", 8)}, ${ticks("var(--rule)", 64)}`,
        backgroundSize: "4px 100%, 8px 100%",
        backgroundPosition: "right top, right top",
      }}
    />
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

const SPRING = { stiffness: 100, damping: 18 };

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
