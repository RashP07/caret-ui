import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { playSound } from "@/lib/sound";
import { usePortalTheme } from "@/lib/theme";
import { Kbd } from "./kbd";
import { ScrollArea } from "./scroll-area";
import { menuDescriptionClass, menuGroupLabelClass, menuMetaClass } from "./select";

/*
 * Command palette. Type to find anything, Enter to run it. It's opened
 * hundreds of times a day, so it has no entrance and no exit: the popup is
 * there on the first frame and gone on the next (the backdrop fades in
 * --d-instant at most). Built on Base UI Autocomplete rendered inline, inside
 * a Dialog: focus is trapped, Escape closes, focus returns to where it was.
 */

export interface CommandItem {
  value: string;
  label: string;
  /** One line under the label saying what it does. */
  description?: string;
  /** Trailing meta: a shortcut, a kind, a count. */
  meta?: string;
  icon?: ReactNode;
  /** Extra words that should find this item. */
  keywords?: string[];
  onSelect: () => void;
}

export interface CommandGroup {
  label: string;
  items: CommandItem[];
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandGroup[];
  placeholder?: string;
  /** Accessible name. */
  label?: string;
  /** Shown when nothing matches. Say what to try next. */
  emptyText?: ReactNode;
  /** Left side of the footer; the key hints sit on the right. */
  footer?: ReactNode;
  /** Fires as the query changes (for readouts). */
  onQueryChange?: (query: string) => void;
}

/** Every word of the query must appear in the label, description or keywords. */
function matches(item: CommandItem, query: string) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = [item.label, item.description ?? "", ...(item.keywords ?? [])].join(" ").toLowerCase();
  return words.every((w) => hay.includes(w));
}

const backdropClass = cn(
  "fixed inset-0 z-[110] min-h-dvh bg-scrim",
  // The only motion allowed: a --d-instant fade on the scrim.
  "transition-opacity duration-instant ease-out data-starting-style:opacity-0 data-ending-style:opacity-0",
);

const popupClass = cn(
  "flex max-h-[calc(100dvh-12vh-16px)] w-[min(560px,calc(100vw-32px))] flex-col overflow-hidden",
  "rounded-dialog bg-surface text-ink shadow-modal outline-none",
);

const itemClass = cn(
  "group/cmd flex cursor-default items-center gap-2.5 rounded-button px-2.5 py-2 text-control outline-none select-none",
  // Highlight is the hover fill, so ink-3 meta keeps 4.5:1 on it.
  "data-highlighted:bg-hover",
  "[&_[data-cmd-icon]]:text-ink-3 data-highlighted:[&_[data-cmd-icon]]:text-ink",
  "data-disabled:cursor-not-allowed data-disabled:text-ink-disabled data-disabled:[&_[data-cmd-icon]]:text-ink-disabled",
);

export function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = "Type a command or search",
  label = "Command palette",
  emptyText = "No results. Try a shorter search.",
  footer,
  onQueryChange,
}: CommandPaletteProps) {
  const portalTheme = usePortalTheme();
  const hintsId = useId();
  const [query, setQuery] = useState("");
  const items = groups.map((g) => ({ value: g.label, items: g.items }));

  function change(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setQuery("");
      onQueryChange?.("");
    }
  }

  function run(item: CommandItem) {
    playSound("select");
    change(false);
    item.onSelect();
  }

  return (
    <BaseDialog.Root open={open} onOpenChange={(o) => change(o)}>
      <BaseDialog.Portal {...portalTheme}>
        <BaseDialog.Backdrop className={backdropClass} />
        <BaseDialog.Viewport className="fixed inset-0 z-[111] flex items-start justify-center px-4 pt-[12vh]">
          <BaseDialog.Popup aria-label={label} className={popupClass}>
            <BaseAutocomplete.Root
              open
              inline
              items={items}
              value={query}
              onValueChange={(v) => {
                setQuery(v);
                onQueryChange?.(v);
              }}
              itemToStringValue={(item: CommandItem) => item.label}
              filter={(item: CommandItem, q: string) => matches(item, q)}
              autoHighlight="always"
              keepHighlight
            >
              <div className="flex h-12 flex-none items-center gap-2.5 px-4">
                <MagnifyingGlassIcon aria-hidden className="flex-none text-ink-3" />
                <BaseAutocomplete.Input
                  aria-label={label}
                  aria-describedby={hintsId}
                  placeholder={placeholder}
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-input-touch text-ink outline-none placeholder:text-ink-3 sm:text-body"
                />
              </div>
              <BaseDialog.Close className="sr-only-caret">Close</BaseDialog.Close>

              <div className="border-t border-line">
                <ScrollArea
                  className="[&>div:first-child]:max-h-[min(60dvh,26rem)]"
                  // Rows truncate to the palette's width instead of scrolling sideways.
                  contentClassName="w-full min-w-0! p-1.5"
                >
                  <BaseAutocomplete.Empty>
                    <div className="px-2.5 py-6 text-small text-pretty text-ink-3">{emptyText}</div>
                  </BaseAutocomplete.Empty>
                  <BaseAutocomplete.List className="outline-none">
                    {(group: { value: string; items: CommandItem[] }) => (
                      <BaseAutocomplete.Group key={group.value} items={group.items} className="not-last:mb-1">
                        <BaseAutocomplete.GroupLabel className={menuGroupLabelClass}>{group.value}</BaseAutocomplete.GroupLabel>
                        <BaseAutocomplete.Collection>
                          {(item: CommandItem) => (
                            <BaseAutocomplete.Item key={item.value} value={item} onClick={() => run(item)} className={itemClass}>
                              {item.icon ? (
                                <span data-cmd-icon className="flex w-4 flex-none items-center justify-center">
                                  {item.icon}
                                </span>
                              ) : (
                                // Only takes room when another row in the list has an icon.
                                <span aria-hidden className="hidden w-4 flex-none [[role=listbox]:has([data-cmd-icon])_&]:block" />
                              )}
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-control" title={item.label}>{item.label}</span>
                                {item.description && (
                                  <span className={cn(menuDescriptionClass, "truncate")} title={item.description}>
                                    {item.description}
                                  </span>
                                )}
                              </span>
                              {item.meta && <span className={cn(menuMetaClass, "flex-none group-data-disabled/cmd:text-ink-disabled")}>{item.meta}</span>}
                            </BaseAutocomplete.Item>
                          )}
                        </BaseAutocomplete.Collection>
                      </BaseAutocomplete.Group>
                    )}
                  </BaseAutocomplete.List>
                </ScrollArea>
              </div>

              <div className="flex min-h-10 flex-none items-center gap-3 border-t border-line px-4 py-2 text-caption text-ink-3">
                <div className="min-w-0 flex-1 truncate">{footer}</div>
                <div id={hintsId} className="flex flex-none items-center gap-3 max-[600px]:hidden">
                  <span className="flex items-center gap-1.5">
                    <Kbd keys="↑ ↓" size="sm" />
                    Move
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Kbd keys="↵" size="sm" />
                    Open
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Kbd keys="Esc" size="sm" />
                    Close
                  </span>
                </div>
              </div>
            </BaseAutocomplete.Root>
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
