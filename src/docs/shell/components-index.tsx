import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Card, CardBody, CardText, CardTitle } from "@/components";
import { GROUP_BLURBS, GROUPS, PAGES, type DocPage } from "../registry";
import { PageModeContext, Section, slugify } from "../spec";
import { Thumb } from "../thumbs";
import { pageLink } from "./links";

/**
 * A page card: a live, inert preview on the drafting ground, then name and one line.
 * `sheet` drops the card frame for a square, borderless cell: the parent draws its edges
 * (shared 1px lines on the landing page's drafting sheet), and `children` can place Nodes.
 */
export function PageCard({ page, sheet, children }: { page: DocPage; sheet?: boolean; children?: ReactNode }) {
  if (sheet) {
    return (
      <Link {...pageLink(page)} className="group relative flex min-w-0 flex-col bg-page text-left text-ink no-underline">
        <div
          inert
          aria-hidden
          className="grid h-[180px] place-items-center overflow-hidden border-b border-(--rule) bg-pattern p-4 [background-position:-8px_-8px]"
        >
          <Thumb slug={page.slug} />
        </div>
        <div className="flex flex-1 flex-col gap-1 p-5 transition-colors duration-quick group-hover:bg-hover">
          <CardTitle>{page.title}</CardTitle>
          <CardText>{page.description}</CardText>
        </div>
        {children}
      </Link>
    );
  }
  return (
    <Link {...pageLink(page)} className="block no-underline">
      <Card link tabIndex={-1} className="h-full overflow-hidden">
        <div
          inert
          aria-hidden
          className="grid h-[180px] place-items-center overflow-hidden border-b border-line bg-page bg-pattern p-4 [background-position:-8px_-8px]"
        >
          <Thumb slug={page.slug} />
        </div>
        <CardBody className="flex flex-col gap-1 p-5">
          <CardTitle>{page.title}</CardTitle>
          <CardText>{page.description}</CardText>
        </CardBody>
      </Card>
    </Link>
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
        {groups.map((g) => (
          <section key={g.name} aria-labelledby={slugify(g.name)} className="mt-12 first-of-type:mt-4">
            <h2 id={slugify(g.name)} className="m-0 mb-4 flex scroll-mt-24 flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="text-title font-heading">{g.name}</span>
              <span className="text-caption font-normal text-ink-3 tabular-nums">{g.pages.length}</span>
              <span className="text-control font-normal text-ink-3">{GROUP_BLURBS[g.name]}</span>
            </h2>
            <div className="grid grid-cols-3 gap-4 max-[1180px]:grid-cols-2 max-[640px]:grid-cols-1">
              {g.pages.map((p) => (
                <PageCard key={p.slug} page={p} />
              ))}
            </div>
          </section>
        ))}
      </Section>
    </PageModeContext.Provider>
  );
}
