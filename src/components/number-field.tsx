import { Field as BaseField } from "@base-ui/react/field";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { ArrowsHorizontalIcon, MinusIcon, PlusIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FieldMessage, fieldLabelClass, fieldRootClass, wellClass, wellInputClass } from "./input";
import { Tooltip } from "./tooltip";

/*
 * Number field. A 36px well with − and + at its ends. Arrows step by `step`,
 * Shift+Arrow by `largeStep`, Alt+Arrow by `smallStep`; Home/End jump to
 * min/max when set. Drag the label sideways to scrub. Typed values snap to
 * the step and clamp to the range on blur, so the field never holds a number
 * it won't accept. Steps count from `min`, so pick a min on the step grid.
 */

export interface NumberFieldProps {
  label: ReactNode;
  hint?: ReactNode;
  /** Replaces the hint when set. Say exactly what to change. */
  error?: ReactNode;
  value: number | null;
  onValueChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  smallStep?: number;
  largeStep?: number;
  /** e.g. { style: "currency", currency: "USD" } or { style: "unit", unit: "minute" }. */
  format?: Intl.NumberFormatOptions;
  /** Unit label for the step buttons' tooltips, e.g. "minutes". */
  unit?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  /** Shows the number at full ink but can't be changed; the steppers go inert. */
  readOnly?: boolean;
  className?: string;
}

/* The steppers keep their own focus ring, drawn inside the well so its overflow can't clip it. */
const stepButton = cn(
  "flex w-9 flex-none items-center justify-center border-0 bg-transparent text-ink-3 touch:w-11",
  "transition-colors duration-instant hover:bg-hover hover:text-ink active:bg-pressed",
  "disabled:cursor-not-allowed disabled:text-ink-disabled disabled:hover:bg-transparent",
);

export function NumberField({
  label,
  hint,
  error,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  smallStep,
  largeStep,
  format,
  unit,
  name,
  required,
  disabled,
  readOnly,
  className,
}: NumberFieldProps) {
  const by = `${step}${unit ? ` ${unit}` : ""}`;
  return (
    <BaseField.Root
      name={name}
      disabled={disabled}
      invalid={error ? true : undefined}
      className={cn(fieldRootClass, className)}
    >
      <BaseNumberField.Root
        value={value}
        onValueChange={(v) => onValueChange(v)}
        min={min}
        max={max}
        step={step}
        smallStep={smallStep}
        largeStep={largeStep}
        format={format}
        required={required}
        readOnly={readOnly}
        snapOnStep
        className="flex flex-col gap-1.5"
      >
        <BaseNumberField.ScrubArea className="cursor-ew-resize self-start select-none">
          <BaseField.Label className={cn(fieldLabelClass, "cursor-ew-resize")}>{label}</BaseField.Label>
          <BaseNumberField.ScrubAreaCursor className="text-ink drop-shadow-[0_1px_0_var(--surface)]">
            <ArrowsHorizontalIcon size={18} weight="bold" />
          </BaseNumberField.ScrubAreaCursor>
        </BaseNumberField.ScrubArea>
        <BaseNumberField.Group data-focus-target className={cn(wellClass, "h-9 touch:h-11")}>
          <Tooltip label={`Decrease by ${by}`} kbd="↓">
            <BaseNumberField.Decrement className={cn(stepButton, "border-r border-line")}>
              <MinusIcon size={14} weight="bold" />
            </BaseNumberField.Decrement>
          </Tooltip>
          <BaseNumberField.Input data-focus-proxy className={cn(wellInputClass, "text-center tabular-nums")} />
          <Tooltip label={`Increase by ${by}`} kbd="↑">
            <BaseNumberField.Increment className={cn(stepButton, "border-l border-line")}>
              <PlusIcon size={14} weight="bold" />
            </BaseNumberField.Increment>
          </Tooltip>
        </BaseNumberField.Group>
      </BaseNumberField.Root>
      <FieldMessage hint={hint} error={error} invalid={!!error} />
    </BaseField.Root>
  );
}
