import { Slider as BaseSlider } from "@base-ui/react/slider";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { fieldLabelClass, hintClass } from "./input";

/*
 * Slider. For a value where the rough position matters more than the exact
 * number (a budget, a temperature). The number is still printed beside
 * the label, at least as large as it. Arrows step, Shift+Arrow and Page Up/Down take large
 * steps, Home/End jump to the ends. Two thumbs make a range.
 *   line — a thin track and a round thumb. Compact, for forms.
 *   fill — a tall track that fills to the value, dotted at each step, with a bar handle
 *          riding inside the fill. For settings where the amount itself is the point.
 */

type Value = number | number[];

const markFocusProxy = (input: HTMLInputElement | null) => input?.setAttribute("data-focus-proxy", "");

export interface SliderProps<V extends Value> {
  label: ReactNode;
  hint?: ReactNode;
  value: V;
  onValueChange: (value: V) => void;
  /** Fires when a drag or key press settles. */
  onValueCommitted?: (value: V) => void;
  min?: number;
  max?: number;
  step?: number;
  largeStep?: number;
  /** Formats the readout and the value announced to assistive tech. */
  format?: Intl.NumberFormatOptions;
  /** Custom readout, e.g. "$12 – $40". Defaults to the formatted values. */
  renderValue?: (formatted: readonly string[], values: readonly number[]) => ReactNode;
  /** Accessible names for each thumb in a range, e.g. ["Minimum", "Maximum"]. */
  thumbLabels?: string[];
  /** `line` (default) or `fill`. */
  variant?: "line" | "fill";
  disabled?: boolean;
  className?: string;
}

/** Tick dots for the fill variant: one per step when there are few, else twenty evenly spaced. */
function ticks(min: number, max: number, step: number): number[] {
  const steps = Math.round((max - min) / step);
  const n = steps > 0 && steps <= 40 ? steps : 20;
  return Array.from({ length: n + 1 }, (_, i) => i / n);
}

export function Slider<V extends Value>({
  label,
  hint,
  value,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  largeStep,
  format,
  renderValue,
  thumbLabels,
  variant = "line",
  disabled,
  className,
}: SliderProps<V>) {
  const count = Array.isArray(value) ? value.length : 1;
  const fill = variant === "fill";
  return (
    <BaseSlider.Root
      value={value}
      onValueChange={(v) => onValueChange(v as V)}
      onValueCommitted={onValueCommitted ? (v) => onValueCommitted(v as V) : undefined}
      min={min}
      max={max}
      step={step}
      largeStep={largeStep}
      format={format}
      disabled={disabled}
      className={cn("group/slider flex w-full min-w-0 flex-col gap-1.5", className)}
    >
      <div className="flex items-baseline gap-2">
        <BaseSlider.Label className={fieldLabelClass}>{label}</BaseSlider.Label>
        <BaseSlider.Value className="ml-auto text-small font-control text-ink tabular-nums group-data-disabled/slider:text-ink-disabled">
          {(formatted, values) => (renderValue ? renderValue(formatted, values) : formatted.join(" – "))}
        </BaseSlider.Value>
      </div>
      {fill ? (
        // The track is inset 12px so the fill can reach past the handle at both ends without clipping.
        <BaseSlider.Control className="flex h-10 w-full touch-none items-center rounded-control bg-sunken px-3 shadow-[inset_0_0_0_1px_var(--line)] select-none data-disabled:cursor-not-allowed touch:h-11">
          {/* 4px inset top and bottom: the fill sits inside the track like a raised block. */}
          <BaseSlider.Track className="relative h-[calc(100%-0.5rem)] w-full">
            <BaseSlider.Indicator
              className={cn(
                "bg-[light-dark(var(--surface),var(--pressed))]",
                // The fill reaches 12px past its ends, so the handle rides inside it.
                "before:absolute before:inset-y-0 before:-left-3 before:w-3 before:rounded-l-[calc(var(--r-control)-4px)] before:bg-inherit before:content-['']",
                "after:absolute after:inset-y-0 after:-right-3 after:w-3 after:rounded-r-[calc(var(--r-control)-4px)] after:bg-inherit after:content-['']",
              )}
            />
            {ticks(min, max, step).map((t) => (
              <span
                key={t}
                aria-hidden
                className="pointer-events-none absolute top-1/2 size-1 -translate-1/2 rounded-full bg-ink-3 group-data-disabled/slider:bg-ink-disabled"
                style={{ left: `${t * 100}%` }}
              />
            ))}
            {Array.from({ length: count }, (_, i) => (
              <BaseSlider.Thumb
                key={i}
                index={i}
                data-focus-target
                inputRef={markFocusProxy}
                getAriaLabel={thumbLabels ? (idx) => thumbLabels[idx] ?? "" : undefined}
                className={cn(
                  "z-[1] h-6 w-1 rounded-full bg-ink",
                  // 24px to grab (44px on touch) around the 4px bar.
                  "before:absolute before:-inset-x-2.5 before:-inset-y-1 before:content-[''] touch:before:-inset-x-5 touch:before:-inset-y-2.5",
                  "transition-[background-color,scale] duration-instant ease-out",
                  "data-dragging:scale-y-110 data-dragging:bg-accent-strong",
                  "group-data-disabled/slider:bg-ink-disabled",
                )}
              />
            ))}
          </BaseSlider.Track>
        </BaseSlider.Control>
      ) : (
      /* 36px of hit area around a 4px track: one size, easy to grab. */
      <BaseSlider.Control className="flex h-9 w-full touch-none items-center select-none data-disabled:cursor-not-allowed">
        <BaseSlider.Track className="relative h-1 w-full rounded-[2px] bg-sunken shadow-[inset_0_0_0_1px_var(--border-control)]">
          <BaseSlider.Indicator className="rounded-[2px] bg-ink group-data-disabled/slider:bg-ink-disabled" />
          {Array.from({ length: count }, (_, i) => (
            <BaseSlider.Thumb
              key={i}
              index={i}
              data-focus-target
              // The thumb wears the ring for its visually hidden range input.
              inputRef={markFocusProxy}
              getAriaLabel={thumbLabels ? (idx) => thumbLabels[idx] ?? "" : undefined}
              className={cn(
                "size-4 rounded-full border-[1.5px] border-ink bg-surface",
                // 24px to grab (44px on touch) around the 16px dot.
                "before:absolute before:-inset-1 before:rounded-full before:content-[''] touch:before:-inset-3.5",
                "transition-[scale,background-color] duration-instant ease-out",
                "hover:scale-110 data-dragging:scale-110 data-dragging:bg-accent-strong",
                "group-data-disabled/slider:border-ink-disabled group-data-disabled/slider:hover:scale-100",
              )}
            />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
      )}
      {hint != null && <div className={hintClass}>{hint}</div>}
    </BaseSlider.Root>
  );
}
