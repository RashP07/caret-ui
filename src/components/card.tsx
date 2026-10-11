import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends ComponentProps<"article"> {
  /** Openable: focusable, and its border steps darker on hover. */
  link?: boolean;
  /** Empty state: dashed, transparent, centered. */
  empty?: boolean;
  /**
   * Frame: square, a darker hairline, a small square mark on each corner, like a part on a drawing.
   * For a card that puts something on display (a specimen, a preview, a featured item), not for
   * every card. The marks sit across the corners, so don't clip a framed card (no overflow-hidden).
   */
  frame?: boolean;
}

/** One corner mark: 9px, centred on the corner of a 1px border; it takes the card's border color, hover included. */
const mark = "pointer-events-none absolute size-[9px] border border-solid [border-color:inherit] bg-page";

/** Holds one thing and its actions. Hairline, no shadow at rest. */
export function Card({ link, empty, frame, className, children, ...props }: CardProps) {
  return (
    <article
      tabIndex={link ? 0 : undefined}
      className={cn(
        "flex min-w-0 flex-col rounded-card border-stroke border-line bg-surface text-left",
        frame && "relative rounded-none border-line-strong",
        link &&
          // Large surface: hover steps the one border darker, never lifts or shrinks on press.
          "cursor-pointer transition-[border-color] duration-quick ease-hover hover:border-line-strong",
        empty &&
          "items-center justify-center gap-3 border-dashed border-line-strong bg-transparent px-6 py-8 text-center [&_p]:max-w-[30ch]",
        frame && link && "hover:border-ink-3",
        className,
      )}
      {...props}
    >
      {frame && (
        <>
          <span aria-hidden className={cn(mark, "-top-[5px] -left-[5px]")} />
          <span aria-hidden className={cn(mark, "-top-[5px] -right-[5px]")} />
          <span aria-hidden className={cn(mark, "-bottom-[5px] -left-[5px]")} />
          <span aria-hidden className={cn(mark, "-right-[5px] -bottom-[5px]")} />
        </>
      )}
      {children}
    </article>
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardHead({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mb-3 flex items-start gap-3", className)} {...props} />;
}

/** 34px icon well beside the title. */
export function CardIcon({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn(
        "grid size-[34px] flex-none place-items-center rounded-control border border-line bg-sunken text-ink",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("text-subtitle font-heading text-balance", className)} {...props} />;
}

export function CardSub({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mt-0.5 text-caption tabular-nums text-ink-3", className)} {...props} />;
}

export function CardText({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("m-0 text-control leading-5.5 text-pretty text-ink-2", className)} {...props} />;
}

/** A dashed rule separates what a thing is from what you can do with it. Actions wrap; padding matches the body. */
export function CardFoot({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-auto flex flex-wrap items-center gap-2 border-t border-dashed border-line-strong px-6 py-3",
        className,
      )}
      {...props}
    />
  );
}
