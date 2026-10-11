import { Field as BaseField } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { CheckIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Input. The label sits above and stays visible. The hint explains the rule
 * before it's broken; the error says exactly what to change. At rest the
 * field is a tinted well; on focus it sits flush and its one border line
 * turns the focus color. No glow, no inner shadow.
 */

/* Shared by every field-shaped control (NumberField, OTPField, Combobox, Autocomplete, Select). */

/** The label above a control. */
export const fieldLabelClass = "flex items-baseline gap-2 text-small font-control text-ink data-disabled:text-ink-disabled";

/** Hint text under a control. */
export const hintClass = "flex items-start gap-1.5 text-small text-ink-3 text-pretty";

/** A field: label, control, message. Takes the width of its container. */
export const fieldRootClass = "group/field flex w-full min-w-0 flex-col gap-1.5";

/**
 * The recessed well: a tinted ground at rest; on focus it turns flush with the shared field
 * focus ring (one 2px line over the border, see field-focus), danger when the enclosing Field
 * (group/field) or the control is invalid. Its resting edge is the dimmer border-field; hover
 * steps it up to border-control (3:1). Disabled goes sunken; read-only keeps full ink on a flat
 * surface. 36px tall (44px on touch) unless it wraps (chips).
 */
export const wellClass = cn(
  "flex items-stretch overflow-hidden rounded-control border-stroke border-border-field",
  "bg-[color-mix(in_srgb,var(--sunken)_45%,var(--surface))]",
  "transition-[border-color,background-color] duration-quick",
  // Hover darkens the edge only while unfocused; focus owns the border.
  "not-focus-within:hover:border-border-control",
  // Focus shows on click too (focus-within), as text entry should.
  "focus-within:field-focus focus-within:bg-surface",
  "group-data-invalid/field:border-danger-line has-[[aria-invalid=true]]:border-danger-line",
  "group-data-invalid/field:[--field-focus:var(--danger)] has-[[aria-invalid=true]]:[--field-focus:var(--danger)]",
  "has-[input[readonly]]:bg-surface",
  "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:border-line-strong has-[input:disabled]:bg-sunken",
);

/**
 * The filled well: no edge at rest, only a sunken fill, so dense forms and settings pages read as
 * quiet text areas instead of a stack of boxes. The fill never changes: hover only shows the quiet
 * resting edge (border-field), and focus only turns that edge the focus color (the shared field
 * focus); invalid keeps its danger edge, so state is never hidden. The fill is the boundary here,
 * so use it on page or surface grounds, never on a sunken one.
 */
export const wellFilledClass = cn(
  "border-transparent bg-sunken focus-within:bg-sunken",
  "not-focus-within:hover:border-border-field",
  "has-[input:disabled]:border-transparent has-[textarea:disabled]:border-transparent",
  "has-[input:disabled]:hover:border-transparent has-[textarea:disabled]:hover:border-transparent",
);

export type WellVariant = "outline" | "filled";

/** The text inside a well. Mark it data-focus-proxy: the well shows focus for it. 16px on phones so iOS doesn't zoom. */
export const wellInputClass = cn(
  "min-w-0 flex-1 border-0 bg-transparent px-3 text-input-touch text-ink outline-none placeholder:text-ink-3 sm:text-control",
  "disabled:cursor-not-allowed disabled:text-ink-disabled disabled:placeholder:text-ink-disabled",
);

/**
 * A leading icon inside a well. Optical spacing: text sits 12px in (wellInputClass), an icon
 * 8px, since its box carries its own whitespace. The trail and the trailing buttons match (8px).
 */
export const wellLeadClass = "flex flex-none items-center ps-2 text-ink-3";

/** The input after a lead: the lead's 8px gap replaces the text inset. */
export const wellInputAfterLeadClass = "ps-2";

/**
 * The line under a control inside a Base UI Field. Shows the hint; an explicit `error`
 * replaces it. Without an explicit error, validation messages (from `validate`, `required`
 * or a <Form> `errors` map) render through Field.Error and hide the hint.
 */
export function FieldMessage({ hint, error, invalid }: { hint?: ReactNode; error?: ReactNode; invalid?: boolean }) {
  if (invalid && error)
    return (
      <BaseField.Description className={cn(hintClass, "text-danger")}>
        <WarningCircleIcon size={14} className="mt-px flex-none" aria-hidden />
        <span>{error}</span>
      </BaseField.Description>
    );
  return (
    <>
      {hint != null && (
        <BaseField.Description className={cn(hintClass, "group-has-[[data-field-error]]/field:hidden")}>{hint}</BaseField.Description>
      )}
      <BaseField.Error
        data-field-error
        className={cn(hintClass, "text-danger")}
        render={({ children, ...p }) => (
          <div {...p}>
            <WarningCircleIcon size={14} className="mt-px flex-none" aria-hidden />
            <span>{children}</span>
          </div>
        )}
      />
    </>
  );
}

export interface FieldProps extends Omit<BaseField.Root.Props, "children"> {
  label?: ReactNode;
  /** "optional" tag beside the label. */
  optional?: boolean;
  /** Right-aligned readout in the label row, e.g. "12/32". */
  count?: ReactNode;
  /** Explains the rule before it's broken. */
  hint?: ReactNode;
  /** Replaces the hint when invalid. Say exactly what to change. */
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Label + control + hint. Wraps Base UI Field, so the label and hint are wired to the control. */
export function Field({ label, optional, count, hint, error, invalid, className, children, ...props }: FieldProps) {
  // Only force the state when told to; otherwise Base UI validation (validate, required, Form errors) decides.
  const isInvalid = invalid ?? (error ? true : undefined);
  return (
    <BaseField.Root
      invalid={isInvalid}
      className={cn(fieldRootClass, className)}
      {...props}
    >
      {label != null && (
        <BaseField.Label className={fieldLabelClass}>
          {label}
          {optional && (
            <span className="text-caption font-normal text-ink-3">
              optional
            </span>
          )}
          {count != null && (
            <span className="ml-auto text-caption font-normal text-ink-3 tabular-nums">
              {count}
            </span>
          )}
        </BaseField.Label>
      )}
      {children}
      <FieldMessage hint={hint} error={error} invalid={isInvalid} />
    </BaseField.Root>
  );
}

export interface InputProps extends Omit<ComponentProps<typeof BaseInput>, "className" | "size"> {
  /** Leading icon inside the well. */
  lead?: ReactNode;
  /** Mono prefix segment, e.g. "https://". */
  affix?: ReactNode;
  /** Trailing slot: a key hint, a status icon. */
  trail?: ReactNode;
  /** Show a success tick in the trail. */
  valid?: boolean;
  /**
   * `sm`: a 28px well at text-small, for dense chrome (a filter in a panel head, a toolbar). It
   * lines up with Button size="sm". Text sits 10px in, an icon 6px. Forms use the default.
   */
  size?: "default" | "sm";
  /** `filled`: no edge until focused, a sunken fill instead. For quiet, dense forms. */
  variant?: WellVariant;
  className?: string;
}

/**
 * The control well and its input. Use inside <Field>, or alone with an aria-label.
 * The well wears the input's focus ring; anything focusable in `trail` keeps its own.
 */
export function Input({ lead, affix, trail, valid, size = "default", variant = "outline", className, ...props }: InputProps) {
  const sm = size === "sm";
  return (
    <div
      data-focus-target
      data-readonly={props.readOnly || undefined}
      // sm reaches 36px on touch, not 44: it lives in dense chrome, beside sm buttons.
      className={cn(wellClass, variant === "filled" && wellFilledClass, sm ? "h-7 touch:h-9" : "h-9 touch:h-11", className)}
    >
      {affix != null && (
        <span className={cn("mono flex flex-none items-center border-r border-line bg-sunken px-2.5 text-caption text-ink-3", sm && "px-2")}>
          {affix}
        </span>
      )}
      {lead != null && <span className={cn(wellLeadClass, sm && "ps-1.5 [&_svg]:size-3.5")}>{lead}</span>}
      <BaseInput
        data-focus-proxy
        className={cn(wellInputClass, lead != null && wellInputAfterLeadClass, sm && "px-2.5 sm:text-small", sm && lead != null && "ps-1.5")}
        {...props}
      />
      {(trail != null || valid) && (
        <span className={cn("flex flex-none items-center px-2 text-ink-3", sm && "px-1.5", valid && "text-success")}>
          {valid ? <CheckIcon aria-hidden /> : trail}
        </span>
      )}
    </div>
  );
}
