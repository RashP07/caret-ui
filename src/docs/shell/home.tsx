import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AccentPicker, Button, Code, Hint, NavItem, Seg, ThemeSwatch } from "@/components";
import { buildTheme, checkTheme, PRESETS } from "@/lib/palette";
import { THEME_INFO, THEMES, ThemeScope, type Accent, type PresetName, type ResolvedMode } from "@/lib/theme";
import { Hero } from "../foundations";
import { GROUPS, PAGES, type DocPage } from "../registry";
import { SampleSettings } from "../theme-builder";
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

/** Promised pairings per theme and mode, straight from the engine, so the claim can't drift from the truth. */
const PAIRINGS = checkTheme(buildTheme(PRESETS.neutral)).length / 2;

/** Try a theme, mode and primary color on a scoped sample; the page itself doesn't change. */
function MakeItYours() {
  const [theme, setTheme] = useState<PresetName>("slate");
  const [mode, setMode] = useState<ResolvedMode>("light");
  const [accent, setAccent] = useState<Accent>("default");
  return (
    <section aria-labelledby="h-yours" className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-12 pt-16 max-[1000px]:grid-cols-1">
      <div className="flex flex-col gap-5">
        <div>
          <h2 id="h-yours" className="m-0 text-h2 font-heading text-balance">
            Make it yours, keep it legible
          </h2>
          <p className="mt-3 mb-0 max-w-[48ch] text-body text-pretty text-ink-2">
            {THEMES.length} themes, each light and dark, and nine primary colors. Or paste your brand color into the theme
            builder. Every combination is solved against its grounds: {PAIRINGS} pairings per theme and mode, all passing.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-small font-control text-ink-2">Theme</span>
          <div role="group" aria-label="Preview theme" className="flex flex-wrap gap-1.5">
            {THEMES.map((t) => (
              <Button
                key={t}
                variant="ghost"
                size="sm"
                aria-pressed={theme === t}
                icon={<ThemeSwatch theme={t} form="dots" />}
                onClick={() => setTheme(t)}
              >
                {THEME_INFO[t].label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-small font-control text-ink-2">Mode</span>
            <Seg<ResolvedMode>
              aria-label="Preview mode"
              value={mode}
              onValueChange={setMode}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-small font-control text-ink-2">Primary color</span>
            <AccentPicker
              aria-label="Preview primary color"
              value={accent}
              onValueChange={setAccent}
              theme={theme}
              disabled={theme === "contrast"}
            />
          </div>
        </div>
        <div>
          <Button
            variant="primary"
            nativeButton={false}
            render={<Link to="/foundations/$slug" params={{ slug: "theme-builder" }} />}
            icon={<ArrowRightIcon />}
          >
            Open the theme builder
          </Button>
        </div>
      </div>

      {/* A scoped theme: data-theme, data-mode and data-accent on one element re-theme everything inside it. */}
      <ThemeScope
        theme={theme}
        mode={mode}
        data-accent={accent}
        className="rounded-card border border-line bg-page bg-pattern p-5 text-ink transition-colors duration-quick"
      >
        <SampleSettings />
      </ThemeScope>
    </section>
  );
}

/** Three steps from nothing to a themed app. */
function QuickStart() {
  return (
    <section aria-labelledby="h-start" className="pt-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="h-start" className="m-0 text-h2 font-heading text-balance">
            Copy it in. Own it.
          </h2>
          <p className="mt-2 mb-0 max-w-[60ch] text-body text-pretty text-ink-2">
            Caret is source, not a dependency: the components and tokens live in your repo, so you can read and change every
            line.
          </p>
        </div>
        <Button variant="secondary" nativeButton={false} render={<Link to="/docs/$slug" params={{ slug: "installation" }} />}>
          Installation guide
        </Button>
      </div>
      <ol className="m-0 grid list-none grid-cols-3 gap-4 p-0 max-[1000px]:grid-cols-1">
        <li className="flex min-w-0 flex-col gap-2">
          <span className="text-small font-control text-ink-2">1. Add the dependencies</span>
          <Code lang="SH" name="terminal" lines={["pnpm add @base-ui/react motion \\", "  @phosphor-icons/react clsx tailwind-merge"]} />
        </li>
        <li className="flex min-w-0 flex-col gap-2">
          <span className="text-small font-control text-ink-2">2. Copy the source</span>
          <Code lang="SH" name="terminal" lines={["cp -r caret/src/components \\", "  caret/src/lib caret/src/styles src/"]} />
        </li>
        <li className="flex min-w-0 flex-col gap-2">
          <span className="text-small font-control text-ink-2">3. Pick a theme</span>
          <Code lang="HTML" name="index.html" lines={['<html data-theme="slate"', '      data-accent="indigo">']} />
        </li>
      </ol>
    </section>
  );
}

/** Every page, by group: the whole system at a glance. */
function Index() {
  return (
    <section aria-labelledby="h-index" className="pt-16">
      <h2 id="h-index" className="m-0 mb-6 text-h2 font-heading text-balance">
        Every page
      </h2>
      {/* Columns, not a grid: long groups flow on, so short ones don't leave holes beside them. */}
      <div className="columns-4 gap-x-6 max-[1000px]:columns-3 max-[700px]:columns-2">
        {GROUPS.map((g) => (
          <nav key={g.name} aria-label={g.name} className="mb-8 flex min-w-0 break-inside-avoid flex-col gap-2">
            <h3 className="m-0 text-small font-heading text-ink">
              {g.name} <span className="font-normal text-ink-3 tabular-nums">{g.pages.length}</span>
            </h3>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {g.pages.map((p) => (
                <li key={p.slug}>
                  <Link {...pageLink(p)} className="text-control text-ink-2 no-underline hover:text-ink hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </section>
  );
}

/** The landing page (layout only): top nav, the hero, theming, what's in the box, the template, quick start, index. */
export function Home() {
  useEffect(() => {
    document.title = "Caret — a design system for software made by people and agents";
  }, []);
  const featured = ["button", "select", "menubar", "tooltip", "switch", "table"].map((s) => PAGES.find((p) => p.slug === s)!);
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
            <NavItem render={<Link to="/foundations/$slug" params={{ slug: "theme-builder" }} />} className="w-auto">
              Theme builder
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

        <MakeItYours />

        <section aria-labelledby="h-inside" className="pt-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="h-inside" className="m-0 text-h2 font-heading text-balance">
                Everything in the box
              </h2>
              <p className="mt-2 mb-0 text-body text-ink-2">
                {count("component", "component", "components")}, {count("foundation", "foundation", "foundations")},{" "}
                {count("template", "template", "templates")}. Each has a page with live specimens and a state readout.
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
              variant="secondary"
              nativeButton={false}
              render={<Link to="/templates/$slug" params={{ slug: "agent-workspace" }} />}
              icon={<ArrowRightIcon />}
            >
              Open the workspace
            </Button>
          </div>
          <PageCard page={workspace} />
        </section>

        <QuickStart />

        <Index />

        <footer className="mt-24 flex flex-wrap justify-between gap-4 border-t border-line pt-6">
          <Hint>Caret v0.1</Hint>
          <Hint>React · Tailwind CSS v4 · Base UI · Motion</Hint>
        </footer>
      </div>
    </div>
  );
}
