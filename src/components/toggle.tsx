import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button, IconButton } from "./button";

/*
 * Toggle. A button that stays pressed: bold, wrap lines, split view.
 * It is a real Caret key: off, it stands on its ledge like any secondary button; on, it stays
 * held down (ledge gone, face dropped, pressed fill), exactly the frame a click passes through.
 * aria-pressed carries the state. Icon-only toggles require a label, which becomes the
 * accessible name and the tooltip.
 */

type BaseToggleProps = Omit<ComponentProps<typeof BaseToggle>, "render" | "className" | "children">;

export interface ToggleProps extends BaseToggleProps {
  /** Icon-only: the accessible name and tooltip. With text: a tooltip that adds detail. */
  label: string;
  icon?: ReactNode;
  /** Visible text. Omit for an icon-only toggle. */
  children?: ReactNode;
  /** Shortcut shown in the tooltip (icon-only) or on the control. */
  kbd?: string;
  className?: string;
}

export function Toggle({ label, icon, children, kbd, className, ...props }: ToggleProps) {
  return (
    <BaseToggle
      {...props}
      render={(p, state) =>
        children == null ? (
          <IconButton {...p} variant="secondary" pressed={state.pressed} label={label} icon={icon} kbd={kbd} className={className} />
        ) : (
          // Text toggles are named by their text; `label` adds detail as a tooltip when it says more.
          <Button {...p} variant="secondary" pressed={state.pressed} icon={icon} kbd={kbd} tip={label !== children ? label : undefined} className={className}>
            {children}
          </Button>
        )
      }
    />
  );
}

type GroupProps = Omit<ComponentProps<typeof BaseToggleGroup>, "className"> & {
  className?: string;
  /** Sit the group in a hairline frame, like a toolbar. */
  framed?: boolean;
};

/**
 * A set of toggles with one tab stop; arrow keys move between them.
 * Single choice by default (pressing the active one clears it); pass `multiple` for independent toggles.
 */
export function ToggleGroup({ className, framed, ...props }: GroupProps) {
  return (
    <BaseToggleGroup
      className={cn(
        "inline-flex items-center gap-1",
        // Concentric: an 8px frame, 4px in, around 4px keys; the keys' ledge sits inside the padding.
        framed && "rounded-control border border-line bg-surface p-1",
        className,
      )}
      {...props}
    />
  );
}
