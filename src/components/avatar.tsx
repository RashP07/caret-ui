import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/*
 * Avatar. Initials on a tile, or an image when there is one. Both tones are solid pairs the token
 * solver guarantees in every theme (ink/on-ink, accent/on-accent), so the tile holds its edge on
 * any ground it sits on: page, surface, a hover or an open picker. `soft` is the accent tile, for
 * a workspace or team mark; `ink` is for people.
 *
 * It carries data-avatar so a control that leads with one (a compact Select) can inset it evenly.
 */

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
      data-avatar=""
      className={cn(
        "grid flex-none place-items-center overflow-hidden font-heading",
        small ? "size-6 rounded-button text-caption" : "size-7 rounded-control text-small",
        round && "rounded-full",
        tone === "ink" ? "bg-ink text-on-ink" : "bg-accent text-on-accent",
        className,
      )}
      {...props}
    >
      {src && <BaseAvatar.Image src={src} className="size-full object-cover" />}
      <BaseAvatar.Fallback>{initials}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
