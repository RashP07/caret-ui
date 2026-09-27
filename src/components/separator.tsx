import { Separator as BaseSeparator } from "@base-ui/react/separator";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface SeparatorProps extends Omit<ComponentProps<typeof BaseSeparator>, "className"> {
  /** Dashed, like a card footer rule: separates what a thing is from what you can do with it. */
  dashed?: boolean;
  className?: string;
}

/** A hairline between regions. Horizontal by default; vertical stretches to its row. */
export function Separator({ orientation = "horizontal", dashed, className, ...props }: SeparatorProps) {
  const vertical = orientation === "vertical";
  return (
    <BaseSeparator
      orientation={orientation}
      className={cn(
        "shrink-0 border-0",
        vertical ? "w-px self-stretch" : "h-px w-full",
        dashed
          ? cn("bg-transparent border-dashed border-line-strong", vertical ? "border-l" : "border-t")
          : "bg-line",
        className,
      )}
      {...props}
    />
  );
}
