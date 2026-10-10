import { NavigationMenu as BaseNav } from "@base-ui/react/navigation-menu";
import { CaretDownIcon } from "@phosphor-icons/react";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { usePortalTheme } from "@/lib/theme";
import { pressClass, pressColorTransition } from "./modality";

/*
 * Navigation menu. Site-level navigation: top-level links, and triggers
 * that open a panel of link cards. Hover or click opens; arrows move
 * between top-level items; Escape closes and returns focus. The panel is
 * a floating card that resizes as you move between sections.
 */

const topItem = cn(
  "relative inline-flex min-h-9 items-center gap-1.5 rounded-button border-0 bg-transparent px-3 py-1.5 text-control font-control text-ink-2 no-underline select-none",
  pressColorTransition,
  pressClass,
  "hover:bg-hover hover:text-ink",
  "data-popup-open:bg-pressed data-popup-open:text-ink",
  // The current page: selected fill, ink text and a 2px accent-strong underline, so it isn't color alone.
  "aria-[current=page]:bg-selected aria-[current=page]:text-ink",
  "after:absolute after:inset-x-3 after:bottom-1 after:hidden after:h-0.5 after:rounded-pill after:bg-accent-strong after:content-[''] aria-[current=page]:after:block",
);

export interface NavigationMenuProps {
  children: ReactNode;
  /** The open section's value, or null. */
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  "aria-label"?: string;
  className?: string;
}

export function NavigationMenu({ children, value, onValueChange, className, ...aria }: NavigationMenuProps) {
  const portalTheme = usePortalTheme();
  return (
    <BaseNav.Root
      value={value}
      onValueChange={(v) => onValueChange?.((v as string | null) ?? null)}
      aria-label={aria["aria-label"]}
      className={cn("min-w-max text-ink", className)}
    >
      <BaseNav.List className="relative m-0 flex list-none gap-0.5 p-0">{children}</BaseNav.List>
      <BaseNav.Portal {...portalTheme}>
        <BaseNav.Positioner
          sideOffset={8}
          collisionPadding={16}
          collisionAvoidance={{ side: "none" }}
          className={cn(
            "z-[60] h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)",
            "transition-[top,left,right,bottom] duration-settle ease-out data-instant:transition-none",
            // hover bridge between trigger and panel
            "before:absolute before:inset-x-0 before:-top-2 before:h-2 before:content-['']",
          )}
        >
          <BaseNav.Popup
            className={cn(
              "relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) overflow-hidden rounded-card border border-line bg-surface text-ink shadow-float outline-none",
              "transition-[opacity,scale,width,height] duration-settle ease-out",
              "data-starting-style:scale-[.98] data-starting-style:opacity-0",
              "data-ending-style:scale-[.98] data-ending-style:opacity-0 data-ending-style:duration-quick",
            )}
          >
            <BaseNav.Viewport className="relative size-full overflow-hidden" />
          </BaseNav.Popup>
        </BaseNav.Positioner>
      </BaseNav.Portal>
    </BaseNav.Root>
  );
}

export interface NavigationMenuLinkProps {
  href: string;
  children: ReactNode;
  /** The current page: sets aria-current. */
  current?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/** A top-level link, button-shaped. */
export function NavigationMenuLink({ href, children, current, onClick }: NavigationMenuLinkProps) {
  return (
    <BaseNav.Item>
      <BaseNav.Link href={href} active={current} onClick={onClick} className={topItem}>
        {children}
      </BaseNav.Link>
    </BaseNav.Item>
  );
}

export interface NavigationLinkCard {
  href: string;
  title: string;
  description?: string;
  icon?: ReactNode;
}

export interface NavigationMenuGroupProps {
  value: string;
  label: ReactNode;
  links: NavigationLinkCard[];
  /** Two columns of link cards (one on phones). */
  columns?: 1 | 2;
  /** Called when a link card is chosen. */
  onNavigate?: (link: NavigationLinkCard, event: React.MouseEvent<HTMLAnchorElement>) => void;
}

/** A trigger that opens a panel of link cards. */
export function NavigationMenuGroup({ value, label, links, columns = 2, onNavigate }: NavigationMenuGroupProps) {
  return (
    <BaseNav.Item value={value}>
      {/* Optical spacing: the chevron side sits 4px closer to the edge than the text side. */}
      <BaseNav.Trigger className={cn(topItem, "pe-2")}>
        {label}
        <BaseNav.Icon className="flex text-ink-3 transition-transform duration-quick ease-out data-popup-open:rotate-180">
          <CaretDownIcon size={14} aria-hidden />
        </BaseNav.Icon>
      </BaseNav.Trigger>
      <BaseNav.Content
        className={cn(
          // A container, so the columns follow the panel's width rather than the window's.
          "@container h-full p-2",
          columns === 2 ? "w-[min(520px,calc(100vw-32px))]" : "w-[min(300px,calc(100vw-32px))]",
          "transition-[opacity,translate] duration-settle ease-out",
          "data-starting-style:opacity-0 data-ending-style:opacity-0",
          "data-starting-style:data-[activation-direction=left]:-translate-x-1/4 data-starting-style:data-[activation-direction=right]:translate-x-1/4",
          "data-ending-style:data-[activation-direction=left]:translate-x-1/4 data-ending-style:data-[activation-direction=right]:-translate-x-1/4",
        )}
      >
        <ul className={cn("m-0 grid list-none gap-0.5 p-0", columns === 2 && "grid-cols-2 @max-md:grid-cols-1")}>
          {links.map((link) => (
            <li key={`${link.title}:${link.href}`}>
              <BaseNav.Link
                href={link.href}
                onClick={(e) => onNavigate?.(link, e)}
                className={cn(
                  // A wide target: no press shrink.
                  "flex h-full gap-3 rounded-button p-3 text-left text-ink no-underline",
                  pressColorTransition,
                  "hover:bg-hover",
                )}
              >
                {link.icon && (
                  <span
                    aria-hidden
                    className="grid size-[34px] flex-none place-items-center rounded-control border border-line bg-sunken text-ink"
                  >
                    {link.icon}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-control font-control">{link.title}</span>
                  {link.description && (
                    <span className="mt-0.5 block text-small text-pretty text-ink-3">
                      {link.description}
                    </span>
                  )}
                </span>
              </BaseNav.Link>
            </li>
          ))}
        </ul>
      </BaseNav.Content>
    </BaseNav.Item>
  );
}
