import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Button, Collapsible, CollapsiblePanel, CollapsibleTrigger, Link as TextLink, NavGroup, NavItem, Threads } from "@/components";
import { cn } from "@/lib/cn";
import { useDocs } from "../docs-context";
import { pageLink } from "./links";
import { GROUPS, hrefOf } from "../registry";

/**
 * The Caret mark: the ⌃ key, standing on its ledge like Caret's buttons.
 * Face in the accent, glyph in on-accent. The ledge is ink in light; on a dark
 * ground ink would vanish, so it's a deeper shade of the face instead.
 * Drawn on a 24-unit grid at 24px, so every edge lands on a whole pixel.
 */
export function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      <rect x="1" y="1" width="22" height="22" rx="4" style={{ fill: "light-dark(var(--ink), color-mix(in oklch, var(--accent) 62%, black))" }} />
      <rect x="2" y="2" width="20" height="16" rx="3" fill="var(--accent)" />
      <path d="M7 13 12 8l5 5" fill="none" stroke="var(--on-accent)" strokeWidth="3" strokeLinejoin="miter" />
    </svg>
  );
}

export function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-2 no-underline">
      <BrandMark />
      <span className="text-title font-heading">Caret</span>
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
        <NavItem render={<Link to="/" />} current={pathname === "/"} onClick={onNavigate}>
          Showcase
        </NavItem>
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

const AUTHOR_URL = "https://rashmitaparmanik.com";
const AUTHOR_EMAIL = "rashmitaparmanik9876@gmail.com";

/** Who made Caret, and how to reach her. Pinned under the nav; also at the foot of the phone drawer. */
export function Credit({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1 text-small", className)}>
      <span className="text-ink-2">
        Built by{" "}
        <TextLink variant="quiet" href={AUTHOR_URL}>
          Rashmita Parmanik
        </TextLink>
      </span>
      <TextLink variant="quiet" href={`mailto:${AUTHOR_EMAIL}`} title={AUTHOR_EMAIL} className="self-start">
        Contact me
      </TextLink>
    </div>
  );
}
