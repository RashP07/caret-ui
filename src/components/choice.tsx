import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Fieldset } from "@base-ui/react/fieldset";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { LayoutGroup, motion } from "motion/react";
import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { playSound } from "@/lib/sound";
import { pressClass, useModalityTransition } from "./modality";
import { Tooltip } from "./tooltip";

/*
 * Radio and Checkbox. A list form for compact choices, a card form when a
 * picture helps. A parent checkbox goes indeterminate; clicking it settles
 * all its children. The tick springs in from 90% (never from nothing); the
 * radio dot scales in on transform + opacity. Rows answer a press.
 */

/* ---------- shared row ---------- */

/**
 * Press feedback lives on the control, never the row: pressing a settings row
 * squeezes the box / dot / switch it will change, and the text stays still.
 * `[label:active_&]` catches presses anywhere on the row. Transform only.
 */
export const controlPressClass =
  "active:not-data-disabled:not-data-readonly:scale-[.94] [label:active_&]:not-data-disabled:not-data-readonly:scale-[.94]";

/** A control's edge on hover: border-control darkened toward ink. Disabled and read-only controls stay still. */
export const controlHoverClass =
  "hover:not-data-disabled:not-data-readonly:border-[color-mix(in_srgb,var(--border-control)_55%,var(--ink))] [label:hover_&]:not-data-disabled:not-data-readonly:border-[color-mix(in_srgb,var(--border-control)_55%,var(--ink))]";

/**
 * A clickable row: control + label + optional description. The whole row wears the focus
 * ring (drawn inside, so a clipping panel can't cut it); mark the control data-focus-proxy.
 * The hover box is the row itself, so it lines up with nothing outside it and needs no negative margin.
 */
export function ChoiceRow({ disabled, className, children }: { disabled?: boolean; className?: string; children: ReactNode }) {
  return (
    <label
      data-focus-target
      data-disabled={disabled || undefined}
      className={cn(
        "group/choice grid cursor-pointer grid-cols-[18px_minmax(0,1fr)] items-start gap-2.5 rounded-button px-2 py-2 text-control touch:min-h-11",
        "transition-[background-color] duration-instant ease-hover",
        "hover:bg-hover",
        disabled && "cursor-not-allowed text-ink-disabled hover:bg-transparent",
        className,
      )}
    >
      {children}
    </label>
  );
}

export function ChoiceText({ label, description, error, errorId }: { label: ReactNode; description?: ReactNode; error?: ReactNode; errorId?: string }) {
  return (
    <span className="min-w-0">
      {label}
      {description && (
        <small className="mt-px block text-small text-ink-3 text-pretty group-data-disabled/choice:text-ink-disabled">
          {description}
        </small>
      )}
      {error && (
        <small id={errorId} className="mt-1 flex items-start gap-1.5 text-small text-pretty text-danger">
          <WarningCircleIcon size={14} className="mt-px flex-none" aria-hidden />
          <span>{error}</span>
        </small>
      )}
    </span>
  );
}

/** Fieldset + legend for a group of choices. Takes the width it's given. */
export function ChoiceList({
  legend,
  className,
  children,
  ...props
}: { legend: ReactNode } & Omit<ComponentProps<typeof Fieldset.Root>, "className"> & { className?: string }) {
  return (
    <Fieldset.Root className={cn("m-0 flex min-w-0 flex-col gap-0.5 border-0 p-0", className)} {...props}>
      {/* Inset like the rows below it, so the legend lines up with their boxes. */}
      <Fieldset.Legend className="mb-2 px-2 py-0 text-small font-control data-disabled:text-ink-disabled">{legend}</Fieldset.Legend>
      {children}
    </Fieldset.Root>
  );
}

/* ---------- Checkbox ---------- */

const boxClass = cn(
  "relative mt-0.5 grid size-4.5 flex-none place-items-center rounded-inline border-stroke border-border-control bg-surface text-on-ink",
  // 18px box, 26px to hit (46px on touch); inside a row the whole row is the target anyway.
  "before:absolute before:-inset-1 before:content-[''] touch:before:-inset-3.5",
  "transition-[background-color,border-color,scale] duration-quick [transition-timing-function:var(--ease-hover),var(--ease-hover),var(--ease-out)]",
  controlPressClass,
  controlHoverClass,
  "data-checked:border-ink data-checked:bg-ink data-indeterminate:border-ink data-indeterminate:bg-ink",
  "aria-invalid:not-data-checked:border-danger-line",
  "data-disabled:cursor-not-allowed data-disabled:border-line-strong data-disabled:bg-sunken",
  "data-disabled:data-checked:border-ink-disabled data-disabled:data-checked:bg-ink-disabled",
  "data-disabled:data-indeterminate:border-ink-disabled data-disabled:data-indeterminate:bg-ink-disabled",
  "data-readonly:cursor-default",
);

export interface CheckboxProps extends Omit<ComponentProps<typeof BaseCheckbox.Root>, "className"> {
  className?: string;
}

/**
 * The mark is drawn, not swapped in: the tick traces itself short leg to long leg on check
 * (settle, on the drawer ease: fast out, gentle landing) and erases quickly on uncheck; the
 * indeterminate dash grows from its centre. It's a path rather than a Phosphor glyph because
 * Phosphor draws filled outlines, which can't be traced. Reduced motion drops the dash and scale
 * transitions (base styles), so the mark simply appears. 12px on a 2px stroke, centred in the
 * 14px face.
 */
function CheckMark({ checked, indeterminate }: { checked: boolean; indeterminate: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {indeterminate ? (
        <path d="M3 6h6" className="origin-center [transform-box:fill-box] animate-[dash-grow_var(--d-settle)_var(--ease-drawer)_both]" />
      ) : (
        <path
          d="M2.5 6.25 5 8.75 9.5 3.5"
          pathLength={1}
          className={cn(
            "[stroke-dasharray:1] transition-[stroke-dashoffset]",
            checked ? "[stroke-dashoffset:0] duration-settle ease-drawer" : "[stroke-dashoffset:1] duration-quick ease-out",
          )}
        />
      )}
    </svg>
  );
}

/** The bare box. Wrap in <CheckboxChoice> for a labelled row. */
export function Checkbox({ className, onCheckedChange, ...props }: CheckboxProps) {
  return (
    <BaseCheckbox.Root
      className={cn(boxClass, className)}
      {...props}
      onCheckedChange={(checked, details) => {
        playSound(checked ? "check" : "uncheck");
        onCheckedChange?.(checked, details);
      }}
    >
      <BaseCheckbox.Indicator
        keepMounted
        className="flex"
        render={(p, state) => (
          <span {...p}>
            <CheckMark checked={state.checked} indeterminate={state.indeterminate} />
          </span>
        )}
      />
    </BaseCheckbox.Root>
  );
}

export interface CheckboxChoiceProps extends CheckboxProps {
  label: ReactNode;
  description?: ReactNode;
  /** Shown under the label, and marks the box invalid. Say what to do, e.g. "Agree to the terms to continue." */
  error?: ReactNode;
}

export function CheckboxChoice({ label, description, error, disabled, ...props }: CheckboxChoiceProps) {
  const errorId = useId();
  return (
    <ChoiceRow disabled={disabled}>
      <Checkbox
        data-focus-proxy
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      <ChoiceText label={label} description={description} error={error} errorId={errorId} />
    </ChoiceRow>
  );
}

/** Shared state for a set of checkboxes. Give it `allValues` to enable a `parent` checkbox. */
export function CheckboxGroup({ className, ...props }: Omit<ComponentProps<typeof BaseCheckboxGroup>, "className"> & { className?: string }) {
  return <BaseCheckboxGroup className={cn("flex flex-col gap-0.5", className)} {...props} />;
}

/**
 * Children of a parent checkbox, hung from a hairline under the parent's box: the row's
 * 8px padding + half the 18px box puts its centre 17px in; the 1px line takes 16–17px, so it
 * stays on whole pixels and ends on the centre.
 */
export function Nested({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("ml-4 flex flex-col gap-0.5 border-l border-line pl-2", className)} {...props} />;
}

/* ---------- Radio ---------- */

const radioClass = cn(
  "relative mt-0.5 grid size-4.5 flex-none place-items-center rounded-full border-stroke border-border-control bg-surface",
  "before:absolute before:-inset-1 before:rounded-full before:content-[''] touch:before:-inset-3.5",
  "transition-[border-color,scale] duration-quick [transition-timing-function:var(--ease-hover),var(--ease-out)]",
  controlPressClass,
  controlHoverClass,
  "data-checked:border-ink",
  "data-disabled:cursor-not-allowed data-disabled:border-line-strong data-disabled:bg-sunken data-disabled:data-checked:border-ink-disabled",
  "data-readonly:cursor-default",
);

/** The dot: enters on transform + opacity (never a painted box-shadow), from 90%. */
function RadioDot() {
  return (
    <BaseRadio.Indicator
      keepMounted
      className={cn(
        "block size-1.5 rounded-full bg-ink data-disabled:bg-ink-disabled",
        "transition-[opacity,scale] duration-quick ease-spring",
        "data-unchecked:scale-[.9] data-unchecked:opacity-0",
      )}
    />
  );
}

export function RadioGroup({ className, onValueChange, ...props }: Omit<ComponentProps<typeof BaseRadioGroup>, "className"> & { className?: string }) {
  return (
    <BaseRadioGroup
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
      onValueChange={(value, details) => {
        playSound("select");
        onValueChange?.(value, details);
      }}
    />
  );
}

export interface RadioChoiceProps extends Omit<ComponentProps<typeof BaseRadio.Root>, "className"> {
  label: ReactNode;
  description?: ReactNode;
}

export function RadioChoice({ label, description, disabled, ...props }: RadioChoiceProps) {
  return (
    <ChoiceRow disabled={disabled}>
      <BaseRadio.Root data-focus-proxy className={radioClass} disabled={disabled} {...props}>
        <RadioDot />
      </BaseRadio.Root>
      <ChoiceText label={label} description={description} />
    </ChoiceRow>
  );
}

export interface RadioCardProps extends Omit<ComponentProps<typeof BaseRadio.Root>, "className"> {
  label: ReactNode;
  description?: ReactNode;
  /** A small diagram. Elements with class "hi" fill with the accent when chosen. */
  picture?: ReactNode;
  /**
   * A full-bleed preview across the top of the card, e.g. a live specimen.
   * It's made inert: a preview is looked at, never tabbed into.
   */
  media?: ReactNode;
  /** Trailing content in the title row, e.g. a Badge. */
  meta?: ReactNode;
  /** Extra content under the description, e.g. a ThemeSwatch strip. */
  children?: ReactNode;
  className?: string;
}

/**
 * The card form, for choices that are easier to understand with a picture. The radio has its
 * own column in the title row, so a long title wraps beside it instead of running under it.
 * State is read from the card's own radio (data-card-radio), never from whatever the media holds.
 */
export function RadioCard({ label, description, picture, media, meta, children, className, ...props }: RadioCardProps) {
  return (
    <label
      data-focus-target
      className={cn(
        "group/card relative flex cursor-pointer flex-col gap-2 rounded-card border-stroke border-line-strong bg-surface p-4 text-ink",
        // Cards are wide targets: they answer a press with the border, never by shrinking.
        "transition-[border-color] duration-instant ease-hover",
        "hover:border-border-control",
        "has-[[data-card-radio][data-checked]]:border-ink",
        "[&_.diagram]:text-ink-3 has-[[data-card-radio][data-checked]]:[&_.diagram]:text-ink",
        "has-[[data-card-radio][data-checked]]:[&_.hi]:fill-accent has-[[data-card-radio][data-checked]]:[&_.hi]:stroke-ink",
        "has-[[data-card-radio][data-disabled]]:cursor-not-allowed has-[[data-card-radio][data-disabled]]:border-line has-[[data-card-radio][data-disabled]]:bg-sunken",
        "has-[[data-card-radio][data-disabled]]:text-ink-disabled",
        "has-[[data-card-radio][data-disabled]]:[&_.diagram]:text-ink-disabled",
        media && "overflow-hidden",
        className,
      )}
    >
      {media && (
        <div inert aria-hidden className="-mx-4 -mt-4 mb-1 border-b border-line bg-page p-4">
          {media}
        </div>
      )}
      {picture && <span className="diagram mb-1 block h-11">{picture}</span>}
      <span className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <b className="text-control font-heading text-balance">{label}</b>
        <span className="flex items-center gap-2">
          {meta}
          <BaseRadio.Root data-card-radio data-focus-proxy className={cn(radioClass, "mt-0")} {...props}>
            <RadioDot />
          </BaseRadio.Root>
        </span>
      </span>
      {description && (
        <span className="text-small text-ink-3 text-pretty group-has-[[data-card-radio][data-disabled]]/card:text-ink-disabled">{description}</span>
      )}
      {children}
    </label>
  );
}

/* ---------- Segmented ---------- */

export interface SegOption<V extends string = string> {
  value: V;
  label: string;
  /** Icon-only segments use `label` as their accessible name, and show it as a tooltip on hover and focus. */
  icon?: ReactNode;
  iconOnly?: boolean;
}

export interface SegProps<V extends string = string> {
  "aria-label": string;
  value: V | undefined;
  onValueChange: (value: V) => void;
  options: SegOption<V>[];
  className?: string;
}

/**
 * Compact 2–4 way switch. A radio group underneath: arrows move and select.
 * The raised pill is one shared element that slides to the chosen segment on
 * pointer, and snaps when the keyboard moved it. Segments sit 1px border + 3px
 * padding inside the --r-control frame, so their corners are that radius − 4px.
 */
export function Seg<V extends string = string>({ value, onValueChange, options, className, ...aria }: SegProps<V>) {
  const id = useId();
  const { handlers, transition } = useModalityTransition();
  return (
    <LayoutGroup id={id}>
      <BaseRadioGroup
        value={value ?? null}
        onValueChange={(v) => {
          playSound("select");
          onValueChange(v as V);
        }}
        aria-label={aria["aria-label"]}
        {...handlers}
        className={cn("inline-flex max-w-full gap-0.5 rounded-control border border-line bg-sunken p-0.75", className)}
      >
        {options.map((o) => {
          const item = (
            <BaseRadio.Root
              key={o.value}
              value={o.value}
              aria-label={o.iconOnly ? o.label : undefined}
              className={cn(
                // Centered, so a Seg stretched to fill its row keeps each label in the middle of its pill.
                "relative isolate inline-flex min-h-7 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-[calc(var(--r-control)-4px)] px-2.5 text-small font-control text-ink-2",
                // Label color on the hover curve at --d-quick, arriving with the pill.
                "transition-[color,scale] duration-quick [transition-timing-function:var(--ease-hover),var(--ease-out)]",
                "hover:text-ink data-checked:text-ink",
                pressClass,
                o.iconOnly && "w-8 px-0",
              )}
              render={(radioProps, state) => (
                <span {...radioProps}>
                  {state.checked && (
                    <motion.span
                      aria-hidden
                      layoutId="seg-pill"
                      transition={transition()}
                      className={cn(
                        "absolute inset-0 -z-10 rounded-[calc(var(--r-control)-4px)]",
                        // Surface lifts off the sunken track in light; in dark the surface is barely lighter
                        // than the track, so the pill takes the pressed fill. Its own hairline (inside it,
                        // 3px clear of the track's border) gives the edge in both.
                        "bg-[light-dark(var(--surface),var(--pressed))] shadow-[inset_0_0_0_1px_var(--line-strong)]",
                      )}
                    />
                  )}
                  {radioProps.children}
                </span>
              )}
            >
              {o.icon}
              {!o.iconOnly && o.label}
            </BaseRadio.Root>
          );
          return o.iconOnly ? (
            <Tooltip key={o.value} label={o.label}>
              {item}
            </Tooltip>
          ) : (
            item
          );
        })}
      </BaseRadioGroup>
    </LayoutGroup>
  );
}
