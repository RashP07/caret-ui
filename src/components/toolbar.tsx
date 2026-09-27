import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "@/lib/cn";
import { TooltipGroup } from "./tooltip";

/*
 * Toolbar. A row of icon buttons with one tab stop; arrow keys move between
 * them (Base UI Toolbar). Every button is an IconButton, so each is
 * labelled and tooltipped — with one shared tooltip (TooltipGroup), so
 * scanning the row swaps the label in place instead of flickering.
 */

export function Toolbar({
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof BaseToolbar.Root>, "className"> & { className?: string }) {
  return (
    <BaseToolbar.Root
      // Concentric: an 8px frame, 4px in, around 4px buttons.
      className={cn("inline-flex gap-0.5 rounded-control border border-line bg-surface p-1", className)}
      {...props}
    >
      <TooltipGroup>{children}</TooltipGroup>
    </BaseToolbar.Root>
  );
}

/** Pass the button to render, e.g. `<ToolbarButton render={<IconButton … />} />`. */
export function ToolbarButton({ render }: { render: ReactElement }) {
  return <BaseToolbar.Button render={render} />;
}

export function ToolbarSeparator() {
  return <BaseToolbar.Separator className="mx-1 my-1 w-px bg-line" />;
}
