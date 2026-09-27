import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Helper and empty-state text. */
export function Hint({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex items-start gap-1.5 text-small text-ink-3 text-pretty", className)} {...props} />
  );
}

/** Section label inside a list or menu. */
export function MenuLabel({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("px-2.5 pt-2 pb-1 text-caption text-ink-3", className)} {...props} />;
}
