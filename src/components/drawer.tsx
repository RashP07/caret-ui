import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { XIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { usePortalTheme } from "@/lib/theme";
import { IconButton } from "./button";
import { overlayBackdropClass } from "./dialog";

/*
 * Drawer. A sheet that slides in from an edge for work that needs room but
 * not the whole page: run details, filters, a settings panel. It's modal
 * like a dialog (focus is trapped, Escape and the backdrop close it, focus
 * returns to the trigger) and it can be swiped away toward its edge.
 * It floats above everything, so it takes --e-modal and rounds only the
 * corners that face the page (--r-dialog).
 *
 * Motion: enters on the iOS sheet curve (ease-drawer, --d-settle) and leaves
 * on --d-quick. Base UI measures the release: a quick flick dismisses
 * regardless of distance, and --drawer-swipe-strength (0.1–1) shortens the
 * exit so the sheet keeps the flick's momentum instead of restarting slow.
 * The sheet carries a hidden --bleed past its edge, so dragging it further
 * open never shows a gap behind it (Base UI damps that overdrag). iOS Safari
 * gets no bleed: its visual viewport already covers the edge.
 */

export type DrawerSide = "right" | "bottom";

export interface DrawerProps {
  /** The element that opens the drawer. */
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Which edge it slides from. `bottom` is a sheet with a drag handle. */
  side?: DrawerSide;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Footer actions, right-aligned. Wrap a dismiss action in <DrawerClose>. */
  footer?: ReactNode;
  /** What gets focus on open (default: the panel). E.g. the chosen option, so arrows work at once. */
  initialFocus?: ComponentProps<typeof BaseDrawer.Popup>["initialFocus"];
}

const popupSide: Record<DrawerSide, string> = {
  right: cn(
    "h-full w-[calc(min(400px,100vw-40px)+var(--bleed))] -mr-(--bleed) pr-(--bleed) rounded-l-dialog",
    "[transform:translateX(var(--drawer-swipe-movement-x,0px))]",
    "data-starting-style:[transform:translateX(calc(100%-var(--bleed)+2px))] data-ending-style:[transform:translateX(calc(100%-var(--bleed)+2px))]",
  ),
  bottom: cn(
    "max-h-[calc(85dvh+var(--bleed))] w-full max-w-[640px] -mb-(--bleed) pb-[calc(env(safe-area-inset-bottom,0px)+var(--bleed))] rounded-t-dialog",
    "[transform:translateY(var(--drawer-swipe-movement-y,0px))]",
    "data-starting-style:[transform:translateY(calc(100%-var(--bleed)+2px))] data-ending-style:[transform:translateY(calc(100%-var(--bleed)+2px))]",
  ),
};

export function Drawer({ trigger, open, onOpenChange, side = "right", title, description, children, footer, initialFocus }: DrawerProps) {
  const portalTheme = usePortalTheme();
  return (
    <BaseDrawer.Root open={open} onOpenChange={(o) => onOpenChange?.(o)} swipeDirection={side === "right" ? "right" : "down"}>
      {trigger && <BaseDrawer.Trigger render={trigger} />}
      <BaseDrawer.Portal {...portalTheme}>
        <BaseDrawer.Backdrop
          className={cn(overlayBackdropClass, "opacity-[calc(1-var(--drawer-swipe-progress,0))] data-swiping:duration-0")}
        />
        <BaseDrawer.Viewport
          className={cn("fixed inset-0 z-[111] flex", side === "right" ? "items-stretch justify-end" : "items-end justify-center")}
        >
          <BaseDrawer.Popup
            initialFocus={initialFocus}
            className={cn(
              "flex flex-col overflow-hidden bg-surface text-ink shadow-modal outline-none",
              "[--bleed:48px] supports-[-webkit-touch-callout:none]:[--bleed:0px]",
              // Enter on the sheet curve; exit faster, and faster still after a hard flick.
              "transition-transform duration-settle ease-drawer data-swiping:duration-0 data-swiping:select-none",
              "data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*var(--d-quick))] data-ending-style:ease-out",
              popupSide[side],
            )}
          >
            {side === "bottom" && <div aria-hidden className="mx-auto mt-2 h-1 w-10 flex-none rounded-pill bg-line-strong" />}
            <BaseDrawer.Content className="flex min-h-0 flex-1 flex-col">
              <div className="relative flex-none border-b border-line px-6 pt-5 pb-4">
                <BaseDrawer.Title className="m-0 pr-9 text-title font-heading text-balance">{title}</BaseDrawer.Title>
                {description && (
                  <BaseDrawer.Description className="m-0 mt-1 text-control text-pretty text-ink-2">{description}</BaseDrawer.Description>
                )}
                <BaseDrawer.Close render={<IconButton label="Close" icon={<XIcon />} className="absolute top-3 right-3" />} />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">{children}</div>
              {footer && (
                <div className="flex flex-none flex-wrap justify-end gap-2 border-t border-line bg-[color-mix(in_srgb,var(--sunken)_45%,var(--surface))] px-6 py-3">
                  {footer}
                </div>
              )}
            </BaseDrawer.Content>
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}

/** Closes the surrounding Drawer. `<DrawerClose render={<Button>Done</Button>} />` */
export function DrawerClose({ render }: { render: ReactElement }) {
  return <BaseDrawer.Close render={render} />;
}
