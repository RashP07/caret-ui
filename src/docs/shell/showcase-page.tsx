import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Accordion, AccordionItem, Button, Code } from "@/components";
import { PAGES } from "../registry";
import { Showcase } from "./home-showcase";

const INSTALL = [
  "pnpm add @base-ui/react motion \\",
  "  @phosphor-icons/react clsx tailwind-merge",
  "cp -r caret/src/{components,lib,styles} src/",
];

const code = "rounded-inline bg-sunken px-1 py-px text-caption";

/**
 * The home page, inside the docs frame: a short title block, the live components, then the few
 * questions people ask before they copy anything in. No marketing bands; the sidebar is the sitemap.
 */
export function ShowcasePage() {
  const count = PAGES.filter((p) => p.kind === "component").length;
  useEffect(() => {
    document.title = "Caret — components for agent apps";
  }, []);

  return (
    <div className="flex flex-col gap-16">
      <header className="flex flex-col items-start">
        <h1 className="m-0 text-h1 font-heading">Caret</h1>
        <p className="mt-3 mb-6 max-w-[56ch] text-body text-ink-2">
          React components for agent apps: the chat, run traces and diffs, and every form and menu around them. {count}{" "}
          components on Base UI, copied into your repo.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" nativeButton={false} render={<Link to="/docs/$slug" params={{ slug: "getting-started" }} />}>
            Get started
          </Button>
          <Button variant="secondary" kbd="B" nativeButton={false} render={<Link to="/components" />}>
            Browse components
          </Button>
        </div>
      </header>

      <Showcase />

      <section aria-labelledby="h-faq" className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-12 gap-y-4 max-[860px]:grid-cols-1">
        <h2 id="h-faq" className="m-0 text-h2 font-heading">Questions</h2>
        <Accordion className="w-full">
          <AccordionItem value="what" title="What is Caret?">
            A set of React components for software people and agents build together: the controls every app needs, plus the
            parts an agent interface needs, like chat, run traces, diffs and a composer.
          </AccordionItem>
          <AccordionItem value="install" title="How do I install it?">
            Add the dependencies and copy the source into your repo. There's no package to update: the code is yours.
          </AccordionItem>
          <AccordionItem value="a11y" title="Is it accessible?">
            Every component is built on Base UI primitives, with full keyboard support, visible focus and screen reader names.
          </AccordionItem>
          <AccordionItem value="theme" title="Can I theme it?">
            Eight themes, each light and dark, and nine primary colors to swap in. Or make your own in the theme builder.
          </AccordionItem>
          <AccordionItem value="agents" title="Does my coding agent understand it?">
            Caret ships with DESIGN.md, the rules every component follows, so an agent writes UI that matches the rest.
          </AccordionItem>
        </Accordion>
      </section>

      <section aria-labelledby="h-install" className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-12 gap-y-4 max-[860px]:grid-cols-1">
        <div>
          <h2 id="h-install" className="m-0 text-h2 font-heading">Install</h2>
          <p className="mt-3 mb-0 text-small text-ink-2">
            Then set <code className={code}>data-theme</code> on <code className={code}>&lt;html&gt;</code>.
          </p>
        </div>
        <Code className="min-w-0" lang="SH" name="terminal" lines={INSTALL} />
      </section>
    </div>
  );
}
