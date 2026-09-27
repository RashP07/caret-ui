import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { usePortalTheme } from "@/lib/theme";
import { floatingArrowClass, floatingPanelClass } from "./popover";

/*
 * Preview card. Hovering or focusing a link shows where it goes (a run, a
 * file, a person) without leaving the page. The link stays a real link:
 * Enter follows it, and the preview is a bonus for pointer and keyboard
 * users, never the only way to see the content. It opens after a short
 * delay so skimming a paragraph doesn't set off a flurry of cards.
 */

export interface PreviewCardProps extends Omit<ComponentProps<"a">, "children"> {
  /** The link text. */
  children: ReactNode;
  /** What the destination looks like: use Card parts, a Badge, a Diffstat. */
  preview: ReactNode;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "bottom";
  /** Panel width in px. Default 300. */
  width?: number;
}

export function PreviewCard({ children, preview, onOpenChange, side = "bottom", width = 300, className, ...link }: PreviewCardProps) {
  const portalTheme = usePortalTheme();
  return (
    <BasePreviewCard.Root onOpenChange={(o) => onOpenChange?.(o)}>
      <BasePreviewCard.Trigger
        delay={500}
        closeDelay={150}
        className={cn(
          "rounded-[2px] text-ink underline decoration-line-strong decoration-1 underline-offset-[3px] transition-colors duration-instant hover:decoration-ink data-popup-open:decoration-accent-strong",
          className,
        )}
        {...link}
      >
        {children}
      </BasePreviewCard.Trigger>
      <BasePreviewCard.Portal {...portalTheme}>
        <BasePreviewCard.Positioner side={side} sideOffset={10} collisionPadding={8} className="z-[70]">
          <BasePreviewCard.Popup
            className={cn(floatingPanelClass, "relative")}
            style={{ width: `min(${width}px, var(--available-width))` }}
          >
            <BasePreviewCard.Arrow className={floatingArrowClass} />
            {preview}
          </BasePreviewCard.Popup>
        </BasePreviewCard.Positioner>
      </BasePreviewCard.Portal>
    </BasePreviewCard.Root>
  );
}
