import { ListIcon } from "@phosphor-icons/react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Crumbs, Drawer, IconButton } from "@/components";
import { PAGES, hrefOf } from "../registry";
import { SearchButton, SidebarNav } from "./sidebar";
import { ThemePanelButton } from "./theme-panel";

/** Breadcrumbs for the current route, from the registry. */
function RouteCrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const page = PAGES.find((p) => hrefOf(p) === pathname);
  const items = [<Link key="home" to="/" activeOptions={{ exact: true }} className="no-underline hover:text-ink">Caret</Link>];
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

/** The docs top bar: crumbs, then the review and theme controls. On phones, the menu opens the sidebar as a drawer. */
export function TopBar({ frameClassName }: { frameClassName?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-20 bg-[color-mix(in_srgb,var(--page)_86%,transparent)] backdrop-blur-[10px]">
      <div className={cn("mx-auto flex h-14 w-full items-center gap-3", frameClassName)}>
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
      {/* The crumbs share the page's centred width so they line up with the content; the theme
          control belongs to the window, so on desktop it pins to the bar's end edge instead. */}
      <div className="ms-auto flex items-center min-[1001px]:absolute min-[1001px]:inset-y-0 min-[1001px]:end-0">
        <ThemePanelButton />
      </div>
      </div>
    </header>
  );
}
