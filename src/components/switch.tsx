import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { snap } from "@/lib/motion";
import { ChoiceRow, ChoiceText, controlHoverClass, controlPressClass } from "./choice";

/*
 * Switch. For a setting that takes effect the moment it flips — no Save
 * button. The checkbox's sibling: a squared track (--r-inline, the same
 * 2px stroke) with a square thumb, never a pill. On, the track fills with
 * ink and the thumb springs 16px across (a transform, nothing else moves). Space toggles it. If the change needs
 * confirming, use a Checkbox in a form instead.
 */

export interface SwitchProps extends Omit<ComponentProps<typeof BaseSwitch.Root>, "className"> {
  className?: string;
}

/** The bare switch. Wrap in <SwitchChoice> for a labelled row. */
export function Switch({ className, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root
      className={cn(
        "relative inline-flex h-5 w-9 flex-none cursor-pointer items-center rounded-inline border-stroke-bold border-border-control bg-sunken p-px",
        // 20px tall to see, 28px to hit (44px on touch).
        "before:absolute before:-inset-x-0.5 before:-inset-y-1 before:content-[''] touch:before:-inset-3",
        // One timing for every color, so track and thumb never pass through a low-contrast middle.
        // Press squeezes the switch itself, never the row around it.
        "transition-[background-color,border-color,scale] duration-quick [transition-timing-function:var(--ease-hover),var(--ease-hover),var(--ease-out)]",
        controlPressClass,
        controlHoverClass,
        "data-checked:border-ink data-checked:bg-ink [label:hover_&]:data-checked:border-ink hover:data-checked:border-ink",
        "data-disabled:cursor-not-allowed data-disabled:border-line-strong",
        "data-disabled:data-checked:border-ink-disabled data-disabled:data-checked:bg-ink-disabled",
        "data-readonly:cursor-default",
        className,
      )}
      {...props}
    >
      <BaseSwitch.Thumb
        // A transform on the thumb alone (not a layout animation), so nothing
        // around it is measured or moved: 30px lane − 14px thumb = 16px of travel.
        render={(thumbProps, state) => (
          <motion.span
            {...(thumbProps as ComponentProps<typeof motion.span>)}
            initial={false}
            animate={{ transform: state.checked ? "translateX(16px)" : "translateX(0px)" }}
            transition={snap}
          />
        )}
        className={cn(
          // 20×36 track − 2px stroke − 1px inset leaves a 30×14 lane for a 14px square (even in even).
          // Outer radius − stroke − inset, so the thumb's corner is concentric (4 − 2 − 1 = 1px by default).
          "block size-3.5 rounded-[max(0px,calc(var(--r-inline)-var(--stroke-bold)-1px))] bg-ink-3",
          "transition-[background-color] duration-quick ease-out",
          "data-checked:bg-on-ink data-disabled:not-data-checked:bg-ink-disabled",
        )}
      />
    </BaseSwitch.Root>
  );
}

export interface SwitchChoiceProps extends SwitchProps {
  label: ReactNode;
  description?: ReactNode;
}

/** A settings row: label and description on the left, the switch on the right. The whole row toggles. */
export function SwitchChoice({ label, description, disabled, ...props }: SwitchChoiceProps) {
  return (
    <ChoiceRow disabled={disabled} className="grid-cols-[1fr_auto] gap-4">
      <ChoiceText label={label} description={description} />
      <Switch data-focus-proxy disabled={disabled} className="mt-0.5" {...props} />
    </ChoiceRow>
  );
}
