import { Meter as BaseMeter } from "@base-ui/react/meter";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Meter. For a level within a known range: a quota, a budget, disk use.
 * Not progress: nothing is finishing. A tick marks the threshold; at or
 * above it the bar and value turn danger, like the context meter at 85%.
 */

export interface MeterProps {
  label: ReactNode;
  value: number;
  min?: number;
  max?: number;
  /** Percent of the range at which the meter turns danger. */
  threshold?: number;
  /** Printed value, e.g. v => `${v} / 500 GB`. Defaults to a percentage. */
  valueText?: (value: number) => string;
  /** Text under the bar. Replaced by `hotHint` at the threshold. */
  hint?: ReactNode;
  hotHint?: ReactNode;
  className?: string;
}

export function Meter({ label, value, min = 0, max = 100, threshold = 85, valueText, hint, hotHint, className }: MeterProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const hot = pct >= threshold;
  return (
    <BaseMeter.Root
      value={value}
      min={min}
      max={max}
      getAriaValueText={valueText ? (_, v) => valueText(v) : undefined}
      className={cn("flex w-full min-w-0 flex-col gap-1.5", className)}
      data-hot={hot || undefined}
    >
      <div className="flex items-baseline gap-2">
        <BaseMeter.Label className="text-small font-control text-ink">{label}</BaseMeter.Label>
        <BaseMeter.Value className={cn("ml-auto text-small font-control text-ink tabular-nums", hot && "text-danger")}>
          {(formatted, v) => (valueText ? valueText(v) : formatted)}
        </BaseMeter.Value>
      </div>
      <BaseMeter.Track className="relative h-2 overflow-hidden rounded-[2px] bg-sunken">
        <BaseMeter.Indicator
          // Full width, scaled from the left: transform instead of width, so no layout per update.
          style={{ transform: `scaleX(${Math.min(1, Math.max(0, pct / 100))})` }}
          className={cn(
            "block h-full w-full! origin-left transition-[transform,background-color] duration-settle ease-out",
            hot ? "bg-danger" : "bg-ink",
          )}
        />
        <span
          aria-hidden
          className="absolute inset-y-0 w-px bg-border-control"
          style={{ left: `${threshold}%` }}
        />
      </BaseMeter.Track>
      {(hot ? (hotHint ?? hint) : hint) != null && (
        <div className={cn("text-small text-ink-3 text-pretty", hot && hotHint != null && "text-danger")}>
          {hot ? (hotHint ?? hint) : hint}
        </div>
      )}
    </BaseMeter.Root>
  );
}
