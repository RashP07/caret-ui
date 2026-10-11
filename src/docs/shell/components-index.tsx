import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { CardText, CardTitle } from "@/components";
import { cn } from "@/lib/cn";
import { GROUP_BLURBS, GROUPS, PAGES, type DocPage } from "../registry";
import { PageModeContext, Section, slugify } from "../spec";
import { Thumb } from "../thumbs";
import { Node } from "./construction";
import { pageLink } from "./links";

/** One index tile: the page's live, inert thumbnail on the drafting ground, then its name and one line. */
function IndexCell({ page, children }: { page: DocPage; children?: ReactNode }) {
  return (
    <Link
      {...pageLink(page)}
      className="group relative flex min-w-0 flex-col bg-surface text-ink no-underline shadow-[0_0_0_1px_var(--frame)]"
    >
      <div
        inert
        aria-hidden
        className="grid h-[180px] place-items-center overflow-hidden border-b border-(--frame) p-4"
      >
        <Thumb slug={page.slug} />
      </div>
      <div className="flex flex-1 flex-col gap-1 bg-hover p-5 transition-colors duration-instant group-hover:bg-surface">
        <CardTitle>{page.title}</CardTitle>
        <CardText>{page.description}</CardText>
      </div>
      {children}
    </Link>
  );
}

/**
 * A group's tiles as one specimen frame: 3 columns, 2 under 1180px, 1 under 640px, sharing their
 * edges (1px spread shadows over 1px gaps). A short last row leaves the page showing, so the Nodes
 * mark only the corners that always exist: the frame's opening corner and the last tile's closing one.
 */
function IndexGrid({ pages }: { pages: DocPage[] }) {
  return (
    <div className="relative grid grid-cols-3 gap-px max-[1180px]:grid-cols-2 max-[640px]:grid-cols-1">
      <Node className="-top-[5px] -left-[5px]" />
      {pages.map((p, i) => (
        <IndexCell key={p.slug} page={p}>
          {i === pages.length - 1 && <Node className="-right-[5px] -bottom-[5px]" />}
        </IndexCell>
      ))}
    </div>
  );
}

export function ComponentsIndex() {
  const groups = GROUPS.filter((g) => g.name !== "Getting started");
  const count = PAGES.filter((p) => p.kind === "component").length;
  useEffect(() => {
    document.title = "Components — Caret";
  }, []);
  return (
    <PageModeContext.Provider value={true}>
        <Section
          id="components"
          title="Components"
          lede={`${count} components on Base UI primitives, plus the foundations they share and a template built only from them. Every one has its states, its keyboard story, every theme in light and dark, and a live state readout.`}
        >
          {/* Each group is a band of the sheet: a rule across the column (the title block's rule opens the first). */}
          {groups.map((g, i) => (
            <section key={g.name} aria-labelledby={slugify(g.name)}>
              <div className={cn("mb-6", i > 0 ? "mt-16" : "mt-10")}>
                <h2 id={slugify(g.name)} className="m-0 mb-1 scroll-mt-24 text-title font-heading text-ink">
                  {g.name} <span className="font-normal text-ink-3">{g.pages.length}</span>
                </h2>
                <p className="m-0 text-body text-ink-2">{GROUP_BLURBS[g.name]}</p>
              </div>
              <IndexGrid pages={g.pages} />
            </section>
          ))}
        </Section>
    </PageModeContext.Provider>
  );
}
