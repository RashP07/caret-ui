import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { usePortalTheme } from "@/lib/theme";
import { actionMenuPopupClass } from "./menu";
import { keyboardInstant } from "./select";

/*
 * Context menu. The same menu, opened at the pointer by right-click or long
 * press over an area. Fill it with the Menu item parts (MenuItem,
 * MenuCheckboxItem, MenuSeparator, MenuSubmenu…). Keyboard users reach the
 * same actions elsewhere: a context menu is a shortcut, never the only path.
 */

export interface ContextMenuProps {
  /** The area that listens for right-click / long press. */
  area: ReactNode;
  /** Menu item parts. */
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
  /** Classes for the area wrapper. */
  className?: string;
  areaProps?: Omit<ComponentProps<typeof BaseContextMenu.Trigger>, "className" | "children">;
}

export function ContextMenu({ area, children, onOpenChange, className, areaProps }: ContextMenuProps) {
  const portalTheme = usePortalTheme();
  return (
    <BaseContextMenu.Root onOpenChange={(o) => onOpenChange?.(o)}>
      <BaseContextMenu.Trigger className={cn("select-none", className)} {...areaProps}>
        {area}
      </BaseContextMenu.Trigger>
      <BaseContextMenu.Portal {...portalTheme}>
        <BaseContextMenu.Positioner collisionPadding={8} className="z-[70] outline-none">
          <BaseContextMenu.Popup className={keyboardInstant(actionMenuPopupClass)}>{children}</BaseContextMenu.Popup>
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
    </BaseContextMenu.Root>
  );
}
