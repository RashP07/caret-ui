import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import {
  CaretRightIcon,
  CheckCircleIcon,
  CircleDashedIcon,
  CircleNotchIcon,
  MinusCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { playSound } from "@/lib/sound";
import { panelContentClass, panelHeightClass } from "./collapsible";

/*
 * Timeline. What a whole run did, in order: clone, install, plan, edit, test, deploy. Trace is the
 * same idea folded inside one reply; a timeline is the page-sized one, where each step has a status,
 * when it started, how long it took and, when there's more to say, a panel with the detail.
 *
 * Each step's mark sits on one rail. The mark carries the status twice, as a glyph and as a color,
 * and screen readers hear it as a word. The running step's mark is the accent and spins; nothing
 * else moves. A step with detail is a Collapsible: its whole title row is the trigger.
 */

export type TimelineStatus = "done" | "running" | "failed" | "pending" | "skipped";

const marks: Record<TimelineStatus, { icon: ReactNode; className: string; word: string }> = {
  done: { icon: <CheckCircleIcon size={16} weight="fill" />, className: "text-success", word: "Done" },
  running: { icon: <CircleNotchIcon size={16} weight="bold" className="animate-spin" />, className: "text-accent-strong", word: "Running" },
  failed: { icon: <XCircleIcon size={16} weight="fill" />, className: "text-danger", word: "Failed" },
  pending: { icon: <CircleDashedIcon size={16} />, className: "text-ink-3", word: "Waiting" },
  skipped: { icon: <MinusCircleIcon size={16} />, className: "text-ink-3", word: "Skipped" },
};

export function Timeline({ className, ...props }: ComponentProps<"ol">) {
  return <ol className={cn("m-0 flex min-w-0 list-none flex-col p-0", className)} {...props} />;
}

export interface TimelineItemProps extends Omit<ComponentProps<"li">, "title"> {
  status: TimelineStatus;
  title: ReactNode;
  /** When it started, short ("14:02:11"); pass the full form in `timeTitle`. */
  time?: ReactNode;
  timeTitle?: string;
  /** How long it took, or "—" while it waits. */
  duration?: ReactNode;
  /** One quiet line under the title: what it touched, why it failed. */
  description?: ReactNode;
  /** The detail behind the step. Makes the row a disclosure. */
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TimelineItem({
  status,
  title,
  time,
  timeTitle,
  duration,
  description,
  children,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ...props
}: TimelineItemProps) {
  const mark = marks[status];
  const detail = children != null;

  const head = (
    <>
      <span className={cn("flex min-w-0 flex-1 flex-col", status === "pending" && "text-ink-3")}>
        <span className={cn("text-control font-control text-pretty", status === "pending" ? "text-ink-2" : "text-ink")}>
          <span className="sr-only-caret">{mark.word}: </span>
          {title}
        </span>
        {description != null && (
          <span className={cn("text-small text-pretty text-ink-3", status === "failed" && "text-danger")}>{description}</span>
        )}
      </span>
      <span className="flex flex-none items-baseline gap-3 text-caption tabular-nums text-ink-3">
        {time != null && <span title={timeTitle}>{time}</span>}
        {duration != null && <span className="min-w-[5ch] text-end text-ink-2">{duration}</span>}
      </span>
    </>
  );

  return (
    <li
      data-status={status}
      className={cn(
        // The rail: a 1px line under the marks, from this mark to the next. 7px in, so it centres
        // on the 16px marks (a hairline is allowed its odd offset), with 4px clear of each mark. The last step has none.
        "relative grid grid-cols-[16px_minmax(0,1fr)] gap-x-3 pb-1",
        "before:absolute before:start-[7px] before:top-[30px] before:-bottom-1.5 before:w-px before:bg-line before:content-[''] last:before:hidden",
        className,
      )}
      {...props}
    >
      {/* Centred on the 20px title line, inside the 36px row (8px + 2px). */}
      <span className={cn("mt-2.5 flex size-4 items-center justify-center", mark.className)} aria-hidden>
        {mark.icon}
      </span>
      {detail ? (
        <BaseCollapsible.Root open={open} defaultOpen={defaultOpen} onOpenChange={(o) => {
          playSound(o ? "open" : "close");
          onOpenChange?.(o);
        }} className="min-w-0">
          <BaseCollapsible.Trigger
            className={cn(
              // Button-shaped row that hangs 8px into the gutter, like CollapsibleTrigger; the
              // caret follows the times so the title keeps the rail's edge.
              "group/tl -ms-2 flex min-h-9 w-[calc(100%+8px)] items-start gap-3 rounded-button border-0 bg-transparent py-2 ps-2 pe-2 text-start",
              // A full-width row: press answers in color, never scale.
              "transition-colors duration-instant ease-hover hover:bg-hover active:bg-pressed",
            )}
          >
            {head}
            <CaretRightIcon
              aria-hidden
              size={14}
              className="mt-0.5 flex-none text-ink-3 transition-transform duration-quick ease-out group-data-panel-open/tl:rotate-90"
            />
          </BaseCollapsible.Trigger>
          {/* Reaches 8px past the column so rings inside (a log, a code block) aren't clipped while it animates. */}
          <BaseCollapsible.Panel className={cn(panelHeightClass, "-mx-2 h-(--collapsible-panel-height) px-2")}>
            <div className={cn(panelContentClass, "pt-1 pb-3")}>{children}</div>
          </BaseCollapsible.Panel>
        </BaseCollapsible.Root>
      ) : (
        // No detail: same row, no trigger. The end padding matches the caret's room so times line up.
        <div className="flex min-h-9 min-w-0 items-start gap-3 py-2 pe-[30px]">{head}</div>
      )}
    </li>
  );
}
