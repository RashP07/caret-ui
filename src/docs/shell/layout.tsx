import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ScrollArea } from "@/components";
import { cn } from "@/lib/cn";
import { useDocs } from "../docs-context";
import { PAGES, hrefOf } from "../registry";
import { Brand, SearchButton, SidebarNav } from "./sidebar";
import { OnThisPage, OnThisPageCompact } from "./toc";
import { TopBar } from "./topbar";

/**
 * The docs frame (layout only): a floating sidebar card, the top bar, the page,
 * and "On this page" (a column on wide screens, a disclosure on top otherwise).
 * Templates get a wide frame; tools (the theme builder) take the whole content area.
 */
export function DocsLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const page = PAGES.find((p) => hrefOf(p) === pathname);
  const { themePanelOpen } = useDocs();
  // Templates and the index use a wide frame, tools the whole area; "On this page" steps aside while the theme panel is docked.
  const full = !!page?.full;
  const wide = full || page?.kind === "template" || pathname === "/components" || pathname === "/components/";
  const showToc = !wide && !themePanelOpen;
  // One centred block for the page (and its table of contents); the top bar shares its width so crumbs line up.
  const frame = full
    ? "max-w-none"
    : wide
      ? "max-w-[1400px]"
      : showToc
        ? "max-w-[1108px] max-[1240px]:max-w-[860px]"
        : "max-w-[860px]";

  return (
    <div className="grid min-h-screen grid-cols-[272px_minmax(0,1fr)] gap-6 p-3 max-[1000px]:grid-cols-1 max-[1000px]:gap-0 max-[1000px]:p-0">
      <aside
        aria-label="Sidebar"
        className="sticky top-3 flex h-[calc(100dvh-24px)] flex-col gap-4 overflow-hidden rounded-card border border-line bg-surface p-3 max-[1000px]:hidden"
      >
        <div className="flex-none pt-2">
          <Brand />
        </div>
        <SearchButton className="w-full flex-none justify-start" />
        {/* Only the nav scrolls; brand and search stay put. It bleeds into the card's
            padding so the bar sits in the gutter and the list runs to the bottom edge;
            pt-1 leaves room for the first row's focus ring. */}
        <ScrollArea
          fade
          layoutScroll
          className="-mx-3 -mb-3 flex-1"
          contentClassName="flex min-h-full w-full min-w-0! flex-col px-3 pt-1 pb-3"
        >
          <SidebarNav />
          <p className="mt-auto px-2 pt-4 text-caption text-pretty text-ink-3">
            Every component built all the way down: states, keyboard, focus, light and dark.
          </p>
        </ScrollArea>
      </aside>

      <div className="min-w-0 pr-5 max-[1000px]:px-4">
        <TopBar frameClassName={frame} />
        <div
          className={cn(
            "mx-auto grid w-full gap-12 pt-6 pb-24",
            frame,
            showToc ? "grid-cols-[minmax(0,1fr)_200px] max-[1240px]:grid-cols-1" : "grid-cols-1",
          )}
        >
          <main id="page" className="min-w-0">
            {/* Below 1240px (or while the theme panel is docked) the column has no room: list the headings on top instead. */}
            {!wide && <OnThisPageCompact containerId="page" className={cn(showToc && "min-[1240px]:hidden")} />}
            {children}
          </main>
          {showToc && (
            <aside className="sticky top-20 h-fit max-[1240px]:hidden">
              <OnThisPage containerId="page" />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
