import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CardText, CardTitle, Hint } from "@/components";
import { cn } from "@/lib/cn";
import { neighbours, type DocPage } from "../registry";
import { PageHeading, PageModeContext, SheetCode } from "../spec";
import { pageLink } from "./links";

function importLines(names: string[]): string[] {
  if (names.join(", ").length <= 48) return [`import { ${names.join(", ")} } from "@/components";`];
  return ["import {", ...names.map((n) => `  ${n},`), '} from "@/components";'];
}

/** How to use it: the import, and the Base UI part underneath. Set off from the specimens by a rule. */
function Usage({ page }: { page: DocPage }) {
  if (!page.imports) return null;
  return (
    <>
      <section className="mt-6">
        <PageHeading>Usage</PageHeading>
        <SheetCode lang="TSX" name={`${page.slug}.tsx`} lines={importLines(page.imports)} />
        {page.baseUi && (
          <Hint className="mt-3">
            <span>
              Built on Base UI's{" "}
              <a href={`https://base-ui.com/react/components/${page.baseUi}`} target="_blank" rel="noreferrer" className="link">
                {page.baseUi.replace(/-/g, " ")}
              </a>
              , so keyboard, focus and ARIA come from the primitive. Caret adds the look, the states and the motion.
            </span>
          </Hint>
        )}
      </section>
    </>
  );
}

/**
 * Previous or next, as a card. Its arrow waits in the free corner of the label row and slides out
 * toward the page it leads to on hover or focus, so it never claims padding of its own.
 */
function NeighbourCell({ page, dir }: { page: DocPage; dir: "prev" | "next" }) {
  const Arrow = dir === "prev" ? ArrowLeftIcon : ArrowRightIcon;
  return (
    <Link
      {...pageLink(page)}
      className={cn(
        "group relative flex min-w-0 flex-col gap-1 rounded-card border border-(--rule) bg-surface p-5 text-ink no-underline hover:bg-hover",
        dir === "next" && "items-end text-right",
      )}
    >
      <span className="mb-1 text-small text-ink-3">{dir === "prev" ? "Previous" : "Next"}</span>
      <CardTitle>{page.title}</CardTitle>
      <CardText>{page.description}</CardText>
      <Arrow
        size={16}
        aria-hidden
        className={cn(
          "absolute top-5 text-ink-3 opacity-0 transition-[opacity,translate] duration-settle ease-drawer",
          dir === "prev" ? "right-5 translate-x-1" : "left-5 -translate-x-1",
          "group-hover:translate-0 group-hover:text-ink group-hover:opacity-100",
          "group-focus-visible:translate-0 group-focus-visible:opacity-100",
        )}
      />
    </Link>
  );
}

/** Previous and next: two cards side by side (stacked on phones); a lone neighbour takes the row. */
function PrevNext({ page }: { page: DocPage }) {
  const { prev, next } = neighbours(page);
  const both = !!prev && !!next;
  return (
    <nav
      aria-label="More pages"
      className={cn("mt-16 grid gap-4", both ? "grid-cols-2 max-[600px]:grid-cols-1" : "grid-cols-1")}
    >
      {prev && <NeighbourCell page={prev} dir="prev" />}
      {next && <NeighbourCell page={next} dir="next" />}
    </nav>
  );
}

/** A registry page, rendered as a routed page: body (in page mode), usage, prev/next. */
export function DocPageView({ page }: { page: DocPage }) {
  const Body = page.load();
  useEffect(() => {
    document.title = `${page.title} — Caret`;
  }, [page]);
  return (
    <>
      <PageModeContext.Provider value={true}>
        <Body />
      </PageModeContext.Provider>
      <Usage page={page} />
      <PrevNext page={page} />
    </>
  );
}
