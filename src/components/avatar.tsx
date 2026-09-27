import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/* Avatar. Initials on a tile, or an image when there is one. */

export interface AvatarProps extends Omit<ComponentProps<typeof BaseAvatar.Root>, "className" | "children"> {
  /** Initials shown when there's no image. */
  initials: string;
  src?: string;
  tone?: "ink" | "soft";
  round?: boolean;
  small?: boolean;
  className?: string;
}

export function Avatar({ initials, src, tone = "ink", round, small, className, ...props }: AvatarProps) {
  return (
    <BaseAvatar.Root
      className={cn(
        "grid flex-none place-items-center overflow-hidden font-heading tracking-[-.01em]",
        small ? "size-6 rounded-button text-caption" : "size-7 rounded-control text-small",
        round && "rounded-full",
        tone === "ink" ? "bg-ink text-on-ink" : "bg-accent-soft text-ink",
        className,
      )}
      {...props}
    >
      {src && <BaseAvatar.Image src={src} className="size-full object-cover" />}
      <BaseAvatar.Fallback>{initials}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
