import { Link } from "@tanstack/react-router";
import { CheckIcon, GitBranchIcon, PauseIcon } from "@phosphor-icons/react";
import { Fragment, useLayoutEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardIcon,
  CardText,
  CardTitle,
  CheckboxChoice,
  Input,
  Seg,
  toast,
  Tooltip,
} from "@/components";
import { cn } from "@/lib/cn";
import { MODE_INFO, MODES, THEME_INFO, type Accent, type Mode, type ThemeName } from "@/lib/theme";
import { usePageScheme } from "@/lib/use-page-scheme";
import { useDocs } from "./docs-context";
import { AccentRow, ThemeList } from "./shell/theme-panel";
import { Section, Spec, SpecBar, type Pairs } from "./spec";

/* =========================================================
   Hero
   ========================================================= */

export function Hero({ pressB }: { pressB: boolean }) {
  return (
    <>
      <section
        aria-labelledby="hero-h"
        className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-end gap-12 border-b border-line pt-16 pb-12 max-[1000px]:grid-cols-1 max-[1000px]:items-start max-[600px]:pt-8"
      >
        <div>
          <h1 id="hero-h" className="m-0 mb-6 text-display font-heading text-balance">
            <span className="block overflow-hidden pb-[.06em]">
              <span className="rm-fade inline-block animate-rise">Components that</span>
            </span>
            <span className="block overflow-hidden pb-[.06em]">
              <span className="rm-fade inline-block animate-rise [animation-delay:.08s]">
                show their work
                <i
                  aria-hidden
                  className="ml-[.06em] inline-block h-[.82em] w-[.09em] animate-blink rounded-[1px] bg-accent align-[-.04em] [animation-delay:.9s]"
                />
              </span>
            </span>
          </h1>
          <p className="m-0 mb-6 max-w-[46ch] text-title leading-[1.55] font-normal tracking-normal text-pretty text-ink-2">
            Caret is a design system for tools where people and agents build software together. Every control makes
            its state legible, every value has a token name you can type, and nothing ships without its keyboard story.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" kbd="B" pressed={pressB} nativeButton={false} render={<Link to="/components" />}>
              Browse components
            </Button>
            <Button variant="secondary" nativeButton={false} render={<Link to="/foundations/$slug" params={{ slug: "theme-builder" }} />}>
              Make a theme
            </Button>
          </div>
        </div>
        <RunCard />
      </section>

      <div className="grid grid-cols-3 border-b border-line max-[860px]:grid-cols-1">
        {[
          ["State is visible", "Every component page carries a live readout, like an editor status bar. If a component can't explain what it's doing, it isn't done."],
          ["Contrast is solved, not checked", "Every color is computed against the grounds it sits on, in every theme and both modes. Text, borders, focus and charts clear their targets by construction."],
          ["Tokens are typed, not guessed", "Colors, spacing, radii and motion are named by role. A design decision you can't reference by name is a decision that will drift."],
        ].map(([t, d], i) => (
          <div
            key={t}
            className={cn(
              "py-6 pr-6 text-control text-pretty text-ink-2",
              i > 0 && "border-l border-line pl-6 max-[860px]:border-t max-[860px]:border-l-0 max-[860px]:pl-0",
            )}
          >
            <strong className="mb-1 block text-body font-heading text-ink">{t}</strong>
            {d}
          </div>
        ))}
      </div>
    </>
  );
}

/** Hero composition: an agent run, built from Caret parts. */
function RunCard() {
  const steps: { label: string; t: string; s: "done" | "now" | "todo" }[] = [
    { label: "Read 14 route handlers", t: "0:12", s: "done" },
    { label: "Draft migration plan", t: "0:41", s: "done" },
    { label: "Rewrite invoices.rs", t: "2:08", s: "now" },
    { label: "Run the test suite", t: "—", s: "todo" },
  ];
  return (
    <Card aria-label="Example: an agent run composed from Caret components" className="rm-fade animate-fade-in overflow-hidden shadow-float">
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <CardIcon>
          <GitBranchIcon />
        </CardIcon>
        <div className="min-w-0">
          <div className="truncate text-body font-heading tracking-[-.01em]" title="Move billing routes to the new router">
            Move billing routes to the new router
          </div>
          <div className="text-small text-ink-3">Started by you, 4 minutes ago</div>
        </div>
        <Badge tone="live" dot className="ml-auto">
          Running
        </Badge>
      </div>
      <ol className="m-0 flex list-none flex-col px-4 pb-3">
        {steps.map((st, i) => (
          <li
            key={st.label}
            className={cn(
              "relative grid grid-cols-[18px_1fr_auto] items-center gap-2.5 py-[7px] text-control",
              st.s === "done" && "text-ink",
              st.s === "now" && "font-control text-ink",
              st.s === "todo" && "text-ink-3",
              i > 0 && "before:absolute before:-top-[7px] before:left-[8.5px] before:h-3.5 before:w-px before:bg-line-strong before:content-['']",
            )}
          >
            <span
              className={cn(
                "relative z-[1] grid size-[18px] place-items-center rounded-full bg-surface",
                st.s === "done" && "bg-ink text-on-ink",
                st.s === "todo" && "border-[1.5px] border-dashed border-line-strong",
                st.s === "now" && "border-[1.5px] border-accent",
              )}
            >
              {st.s === "done" && <CheckIcon size={10} weight="bold" />}
              {st.s === "now" && <span className="size-1.5 animate-pulse-dot rounded-full bg-accent" />}
            </span>
            {st.label}
            <span className="text-caption text-ink-3 tabular-nums">{st.t}</span>
          </li>
        ))}
      </ol>
      <div
        aria-label="Diff preview"
        className="mono mx-4 mb-3 overflow-x-auto rounded-control border border-line bg-sunken py-2 text-code [&>div]:px-3 [&>div]:whitespace-pre"
      >
        <div className="bg-danger-soft text-ink-2">- let app = Router::new().route("/invoices", legacy)</div>
        <div className="bg-success-soft text-ink">+ let app = Router::new().route("/invoices", get(list))</div>
        <div>{"      .layer(auth_layer());"}</div>
      </div>
      <div className="flex items-center gap-2 border-t border-line bg-[color-mix(in_srgb,var(--sunken)_45%,var(--surface))] px-4 py-3">
        <Button variant="ghost" icon={<PauseIcon />} tip="Pause after the current step" tipKbd="⌘ .">
          Pause
        </Button>
        <div className="flex-1" />
        <Button variant="primary" kbd="↵">
          Review changes
        </Button>
      </div>
    </Card>
  );
}

/* =========================================================
   Color
   ========================================================= */

const GROUPS: [string, [string, string, string][]][] = [
  ["Grounds", [["Page", "--page", "Page ground"], ["Surface", "--surface", "Cards, controls, popups"], ["Sunken", "--sunken", "Wells, tracks"]]],
  ["States", [["Hover", "--hover", "Pointer over a row or control"], ["Pressed", "--pressed", "Pressed, toggled on, open"], ["Selected", "--selected", "The current row"]]],
  ["Ink", [["Ink", "--ink", "Text, primary actions"], ["Ink 2", "--ink-2", "Secondary text (7:1)"], ["Ink 3", "--ink-3", "Hints, meta (4.5:1 on every ground)"], ["Disabled", "--ink-disabled", "Disabled text (3:1)"]]],
  ["Lines", [["Line", "--line", "Dividers (decorative)"], ["Line strong", "--line-strong", "Strong dividers, ledges"], ["Control border", "--border-control", "Input, checkbox, switch edges (3:1)"]]],
  ["Accent", [["Accent", "--accent", "Brand fill, small doses"], ["Accent strong", "--accent-strong", "Indicators: current, live (3:1)"], ["Accent soft", "--accent-soft", "Selection, highlights"], ["Focus", "--focus", "Keyboard focus ring"], ["Link", "--link", "Links in running text"]]],
  ["Status", [["Danger", "--danger", "Errors, destructive text"], ["Success", "--success", "Healthy, added"], ["Warning", "--warning", "Needs attention"], ["Info", "--info", "Neutral notices"]]],
  ["Status fills", [["Danger solid", "--danger-solid", "Destructive buttons"], ["Success solid", "--success-solid", "Solid badges"], ["Warning solid", "--warning-solid", "Solid badges, dark text"], ["Info solid", "--info-solid", "Solid badges"]]],
  ["Charts", [["Chart 1", "--chart-1", "Series 1"], ["Chart 2", "--chart-2", "Series 2"], ["Chart 3", "--chart-3", "Series 3"], ["Chart 4", "--chart-4", "Series 4"], ["Chart 5", "--chart-5", "Series 5"], ["Chart 6", "--chart-6", "Series 6"]]],
];

/** A token's resolved color: light-dark() only resolves on an element, so read it off a probe. */
function resolveToken(token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  probe.style.display = "none";
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

/** sRGB hex for any CSS color (oklch included): paint one pixel and read it back. */
function toHex(val: string) {
  const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!c) return val;
  c.clearRect(0, 0, 1, 1);
  c.fillStyle = val;
  c.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = c.getImageData(0, 0, 1, 1).data;
  const hex = "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase();
  return a < 255 ? `${hex} · ${Math.round((a / 255) * 100)}%` : hex;
}

function Swatch({ name, token, role, hex }: { name: string; token: string; role: string; hex: string }) {
  const [tip, setTip] = useState<string | null>(null);
  return (
    <Tooltip label={tip ?? `Copy var(${token})`}>
      <button
        type="button"
        className="cursor-pointer overflow-hidden rounded-card border border-line bg-surface p-0 text-left transition-[border-color] duration-instant hover:border-line-strong"
        onClick={async () => {
          let ok = false;
          try {
            await navigator.clipboard.writeText(`var(${token})`);
            ok = true;
          } catch {
            /* blocked */
          }
          setTip(ok ? "Copied" : "Couldn't copy. Select and copy manually.");
          setTimeout(() => setTip(null), ok ? 1100 : 2400);
        }}
      >
        <div className="h-[76px] border-b border-line" style={{ background: `var(${token})` }} />
        <div className="flex flex-col gap-0.5 px-3 pt-2.5 pb-3">
          <span className="text-control font-control">{name}</span>
          <span className="mono text-caption text-ink-3">{token}</span>
          <span className="mono text-caption text-ink-2">{hex}</span>
          <span className="mt-1 text-caption text-pretty text-ink-3">
            {role}
          </span>
        </div>
      </button>
    </Tooltip>
  );
}

export function ColorSection({ themeKey }: { themeKey: string }) {
  const [hex, setHex] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    const next: Record<string, string> = {};
    GROUPS.forEach(([, items]) => items.forEach(([, v]) => (next[v] = toHex(resolveToken(v)))));
    setHex(next);
  }, [themeKey]);

  return (
    <Section
      id="color"
      title="Color"
      lede="Shown in the active theme and mode. Tokens are named by role, not by color: text, grounds, states, borders, status and charts. Every pairing is measured against the grounds it sits on, in every theme and both modes. Click a swatch to copy its token."
    >
      {GROUPS.map(([g, items]) => (
        <div key={g}>
          <div className="mt-6 mb-2 text-small font-control text-ink-3">{g}</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {items.map(([n, v, role]) => (
              <Swatch key={v} name={n} token={v} role={role} hex={hex[v] ?? ""} />
            ))}
          </div>
        </div>
      ))}
      <div aria-label="Core pairings" className="mt-6 grid grid-cols-3 overflow-hidden rounded-card border border-line max-[860px]:grid-cols-1">
        {[
          ["ink / on-ink", "Aa Ink", "Primary actions, selected states, tooltips.", "bg-ink text-on-ink"],
          ["accent / on-accent", "Aa Accent", "Brand moments and live activity. Small doses only.", "bg-accent text-on-accent"],
          ["surface / ink-2", "Aa Surface", "Everything else. The quiet majority.", "bg-surface"],
        ].map(([k, b, d, c]) => (
          <div key={k} className={cn("flex min-h-[130px] flex-col gap-1.5 p-6", c)}>
            <span className="mono text-caption">{k}</span>
            <b className="text-h2 leading-none font-heading">{b}</b>
            <span className="text-small">{d}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* =========================================================
   Themes
   ========================================================= */

export function ThemesSection({
  theme,
  setTheme,
  mode,
  setMode,
  accent,
  setAccent,
}: {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
}) {
  // Observed from <html>, so it's correct after the page mode has actually applied.
  const { custom } = useDocs();
  const scheme = usePageScheme();
  const state: Pairs = [
    ["theme", `"${theme}"`],
    ["mode", mode === "system" ? `system (${scheme})` : mode],
    ["accent", theme === "contrast" ? "n/a" : accent],
  ];

  return (
    <Section
      id="themes"
      title="Themes"
      lede="Eight themes, each with a light and a dark variant. data-theme picks the palette, data-mode picks light or dark (with none, the page follows the OS), and data-accent swaps in a primary color. Both scope to any element. Every pairing is solved against its grounds: text clears 4.5:1, control borders and focus clear 3:1, and Contrast clears 7:1 for all text."
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Seg
          aria-label="Mode"
          value={mode}
          onValueChange={(m) => setMode(m)}
          options={MODES.map((m) => ({ value: m, label: MODE_INFO[m].label }))}
        />
        <div className="flex-1" />
        <Button
          variant="ghost"
          onClick={() => {
            setTheme("neutral");
            setMode("system");
            setAccent("default");
          }}
        >
          Reset to default
        </Button>
      </div>
      <AccentRow theme={theme} accent={accent} setAccent={setAccent} className="mb-4 px-0" />
      <ThemeList
        hasCustom={!!custom}
        theme={theme}
        setTheme={(t) => {
          setTheme(t);
          toast(`Theme set to ${THEME_INFO[t].label}`, { tone: "success" });
        }}
        className="grid grid-cols-2 gap-x-6 rounded-card border border-line bg-surface p-2 max-[700px]:grid-cols-1"
      />
      <figure className="m-0 mt-4 overflow-hidden rounded-control border border-line">
        <SpecBar name="theme × mode" state={state} className="border-t-0" />
      </figure>
    </Section>
  );
}

/* =========================================================
   Typography
   ========================================================= */

export function TypeSection() {
  // Each specimen is set with the utility it documents.
  const scale: [string, string, string, string][] = [
    ["display", "clamp(2.75rem, 7vw, 4.75rem) / .98 / −4.5%", "Ship it", "text-display font-heading"],
    ["h1", "2.5rem (40) / 1.1 / −3.5%", "Agent settings", "text-h1 font-heading"],
    ["h2", "1.75rem (28) / 1.1 / −3%", "Scheduled runs", "text-h2 font-heading"],
    ["title", "1.125rem (18) / 1.3 / −1.5%", "Connected tools", "text-title font-heading"],
    ["body", ".9375rem (15) / 1.55", "The agent keeps its state between runs, so it can pick up where it left off when a reply arrives hours later.", "text-body text-ink-2 whitespace-normal text-pretty"],
    ["control", ".875rem (14) / 1.4", "Deploy agent", "text-control font-control"],
    ["small", ".8125rem (13) / 1.45", "Last deployed 12 minutes ago by Priya", "text-small text-ink-2"],
    ["caption", ".75rem (12) / 1.4", "3 files changed · 34 minutes ago", "text-caption text-ink-3 tabular-nums"],
    ["code", ".78125rem (12.5) / 1.7, mono", 'this.schedule("weekdays at 11:30", "chooseLunch")', "mono text-code"],
  ];
  const weights: [string, string, string][] = [
    ["font-normal", "400", "Reading text, descriptions"],
    ["font-control", "550", "Buttons, labels, menu items"],
    ["font-heading", "620", "Titles and headings"],
  ];
  return (
    <Section
      id="type"
      title="Typography"
      lede="Two faces with clearly separate jobs. Schibsted Grotesk carries the interface and headlines with tight, confident tracking. JetBrains Mono appears only where the content is literally code: keys, token names, paths, logs. Sizes are in rem, so they follow the reader's default font size."
    >
      <div className="mb-4 grid grid-cols-2 gap-4 max-[860px]:grid-cols-1">
        <div className="flex min-h-[220px] flex-col gap-3 rounded-card border border-line bg-surface p-6">
          <div aria-hidden className="text-display font-heading">Rg</div>
          <div className="text-body font-heading">Schibsted Grotesk</div>
          <p className="m-0 text-control text-pretty text-ink-2">Interface and display, in three weights. Tracking gets tighter as the size grows.</p>
          <div className="mt-auto text-small break-all text-ink-3">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789</div>
        </div>
        <div className="flex min-h-[220px] flex-col gap-3 rounded-card border border-line bg-surface p-6">
          <div aria-hidden className="mono text-display font-normal tracking-normal">{"{}"}</div>
          <div className="text-body font-heading">JetBrains Mono</div>
          <p className="m-0 text-control text-pretty text-ink-2 [&_code]:text-small">
            Code, keyboard keys and token names (<code>mono</code>), with clearly distinct 0/O and 1/l/I. Counts, times
            and percentages stay in the grotesk with tabular figures.
          </p>
          <div className="mono mt-auto text-small break-all text-ink-3">--s-4: 16px; ⌘K ↵ ⇧ → 0O1lI {"{}[]"}</div>
        </div>
      </div>
      <div className="overflow-hidden rounded-card border border-line bg-surface">
        {scale.map(([n, m, s, c]) => (
          <div key={n} className="grid grid-cols-[200px_minmax(0,1fr)] items-baseline gap-6 border-b border-line px-6 py-4 last:border-b-0 max-[860px]:grid-cols-1 max-[860px]:gap-1">
            <div className="text-caption text-ink-3">
              <b className="mono block font-control text-ink-2">text-{n}</b>
              <span className="tabular-nums">{m}</span>
            </div>
            <div className={cn("truncate", c)}>{s}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 max-[860px]:grid-cols-1">
        {weights.map(([u, w, use]) => (
          <div key={u} className="flex flex-col gap-1 rounded-card border border-line bg-surface p-5">
            <span className={cn("text-h2", u)}>Aa {w}</span>
            <span className="mono text-caption text-ink-2">{u}</span>
            <span className="text-small text-ink-3">{use}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 mb-0 max-w-[64ch] text-small text-pretty text-ink-2 [&_code]:text-caption">
        Nothing that carries information goes below <code>text-caption</code> (12px): shortcuts, counts, timestamps and badges
        included. Editable fields use 16px below the <code>sm</code> breakpoint (<code>text-input-touch</code>) so iOS
        doesn't zoom in on focus.
      </p>
    </Section>
  );
}

/* =========================================================
   Space & radius
   ========================================================= */

export function SpaceSection() {
  const space: [string, number][] = [["--s-1", 4], ["--s-2", 8], ["--s-3", 12], ["--s-4", 16], ["--s-5", 24], ["--s-6", 32], ["--s-7", 48], ["--s-8", 64], ["--s-9", 96]];
  const radii: [string, string, string, string][] = [
    ["inline", "4px", "kbd, tags", "rounded-tl-inline"],
    ["button", "4px", "buttons, rows", "rounded-tl-button"],
    ["control", "8px", "inputs, menus", "rounded-tl-control"],
    ["card", "12px", "cards, panels", "rounded-tl-card"],
    ["dialog", "16px", "modals", "rounded-tl-dialog"],
    ["pill", "999px", "badges, counts", "rounded-tl-pill"],
  ];
  return (
    <Section
      id="space"
      title="Space & radius"
      lede="Every space is a multiple of 4px, on a scale that widens as it grows. Radius follows hierarchy: the more something floats above the page, the softer its corners. Buttons are crisp so they read as solid keys, fields are a touch softer, and dialogs are the roundest."
    >
      <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
        <div className="flex flex-col gap-1.5 rounded-card border border-line bg-surface p-6">
          {space.map(([n, v]) => (
            <div key={n} className="grid grid-cols-[70px_44px_1fr] items-center gap-3 text-caption text-ink-3">
              <span className="mono">{n}</span>
              <span className="tabular-nums">{v}px</span>
              <i className="block h-3 max-w-full rounded-[2px] border border-accent bg-accent-soft" style={{ width: v * 2 }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(124px,1fr))] gap-3">
          {radii.map(([n, v, u, r]) => (
            <div key={n} className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
              <div className={cn("h-16 border-t-[1.5px] border-l-[1.5px] border-ink bg-sunken", r)} />
              <b className="text-control font-control">
                {n} <span className="font-normal text-ink-3 tabular-nums">{v}</span>
              </b>
              <span className="mono text-caption text-ink-2">--r-{n}</span>
              <span className="text-caption text-ink-3">{u}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-center gap-6 rounded-card border border-line bg-surface p-6 max-[860px]:grid-cols-1">
        <div>
          <b className="block text-body font-heading">Nested corners are concentric</b>
          <p className="m-0 mt-1 text-small text-pretty text-ink-2">
            Outer radius = inner radius + padding. An 8px control with a 4px inset holds 4px segments; a 16px frame with
            4px padding holds 12px cards. Equal radii on nested boxes make the inner corners look fat.
          </p>
        </div>
        <div aria-hidden className="flex flex-wrap items-center gap-4">
          <div className="flex gap-1 rounded-control border border-line-strong p-1">
            <span className="rounded-button bg-ink px-3 py-1 text-caption font-control text-on-ink">8 = 4 + 4</span>
            <span className="rounded-button px-3 py-1 text-caption text-ink-2">Off</span>
          </div>
          <div className="rounded-dialog border border-line-strong p-1">
            <div className="rounded-card border border-line bg-sunken px-4 py-3 text-caption text-ink-2">16 = 12 + 4</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* =========================================================
   Motion
   ========================================================= */

const CURVES: { token: string; use: string; dur: "instant" | "quick" | "settle"; color?: boolean }[] = [
  { token: "ease-out", use: "Entering and exiting: menus, tooltips, dialogs, toasts", dur: "quick" },
  { token: "ease-in-out", use: "Moving across the screen: tab ink, nav highlight, pills", dur: "settle" },
  { token: "ease-drawer", use: "Sheets sliding in from an edge", dur: "settle" },
  { token: "ease-hover", use: "Hover and color changes", dur: "instant", color: true },
  { token: "ease-spring", use: "Small arrivals with a little life: ticks, radio dots", dur: "quick" },
];

const DURATIONS: [string, string, string][] = [
  ["--d-instant", "90ms", "Hover, press, color"],
  ["--d-quick", "160ms", "Menus, tooltips, small travel; most exits"],
  ["--d-settle", "260ms", "Things that arrive: dialogs, panels, indicators"],
];

export function MotionSection() {
  const [go, setGo] = useState<Record<string, boolean>>({});
  const [last, setLast] = useState<string | null>(null);
  const state: Pairs = [
    ["last", last ? `"${last}"` : "none"],
    ...(last ? ([["duration", `--d-${CURVES.find((c) => c.token === last)!.dur}`]] as Pairs) : []),
  ];

  return (
    <Section
      id="motion"
      title="Motion"
      lede="Motion only answers something you did, and the more often you'll see it, the less there is: keyboard actions never animate, list navigation barely does, dialogs and sheets get a real entrance. Each curve has one job. Click a track to play it."
    >
      <Spec name="curves by job, durations, springs" state={state} layout="block" canvasClassName="px-6 py-8">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          {CURVES.map((c) => (
            <button
              key={c.token}
              type="button"
              aria-pressed={!!go[c.token]}
              onClick={() => {
                setGo((g) => ({ ...g, [c.token]: !g[c.token] }));
                setLast(c.token);
              }}
              className="flex cursor-pointer flex-col justify-start rounded-card border border-line bg-surface p-4 text-left transition-colors duration-instant ease-hover hover:border-line-strong"
            >
              <div className="relative mb-3 h-7 rounded-pill bg-sunken [container-type:inline-size]">
                <div
                  className={cn("absolute top-1 left-1 size-5 rounded-full", c.color ? (go[c.token] ? "bg-accent" : "bg-ink-3") : "bg-ink")}
                  style={
                    c.color
                      ? { transition: `background-color var(--d-${c.dur}) var(--${c.token})` }
                      : {
                          transform: go[c.token] ? "translateX(calc(100cqw - 28px))" : "none",
                          transition: `transform var(--d-${c.dur}) var(--${c.token})`,
                        }
                  }
                />
              </div>
              <b className="mono block text-caption font-control">{c.token}</b>
              <span className="mono text-caption text-ink-3">--d-{c.dur}</span>
              <span className="mt-1 block text-caption text-pretty text-ink-2">
                {c.use}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 max-[860px]:grid-cols-1">
          <dl className="m-0 grid grid-cols-[96px_52px_1fr] gap-x-3 gap-y-2 text-small">
            {DURATIONS.map(([t, v, u]) => (
              <Fragment key={t}>
                <dt className="mono text-ink">{t}</dt>
                <dd className="m-0 text-ink-3 tabular-nums">{v}</dd>
                <dd className="m-0 text-ink-2">{u}</dd>
              </Fragment>
            ))}
          </dl>
          <p className="m-0 text-small text-pretty text-ink-2">
            <b className="font-heading text-ink">Springs</b> are for things that glide between places and can be
            interrupted: <code className="text-caption">settle</code> (260ms, bounce .12) moves tab ink, nav highlights and
            pills; <code className="text-caption">snap</code> (160ms, bounce .2) moves the switch thumb. Both live in{" "}
            <code className="text-caption">src/lib/motion.ts</code>. Exits run faster than entrances, and nothing grows from
            less than 90% of its size.
          </p>
        </div>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Focus
   ========================================================= */

/** What a screen reader would call it, near enough for a readout. */
function focusName(el: HTMLElement) {
  const text = el.getAttribute("aria-label") ?? el.closest("label")?.textContent ?? el.textContent;
  return text?.replace(/\s+/g, " ").trim() || el.tagName.toLowerCase();
}

export function FocusSection() {
  const [focus, setFocus] = useState<{ name: string; ring: boolean } | null>(null);
  const state: Pairs = focus
    ? [["focused", `"${focus.name}"`], ["ring", focus.ring ? "on" : "off (pointer)"]]
    : [["focused", "null"]];

  return (
    <Section
      id="focus"
      title="Focus"
      lede="Keyboard focus is one plain ring: the focus color, drawn just inside the control's edge. It shows when you move with the keyboard, not when you click, and where the focused element is hidden or inset it goes on what you can see. Click into the canvas and press Tab."
    >
      <Spec name="focus ring" state={state}>
        <div
          className="flex flex-wrap items-center justify-center gap-4"
          onFocus={(e) => setFocus({ name: focusName(e.target), ring: e.target.matches(":focus-visible") })}
          onBlur={() => setFocus(null)}
        >
          <Button variant="primary">Save changes</Button>
          <Button variant="secondary">Preview</Button>
          <CheckboxChoice label="Notify me" defaultChecked />
          <Input aria-label="Commit message" placeholder="Commit message" className="w-[190px]" />
          <Input aria-label="Branch name" aria-invalid defaultValue="fix/ login" className="w-[150px]" />
        </div>
      </Spec>
      <div className="mt-4 grid grid-cols-3 gap-4 max-[860px]:grid-cols-1">
        {[
          ["Keyboard, not pointer", "The ring follows :focus-visible. Tab shows it; clicking a button doesn't. Text fields always show it, since focus there means you're about to type."],
          ["On what you can see", "A hidden or inset control (data-focus-proxy) hands the ring to the box around it (data-focus-target): the checkbox row, the radio card. Text fields wear the same ring, with their border turned the focus color beneath it. Other buttons inside keep their own ring."],
          ["Follows the state", "Invalid fields ring in the danger color. The Contrast theme thickens the ring to 3px (--focus-width)."],
        ].map(([t, d]) => (
          <Card key={t}>
            <CardBody>
              <CardTitle>{t}</CardTitle>
              <CardText className="mt-1.5">{d}</CardText>
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}
