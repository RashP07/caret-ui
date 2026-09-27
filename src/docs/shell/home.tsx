import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button, Card, CardBody, CardText, CardTitle, Hint, NavItem } from "@/components";
import { Hero } from "../foundations";
import { GROUP_BLURBS, GROUPS, PAGES, type DocPage } from "../registry";
import { PageCard } from "./components-index";
import { Brand, SearchButton } from "./sidebar";
import { ThemePanelButton } from "./theme-panel";
import { pageLink } from "./links";

const plural = new Intl.PluralRules("en");

/** "1 template", "22 components": registry counts, never "1 templates". */
function count(kind: DocPage["kind"], one: string, other: string) {
  const n = PAGES.filter((p) => p.kind === kind).length;
  return `${n} ${plural.select(n) === "one" ? one : other}`;
}

/** The landing page (layout only): top nav, the hero, what's in the box, the template, footer. */
export function Home() {
  useEffect(() => {
    document.title = "Caret — a design system for software made by people and agents";
  }, []);
  const featured = ["button", "select", "menubar", "tooltip", "switch", "chat"].map((s) => PAGES.find((p) => p.slug === s)!);
  const workspace = PAGES.find((p) => p.slug === "agent-workspace")!;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-[color-mix(in_srgb,var(--page)_86%,transparent)] backdrop-blur-[10px]">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-2 px-6 max-[600px]:px-4">
          <Brand />
          <nav aria-label="Primary" className="ml-4 flex items-center gap-1 max-[860px]:hidden">
            <NavItem render={<Link to="/components" />} className="w-auto">
              Components
            </NavItem>
            <NavItem render={<Link to="/docs/$slug" params={{ slug: "getting-started" }} />} className="w-auto">
              Docs
            </NavItem>
            <NavItem render={<Link to="/templates/$slug" params={{ slug: "agent-workspace" }} />} className="w-auto">
              Templates
            </NavItem>
          </nav>
          <div className="flex-1" />
          <SearchButton className="max-[860px]:hidden" />
          <ThemePanelButton />
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-6 pb-24 max-[600px]:px-4">
        <Hero pressB={false} />

        <section aria-labelledby="h-inside" className="pt-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="h-inside" className="m-0 text-h2 font-heading text-balance">
                Everything in the box
              </h2>
              <p className="mt-2 mb-0 text-body text-ink-2">
                {count("component", "component", "components")}, {count("foundation", "foundation", "foundations")},{" "}
                {count("template", "template", "templates")}. Each one live below.
              </p>
            </div>
            <Button variant="secondary" nativeButton={false} render={<Link to="/components" />} kbd="B">
              Browse all components
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[640px]:grid-cols-1">
            {featured.map((p) => (
              <PageCard key={p.slug} page={p} />
            ))}
          </div>
        </section>

        <section aria-labelledby="h-groups" className="pt-16">
          <h2 id="h-groups" className="m-0 mb-6 text-h2 font-heading text-balance">
            How it's organised
          </h2>
          <div className="grid grid-cols-4 gap-4 max-[1000px]:grid-cols-2 max-[600px]:grid-cols-1">
            {GROUPS.map((g) => (
              <Link key={g.name} {...pageLink(g.pages[0])} className="block no-underline">
                <Card link tabIndex={-1} className="h-full">
                  <CardBody className="flex flex-col gap-1.5 p-5">
                    <CardTitle>
                      {g.name} <span className="text-caption font-normal text-ink-3 tabular-nums">{g.pages.length}</span>
                    </CardTitle>
                    <CardText>{GROUP_BLURBS[g.name]}</CardText>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="h-template" className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-12 pt-16 max-[1000px]:grid-cols-1">
          <div>
            <h2 id="h-template" className="m-0 text-h2 font-heading text-balance">
              A template, built only from the parts
            </h2>
            <p className="mt-3 mb-6 max-w-[48ch] text-body text-pretty text-ink-2">
              {workspace.description} Send a message to watch a run, filter threads, read the diffs, and switch it between light
              and dark on its own.
            </p>
            <Button
              variant="primary"
              nativeButton={false}
              render={<Link to="/templates/$slug" params={{ slug: "agent-workspace" }} />}
              icon={<ArrowRightIcon />}
            >
              Open the workspace
            </Button>
          </div>
          <PageCard page={workspace} />
        </section>

        <footer className="mt-24 flex flex-wrap justify-between gap-4 border-t border-line pt-6">
          <Hint>Caret v0.1</Hint>
          <Hint>React · Tailwind CSS v4 · Base UI · Motion</Hint>
        </footer>
      </div>
    </div>
  );
}
