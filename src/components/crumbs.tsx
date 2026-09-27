import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CrumbsProps {
  /** Path segments; the last one is the current item. */
  items: ReactNode[];
  /** Optional leading icon. */
  icon?: ReactNode;
  /**
   * Segments at these indexes give way first when the crumbs run out of room
   * (in whatever container, not just at phone width): they truncate, then
   * collapse away with their separator, before the current item truncates.
   */
  hideOnSmall?: number[];
  className?: string;
}

/** Plain-text segments get their full text as a title, since they can truncate. */
const titleOf = (item: ReactNode) => (typeof item === "string" ? item : undefined);

export function Crumbs({ items, icon, hideOnSmall = [], className }: CrumbsProps) {
  const last = items.length - 1;
  return (
    <nav aria-label="Breadcrumb" className={cn("flex min-w-0 items-center gap-2 text-small text-ink-3", className)}>
      {icon && <span className="flex flex-none">{icon}</span>}
      {items.map((item, i) => (
        <Fragment key={i}>
          {i === last ? (
            <b aria-current="page" title={titleOf(item)} className="min-w-0 truncate font-control text-ink">
              {item}
            </b>
          ) : (
            <span
              className={cn(
                "flex items-center gap-2 whitespace-nowrap",
                hideOnSmall.includes(i) ? "min-w-0 shrink-[1000] overflow-hidden" : "flex-none",
              )}
            >
              <span title={titleOf(item)} className="min-w-0 truncate">
                {item}
              </span>
              <span aria-hidden className="flex-none opacity-50">
                /
              </span>
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
