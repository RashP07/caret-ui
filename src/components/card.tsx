import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends ComponentProps<"article"> {
  /** Openable: focusable, and lifts on hover. The only card with a shadow. */
  link?: boolean;
  /** Empty state: dashed, transparent, centered. */
  empty?: boolean;
}

/** Holds one thing and its actions. Hairline, no shadow at rest. */
export function Card({ link, empty, className, ...props }: CardProps) {
  return (
    <article
      tabIndex={link ? 0 : undefined}
      className={cn(
        "flex min-w-0 flex-col rounded-card border-stroke border-line bg-surface text-left",
        link &&
          // Large surface: lifts on hover, but never shrinks on press. Lift on the hover curve.
          "cursor-pointer transition-[border-color,box-shadow] duration-quick ease-hover hover:border-line-strong hover:shadow-float",
        empty &&
          "items-center justify-center gap-3 border-dashed border-line-strong bg-transparent px-6 py-8 text-center [&_p]:max-w-[30ch]",
        className,
      )}
      {...props}
    />
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
  return <div className={cn("text-body leading-[1.3] font-heading tracking-[-.01em] text-balance", className)} {...props} />;
}

export function CardSub({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mt-0.5 text-caption tabular-nums text-ink-3", className)} {...props} />;
}

export function CardText({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("m-0 text-control leading-normal text-pretty text-ink-2", className)} {...props} />;
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
