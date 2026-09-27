import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { LayoutGroup, motion, type Transition } from "motion/react";
import { createContext, useContext, useEffect, useId, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button, IconButton } from "./button";
import { useModalityTransition } from "./modality";

/*
 * Toggle. A button that stays pressed: bold, wrap lines, split view.
 * Built on the ghost button, so pressed reads as the pressed fill, a hairline
 * mark and ink (never just a hover tint), and aria-pressed carries the state. Icon-only toggles require a label, which
 * becomes the accessible name and the tooltip.
 *
 * In a single-choice group the pressed face is one shared element that
 * slides to the pressed toggle on pointer and snaps on keyboard. In a
 * `multiple` group each toggle keeps its own face.
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

/** Set by a single-choice ToggleGroup: which values are pressed, and how the shared face moves. */
const SharedFace = createContext<{ pressed: readonly string[]; transition: () => Transition } | null>(null);

export function Toggle({ label, icon, children, kbd, className, ...props }: ToggleProps) {
  const shared = useContext(SharedFace);
  // In a single-choice group the face is drawn behind the button, so the button's own pressed fill and mark go clear.
  const faceClass = shared ? cn(className, "aria-pressed:[--bg:transparent] aria-pressed:shadow-none") : className;
  const render =
    children == null ? (
      <IconButton label={label} icon={icon} kbd={kbd} className={faceClass} />
    ) : (
      // Text toggles are named by their text; `label` adds detail as a tooltip when it says more.
      <Button variant="ghost" icon={icon} kbd={kbd} tip={label !== children ? label : undefined} className={faceClass}>
        {children}
      </Button>
    );

  if (!shared) return <BaseToggle render={render} {...props} />;

  const isPressed = props.value != null && shared.pressed.includes(props.value);
  return (
    <span className="relative isolate inline-flex">
      {isPressed && (
        <motion.span
          aria-hidden
          layoutId="toggle-face"
          transition={shared.transition()}
          className="absolute inset-0 -z-10 rounded-button bg-pressed shadow-[inset_0_0_0_1px_var(--line-strong)]"
        />
      )}
      <BaseToggle render={render} {...props} />
    </span>
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
export function ToggleGroup({ className, framed, multiple, value, defaultValue, onValueChange, ...props }: GroupProps) {
  const id = useId();
  const { handlers, transition } = useModalityTransition();
  // Mirror the pressed values so single-choice groups know where to draw the shared face.
  const [pressed, setPressed] = useState<readonly string[]>(value ?? defaultValue ?? []);
  useEffect(() => {
    if (value) setPressed(value);
  }, [value]);

  const group = (
    <BaseToggleGroup
      multiple={multiple}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next, details) => {
        setPressed(next);
        onValueChange?.(next, details);
      }}
      {...(multiple ? {} : handlers)}
      className={cn(
        "inline-flex items-center gap-0.5",
        // Concentric: an 8px frame, 4px in, around 4px buttons.
        framed && "rounded-control border border-line bg-surface p-1",
        className,
      )}
      {...props}
    />
  );

  if (multiple) return group;
  return (
    <LayoutGroup id={id}>
      <SharedFace.Provider value={{ pressed, transition }}>{group}</SharedFace.Provider>
    </LayoutGroup>
  );
}
