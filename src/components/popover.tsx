import { Popover as BasePopover } from "@base-ui/react/popover";
import { XIcon } from "@phosphor-icons/react";
import { useRef, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { playOpenSound } from "@/lib/sound";
import { usePortalTheme } from "@/lib/theme";
import { IconButton } from "./button";

/*
 * Popover. A small floating panel anchored to the button that opened it:
 * details, a quick setting, a short form. Unlike a tooltip it can hold
 * interactive content, and it opens on click (or Enter/Space), so touch and
 * keyboard users get it too. Escape or a click outside closes it and focus
 * returns to the trigger. It floats, so it's a card: --r-card, --e-float.
 */

/** Shared floating-panel classes (Popover, PreviewCard). */
export const floatingPanelClass = cn(
  "rounded-card border border-line bg-surface text-ink shadow-float outline-none",
  "origin-(--transform-origin) transition-[opacity,scale] duration-quick ease-out",
  "data-starting-style:scale-[.97] data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-instant",
  "data-instant:transition-none",
);

/** A bordered arrow that continues the panel's hairline. Set 5px out (half its 10px box), so its
 *  corners land on the border's inner edge on whole pixels. */
export const floatingArrowClass = cn(
  "size-2.5 rotate-45 rounded-[1px] border-line bg-surface",
  "data-[side=bottom]:-top-[5px] data-[side=bottom]:border-t data-[side=bottom]:border-l",
  "data-[side=top]:-bottom-[5px] data-[side=top]:border-r data-[side=top]:border-b",
  "data-[side=left]:-right-[5px] data-[side=left]:border-t data-[side=left]:border-r",
  "data-[side=right]:-left-[5px] data-[side=right]:border-b data-[side=right]:border-l",
);

export interface PopoverProps {
  /** The element that opens the popover: a Button or IconButton. */
  trigger: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  /** Also open on hover (for pointer users); click still works. */
  openOnHover?: boolean;
  /** Panel width in px. Default 320. */
  width?: number;
  /** Hide the close button (the popover still closes on Escape and outside click). */
  hideClose?: boolean;
}

export function Popover({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
  side = "bottom",
  align = "center",
  openOnHover,
  width = 320,
  hideClose,
}: PopoverProps) {
  const portalTheme = usePortalTheme();
  // Focus the panel itself on open: keyboard users read it first, then Tab to its actions.
  const popupRef = useRef<HTMLDivElement>(null);
  return (
    <BasePopover.Root open={open} onOpenChange={(o, d) => {
        playOpenSound(o, d);
        onOpenChange?.(o);
      }}>
      <BasePopover.Trigger render={trigger} openOnHover={openOnHover} />
      <BasePopover.Portal {...portalTheme}>
        <BasePopover.Positioner side={side} align={align} sideOffset={10} collisionPadding={8} className="z-[70]">
          <BasePopover.Popup
            ref={popupRef}
            initialFocus={popupRef}
            className={cn(floatingPanelClass, "relative p-4")}
            style={{ width: `min(${width}px, var(--available-width))` }}
          >
            <BasePopover.Arrow className={floatingArrowClass} />
            <BasePopover.Title className={cn("m-0 text-subtitle font-heading text-balance", !hideClose && "pr-9")}>
              {title}
            </BasePopover.Title>
            {description && (
              <BasePopover.Description className="m-0 mt-1 text-control text-pretty text-ink-2">{description}</BasePopover.Description>
            )}
            {children && <div className="mt-3">{children}</div>}
            {!hideClose && (
              <BasePopover.Close
                render={<IconButton label="Close" icon={<XIcon size={14} />} className="absolute top-2 right-2" />}
              />
            )}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

/** Closes the surrounding Popover. `<PopoverClose render={<Button>Done</Button>} />` */
export function PopoverClose({ render }: { render: ReactElement }) {
  return <BasePopover.Close render={render} />;
}
