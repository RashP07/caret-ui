import { Button as BaseButton } from "@base-ui/react/button";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { scaled } from "@/lib/motion";
import { Kbd } from "./kbd";
import { Tooltip } from "./tooltip";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "danger";
export type ButtonSize = "default" | "sm";

/*
 * Tactile buttons. Each face stands on a 2px ledge (the second shadow).
 * Pressed, the face travels down exactly as far as the ledge shrinks, so the
 * bottom edge never moves. The face is 36px less the ledge, so a ledged
 * button takes the same 36px row as an input. Ghost buttons have no ledge.
 * Disabled buttons stay up: no travel, a muted face.
 *
 * Per-variant material lives in local custom properties (--bg, --fg, --bd,
 * --ledge, --hl); the per-theme strength comes from material tokens. Solid
 * fills darken with relative color (oklch from a token), never a mix with black.
 *
 * Optical spacing (DESIGN.md §3 Space): the side with an icon, chevron or key cap
 * gets less padding than the text side, because a 16px icon box carries its own
 * whitespace and lighter mass than a word. --pad is the text side, --pad-icon the
 * icon side; [data-lead] / [data-trail] pick it. Logical sides, so RTL mirrors.
 */
const base = [
  "relative inline-flex min-w-0 max-w-full items-center justify-center gap-2 rounded-button",
  "[--pad:--spacing(3.5)] [--pad-icon:--spacing(2.5)] px-(--pad) data-lead:ps-(--pad-icon) data-trail:pe-(--pad-icon)",
  "border border-(--bd) bg-(--bg) text-(--fg) text-control font-control tracking-[-.005em] whitespace-nowrap no-underline select-none",
  "[-webkit-tap-highlight-color:transparent] mb-(--btn-ledge) [--lift:var(--btn-ledge)]",
  "shadow-[inset_0_1px_0_var(--hl),0_var(--lift)_0_0_var(--ledge)]",
  // Focus: the global inset outline. The ring sits inside the face, over its border, so it never
  // overlaps neighbours in a toolbar or group, and the ledge below doesn't matter.
  // Touch: a 44px hit area around the face without growing the layout.
  "touch:before:absolute touch:before:top-1/2 touch:before:left-1/2 touch:before:size-full touch:before:min-h-11 touch:before:min-w-11 touch:before:-translate-1/2 touch:before:content-['']",
  // Press travel answers the press (ease-out); the face color is a hover change (ease).
  "transition-[background-color,border-color,color,box-shadow,translate] duration-instant ease-out",
  "[transition-timing-function:var(--ease-hover),var(--ease-hover),var(--ease-hover),var(--ease-out),var(--ease-out)]",
  "[--bg:transparent] [--fg:var(--ink)] [--bd:transparent] [--ledge:transparent] [--hl:transparent]",
  "disabled:cursor-not-allowed disabled:[--fg:var(--ink-disabled)]",
  "aria-busy:cursor-progress",
  "[&_svg]:flex-none",
].join(" ");

/** Pressed: mouse/touch (:active), keyboard (Enter/Space), a shortcut, or busy. Never while disabled. */
const ledgePressed = "not-disabled:[--lift:0px] not-disabled:translate-y-(--btn-travel)";
const ledgeActive =
  "not-disabled:active:[--lift:0px] not-disabled:active:translate-y-(--btn-travel) aria-busy:[--lift:0px] aria-busy:translate-y-(--btn-travel)";

/** Ledged variants when disabled: a sunken face on a hairline ledge, standing up. */
const ledgeDisabled =
  "disabled:[--bg:var(--sunken)] disabled:[--bd:var(--line)] disabled:[--ledge:var(--line)] disabled:[--hl:transparent]";

/** Filled faces: the focus color can match the fill (ink primary, accent on an accent theme), so the
 *  ring is drawn in the face's own text color, one step inside the border. Still one line, still inside. */
const filledFocus =
  "focus-visible:outline-(--fg) focus-visible:outline-offset-[calc(-1*var(--focus-width)-2px)]";

const variants: Record<ButtonVariant, { rest: string; pressed: string }> = {
  primary: {
    rest: cn(
      "[--bg:var(--btn-primary)] [--fg:var(--on-btn-primary)] [--bd:color-mix(in_oklch,var(--btn-primary),var(--btn-primary-ledge))] [--ledge:var(--btn-primary-ledge)] [--hl:color-mix(in_oklab,var(--btn-secondary-hl)_30%,transparent)]",
      "not-disabled:hover:[--bg:var(--btn-primary-hover)] not-disabled:active:[--bg:color-mix(in_oklch,var(--btn-primary)_88%,var(--on-btn-primary))]",
      ledgeActive,
      ledgeDisabled,
      filledFocus,
    ),
    pressed: cn(ledgePressed, "not-disabled:[--bg:color-mix(in_oklch,var(--btn-primary)_88%,var(--on-btn-primary))]"),
  },
  secondary: {
    rest: cn(
      "border-stroke [--bg:var(--surface)] [--bd:var(--line-strong)] [--ledge:var(--btn-secondary-ledge)] [--hl:var(--btn-secondary-hl)]",
      "not-disabled:hover:[--bg:var(--hover)] not-disabled:active:[--bg:var(--pressed)]",
      ledgeActive,
      ledgeDisabled,
    ),
    pressed: cn(ledgePressed, "not-disabled:[--bg:var(--pressed)]"),
  },
  ghost: {
    // Pressed (aria-pressed) is a stronger fill than hover plus a hairline mark, and hover doesn't wash it out.
    rest: cn(
      "mb-0 [--lift:0px] [--fg:var(--ink-2)]",
      "not-disabled:not-aria-pressed:hover:[--bg:var(--hover)] not-disabled:hover:[--fg:var(--ink)]",
      "not-disabled:active:translate-y-px",
      "aria-pressed:[--bg:var(--pressed)] aria-pressed:[--fg:var(--ink)] aria-pressed:shadow-[inset_0_0_0_1px_var(--line-strong)]",
    ),
    pressed: "not-disabled:translate-y-px",
  },
  accent: {
    rest: cn(
      "[--bg:var(--accent)] [--fg:var(--on-accent)] [--bd:oklch(from_var(--accent)_calc(l_-_0.14)_c_h)] [--ledge:oklch(from_var(--accent)_calc(l_-_0.22)_c_h)] [--hl:var(--btn-secondary-hl)]",
      "not-disabled:hover:[--bg:oklch(from_var(--accent)_calc(l_-_0.03)_c_h)]",
      ledgeActive,
      ledgeDisabled,
      filledFocus,
    ),
    pressed: ledgePressed,
  },
  danger: {
    rest: cn(
      "[--bg:var(--danger-solid)] [--fg:var(--on-danger)] [--bd:oklch(from_var(--danger-solid)_calc(l_-_0.1)_c_h)] [--ledge:oklch(from_var(--danger-solid)_calc(l_-_0.18)_c_h)] [--hl:color-mix(in_oklab,var(--on-danger)_20%,transparent)]",
      "not-disabled:hover:[--bg:oklch(from_var(--danger-solid)_calc(l_-_0.04)_c_h)]",
      ledgeActive,
      ledgeDisabled,
      filledFocus,
    ),
    pressed: ledgePressed,
  },
};

/**
 * Sizes: the row height a button takes (36px or 28px), ledge included. Ghost
 * faces fill it; ledged faces are that less the ledge. Icon-only faces are square.
 * Both stay ≥24px, and the touch hit area reaches 44px either way.
 */
const sizes: Record<ButtonSize, { ghost: string; ledged: string; square: string; ledgedSquare: string; rest: string }> = {
  default: {
    ghost: "h-9",
    ledged: "h-[calc(2.25rem_-_var(--btn-ledge))]",
    square: "w-9",
    ledgedSquare: "w-[calc(2.25rem_-_var(--btn-ledge))]",
    rest: "",
  },
  sm: {
    ghost: "h-7",
    ledged: "h-[calc(1.75rem_-_var(--btn-ledge))]",
    square: "w-7",
    ledgedSquare: "w-[calc(1.75rem_-_var(--btn-ledge))]",
    rest: "gap-1.5 [--pad:--spacing(2.5)] [--pad-icon:--spacing(1.5)] text-small",
  },
};

export function buttonClass(
  variant: ButtonVariant = "secondary",
  opts: { icon?: boolean; pressed?: boolean; size?: ButtonSize } = {},
) {
  const v = variants[variant];
  const z = sizes[opts.size ?? "default"];
  const ghost = variant === "ghost";
  return cn(
    base,
    v.rest,
    opts.pressed && v.pressed,
    ghost ? z.ghost : z.ledged,
    z.rest,
    // Icon-only faces are square: no side padding, so no optical offset either.
    opts.icon && cn(ghost ? z.square : z.ledgedSquare, "[--pad:0px] [--pad-icon:0px]"),
  );
}

export interface ButtonProps extends ComponentProps<typeof BaseButton> {
  variant?: ButtonVariant;
  /** `sm`: a 28px row at text-small, for dense spots (toasts, table rows). Same ledge. */
  size?: ButtonSize;
  /** Leading icon (a Phosphor icon element). Hidden while loading. */
  icon?: ReactNode;
  /** Trailing icon, e.g. a menu trigger's chevron. Takes the icon-side padding. */
  trail?: ReactNode;
  /** Shortcut printed on the control, e.g. "⌘↵". */
  kbd?: string;
  /** Busy: sets aria-busy, shows a spinner, keeps the width. */
  loading?: boolean;
  /** Force the pressed look, e.g. while its keyboard shortcut is held. */
  pressed?: boolean;
  /** Optional tooltip label (and its shortcut). */
  tip?: ReactNode;
  tipKbd?: string;
  /** Fires when the tooltip opens or closes (for state readouts). */
  onTipOpenChange?: (open: boolean) => void;
}

export function Button({
  variant = "secondary",
  size,
  icon,
  trail,
  kbd,
  loading,
  pressed = false,
  tip,
  tipKbd,
  onTipOpenChange,
  className,
  children,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: ButtonProps) {
  // Keyboard presses show the pressed state too, not just the pointer.
  const [keyDown, setKeyDown] = useState(false);
  const isIconOnly = !children && !!icon;

  const button = (
    <BaseButton
      aria-busy={loading || undefined}
      // Optical spacing: the icon side and the trailing side (key cap, chevron) take --pad-icon.
      data-lead={(icon != null && !isIconOnly) || undefined}
      data-trail={(kbd != null || trail != null) || undefined}
      className={(state) =>
        cn(
          buttonClass(variant, { icon: isIconOnly, pressed: pressed || keyDown, size }),
          typeof className === "function" ? className(state) : className,
        )
      }
      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
        if ((e.key === "Enter" || e.key === " ") && !props.disabled) setKeyDown(true);
        onKeyDown?.(e as never);
      }}
      onKeyUp={(e: KeyboardEvent<HTMLElement>) => {
        setKeyDown(false);
        onKeyUp?.(e as never);
      }}
      onBlur={(e) => {
        setKeyDown(false);
        onBlur?.(e as never);
      }}
      {...props}
    >
      {/*
        Loading crossfades label → spinner with a 2px blur, so it reads as one
        control changing state rather than two things swapping. The label keeps
        its box (opacity only), so the width never jumps.
      */}
      <span
        className={cn(
          "inline-flex min-w-0 items-center gap-2 transition-[opacity,filter,scale] duration-quick ease-out",
          loading && "scale-90 opacity-0 blur-[2px]",
        )}
      >
        {icon}
        {/* Long or localized labels truncate instead of blowing out the row. */}
        {children != null && <span className="min-w-0 truncate">{children}</span>}
        {/* The key hint takes the face's text color (Kbd tints from currentColor), so it suits every variant. */}
        {kbd && <Kbd keys={kbd} size={size === "sm" ? "sm" : "default"} />}
        {trail}
      </span>
      {loading !== undefined && (
        <CircleNotchIcon
          aria-hidden
          className={cn(
            // ~600ms a turn: a faster spinner reads as faster work.
            "absolute inset-0 m-auto animate-spin [animation-duration:600ms]",
            "transition-[opacity,filter,scale] duration-quick ease-out",
            !loading && "scale-90 opacity-0 blur-[2px]",
          )}
        />
      )}
    </BaseButton>
  );

  return tip ? (
    <Tooltip label={tip} kbd={tipKbd} onOpenChange={onTipOpenChange}>
      {button}
    </Tooltip>
  ) : (
    button
  );
}

/**
 * Morph: crossfade between two states of one small thing (an icon, a short
 * label), growing from a quarter size out of a 4px blur on a spring with no
 * bounce, so the change reads as one object transforming (Send → Stop,
 * Copy → Check). Both states share one grid cell, so nothing around it moves.
 */
export function Morph({ swapKey, children }: { swapKey: string; children: ReactNode }) {
  const hidden = { opacity: 0, scale: 0.25, filter: "blur(4px)" };
  const shown = { opacity: 1, scale: 1, filter: "blur(0px)" };
  return (
    <span className="grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
      <AnimatePresence initial={false}>
        <motion.span
          key={swapKey}
          className="flex"
          initial={hidden}
          animate={shown}
          exit={hidden}
          transition={scaled({ type: "spring", duration: 0.3, bounce: 0 })}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, "children" | "icon" | "tip" | "aria-label"> {
  /** Required: becomes both the accessible name and the tooltip. */
  label: string;
  icon: ReactNode;
  /** Shortcut shown in the tooltip. */
  kbd?: string;
  /** Tooltip text if it should differ from the accessible name. */
  tip?: string;
}

/** Icon-only buttons always carry an aria-label and a tooltip. */
export function IconButton({ label, icon, kbd, tip, variant = "ghost", ...props }: IconButtonProps) {
  return <Button variant={variant} icon={icon} aria-label={label} tip={tip ?? label} tipKbd={kbd} {...props} />;
}

/** Joins buttons into one control: square inner corners, shared borders; a focused button rises so its ring covers the shared border. */
export function ButtonGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      role="group"
      className={cn(
        "inline-flex [&>*]:rounded-none [&>*:first-child]:rounded-s-button [&>*:last-child]:rounded-e-button",
        "[&>*:not(:first-child)]:-ms-px [&>*:focus-visible]:z-10",
        className,
      )}
      {...props}
    />
  );
}
