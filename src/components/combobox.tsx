import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Field as BaseField } from "@base-ui/react/field";
import { CaretDownIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { useMemo, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { playOpenSound, playSound } from "@/lib/sound";
import { usePortalTheme } from "@/lib/theme";
import { FieldMessage, fieldLabelClass, fieldRootClass, hintClass, wellClass, wellInputAfterLeadClass, wellInputClass, wellLeadClass } from "./input";
import { keyboardInstant, menuDescriptionClass, menuItemClass, menuMetaClass, menuPopupClass, selectedTickClass, type SelectOption } from "./select";
import { Tooltip } from "./tooltip";

/*
 * Combobox. A Select you can type into: the list filters as you type, so it
 * stays fast with dozens of options. Arrows move, Enter picks, Escape
 * closes and then clears. The multiple form keeps each pick as a chip in
 * the well; Backspace at the start of the input removes the last one.
 * Options carry a description and meta, like Select's.
 */

interface ComboboxBaseProps<V extends string> {
  label: ReactNode;
  hint?: ReactNode;
  /** Replaces the hint when set. Say exactly what to change. */
  error?: ReactNode;
  options: SelectOption<V>[];
  placeholder?: string;
  /** Shown when nothing matches. Say what to try instead. */
  emptyText?: ReactNode;
  /** Leading icon inside the well. */
  lead?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  name?: string;
  disabled?: boolean;
  /** Shows the value at full ink but can't be changed. */
  readOnly?: boolean;
  className?: string;
}

/** Buttons at the trailing end of the well (clear, open). They keep their own ring, drawn inside the well. */
const wellButton = cn(
  "flex w-8 flex-none items-center justify-center border-0 bg-transparent text-ink-3 touch:w-11",
  "transition-colors duration-instant hover:text-ink",
);

/** "Clear Framework" when the label is text, so the button says what it clears. */
const named = (verb: string, label: ReactNode) => (typeof label === "string" ? `${verb} ${label}` : verb);

function useItems<V extends string>(options: SelectOption<V>[]) {
  return useMemo(
    () => BaseCombobox.createItems(options, { getValue: (o) => o.value, getLabel: (o) => o.label }),
    [options],
  );
}

function ComboboxPopup<V extends string>({ emptyText }: { emptyText: ReactNode }) {
  const portalTheme = usePortalTheme();
  return (
    <BaseCombobox.Portal {...portalTheme}>
      <BaseCombobox.Positioner sideOffset={6} collisionPadding={8} className="z-[60] outline-none">
        <BaseCombobox.Popup className={keyboardInstant(cn(menuPopupClass, "w-(--anchor-width) max-w-(--available-width)"))}>
          <BaseCombobox.Empty className={cn(hintClass, "px-2.5 py-2 empty:hidden")}>
            {emptyText}
          </BaseCombobox.Empty>
          <BaseCombobox.List className="outline-none">
            {(o: SelectOption<V>) => (
              <BaseCombobox.Item key={o.value} value={o.value} className={menuItemClass}>
                <span className="min-w-0">
                  <span className="block font-control">{o.label}</span>
                  {o.description && <span className={menuDescriptionClass}>{o.description}</span>}
                </span>
                {o.trail ?? (o.meta ? <span className={menuMetaClass}>{o.meta}</span> : <span />)}
                <CheckIcon aria-hidden className={selectedTickClass} />
              </BaseCombobox.Item>
            )}
          </BaseCombobox.List>
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

function TrailingButtons({ label }: { label: ReactNode }) {
  return (
    <span className="flex flex-none items-stretch self-stretch">
      <Tooltip label="Clear">
        <BaseCombobox.Clear aria-label={named("Clear", label)} className={wellButton}>
          <XIcon size={14} />
        </BaseCombobox.Clear>
      </Tooltip>
      <Tooltip label="Show options" kbd="↓">
        <BaseCombobox.Trigger
          aria-label="Show options"
          className={cn(wellButton, "[&>svg]:transition-transform [&>svg]:duration-quick data-popup-open:[&>svg]:rotate-180")}
        >
          <CaretDownIcon />
        </BaseCombobox.Trigger>
      </Tooltip>
    </span>
  );
}

export interface ComboboxProps<V extends string = string> extends ComboboxBaseProps<V> {
  value: V | null;
  onValueChange: (value: V | null) => void;
}

/** Pick one option by typing to filter. */
export function Combobox<V extends string = string>({
  label,
  hint,
  error,
  options,
  placeholder,
  emptyText = "Nothing matches. Try a shorter search.",
  lead,
  value,
  onValueChange,
  onOpenChange,
  name,
  disabled,
  readOnly,
  className,
}: ComboboxProps<V>) {
  const items = useItems(options);
  return (
    <BaseField.Root
      name={name}
      disabled={disabled}
      invalid={error ? true : undefined}
      className={cn(fieldRootClass, className)}
    >
      <BaseField.Label className={fieldLabelClass}>{label}</BaseField.Label>
      <BaseCombobox.Root
        items={items}
        value={value}
        onValueChange={(v) => {
          playSound("select");
          onValueChange((v as V | null) ?? null);
        }}
        onOpenChange={(open, d) => {
          playOpenSound(open, d);
          onOpenChange?.(open);
        }}
        disabled={disabled}
        readOnly={readOnly}
      >
        <BaseCombobox.InputGroup data-focus-target className={cn(wellClass, "h-9 touch:h-11")}>
          {lead != null && <span className={wellLeadClass}>{lead}</span>}
          <BaseCombobox.Input data-focus-proxy placeholder={placeholder} className={cn(wellInputClass, lead != null && wellInputAfterLeadClass)} />
          <TrailingButtons label={label} />
        </BaseCombobox.InputGroup>
        <ComboboxPopup<V> emptyText={emptyText} />
      </BaseCombobox.Root>
      <FieldMessage hint={hint} error={error} invalid={!!error} />
    </BaseField.Root>
  );
}

export interface MultiComboboxProps<V extends string = string> extends ComboboxBaseProps<V> {
  value: V[];
  onValueChange: (value: V[]) => void;
}

/** Pick several; each pick becomes a chip in the well. */
export function MultiCombobox<V extends string = string>({
  label,
  hint,
  error,
  options,
  placeholder,
  emptyText = "Nothing matches. Try a shorter search.",
  value,
  onValueChange,
  onOpenChange,
  name,
  disabled,
  readOnly,
  className,
}: MultiComboboxProps<V>) {
  const items = useItems(options);
  const labelOf = (v: V) => options.find((o) => o.value === v)?.label ?? v;
  return (
    <BaseField.Root
      name={name}
      disabled={disabled}
      invalid={error ? true : undefined}
      className={cn(fieldRootClass, className)}
    >
      <BaseField.Label className={fieldLabelClass}>{label}</BaseField.Label>
      <BaseCombobox.Root
        items={items}
        multiple
        value={value}
        onValueChange={(v) => {
          playSound((v as V[]).length > value.length ? "check" : "uncheck");
          onValueChange(v as V[]);
        }}
        onOpenChange={(open, d) => {
          playOpenSound(open, d);
          onOpenChange?.(open);
        }}
        disabled={disabled}
        readOnly={readOnly}
      >
        <BaseCombobox.InputGroup data-focus-target className={cn(wellClass, "min-h-9 cursor-text items-center touch:min-h-11")}>
          <BaseCombobox.Value>
            {(selected: V[]) => (
              <BaseCombobox.Chips
                aria-label={selected.length > 0 ? named("Selected", label) : undefined}
                className="flex min-w-0 flex-1 flex-wrap items-center gap-1 py-1 pl-1"
              >
                {selected.map((v) => (
                  <BaseCombobox.Chip
                    key={v}
                    aria-label={labelOf(v)}
                    className={cn(
                      "inline-flex min-h-6.5 max-w-full min-w-0 items-center gap-0.5 rounded-inline border border-line-strong bg-sunken pl-2 text-small text-ink outline-none",
                      "data-highlighted:border-ink focus-within:border-ink",
                    )}
                  >
                    <span title={labelOf(v)} className="min-w-0 truncate">
                      {labelOf(v)}
                    </span>
                    <BaseCombobox.ChipRemove
                      aria-label={`Remove ${labelOf(v)}`}
                      className={cn(
                        // 24px box flush with the chip's edge (radius concentric with its 1px border),
                        // and a hit area that reaches past the chip on touch.
                        "relative grid size-6 flex-none place-items-center rounded-[calc(var(--r-inline)-1px)] border-0 bg-transparent text-ink-3",
                        "before:absolute before:-inset-0.5 before:content-[''] touch:before:-inset-2.5 hover:bg-hover hover:text-ink",
                      )}
                    >
                      <XIcon size={12} />
                    </BaseCombobox.ChipRemove>
                  </BaseCombobox.Chip>
                ))}
                <BaseCombobox.Input
                  data-focus-proxy
                  placeholder={selected.length > 0 ? "" : placeholder}
                  className={cn(wellInputClass, "min-h-6.5 min-w-16 px-1.5")}
                />
              </BaseCombobox.Chips>
            )}
          </BaseCombobox.Value>
          <TrailingButtons label={label} />
        </BaseCombobox.InputGroup>
        <ComboboxPopup<V> emptyText={emptyText} />
      </BaseCombobox.Root>
      <FieldMessage hint={hint} error={error} invalid={!!error} />
    </BaseField.Root>
  );
}
