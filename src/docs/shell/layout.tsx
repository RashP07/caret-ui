import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ScrollArea } from "@/components";
import { cn } from "@/lib/cn";
import { useDocs } from "../docs-context";
import { PAGES, hrefOf } from "../registry";
import { COLUMN_PAD, SHEET } from "./construction";
import { Brand, Credit, SearchButton, SidebarNav } from "./sidebar";
import { OnThisPage, OnThisPageCompact } from "./toc";
import { TopBar } from "./topbar";

/**
 * The docs frame (layout only), drawn as a drafting sheet: the sidebar is the sheet's first
 * column, bounded by one line; the top bar's bottom rule runs the full width; below it the page
 * sits in a framed column, with "On this page" in a second column behind one more line (or a
 * disclosure on top when there's no room). Templates get a wide frame; tools (the theme builder)
 * take the whole content area.
 *
 * Geometry: every line is a 1px border in `--rule`. The top rule is the 56th pixel row both in the
 * sidebar's brand row and in the top bar (both 56px, border-box), so it reads as one line.
 */
export function DocsLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const page = PAGES.find((p) => hrefOf(p) === pathname);
  const { themePanelOpen } = useDocs();
  // Templates and the index use a wide frame, tools the whole area; "On this page" steps aside while the theme panel is docked.
  const full = !!page?.full;
  const wide = full || page?.kind === "template" || pathname === "/" || pathname === "/components" || pathname === "/components/";
  const showToc = !wide && !themePanelOpen;
  // One centred frame for the page (and its table of contents); the top bar shares its width so crumbs
  // and the Nodes on the top rule line up. Widths are even, so a centred frame lands on whole pixels.
  // Reading column: 860px of text + 2 × 40px padding + its two lines; the TOC column adds 224px.
  const frame = full
    ? "max-w-none"
    : wide
      ? "max-w-[1400px]"
      : showToc
        ? "max-w-[1166px] max-[1240px]:max-w-[942px]"
        : "max-w-[942px]";

  return (
    <div
      className="grid min-h-screen grid-cols-[272px_minmax(0,1fr)] max-[1000px]:grid-cols-1"
      style={SHEET}
    >
      {/* Above the top bar (z-20), so the Node where its line crosses the top rule sits over both. */}
      <aside
        aria-label="Sidebar"
        className="sticky top-0 z-[21] flex h-dvh flex-col border-r border-(--rule) bg-surface max-[1000px]:hidden"
      >
        <div className="relative flex h-14 flex-none items-center border-b border-(--rule) px-3">
          <Brand />
        </div>
        <div className="flex-none px-3 pt-3 pb-2">
          <SearchButton className="w-full justify-start" />
        </div>
        {/* Only the nav scrolls; brand and search stay put. pt-1 leaves room for the first row's focus ring. */}
        <ScrollArea
          fade
          hideScrollbar
          layoutScroll
          className="min-h-0 flex-1"
          contentClassName="flex min-h-full w-full min-w-0! flex-col px-3 pt-1 pb-3"
        >
          <SidebarNav />
          <p className="mt-auto px-2 pt-4 text-caption text-pretty text-ink-3">
            Every component built all the way down: states, keyboard, focus, light and dark.
          </p>
        </ScrollArea>
        {/* Pinned under the nav: who built it and how to reach her. */}
        <Credit className="flex-none border-t border-(--rule) px-5 py-3" />
      </aside>

      {/* Clips the margin grid at the sidebar's line and the window's edge; clip, not hidden, so sticky still works. */}
      <div className="min-w-0 overflow-x-clip">
        <TopBar frameClassName={frame} />
        <div className="px-6 max-[1000px]:px-4">
          <div
            className={cn(
              "relative mx-auto grid min-h-[calc(100dvh-56px)] w-full",
              frame,
              showToc ? "grid-cols-[minmax(0,1fr)_224px] max-[1240px]:grid-cols-1" : "grid-cols-1",
            )}
          >
            <main id="page" className="min-w-0">
              {/* Below 1240px (or while the theme panel is docked) the column has no room: list the headings on top instead. */}
              {!wide && <OnThisPageCompact containerId="page" className={cn(showToc && "min-[1240px]:hidden")} />}
              <div className={cn(COLUMN_PAD, "pt-10 pb-24")}>{children}</div>
            </main>
            {showToc && (
              <aside className="max-[1240px]:hidden">
                <div className="sticky top-14 px-4 pt-10 pb-6">
                  <OnThisPage containerId="page" />
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
