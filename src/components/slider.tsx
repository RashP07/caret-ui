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
 *   fill — a tall bar that fills to the value, with a thin handle riding just inside the
 *          fill's edge. Label and value sit above. For settings where the amount itself
 *          is the point.
 *   scrubber — the fill bar with the label and value inside it. One compact row.
 */

type Value = number | number[];

const markFocusProxy = (input: HTMLInputElement | null) => input?.setAttribute("data-focus-proxy", "");

/*
 * Motion. A click on the track or an arrow key springs the thumb and fill to the new value
 * (a soft spring); grabbing the handle squashes it on a bouncier one. While dragging, position
 * follows the pointer 1:1 (no transition) and only the squash animates. Reduced motion snaps.
 */
const travel = "calc(420ms*var(--motion-scale))";
const pop = "calc(480ms*var(--motion-scale))";
const indicatorMotion = cn(
  "transition-[inset-inline-start,left,width]",
  `[transition-duration:${travel}] ease-spring-soft data-dragging:transition-none`,
);
const thumbMotion = cn(
  "transition-[inset-inline-start,left,scale,background-color]",
  `[transition-duration:${travel},${travel},${pop},var(--d-instant)]`,
  "[transition-timing-function:var(--ease-spring-soft),var(--ease-spring-soft),var(--ease-gooey),var(--ease-hover)]",
  `data-dragging:transition-[scale,background-color] data-dragging:[transition-duration:${pop},var(--d-instant)]`,
  "data-dragging:[transition-timing-function:var(--ease-gooey),var(--ease-hover)]",
);

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
  /** `line` (default), `fill`, or `scrubber` (fill with the label and value inside). */
  variant?: "line" | "fill" | "scrubber";
  disabled?: boolean;
  className?: string;
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
  const bar = variant !== "line";
  const inside = variant === "scrubber";
  const readout = (formatted: readonly string[], values: readonly number[]) =>
    renderValue ? renderValue(formatted, values) : formatted.join(" – ");
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
      {!inside && (
        <div className="flex items-baseline gap-2">
          <BaseSlider.Label className={fieldLabelClass}>{label}</BaseSlider.Label>
          <BaseSlider.Value className="ml-auto text-small font-control text-ink tabular-nums group-data-disabled/slider:text-ink-disabled">
            {readout}
          </BaseSlider.Value>
        </div>
      )}
      {bar ? (
        // The whole bar is the control; it wears the focus ring for the thumb's hidden input.
        // The track is inset 10px so the fill can reach past the handle at both ends.
        <BaseSlider.Control
          data-focus-target
          className={cn(
            "relative flex h-9 w-full touch-none items-center overflow-hidden rounded-control border-stroke border-line-strong bg-surface px-2.5 select-none touch:h-11",
            "transition-[border-color] duration-quick hover:border-[color-mix(in_srgb,var(--line-strong)_55%,var(--ink))]",
            "data-disabled:cursor-not-allowed data-disabled:border-line data-disabled:hover:border-line",
          )}
        >
          <BaseSlider.Track className="relative h-full w-full">
            <BaseSlider.Indicator
              className={cn(
                "bg-[light-dark(var(--sunken),var(--pressed))]",
                indicatorMotion,
                // The fill reaches 10px past its ends, so the handle rides just inside its edge.
                "before:absolute before:inset-y-0 before:-left-2.5 before:w-2.5 before:bg-inherit before:content-['']",
                "after:absolute after:inset-y-0 after:-right-2.5 after:w-2.5 after:bg-inherit after:content-['']",
              )}
            />
            {Array.from({ length: count }, (_, i) => (
              <BaseSlider.Thumb
                key={i}
                index={i}
                inputRef={markFocusProxy}
                getAriaLabel={thumbLabels ? (idx) => thumbLabels[idx] ?? "" : undefined}
                className={cn(
                  "z-[1] h-4 w-0.5 rounded-full bg-ink-3 group-hover/slider:bg-ink-2",
                  // 24px to grab (44px on touch) around the 2px bar.
                  "before:absolute before:-inset-x-3 before:-inset-y-1 before:content-[''] touch:before:-inset-x-5 touch:before:-inset-y-3.5",
                  thumbMotion,
                  // Grabbed: the bar squashes wider and taller, then settles, like something soft under a finger.
                  "data-dragging:scale-x-175 data-dragging:scale-y-110 data-dragging:bg-accent-strong",
                  "group-data-disabled/slider:bg-ink-disabled",
                )}
              />
            ))}
          </BaseSlider.Track>
          {/* Scrubber: label and readout sit inside the bar, over the fill. Clicks pass through to the track. */}
          {inside && (
            <div className="pointer-events-none absolute inset-0 flex items-center gap-3 px-4 text-control">
              <BaseSlider.Label className="min-w-0 truncate text-ink-2 group-data-disabled/slider:text-ink-disabled">{label}</BaseSlider.Label>
              <BaseSlider.Value className="ml-auto flex-none text-ink tabular-nums group-data-disabled/slider:text-ink-disabled">
                {readout}
              </BaseSlider.Value>
            </div>
          )}
        </BaseSlider.Control>
      ) : (
        // 36px of hit area around a 4px track: one size, easy to grab.
        <BaseSlider.Control className="flex h-9 w-full touch-none items-center select-none data-disabled:cursor-not-allowed">
          <BaseSlider.Track className="relative h-1 w-full rounded-[2px] bg-sunken shadow-[inset_0_0_0_1px_var(--border-control)]">
            <BaseSlider.Indicator className={cn("rounded-[2px] bg-ink group-data-disabled/slider:bg-ink-disabled", indicatorMotion)} />
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
                  thumbMotion,
                  "hover:scale-110 data-dragging:scale-125 data-dragging:bg-accent-strong",
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
