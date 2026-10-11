import { GithubLogoIcon, ListIcon } from "@phosphor-icons/react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Crumbs, Drawer, IconButton, LinkButton, Tooltip } from "@/components";
import { PAGES, hrefOf } from "../registry";
import { SearchButton, SidebarNav } from "./sidebar";
import { COLUMN_PAD } from "./construction";
import { ThemePanelButton } from "./theme-panel";

/** Breadcrumbs for the current route, from the registry. */
function RouteCrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const page = PAGES.find((p) => hrefOf(p) === pathname);
  const items = [<Link key="home" to="/" activeOptions={{ exact: true }} className="no-underline hover:text-ink">Caret</Link>];
  if (pathname === "/") items.push(<span key="s">Showcase</span>);
  if (pathname.startsWith("/components") && !page) items.push(<span key="c">Components</span>);
  if (page) {
    // A group named like its page ("Getting started") would print twice.
    if (page.group !== page.title) items.push(
      page.kind === "component" ? (
        <Link key="g" to="/components" activeOptions={{ exact: true }} className="no-underline hover:text-ink">
          Components
        </Link>
      ) : (
        <span key="g">{page.group}</span>
      ),
    );
    items.push(<span key="p">{page.title}</span>);
  }
  return <Crumbs items={items} hideOnSmall={[0]} />;
}

/**
 * The docs top bar: crumbs, then the review and theme controls. On phones, the menu opens the sidebar as a drawer.
 * Its bottom border is the sheet's top rule, full width; the frame's lines rise to meet it from below, and
 * Nodes mark each junction (the frame's two sides, and the line before "On this page" when it shows).
 */
/** Where Caret's source lives. */
export const REPO_URL = "https://github.com/RashP07/caret-ui";

export function TopBar({ frameClassName }: { frameClassName?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-(--rule) bg-[color-mix(in_srgb,var(--page)_86%,transparent)] px-6 backdrop-blur-[10px] max-[1000px]:px-4">
      {/* The frame's width, with transparent sides and the column's padding, so the crumbs line up with the text below. */}
      <div className={cn("mx-auto flex h-full w-full items-center gap-3 border-x border-transparent", COLUMN_PAD, frameClassName)}>
        <span className="hidden max-[1000px]:flex">
          <Drawer
            open={menuOpen}
            onOpenChange={setMenuOpen}
            trigger={<IconButton label="Open navigation" icon={<ListIcon />} />}
            title="Caret"
            description="Foundations, components and templates."
          >
            <div className="flex flex-col gap-4">
              <SearchButton className="w-full justify-start" />
              <SidebarNav onNavigate={() => setMenuOpen(false)} />
            </div>
          </Drawer>
        </span>
        <RouteCrumbs />
        {/* The crumbs share the page's centred width; the theme control belongs to the window, so on
            desktop it pins to the bar's end edge instead. */}
        <div className="ms-auto flex items-center gap-1 min-[1001px]:absolute min-[1001px]:inset-y-0 min-[1001px]:end-4">
          {/* The source, one press away. Icon-only, so the label is its name and its tooltip. */}
          <Tooltip label="Source on GitHub">
            <LinkButton
              variant="ghost"
              icon={<GithubLogoIcon />}
              href={REPO_URL}
              external={false}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Source on GitHub (opens in a new tab)"
            />
          </Tooltip>
          <ThemePanelButton />
        </div>
      </div>
    </header>
  );
}
