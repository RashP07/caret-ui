import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Button, Collapsible, CollapsiblePanel, CollapsibleTrigger, NavGroup, NavItem, Threads } from "@/components";
import { cn } from "@/lib/cn";
import { useDocs } from "../docs-context";
import { pageLink } from "./links";
import { GROUPS, hrefOf } from "../registry";

/** The Caret mark: an ink tile with the accent caret. */
export function BrandMark() {
  return (
    <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden>
      <rect x="1" y="1" width="20" height="20" rx="6" fill="var(--ink)" />
      <rect x="9.5" y="5" width="3" height="12" rx="1" fill="var(--accent)" />
    </svg>
  );
}

export function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-2 no-underline">
      <BrandMark />
      <span className="text-title font-heading tracking-[-.02em]">Caret</span>
      <span className="mono ml-auto rounded-inline border border-line px-1.5 py-0.5 text-caption text-ink-3">v0.1</span>
    </Link>
  );
}

/** Opens the command palette. Printed with its shortcut, like every Caret control. */
export function SearchButton({ className }: { className?: string }) {
  const { openSearch } = useDocs();
  return (
    <Button variant="secondary" icon={<MagnifyingGlassIcon />} kbd="⌘K" onClick={openSearch} className={cn("[&>span]:flex-1 [&_kbd]:ml-auto", className)}>
      <span className="text-ink-3">Quick search</span>
    </Button>
  );
}

/**
 * The docs tree: collapsible groups of NavItems, one shared highlight that
 * glides to the page you open (NavGroup). Composition only.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Documentation" className="flex flex-col gap-1">
      <NavGroup>
        {GROUPS.map((g) => (
          <Collapsible key={g.name} defaultOpen>
            {/* Full-width row, flush with the search button; wide rows don't shrink on press. */}
            <CollapsibleTrigger meta={g.pages.length} className="ml-0 flex self-stretch active:scale-100">
              {g.name}
            </CollapsibleTrigger>
            <CollapsiblePanel>
              {/* The thread hangs from the caret: its centre is 8px padding + 7px (half the
                  14px icon) = 15px in; the 1px line takes 14–15px, whole pixels ending on the centre. */}
              <Threads className="ml-3.5 py-px pr-px">
                {g.pages.map((p) => (
                  <NavItem
                    key={p.slug}
                    render={<Link {...pageLink(p)} />}
                    current={pathname === hrefOf(p)}
                    onClick={onNavigate}
                  >
                    {p.title}
                  </NavItem>
                ))}
              </Threads>
            </CollapsiblePanel>
          </Collapsible>
        ))}
      </NavGroup>
    </nav>
  );
}
