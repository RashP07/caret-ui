import { Progress as BaseProgress } from "@base-ui/react/progress";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Progress. For work with an end: a deploy, an index, a test run. The label
 * sits above with the value beside it; `null` means indeterminate and shows a
 * sliding stripe (stilled by reduced motion). Complete turns success; a
 * failing run uses the danger tone.
 */

export interface ProgressProps {
  label: ReactNode;
  /** 0–max, or null while the total is unknown. */
  value: number | null;
  max?: number;
  /** `danger` for a run that is failing. */
  tone?: "ink" | "danger";
  /** Text under the bar: what's happening now, or what went wrong. */
  hint?: ReactNode;
  /** What to print while indeterminate. */
  pendingText?: string;
  className?: string;
}

export function Progress({ label, value, max = 100, tone = "ink", hint, pendingText = "Working", className }: ProgressProps) {
  const danger = tone === "danger";
  return (
    <BaseProgress.Root
      value={value}
      max={max}
      className={cn("group/pr flex w-full min-w-0 flex-col gap-1.5", className)}
    >
      <div className="flex items-baseline gap-2">
        <BaseProgress.Label className="text-small font-control text-ink">{label}</BaseProgress.Label>
        <BaseProgress.Value
          className={cn(
            "ml-auto text-small font-control text-ink tabular-nums group-data-complete/pr:text-success",
            danger && "text-danger",
          )}
        >
          {(formatted) => (value == null ? pendingText : formatted)}
        </BaseProgress.Value>
      </div>
      <BaseProgress.Track className="relative h-1.5 overflow-hidden rounded-[2px] bg-sunken">
        <BaseProgress.Indicator
          // Determinate: a full-width bar scaled from the left (transform, not width),
          // so frequent updates during a run never trigger layout.
          style={value == null ? undefined : { transform: `scaleX(${Math.min(1, Math.max(0, value / max))})` }}
          className={cn(
            "block h-full bg-ink",
            value != null && "w-full! origin-left transition-[transform,background-color] duration-settle ease-out",
            "data-complete:bg-success",
            danger && "bg-danger",
            // Indeterminate: constant motion, so linear.
            "data-indeterminate:w-2/5 data-indeterminate:rounded-[2px] data-indeterminate:animate-[caret-progress-slide_1.4s_linear_infinite]",
          )}
        />
      </BaseProgress.Track>
      {hint != null && (
        <div className={cn("text-small text-ink-3 text-pretty", danger && "text-danger")}>{hint}</div>
      )}
    </BaseProgress.Root>
  );
}
