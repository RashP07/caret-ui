import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { Field as BaseField } from "@base-ui/react/field";
import { XIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { playOpenSound } from "@/lib/sound";
import { usePortalTheme } from "@/lib/theme";
import { FieldMessage, fieldLabelClass, fieldRootClass, hintClass, wellClass, wellInputAfterLeadClass, wellInputClass, wellLeadClass } from "./input";
import { keyboardInstant, menuDescriptionClass, menuItemClass, menuMetaClass, menuPopupClass } from "./select";
import { Tooltip } from "./tooltip";

/*
 * Autocomplete. Free text with suggestions: whatever you type is the value,
 * and the list only offers to finish it. Arrows move through suggestions,
 * Enter takes one, Escape closes the list and keeps your text. Use a
 * Combobox instead when the value must be one of the options.
 */

export interface Suggestion {
  value: string;
  description?: string;
  /** Right-aligned meta, e.g. a count or a type. */
  meta?: string;
}

export interface AutocompleteProps {
  label: ReactNode;
  hint?: ReactNode;
  /** Replaces the hint when set. Say exactly what to change. */
  error?: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  suggestions: (string | Suggestion)[];
  placeholder?: string;
  /** Leading icon inside the well. */
  lead?: ReactNode;
  /** Shown when no suggestion matches; leave unset to simply close the list. */
  emptyText?: ReactNode;
  /** "list" filters suggestions; "both" also completes the text inline as you type. */
  mode?: "list" | "both";
  onOpenChange?: (open: boolean) => void;
  name?: string;
  disabled?: boolean;
  /** Shows the text at full ink but can't be changed. */
  readOnly?: boolean;
  className?: string;
}

export function Autocomplete({
  label,
  hint,
  error,
  value,
  onValueChange,
  suggestions,
  placeholder,
  lead,
  emptyText,
  mode = "list",
  onOpenChange,
  name,
  disabled,
  readOnly,
  className,
}: AutocompleteProps) {
  const portalTheme = usePortalTheme();
  const items: Suggestion[] = suggestions.map((s) => (typeof s === "string" ? { value: s } : s));
  return (
    <BaseField.Root
      name={name}
      disabled={disabled}
      invalid={error ? true : undefined}
      className={cn(fieldRootClass, className)}
    >
      <BaseField.Label className={fieldLabelClass}>{label}</BaseField.Label>
      <BaseAutocomplete.Root
        items={items}
        value={value}
        onValueChange={(v) => onValueChange(v)}
        onOpenChange={(open, d) => {
          playOpenSound(open, d);
          onOpenChange?.(open);
        }}
        itemToStringValue={(s: Suggestion) => s.value}
        mode={mode}
        disabled={disabled}
        readOnly={readOnly}
      >
        <BaseAutocomplete.InputGroup data-focus-target className={cn(wellClass, "h-9 touch:h-11")}>
          {lead != null && <span className={wellLeadClass}>{lead}</span>}
          <BaseAutocomplete.Input data-focus-proxy placeholder={placeholder} className={cn(wellInputClass, lead != null && wellInputAfterLeadClass)} />
          <Tooltip label="Clear">
            <BaseAutocomplete.Clear
              aria-label={typeof label === "string" ? `Clear ${label}` : "Clear"}
              // Keeps its own ring, drawn inside the well so overflow can't clip it.
              className="flex w-8 flex-none items-center justify-center border-0 bg-transparent text-ink-3 transition-colors duration-instant hover:text-ink touch:w-11"
            >
              <XIcon size={14} />
            </BaseAutocomplete.Clear>
          </Tooltip>
        </BaseAutocomplete.InputGroup>
        <BaseAutocomplete.Portal {...portalTheme}>
          <BaseAutocomplete.Positioner sideOffset={6} collisionPadding={8} className="z-[60] outline-none">
            <BaseAutocomplete.Popup className={keyboardInstant(cn(menuPopupClass, "w-(--anchor-width) max-w-(--available-width)"))}>
              {emptyText != null && (
                <BaseAutocomplete.Empty className={cn(hintClass, "px-2.5 py-2 empty:hidden")}>
                  {emptyText}
                </BaseAutocomplete.Empty>
              )}
              <BaseAutocomplete.List className="outline-none">
                {(s: Suggestion) => (
                  <BaseAutocomplete.Item key={s.value} value={s} className={cn(menuItemClass, "grid-cols-[1fr_auto]")}>
                    <span className="min-w-0">
                      <span className="block font-control">{s.value}</span>
                      {s.description && <span className={menuDescriptionClass}>{s.description}</span>}
                    </span>
                    {s.meta ? <span className={menuMetaClass}>{s.meta}</span> : <span />}
                  </BaseAutocomplete.Item>
                )}
              </BaseAutocomplete.List>
            </BaseAutocomplete.Popup>
          </BaseAutocomplete.Positioner>
        </BaseAutocomplete.Portal>
      </BaseAutocomplete.Root>
      <FieldMessage hint={hint} error={error} invalid={!!error} />
    </BaseField.Root>
  );
}
