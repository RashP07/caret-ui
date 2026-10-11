import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { CaretRightIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { playSound } from "@/lib/sound";
import { pressClass, pressColorTransition } from "./modality";

/*
 * Collapsible. One trigger, one panel: hide detail until it's asked for
 * ("Environment variables (3)"). The caret turns 90° when open; the panel
 * height moves on ease-in-out and the content fades in just behind it.
 */

/**
 * Panel height: Base UI measures it, so it has to be height (not transform).
 * On ease-in-out, at --d-settle. Reduced motion drops the height change entirely.
 */
export const panelHeightClass = cn(
  "group/panel overflow-hidden transition-[height] duration-settle ease-in-out motion-reduce:duration-0!",
  "data-starting-style:h-0 data-ending-style:h-0",
);

/**
 * Panel content: fades in a beat after the height starts, and out at once when closing,
 * so text is never seen clipped mid-line.
 */
export const panelContentClass = cn(
  "transition-opacity duration-quick ease-out delay-(--d-instant)",
  "group-data-starting-style/panel:opacity-0 group-data-ending-style/panel:opacity-0",
  "group-data-ending-style/panel:delay-0 group-data-ending-style/panel:duration-instant",
);

type RootProps = Omit<ComponentProps<typeof BaseCollapsible.Root>, "className"> & { className?: string };

export function Collapsible({ className, onOpenChange, ...props }: RootProps) {
  return (
    <BaseCollapsible.Root
      className={cn("flex flex-col gap-1", className)}
      {...props}
      onOpenChange={(open, details) => {
        playSound(open ? "open" : "close");
        onOpenChange?.(open, details);
      }}
    />
  );
}

type TriggerProps = Omit<ComponentProps<typeof BaseCollapsible.Trigger>, "className"> & {
  className?: string;
  /** Trailing meta, e.g. a count. */
  meta?: ReactNode;
};

/**
 * A button-shaped row with a turning caret. It hangs 8px into the gutter so the
 * caret lines up with the content — no further than a panel's side room — and
 * draws its ring inside, so neither the hover face nor the ring is clipped there.
 */
export function CollapsibleTrigger({ className, children, meta, ...props }: TriggerProps) {
  return (
    <BaseCollapsible.Trigger
      className={cn(
        "group/col -ms-2 inline-flex h-9 items-center gap-1.5 self-start rounded-button border-0 bg-transparent ps-2 pe-2.5 text-control font-control text-ink-2",
        pressColorTransition,
        pressClass,
        "hover:bg-hover hover:text-ink data-panel-open:text-ink",
        className,
      )}
      {...props}
    >
      <CaretRightIcon
        aria-hidden
        size={14}
        className="flex-none transition-transform duration-quick ease-out group-data-panel-open/col:rotate-90"
      />
      {children}
      {meta != null && (
        <span className="ms-1 text-caption font-normal tabular-nums text-ink-3">
          {meta}
        </span>
      )}
    </BaseCollapsible.Trigger>
  );
}

type PanelProps = Omit<ComponentProps<typeof BaseCollapsible.Panel>, "className"> & { className?: string };

/**
 * The panel clips while it animates, so it reaches 8px past the column on each side
 * (and its content 4px below): rings on full-width fields and nested triggers'
 * hover faces are never cut off. The column itself doesn't move.
 */
export function CollapsiblePanel({ className, children, ...props }: PanelProps) {
  return (
    <BaseCollapsible.Panel
      className={cn(panelHeightClass, "-mx-2 -mb-1 h-(--collapsible-panel-height) px-2")}
      {...props}
    >
      <div className={cn(panelContentClass, "pt-1 pb-1", className)}>{children}</div>
    </BaseCollapsible.Panel>
  );
}
