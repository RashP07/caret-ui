import { Field as BaseField } from "@base-ui/react/field";
import { Select as BaseSelect } from "@base-ui/react/select";
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { usePortalTheme } from "@/lib/theme";
import { FieldMessage, fieldLabelClass, fieldRootClass } from "./input";

/*
 * Dropdown. A real listbox: arrows, Enter, Escape, Home/End and type-ahead
 * (all from Base UI Select). Options may carry a description and a meta
 * so nobody has to guess what "Balanced" means.
 */

export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
  /** One line under the label explaining the choice. */
  description?: string;
  /** Right-aligned meta, e.g. "fast". Also shown in the trigger with `showMeta`. */
  meta?: string;
  /** Right-aligned custom content, e.g. theme chips. */
  trail?: ReactNode;
}

export interface SelectGroup<V extends string = string> {
  /** Optional section label (`MenuLabel`). Groups are separated by a rule. */
  label?: string;
  options: SelectOption<V>[];
}

export type SelectDensity = "default" | "compact" | "xs";

export interface SelectProps<V extends string = string> {
  /** The field label. Always required for the accessible name; hide it visually with `hideLabel`. */
  label: string;
  hideLabel?: boolean;
  /** Explains the choice before it's made. */
  hint?: ReactNode;
  /** Replaces the hint and marks the field invalid. Say exactly what to change. */
  error?: ReactNode;
  /** Force the invalid state; otherwise `error`, `required` or a <Form> `errors` map decides. */
  invalid?: boolean;
  /** Submitted with a <Form>, and the key for its `errors` map. */
  name?: string;
  required?: boolean;
  readOnly?: boolean;
  value: V;
  onValueChange: (value: V) => void;
  onOpenChange?: (open: boolean) => void;
  groups: SelectGroup<V>[];
  /** `compact` and `xs` are for dense UI (toolbars, composers): borderless until hovered. */
  density?: SelectDensity;
  /** Leading content in the trigger: an icon, an avatar, theme chips. */
  lead?: ReactNode;
  /** Print the selected option's meta in the trigger. */
  showMeta?: boolean;
  /** Custom trigger value rendering. */
  renderValue?: (option: SelectOption<V> | undefined) => ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "end";
  /** Fixed menu width in px. Defaults to the trigger's width. */
  menuWidth?: number;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

/*
 * Input modality. Popups opened or closed from the keyboard appear instantly:
 * keyboard actions repeat constantly, and animation makes them feel delayed.
 * Pointer opens keep the fade. Read at the popup's own render (Base UI calls a
 * className function whenever the popup's state changes), so it is never stale.
 */
let lastInput: "keyboard" | "pointer" = "pointer";
if (typeof document !== "undefined") {
  document.addEventListener("keydown", () => (lastInput = "keyboard"), true);
  document.addEventListener("pointerdown", () => (lastInput = "pointer"), true);
  // Hover-opened menus (menubar, openOnHover) count as pointer too.
  document.addEventListener("pointermove", () => (lastInput = "pointer"), { capture: true, passive: true });
}

/** Wrap a popup's class so the popup skips its transition when the keyboard drove it. */
export function keyboardInstant(base: string) {
  return () => cn(base, lastInput === "keyboard" && "transition-none");
}

/* Menu look shared with Combobox and Autocomplete popups. Exits are faster than entrances. */
export const menuPopupClass = cn(
  "max-h-[min(70vh,var(--available-height))] min-w-(--anchor-width) overflow-y-auto rounded-control border border-line bg-surface p-1 text-ink shadow-float outline-none",
  "origin-(--transform-origin) transition-[opacity,scale,translate] duration-quick ease-out",
  "data-starting-style:scale-[.98] data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-instant",
  "data-[side=bottom]:data-starting-style:-translate-y-1 data-[side=top]:data-starting-style:translate-y-1",
);
export const menuItemClass = cn(
  // label · meta · tick. The tick sits at the trailing edge, so no row starts with an empty column.
  // Same padding as menu rows. The highlight is the hover fill, so ink-3 meta stays legible on it.
  "group/opt grid cursor-pointer grid-cols-[1fr_auto_16px] items-center gap-2.5 rounded-button px-2.5 py-2 text-control outline-none select-none",
  "data-highlighted:bg-hover data-disabled:cursor-not-allowed data-disabled:text-ink-disabled",
);
/** The selected-option tick: trailing edge, springs in from 90% (never from nothing). */
export const selectedTickClass =
  "text-ink opacity-0 scale-[.9] transition-[opacity,scale] duration-quick ease-spring group-data-selected/opt:opacity-100 group-data-selected/opt:scale-100";
export const menuGroupLabelClass = "px-2.5 pt-2 pb-1 text-caption text-ink-3";
export const menuSeparatorClass = "-mx-1 my-1 h-px bg-line";
export const menuDescriptionClass = "mt-px block text-caption text-ink-3";
/** Right-aligned meta in an option row: a count, a speed, a type. */
export const menuMetaClass = "text-caption text-ink-3 tabular-nums";

const triggerBase = cn(
  "flex w-full min-w-0 items-center text-left transition-[border-color,background-color,color] duration-instant ease-hover",
  "data-disabled:cursor-not-allowed data-disabled:text-ink-disabled",
);

const triggerDensity: Record<SelectDensity, string> = {
  default: cn(
    "h-9 gap-2.5 rounded-control border-stroke border-border-control bg-surface pr-2.5 pl-3 text-control text-ink touch:h-11",
    // Hover darkens the edge only when the field isn't focused or open.
    "not-focus-visible:not-data-popup-open:hover:border-[color-mix(in_srgb,var(--border-control)_55%,var(--ink))]",
    // Like the text fields: focus and open show a brand border, not an offset ring.
    "focus-visible:outline-none focus-visible:border-accent-strong focus-visible:shadow-[0_0_0_1px_var(--accent-strong)]",
    "data-popup-open:border-accent-strong data-popup-open:shadow-[0_0_0_1px_var(--accent-strong)]",
    "data-invalid:border-danger-line group-data-invalid/field:border-danger-line",
    "data-disabled:border-line-strong data-disabled:bg-sunken",
  ),
  compact: cn(
    "min-h-7.5 gap-1.5 rounded-control border border-transparent bg-transparent pr-1.5 pl-2.5 text-small font-control text-ink-2",
    "hover:bg-hover hover:text-ink focus-visible:bg-hover focus-visible:text-ink data-popup-open:bg-pressed data-popup-open:text-ink",
    "data-disabled:bg-transparent data-disabled:text-ink-disabled",
  ),
  xs: cn(
    "min-h-6.5 gap-1.5 rounded-control border border-transparent bg-transparent pr-1 pl-2 text-small font-control text-ink-2",
    "hover:bg-hover hover:text-ink focus-visible:bg-hover focus-visible:text-ink data-popup-open:bg-pressed data-popup-open:text-ink",
    "data-disabled:bg-transparent data-disabled:text-ink-disabled",
  ),
};

/**
 * Select. Inside a Base UI Field like Input, so `name`, `required`, `error`, the hint and
 * <Form> errors behave identically: the label and message are wired to the trigger.
 */
export function Select<V extends string = string>({
  label,
  hideLabel,
  hint,
  error,
  invalid,
  name,
  required,
  readOnly,
  value,
  onValueChange,
  onOpenChange,
  groups,
  density = "default",
  lead,
  showMeta,
  renderValue,
  side = "bottom",
  align = "start",
  menuWidth,
  disabled,
  className,
  triggerClassName,
}: SelectProps<V>) {
  const portalTheme = usePortalTheme();
  const all = groups.flatMap((g) => g.options);
  const selected = all.find((o) => o.value === value);
  const compact = density !== "default";
  // Only force the state when told to; otherwise Base UI validation decides.
  const isInvalid = invalid ?? (error ? true : undefined);

  return (
    <BaseField.Root
      name={name}
      disabled={disabled}
      invalid={isInvalid}
      className={cn(fieldRootClass, compact && "w-auto", className)}
    >
      <BaseSelect.Root<V>
        value={value}
        onValueChange={(v) => v != null && onValueChange(v)}
        onOpenChange={(open) => onOpenChange?.(open)}
        items={all.map((o) => ({ value: o.value, label: o.label }))}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
      >
        <BaseSelect.Label className={cn(fieldLabelClass, hideLabel && "sr-only-caret")}>{label}</BaseSelect.Label>
        <BaseSelect.Trigger
          className={cn(triggerBase, triggerDensity[density], "[&>svg:not([data-chev])]:flex-none [&>svg:not([data-chev])]:text-ink-3", triggerClassName)}
        >
          {lead}
          <BaseSelect.Value title={selected?.label} className="min-w-0 flex-auto truncate">
            {() => (renderValue ? renderValue(selected) : selected?.label)}
          </BaseSelect.Value>
          {showMeta && selected?.meta && <span className={cn(menuMetaClass, "flex-none")}>{selected.meta}</span>}
          <BaseSelect.Icon className="flex flex-none text-ink-3 transition-transform duration-quick ease-out data-popup-open:rotate-180">
            <CaretDownIcon data-chev size={compact ? 14 : 16} />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal {...portalTheme}>
          <BaseSelect.Positioner
            alignItemWithTrigger={false}
            side={side}
            align={align}
            sideOffset={6}
            collisionPadding={8}
            className="z-[60] outline-none"
          >
            <BaseSelect.Popup
              style={menuWidth ? { width: menuWidth } : undefined}
              className={keyboardInstant(menuPopupClass)}
            >
              <BaseSelect.List>
                {groups.map((group, gi) => (
                  <Fragment key={gi}>
                    {gi > 0 && <BaseSelect.Separator className={menuSeparatorClass} />}
                    <BaseSelect.Group>
                      {group.label && (
                        <BaseSelect.GroupLabel className={menuGroupLabelClass}>
                          {group.label}
                        </BaseSelect.GroupLabel>
                      )}
                      {group.options.map((o) => (
                        <SelectItem key={o.value} option={o} />
                      ))}
                    </BaseSelect.Group>
                  </Fragment>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
      <FieldMessage hint={hint} error={error} invalid={isInvalid} />
    </BaseField.Root>
  );
}

function SelectItem<V extends string>({ option }: { option: SelectOption<V> }) {
  return (
    <BaseSelect.Item
      value={option.value}
      label={option.label}
      className={menuItemClass}
    >
      <span className="min-w-0">
        <BaseSelect.ItemText className="block font-control">{option.label}</BaseSelect.ItemText>
        {option.description && (
          <span className={menuDescriptionClass}>{option.description}</span>
        )}
      </span>
      {option.trail ?? (option.meta ? <span className={menuMetaClass}>{option.meta}</span> : <span />)}
      <CheckIcon aria-hidden className={selectedTickClass} />
    </BaseSelect.Item>
  );
}
