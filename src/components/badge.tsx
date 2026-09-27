import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "ok" | "live" | "danger" | "warning" | "info";

/** Soft: a status tint with status text (≥4.5:1 on its tint). */
const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-sunken text-ink-2",
  ok: "border-transparent bg-success-soft text-success",
  live: "border-transparent bg-accent-soft text-ink",
  danger: "border-transparent bg-danger-soft text-danger",
  warning: "border-transparent bg-warning-soft text-warning",
  info: "border-transparent bg-info-soft text-info",
};

/** Solid: the status fill and its on-color, for the one badge that must be seen. */
const solids: Record<BadgeTone, string> = {
  neutral: "border-transparent bg-ink text-on-ink",
  ok: "border-transparent bg-success-solid text-on-success",
  live: "border-transparent bg-accent text-on-accent",
  danger: "border-transparent bg-danger-solid text-on-danger",
  warning: "border-transparent bg-warning-solid text-on-warning",
  info: "border-transparent bg-info-solid text-on-info",
};

export interface BadgeProps extends ComponentProps<"span"> {
  tone?: BadgeTone;
  /** Solid fill instead of a soft tint. */
  solid?: boolean;
  /** Leading status dot. `live` pulses in the accent color. */
  dot?: boolean;
}

/**
 * Status, count or date pill. It keeps its width in a row and truncates only
 * when it alone is wider than its container; pass `title` when the text may.
 */
export function Badge({ tone = "neutral", solid, dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-[22px] max-w-full flex-none items-center gap-1.5 rounded-pill border px-2 py-0.5 text-caption font-control whitespace-nowrap",
        solid ? solids[tone] : tones[tone],
        className,
      )}
      {...props}
    >
      {dot && (
        <i
          aria-hidden
          className={cn(
            "size-1.5 flex-none rounded-full bg-current",
            tone === "live" && "animate-pulse-dot",
            tone === "live" && !solid && "bg-accent-strong",
          )}
        />
      )}
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
