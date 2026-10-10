import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AccentPicker, Button, Code, Hint, NavItem, Seg, ThemeSwatch } from "@/components";
import { cn } from "@/lib/cn";
import { buildTheme, checkTheme, PRESETS } from "@/lib/palette";
import { THEME_INFO, THEMES, ThemeScope, type Accent, type PresetName, type ResolvedMode } from "@/lib/theme";
import { RunCard } from "../foundations";
import { GROUPS, PAGES, type DocPage } from "../registry";
import { SampleSettings } from "../theme-builder";
import { PageCard } from "./components-index";
import { ConstructionArc, Crosshair, Diagonal, Frame, Guides, Node, Rule, Ruler, SHEET } from "./construction";
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

/* The drafting sheet: a 1132px framed column (even, so its centre is a whole px) in a 24px
   gutter, 16px on phones. Sections pad inside the frame; GUIDE_INSET matches that padding. */
const GUTTER = "px-6 max-[600px]:px-4";
const COLUMN = "mx-auto max-w-[1132px]";
const PAD = "px-12 max-[1000px]:px-8 max-[600px]:px-4";
const GUIDE_INSET = "inset-x-12 max-[1000px]:inset-x-8 max-[600px]:inset-x-4";

/** The hero: centered type over a compass arc, with a crosshair resting on the arc's centre. */
function HomeHero() {
  return (
    <section
      aria-labelledby="hero-h"
      className={cn(
        PAD,
        "relative flex flex-col items-center justify-center py-16 text-center min-[1001px]:h-[576px] min-[601px]:max-[1000px]:h-[600px]",
      )}
    >
      {/* A fixed, whole-px height: the fluid display type would otherwise leave every rule below on a fraction. */}
      <ConstructionArc />
      <Crosshair rest={{ x: 0.5, y: 1 }} track />
      <Diagonal className="max-[720px]:hidden" />

      <div className="relative flex flex-col items-center">
        <p className="mono m-0 mb-6 text-small text-ink-3">a design system for people and agents</p>
        <h1 id="hero-h" className="m-0 mb-6 text-display font-normal text-balance max-[600px]:leading-[44px]">
          <span className="block overflow-hidden pb-[.06em] max-[600px]:pb-[2px]">
            <span className="rm-fade inline-block animate-rise">Components that</span>
          </span>
          <span className="block overflow-hidden pb-[.06em] max-[600px]:pb-[2px]">
            <span className="rm-fade inline-block animate-rise [animation-delay:.08s]">
              show their work
              <i
                aria-hidden
                className="ml-[.06em] inline-block h-[.82em] w-[.09em] animate-blink rounded-[1px] bg-accent align-[-.04em] [animation-delay:.9s]"
              />
            </span>
          </span>
        </h1>
        <p className="m-0 mb-8 max-w-[52ch] text-title leading-7 font-normal tracking-normal text-pretty text-ink-2">
          Caret is a design system for tools where people and agents build software together. Every control makes its
          state legible, every value has a token name you can type, and nothing ships without its keyboard story.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="primary" kbd="B" nativeButton={false} render={<Link to="/components" />}>
            Browse components
          </Button>
          <Button variant="secondary" nativeButton={false} render={<Link to="/foundations/$slug" params={{ slug: "theme-builder" }} />}>
            Make a theme
          </Button>
        </div>
      </div>
    </section>
  );
}

const PRINCIPLES = [
  ["State is visible", "Every component page carries a live readout, like an editor status bar. If a component can't explain what it's doing, it isn't done."],
  ["Contrast is solved, not checked", "Every color is computed against the grounds it sits on, in every theme and both modes. Text, borders, focus and charts clear their targets by construction."],
  ["Tokens are typed, not guessed", "Colors, spacing, radii and motion are named by role. A design decision you can't reference by name is a decision that will drift."],
];

/** The three principles stacked beside the hero's live specimen, split by one frame line with nodes at its ends. */
function Principles() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] max-[1000px]:grid-cols-1">
      <div className="flex flex-col">
        {PRINCIPLES.map(([t, d], i) => (
          <div
            key={t}
            className={cn(PAD, "flex-1 py-8 text-control text-pretty text-ink-2", i > 0 && "border-t border-(--rule)")}
          >
            <strong className="mb-1 block text-body font-heading text-ink">{t}</strong>
            {d}
          </div>
        ))}
      </div>
      <div className="relative grid place-items-center border-l border-(--rule) bg-pattern px-12 py-12 max-[1000px]:border-t max-[1000px]:border-l-0 max-[600px]:px-4">
        <Node className="-top-[5px] -left-[5px] max-[1000px]:hidden" />
        <Node className="-bottom-[5px] -left-[5px] max-[1000px]:hidden" />
        <div className="w-full min-w-0 max-w-[480px]">
          <RunCard variant="sheet" />
        </div>
      </div>
    </div>
  );
}

/** Try a theme, mode and primary color on a scoped sample; the page itself doesn't change. */
function MakeItYours() {
  const [theme, setTheme] = useState<PresetName>("slate");
  const [mode, setMode] = useState<ResolvedMode>("light");
  const [accent, setAccent] = useState<Accent>("default");
  return (
    <section aria-labelledby="h-yours" className={cn(PAD, "grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-12 py-16 max-[1000px]:grid-cols-1")}>
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
      {/* The frame and its nodes sit outside the scope, so they keep the sheet's own line and page colors. */}
      <Boxed>
        <ThemeScope
          theme={theme}
          mode={mode}
          data-accent={accent}
          className="bg-page bg-pattern p-5 text-ink transition-colors duration-quick"
        >
          <SampleSettings />
        </ThemeScope>
      </Boxed>
    </section>
  );
}

/** A square 1px frame in the sheet's line color, with a Node on each corner. */
function Boxed({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("relative grid border border-(--rule)", className)}>
      <Node className="-top-[5px] -left-[5px]" />
      <Node className="-top-[5px] -right-[5px]" />
      <Node className="-bottom-[5px] -left-[5px]" />
      <Node className="-right-[5px] -bottom-[5px]" />
      {children}
    </div>
  );
}

/**
 * Pages as one table of cells: 3 columns, 2 under 1000px, 1 under 640px. The grid's 1px gaps
 * show its `--rule` background and its border is the outer edge, so every edge is one line.
 * (Fill whole rows: an empty slot in a short last row would show as a solid block of line.)
 *
 * Nodes: the grid holds the top-left corner; every cell marks its own bottom-right junction
 * (crossings, the right and bottom T's, the bottom-right corner); first-row cells add their
 * top-right (top T's, top-right corner) and first-column cells their bottom-left (left T's,
 * bottom-left corner), worked out per breakpoint. -5px centres a 9px node on a 1px gap or border.
 */
function CellGrid({ pages }: { pages: DocPage[] }) {
  return (
    <div className="relative grid grid-cols-3 gap-px border border-(--rule) bg-(--rule) max-[1000px]:grid-cols-2 max-[640px]:grid-cols-1">
      <Node className="-top-[5px] -left-[5px]" />
      {pages.map((p, i) => (
        <PageCard key={p.slug} page={p} sheet>
          <Node className="-right-[5px] -bottom-[5px]" />
          <Node
            className={cn(
              "-top-[5px] -right-[5px] hidden",
              i < 3 && "min-[1001px]:block",
              i < 2 && "min-[641px]:max-[1000px]:block",
              i < 1 && "max-[640px]:block",
            )}
          />
          <Node
            className={cn(
              "-bottom-[5px] -left-[5px] hidden max-[640px]:block",
              i % 3 === 0 && "min-[1001px]:block",
              i % 2 === 0 && "min-[641px]:max-[1000px]:block",
            )}
          />
        </PageCard>
      ))}
    </div>
  );
}

/** Three steps from nothing to a themed app. */
function QuickStart() {
  return (
    <section aria-labelledby="h-start" className={cn(PAD, "relative py-16")}>
      <Guides columns={3} className={cn(GUIDE_INSET, "max-[1000px]:hidden")} />
      <div className="relative mb-6 flex flex-wrap items-end justify-between gap-4">
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
      <ol className="relative m-0 grid list-none grid-cols-3 gap-4 p-0 max-[1000px]:grid-cols-1">
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
    <section aria-labelledby="h-index" className={cn(PAD, "relative pt-16 pb-8")}>
      <Guides columns={4} gap={24} className={cn(GUIDE_INSET, "max-[1000px]:hidden")} />
      <Guides columns={3} gap={24} className={cn(GUIDE_INSET, "hidden max-[1000px]:grid max-[700px]:hidden")} />
      <Guides columns={2} gap={24} className={cn(GUIDE_INSET, "hidden max-[700px]:grid")} />
      <h2 id="h-index" className="relative m-0 mb-6 text-h2 font-heading text-balance">
        Every page
      </h2>
      {/* Columns, not a grid: long groups flow on, so short ones don't leave holes beside them. */}
      <div className="relative columns-4 gap-x-6 max-[1000px]:columns-3 max-[700px]:columns-2">
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
    // overflow-x-clip trims the full-bleed rules and the diagonal at the viewport without breaking the sticky header.
    <div className="min-h-screen overflow-x-clip" style={SHEET}>
      <header className={cn(GUTTER, "sticky top-0 z-20 border-b border-(--rule) bg-[color-mix(in_srgb,var(--page)_86%,transparent)] backdrop-blur-[10px]")}>
        <Frame nodes="bottom" className={cn(COLUMN, "flex h-14 items-center gap-2 px-4 max-[600px]:px-2")}>
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
        </Frame>
      </header>

      <div className={GUTTER}>
        <Frame className={COLUMN}>
          <Ruler className="max-[720px]:hidden" />

          <HomeHero />
          <Rule />
          <Principles />
          <Rule />

          <MakeItYours />
          <Rule />

          <section aria-labelledby="h-inside" className={cn(PAD, "relative py-16")}>
            <div className="relative mb-6 flex flex-wrap items-end justify-between gap-4">
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
            <CellGrid pages={featured} />
          </section>
          <Rule />

          <section
            aria-labelledby="h-template"
            className={cn(PAD, "grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-12 py-16 max-[1000px]:grid-cols-1")}
          >
            <div>
              <h2 id="h-template" className="m-0 text-h2 font-heading text-balance">
                A template, built only from the parts
              </h2>
              <p className="mt-3 mb-6 max-w-[48ch] text-body text-pretty text-ink-2">
                {workspace.description} Send a message to watch a run, filter threads, read the diffs, and switch it between
                light and dark on its own.
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
            <Boxed>
              <PageCard page={workspace} sheet />
            </Boxed>
          </section>
          <Rule />

          <QuickStart />
          <Rule />

          <Index />
          <Rule />

          <footer className={cn(PAD, "flex flex-wrap justify-between gap-4 py-6")}>
            <Hint>Caret v0.1</Hint>
            <Hint>React · Tailwind CSS v4 · Base UI · Motion</Hint>
          </footer>
          <Rule />
          {/* The frame runs on past the last rule, like the margin of a sheet. */}
          <div aria-hidden className="h-24" />
        </Frame>
      </div>
    </div>
  );
}
