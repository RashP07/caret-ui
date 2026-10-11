import { XIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconButton } from "./button";
import { toneMark, type ToastTone } from "./toast";

/*
 * Callout. A notice that stays on the page until its cause goes away: a key about to expire, a
 * quota nearly spent, a run that needs you. A toast says what just happened and leaves; a callout
 * says what is true now. It sits in the flow on the surface, edged in its status line, with the
 * toast's tone mark, so a warning reads the same wherever it shows up. Color is never the only
 * cue: each tone has its own glyph, and screen readers hear the tone first.
 */

export type CalloutTone = ToastTone;

const edge: Record<CalloutTone, string> = {
  neutral: "border-line-strong",
  success: "border-success-line",
  danger: "border-danger-line",
  warning: "border-warning-line",
  info: "border-info-line",
};

const spoken: Record<CalloutTone, string> = {
  neutral: "Note",
  success: "Done",
  danger: "Error",
  warning: "Warning",
  info: "Info",
};

export interface CalloutProps extends Omit<ComponentProps<"div">, "title"> {
  tone?: CalloutTone;
  /** One line: what is true. */
  title: ReactNode;
  /** What it means, and what to do about it. */
  children?: ReactNode;
  /** A Button size="sm" (or two). Sits at the end, or wraps under the text when there's no room. */
  action?: ReactNode;
  /** Shows a close button. Leave it off for anything that must stay until it's fixed. */
  onDismiss?: () => void;
  /** A leading icon for the neutral tone, which has no mark of its own. */
  icon?: ReactNode;
}

/**
 * A persistent notice in the page flow. Not a live region by default: a callout that is there when
 * the page loads is read in order. Pass role="alert" (danger) or role="status" when one appears
 * because of something the person just did.
 */
export function Callout({ tone = "neutral", title, children, action, onDismiss, icon, className, ...props }: CalloutProps) {
  const mark = tone === "neutral" ? null : toneMark[tone];
  return (
    <div
      data-tone={tone}
      className={cn(
        // A container, so the card radius. With an action or a close button the end side tightens
        // to 8px: 12px outer less 8px inset is the button's 4px radius (concentric), as in a toast.
        "flex w-full min-w-0 items-start gap-2.5 rounded-card border-stroke bg-surface py-2.5 ps-3 pe-3 text-small",
        (action || onDismiss) && "pe-2",
        edge[tone],
        className,
      )}
      {...props}
    >
      {mark ? (
        // Centred on the 20px title line.
        <span aria-hidden className={cn("mt-px grid size-[18px] flex-none place-items-center rounded-full", mark.disc)}>
          {mark.glyph}
        </span>
      ) : (
        icon && (
          <span aria-hidden className="flex h-5 flex-none items-center text-ink-2 [&_svg]:size-4">
            {icon}
          </span>
        )
      )}
      {/* Text and actions share a wrapping row: the actions drop under the text when it's narrow. */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-[min(100%,24ch)] flex-1">
          <div className="text-control font-control text-pretty text-ink">
            <span className="sr-only-caret">{spoken[tone]}: </span>
            {title}
          </div>
          {children != null && <div className="mt-0.5 text-small text-pretty text-ink-2">{children}</div>}
        </div>
        {action && <div className="flex flex-none flex-wrap items-center gap-2">{action}</div>}
      </div>
      {onDismiss && <IconButton size="sm" className="flex-none" label="Dismiss" icon={<XIcon />} onClick={onDismiss} />}
    </div>
  );
}
