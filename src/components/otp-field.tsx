import { Field as BaseField } from "@base-ui/react/field";
import { OTPField as BaseOTPField } from "@base-ui/react/otp-field";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FieldMessage, fieldLabelClass, fieldRootClass } from "./input";

/*
 * OTP field. One cell per character, mono, each a small recessed well. Typing
 * advances, Backspace steps back, arrows move between cells, and pasting
 * the whole code fills every cell at once. The focus ring goes around the
 * whole code, not one cell: every cell is its focus proxy.
 */

export interface OTPFieldProps {
  label: ReactNode;
  hint?: ReactNode;
  /** Replaces the hint when set. Say exactly what to change. */
  error?: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  /** Fires once every cell is filled. */
  onValueComplete?: (value: string) => void;
  /** Number of characters. Default 6. */
  length?: number;
  /** Where to draw the separator, e.g. 3 for "123–456". 0 for none. */
  groupAt?: number;
  /** "numeric" (default) or "alphanumeric". */
  validationType?: "numeric" | "alphanumeric";
  name?: string;
  disabled?: boolean;
  className?: string;
}

export function OTPField({
  label,
  hint,
  error,
  value,
  onValueChange,
  onValueComplete,
  length = 6,
  groupAt = 3,
  validationType = "numeric",
  name,
  disabled,
  className,
}: OTPFieldProps) {
  return (
    <BaseField.Root
      name={name}
      disabled={disabled}
      invalid={error ? true : undefined}
      className={cn(fieldRootClass, className)}
    >
      <BaseField.Label className={fieldLabelClass}>{label}</BaseField.Label>
      <BaseOTPField.Root
        length={length}
        value={value}
        onValueChange={(v) => onValueChange(v)}
        onValueComplete={onValueComplete ? (v) => onValueComplete(v) : undefined}
        validationType={validationType}
        autoComplete="one-time-code"
        className="inline-flex max-w-full items-center gap-1.5 self-start"
      >
        {Array.from({ length }, (_, i) => (
          <Fragment key={i}>
            {groupAt > 0 && i === groupAt && (
              <BaseOTPField.Separator className="h-px w-2.5 flex-none bg-line-strong" />
            )}
            <BaseOTPField.Input
              data-focus-proxy
              aria-label={i === 0 ? undefined : `Character ${i + 1} of ${length}`}
              className={cn(
                "mono size-9 min-w-8 shrink rounded-control border-stroke border-border-control p-0 text-center text-input-touch text-ink outline-none sm:text-control touch:size-11",
                "bg-[color-mix(in_srgb,var(--sunken)_45%,var(--surface))] shadow-[inset_0_1px_2px_var(--well-shadow)]",
                "transition-[border-color,box-shadow,background-color] duration-quick",
                "hover:border-[color-mix(in_srgb,var(--border-control)_55%,var(--ink))]",
                "focus:border-accent-strong focus:bg-surface focus:shadow-[0_0_0_1px_var(--accent-strong)]",
                "data-filled:bg-surface",
                "group-data-invalid/field:border-danger-line data-invalid:border-danger-line",
                "disabled:cursor-not-allowed disabled:border-line-strong disabled:bg-sunken disabled:text-ink-disabled disabled:shadow-none",
              )}
            />
          </Fragment>
        ))}
      </BaseOTPField.Root>
      <FieldMessage hint={hint} error={error} invalid={!!error} />
    </BaseField.Root>
  );
}
