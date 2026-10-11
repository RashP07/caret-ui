import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Code, type CodeProps } from "@/components";
import { getMotionScale } from "@/lib/motion";
import { Corners } from "./shell/construction";
import { cn } from "@/lib/cn";


/*
 * Docs chrome. Every specimen is a square drafting cell: a plain canvas on the page ground (so
 * cards, code and wells set on it stand off it, as they would in an app), one
 * rule, and a caption strip on the hover tint carrying its name and its live
 * state as a row of hairline tags. Nodes mark the cell's corners.
 */

export type Pairs = [string, string][];

/**
 * Page mode: a section rendered as its own routed page. Its title becomes the
 * page's H1, and every specimen gets an H2 anchor, which "On this page" reads.
 */
export const PageModeContext = createContext(false);

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** An H2 anchor inside a page (scroll margin clears the sticky top bar). */
export function PageHeading({ children, id }: { children: string; id?: string }) {
  return (
    <h2 id={id ?? slugify(children)} className="mt-12 mb-5 scroll-mt-24 text-title font-heading text-balance">
      {children}
    </h2>
  );
}

/** Properties that mean something is moving (not just changing color). */
const MOVEMENT = /transform|translate|scale|rotate|left|top|right|bottom|width|height|inset/;

/**
 * Whether anything inside `ref` is moving right now: CSS transitions on
 * movement properties, plus motion's layout animations (which write
 * `transform` to inline styles frame by frame). Lightweight: events and a
 * MutationObserver, no polling.
 */
export function useAnimating<T extends HTMLElement>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [animating, setAnimating] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let css = 0;
    let styleMoving = false;
    let quiet = 0;
    const sync = () => setAnimating(css > 0 || styleMoving);
    const onRun = (e: TransitionEvent) => {
      if (!MOVEMENT.test(e.propertyName)) return;
      css++;
      sync();
    };
    const onEnd = (e: TransitionEvent) => {
      if (!MOVEMENT.test(e.propertyName)) return;
      css = Math.max(0, css - 1);
      sync();
    };
    const mo = new MutationObserver((records) => {
      const moved = records.some((r) => {
        const now = (r.target as HTMLElement).style?.transform ?? "";
        return (r.oldValue ?? "").includes("transform") || (now !== "" && now !== "none");
      });
      if (!moved) return;
      styleMoving = true;
      sync();
      clearTimeout(quiet);
      // motion writes every frame; two quiet frames (scaled for slow motion) means it has settled
      quiet = window.setTimeout(() => {
        styleMoving = false;
        sync();
      }, 50 * getMotionScale());
    });
    el.addEventListener("transitionrun", onRun);
    el.addEventListener("transitionend", onEnd);
    el.addEventListener("transitioncancel", onEnd);
    mo.observe(el, { subtree: true, attributes: true, attributeFilter: ["style"], attributeOldValue: true });
    return () => {
      clearTimeout(quiet);
      mo.disconnect();
      el.removeEventListener("transitionrun", onRun);
      el.removeEventListener("transitionend", onEnd);
      el.removeEventListener("transitioncancel", onEnd);
    };
  }, []);
  return [ref, animating];
}

/**
 * The live state, as hairline tags: one `key │ value` cell per pair, drawn with a single line.
 * When a value changes, only its tag answers: the line and the value turn the accent and
 * settle back (the stroke is the only highlight; no dot, no fill).
 */
export function StateReadout({ pairs, className }: { pairs: Pairs; className?: string }) {
  const [changed, setChanged] = useState<ReadonlySet<string>>(new Set());
  const prev = useRef<Map<string, string> | null>(null);
  const key = JSON.stringify(pairs);
  useEffect(() => {
    const before = prev.current;
    prev.current = new Map(pairs);
    if (!before) return;
    const next = new Set(pairs.filter(([k, v]) => before.get(k) !== v).map(([k]) => k));
    if (!next.size) return;
    setChanged(next);
    const t = setTimeout(() => setChanged(new Set()), 700);
    return () => clearTimeout(t);
  }, [key]);

  return (
    <code
      role="status"
      className={cn(
        "ms-auto flex min-w-0 flex-wrap items-center justify-end gap-1.5 text-caption leading-none max-[600px]:ms-0 max-[600px]:justify-start",
        className,
      )}
    >
      {pairs.map(([k, v]) => {
        const on = changed.has(k);
        return (
          <span
            key={k}
            data-changed={on || undefined}
            className={cn(
              // line-strong: the tags sit on the caption's hover tint, where --line would barely show.
              "inline-flex h-5 items-stretch overflow-hidden rounded-inline border-stroke border-line-strong whitespace-nowrap",
              // Out slowly on the hairline ease; in at once, so the change is read where it happens.
              "transition-colors duration-700 ease-drawer data-changed:border-accent-strong data-changed:duration-0",
            )}
          >
            <span className="flex items-center px-1.5 font-ui text-ink-3">{k}</span>
            <span
              className={cn(
                "mono flex items-center border-l border-[inherit] px-1.5 text-ink-2",
                "transition-colors duration-700 ease-drawer",
                on && "text-accent-strong duration-0",
              )}
            >
              {v}
            </span>
          </span>
        );
      })}
    </code>
  );
}

/**
 * The specimen's caption strip: its name on the left, its live state on the right. It sits on the
 * hover tint, set off from the canvas by the cell's one inner rule (the landing cards' caption).
 */
export function SpecBar({ name, state, className }: { name: string; state: Pairs; className?: string }) {
  return (
    <figcaption
      className={cn("flex min-h-10 items-center gap-3 border-t border-(--frame) bg-hover px-3 py-2 text-caption", className)}
    >
      <span className="font-control whitespace-nowrap text-ink-2 max-[600px]:hidden">{name}</span>
      <StateReadout pairs={state} />
    </figcaption>
  );
}

export interface SpecProps {
  name: string;
  state: Pairs;
  children: ReactNode;
  /** center (default), left, or stack (column). */
  layout?: "center" | "left" | "stack" | "block";
  className?: string;
  canvasClassName?: string;
  /** Append `animating: true/false` to the readout while anything in the canvas moves. */
  trackMotion?: boolean;
}

export function Spec({ name, state, children, layout = "center", className, canvasClassName, trackMotion }: SpecProps) {
  const page = useContext(PageModeContext);
  const [canvasRef, animating] = useAnimating<HTMLDivElement>();
  const pairs: Pairs = trackMotion ? [...state, ["animating", String(animating)]] : state;
  const figure = (
    // A specimen frame: square and unclipped (nothing inside loses a focus ring), Nodes on its corners.
    <figure className={cn("relative m-0 mb-4 min-w-0 border border-(--frame) bg-page", className)}>
      <Corners />
      <div
        ref={canvasRef}
        className={cn(
          "relative flex min-h-[180px] flex-wrap items-center justify-center gap-4 bg-page px-8 py-12",
          "max-[860px]:px-4 max-[860px]:py-8",
          layout === "left" && "items-start justify-start",
          layout === "stack" && "flex-col",
          layout === "block" && "block",
          canvasClassName,
        )}
      >
        {children}
      </div>
      <SpecBar name={name} state={pairs} />
    </figure>
  );
  if (!page) return figure;
  // In a page, each specimen is a titled section (and a table-of-contents entry).
  return (
    <div className="min-w-0">
      <PageHeading>{capitalize(name)}</PageHeading>
      {figure}
    </div>
  );
}

export function Section({
  id,
  title,
  children,
  lede,
}: {
  id: string;
  title: string;
  lede: ReactNode;
  children: ReactNode;
}) {
  const page = useContext(PageModeContext);
  if (page) {
    return (
      <article id={id} aria-labelledby={`h-${id}`}>
        <header className="mb-4">
          <h1 id={`h-${id}`} className="m-0 text-h1 font-heading text-balance">
            {title}
          </h1>
          <p className="mt-4 mb-0 max-w-[64ch] text-body text-pretty text-ink-2">{lede}</p>
        </header>
        {children}
      </article>
    );
  }
  return (
    <section id={id} aria-labelledby={`h-${id}`} className="scroll-mt-[72px] pt-16">
      {/* Title over lede, one reading column, the same as a page header. Never side by side: a
          two-column split strands a short title against a paragraph and reads as two unrelated blocks. */}
      <header className="mb-6">
        <h2 id={`h-${id}`} className="m-0 text-h2 font-heading text-balance">
          {title}
        </h2>
        <p className="mt-3 mb-0 max-w-[64ch] text-body text-pretty text-ink-2">{lede}</p>
      </header>
      {children}
    </section>
  );
}

/** A code block on a docs page: the library's Code as it ships. */
export function SheetCode(props: CodeProps) {
  return <Code {...props} />;
}
