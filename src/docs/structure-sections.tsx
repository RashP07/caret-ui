import {
  ArrowCounterClockwiseIcon,
  BookOpenIcon,
  CodeIcon,
  ColumnsIcon,
  DatabaseIcon,
  KeyIcon,
  LightningIcon,
  PlayIcon,
  PlusIcon,
  RobotIcon,
  RocketIcon,
  RowsIcon,
  StackIcon,
  TerminalIcon,
  TextAlignLeftIcon,
  TextBIcon,
  TextItalicIcon,
  WrenchIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { parseKeys } from "@/components/kbd";
import {
  Accordion,
  AccordionItem,
  Badge,
  Button,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  Kbd,
  Meter,
  NavigationMenu,
  NavigationMenuGroup,
  NavigationMenuLink,
  Progress,
  ScrollArea,
  Seg,
  Separator,
  Toggle,
  ToggleGroup,
  type NavigationLinkCard,
} from "@/components";
import { Section, Spec, type Pairs } from "./spec";

/* =========================================================
   Accordion
   ========================================================= */

export function AccordionSection() {
  const [mode, setMode] = useState<"single" | "multiple">("single");
  const [open, setOpen] = useState<string[]>(["billing"]);
  return (
    <Section
      id="accordion"
      title="Accordion"
      lede="Use an accordion for a stack of questions or settings groups that people open one or a few at a time. Each header is a button; the arrow turns, so you can see which rows are open."
    >
      <Spec
        name="single and multiple, disabled item"
        state={[["open", JSON.stringify(open)], ["mode", mode]]}
        layout="stack"
        canvasClassName="gap-5"
      >
        <Seg
          aria-label="Open rows"
          value={mode}
          onValueChange={(m) => {
            setMode(m);
            if (m === "single") setOpen((o) => o.slice(0, 1));
          }}
          options={[
            { value: "single", label: "One at a time" },
            { value: "multiple", label: "Several" },
          ]}
        />
        <Accordion className="max-w-[560px]" multiple={mode === "multiple"} value={open} onValueChange={(v) => setOpen(v as string[])}>
          <AccordionItem value="timeout" title="Why did my run stop after 15 minutes?">
            Runs that wait on a tool for more than 15 minutes are paused, not failed. Reply in the thread, or raise the
            limit in the agent's settings, and the run picks up where it left off.
          </AccordionItem>
          <AccordionItem value="billing" title="What counts as billed time?" meta="2 rules">
            Only active time: model calls and tool execution. Time spent waiting on you, on a schedule, or on a slow
            network isn't billed.
          </AccordionItem>
          <AccordionItem value="state" title="Can two agents share state?">
            Not directly. Give one agent a tool that reads the other's public API, so every read is explicit and
            shows up in the trace.
          </AccordionItem>
          <AccordionItem value="byo" title="Can I bring my own model?" meta="soon" disabled>
            Not yet.
          </AccordionItem>
        </Accordion>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Collapsible
   ========================================================= */

const ENV = [
  ["DATABASE_URL", "postgres://…/lunch"],
  ["SLACK_CHANNEL", "#office"],
  ["LUNCH_CUTOFF", "11:30"],
];

export function CollapsibleSection() {
  const [open, setOpen] = useState(false);
  return (
    <Section
      id="collapsible"
      title="Collapsible"
      lede="Use a collapsible for detail only some people need. The trigger says what's inside and how much, so opening it is never a gamble; the arrow turns and the panel grows to fit."
    >
      <Spec name="trigger with count, animated panel" state={[["open", String(open)], ["items", String(ENV.length)]]} layout="left">
        <div className="w-full max-w-[420px]">
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger meta={ENV.length}>Environment variables</CollapsibleTrigger>
            <CollapsiblePanel>
              <dl className="mono m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-control border border-line bg-sunken px-3 py-2.5 text-code">
                {ENV.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-ink-2">{k}</dt>
                    <dd className="m-0 truncate text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </CollapsiblePanel>
          </Collapsible>
        </div>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Separator
   ========================================================= */

export function SeparatorSection() {
  return (
    <Section
      id="separator"
      title="Separator"
      lede="Use a separator to divide regions of the same thing; screen readers hear it as a boundary. The dashed form separates what a thing is from what you can do with it."
    >
      <Spec name="horizontal, vertical, dashed" state={[["role", "separator"], ["orientations", "horizontal, vertical"]]} layout="stack">
        <div className="w-full max-w-[420px] rounded-card border border-line bg-surface">
          <div className="p-4">
            <div className="text-body font-heading">lunch-picker</div>
            <div className="mt-1 flex h-4 items-center gap-2.5 text-small text-ink-3">
              <span className="mono">main</span>
              <Separator orientation="vertical" />
              <span>3 files changed</span>
              <Separator orientation="vertical" />
              <span>2 minutes ago</span>
            </div>
          </div>
          <Separator />
          <div className="p-4 text-control text-ink-2">Collects votes each morning and announces the office lunch order at 11:30.</div>
          <Separator dashed />
          <div className="flex items-center gap-2 px-4 py-3">
            <Badge tone="ok" dot>
              Healthy
            </Badge>
          </div>
        </div>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Scroll area
   ========================================================= */

const LOG = Array.from({ length: 36 }, (_, i) => {
  const secs = i * 7;
  const t = `11:${String(30 + Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  const lines = [
    "schedule fired  chooseLunch",
    "read 9 votes from state",
    "tool call  menu-lookup  dosa-corner",
    "tool call  menu-lookup  green-bowl",
    "ranked 4 options by votes and distance",
    "wrote todaysRuling",
  ];
  return `${t}  ${lines[i % lines.length]}`;
});

export function ScrollAreaSection() {
  const [pos, setPos] = useState<Pairs>([["scrolled", "0%"], ["edge", "top"]]);
  return (
    <Section
      id="scroll-area"
      title="Scroll area"
      lede="Use a scroll area when a region scrolls inside the page. Scrolling stays native; the thin bars, drawn in line tokens, show whenever there's more to see. Focus the region to scroll with the keyboard."
    >
      <Spec name="vertical log, horizontal overflow" state={pos} canvasClassName="items-start gap-6">
        <ScrollArea
          aria-label="Run log"
          className="h-[220px] w-full max-w-[380px] rounded-control border border-line bg-sunken"
          contentClassName="mono pt-2 pr-5 pb-4 pl-3 text-code leading-6 whitespace-pre text-ink-2"
          onScroll={(e) => {
            const el = e.currentTarget;
            const max = el.scrollHeight - el.clientHeight;
            const pct = max > 0 ? Math.round((el.scrollTop / max) * 100) : 0;
            setPos([["scrolled", `${pct}%`], ["edge", pct === 0 ? "top" : pct === 100 ? "bottom" : "middle"]]);
          }}
        >
          {LOG.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </ScrollArea>
        <ScrollArea
          aria-label="Wide diff line"
          className="w-full max-w-[380px] rounded-control border border-line bg-surface"
          contentClassName="mono px-3 pt-2 pb-4 text-code leading-6 whitespace-pre text-ink"
        >
          {`+ const ruling = await agent.tools.menuLookup({ restaurants: votes.map((v) => v.restaurant), cutoff: env.LUNCH_CUTOFF });`}
        </ScrollArea>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Progress
   ========================================================= */

export function ProgressSection() {
  const [deploy, setDeploy] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => clearInterval(timer.current), []);

  function start() {
    clearInterval(timer.current);
    setDeploy(0);
    setRunning(true);
    timer.current = window.setInterval(() => {
      setDeploy((d) => {
        const next = Math.min(100, d + 7 + Math.round(Math.random() * 6));
        if (next >= 100) {
          clearInterval(timer.current);
          setRunning(false);
        }
        return next;
      });
    }, 260);
  }

  const status = deploy >= 100 ? "complete" : running ? "progressing" : deploy === 0 ? "idle" : "paused";

  return (
    <Section
      id="progress"
      title="Progress"
      lede="Use progress for work with an end. The label says what's happening and the value is printed beside it. When the total is unknown, the bar slides instead of faking a percentage."
    >
      <Spec name="determinate, indeterminate, failing" state={[["deploy", `${deploy}%`], ["status", status]]} layout="stack" canvasClassName="gap-6">
        <div className="flex w-full max-w-[340px] flex-col gap-3">
          <Progress
            label="Deploying lunch-picker"
            value={deploy}
            hint={deploy >= 100 ? "Live at /agents/lunch-picker." : running ? "Uploading bundle to 3 regions." : "Ready to deploy."}
          />
          <div className="flex gap-2">
            <Button variant="secondary" icon={deploy > 0 ? <ArrowCounterClockwiseIcon /> : <PlayIcon />} onClick={start} disabled={running}>
              {deploy > 0 ? "Deploy again" : "Deploy"}
            </Button>
          </div>
        </div>
        <Progress className="max-w-[340px]" label="Indexing repository" value={null} pendingText="1,284 files so far" hint="Counting files. The total appears once the scan finishes." />
        <Progress className="max-w-[340px]" label="Test suite" value={64} tone="danger" hint="3 tests failed in invoices.rs. The run continues." />
      </Spec>
    </Section>
  );
}

/* =========================================================
   Meter
   ========================================================= */

export function MeterSection() {
  const [calls, setCalls] = useState(62);
  const hot = calls >= 85;
  return (
    <Section
      id="meter"
      title="Meter"
      lede="Use a meter for a level in a known range: a quota, a budget, disk use. Nothing is finishing, so it isn't progress. At or past the threshold tick, the bar and value turn danger."
    >
      <Spec name="quota with threshold" state={[["calls", `${calls}%`], ["hot", String(hot)]]} layout="stack" canvasClassName="gap-6">
        <div className="flex w-full max-w-[340px] flex-col gap-3">
          <Meter
            label="Model calls this month"
            value={calls}
            valueText={(v) => `${Math.round(v * 50).toLocaleString("en-US")} / 5,000`}
            hint="Resets on the 1st."
            hotHint="Nearly out. New runs pause at 5,000 calls until the 1st."
          />
          <div className="flex gap-2">
            <Button variant="secondary" icon={<PlusIcon />} onClick={() => setCalls((c) => Math.min(100, c + 10))}>
              Use 500 calls
            </Button>
            <Button variant="ghost" onClick={() => setCalls(62)}>
              Reset
            </Button>
          </div>
        </div>
        <Meter className="max-w-[340px]" label="State storage" value={91} valueText={(v) => `${v} / 100 MB`} hotHint="Old run logs will be pruned first." />
      </Spec>
    </Section>
  );
}

/* =========================================================
   Toggle
   ========================================================= */

export function ToggleSection() {
  const [format, setFormat] = useState<string[]>(["bold"]);
  const [view, setView] = useState<string[]>(["split"]);
  const [wrap, setWrap] = useState(true);
  return (
    <Section
      id="toggle"
      title="Toggle"
      lede="Use a toggle for a button that stays pressed, like Bold. Pressed shows a darker face with a hairline edge, and assistive tech hears it as pressed. In a group, arrow keys move between toggles."
    >
      <Spec
        name="multiple, single, standalone"
        state={[["format", JSON.stringify(format)], ["view", view[0] ? `"${view[0]}"` : "null"], ["wrap", String(wrap)]]}
        canvasClassName="gap-8"
      >
        <ToggleGroup framed multiple aria-label="Text formatting" value={format} onValueChange={(v) => setFormat(v as string[])}>
          <Toggle value="bold" label="Bold" kbd="⌘ B" icon={<TextBIcon weight="bold" />} />
          <Toggle value="italic" label="Italic" kbd="⌘ I" icon={<TextItalicIcon />} />
          <Toggle value="code" label="Inline code" kbd="⌘ E" icon={<CodeIcon />} />
        </ToggleGroup>
        <ToggleGroup aria-label="Diff layout" value={view} onValueChange={(v) => setView(v as string[])}>
          <Toggle value="split" label="Split diff" icon={<ColumnsIcon />}>
            Split
          </Toggle>
          <Toggle value="unified" label="Unified diff" icon={<RowsIcon />}>
            Unified
          </Toggle>
        </ToggleGroup>
        <Toggle label="Wrap long lines" icon={<TextAlignLeftIcon />} pressed={wrap} onPressedChange={setWrap}>
          Wrap lines
        </Toggle>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Navigation menu
   ========================================================= */

const GUIDES: NavigationLinkCard[] = [
  { href: "#navigation-menu", title: "Quick start", description: "Deploy your first agent in five minutes.", icon: <RocketIcon /> },
  { href: "#navigation-menu", title: "Agents", description: "Schedules, state, and how runs resume.", icon: <RobotIcon /> },
  { href: "#navigation-menu", title: "Tools", description: "Give an agent a browser, a database, an inbox.", icon: <WrenchIcon /> },
  { href: "#navigation-menu", title: "Durable state", description: "What survives restarts and redeploys.", icon: <DatabaseIcon /> },
];
const REFERENCE: NavigationLinkCard[] = [
  { href: "#navigation-menu", title: "API", description: "Every endpoint, with examples.", icon: <LightningIcon /> },
  { href: "#navigation-menu", title: "CLI", description: "caret deploy, logs, and secrets.", icon: <TerminalIcon /> },
  { href: "#navigation-menu", title: "Secrets", description: "Store keys outside your code.", icon: <KeyIcon /> },
];

export function NavigationMenuSection() {
  const [open, setOpen] = useState<string | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const go = (link: NavigationLinkCard, e: React.MouseEvent) => {
    e.preventDefault();
    setLast(link.title);
  };
  return (
    <Section
      id="navigation-menu"
      title="Navigation menu"
      lede="Use a navigation menu for site navigation: top-level links, and sections that open a panel of link cards. Each card says where it goes before you go. Hover or click to open."
    >
      <Spec
        name="sections with link cards, plain link"
        state={[["open", open ? `"${open}"` : "null"], ["last", last ? `"${last}"` : "none"]]}
        canvasClassName="items-start min-h-[140px] overflow-x-auto justify-start"
      >
        <NavigationMenu aria-label="Docs" value={open} onValueChange={setOpen}>
          <NavigationMenuGroup value="guides" label="Guides" links={GUIDES} onNavigate={go} />
          <NavigationMenuGroup value="reference" label="Reference" links={REFERENCE} columns={1} onNavigate={go} />
          <NavigationMenuLink
            href="#navigation-menu"
            current={last === "Changelog"}
            onClick={(e) => {
              e.preventDefault();
              setLast("Changelog");
            }}
          >
            <StackIcon aria-hidden />
            Changelog
          </NavigationMenuLink>
          <NavigationMenuLink
            href="#navigation-menu"
            onClick={(e) => {
              e.preventDefault();
              setLast("Community");
            }}
          >
            <BookOpenIcon aria-hidden />
            Community
          </NavigationMenuLink>
        </NavigationMenu>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Kbd
   ========================================================= */

const SPOKEN_DEMO: Record<string, string> = { "⌘": "Command", "⇧": "Shift", "⌥": "Option", "↵": "Enter", "⌃": "Control" };

export function KbdSection() {
  const [last, setLast] = useState("⇧⌘Z");
  const spoken = parseKeys(last).map((k) => SPOKEN_DEMO[k] ?? k).join(" ");
  const chords = ["⌘K", "⌘ K", "⇧⌘Z", "⌥ Space", "Esc", "⌃ `"];
  return (
    <Section
      id="kbd"
      title="Kbd"
      lede="Use Kbd to print a shortcut, one cap per key. It takes any spelling, tints itself from the text around it, and tells screen readers the key names."
    >
      <Spec name="any spelling, one cap per key" state={[["keys", `"${last}"`], ["caps", JSON.stringify(parseKeys(last))], ["spoken", spoken]]} layout="stack" canvasClassName="gap-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {chords.map((c) => (
            <Button key={c} variant="ghost" size="sm" onClick={() => setLast(c)} className="font-normal">
              <code className="text-small text-ink-3">"{c}"</code>
              <Kbd keys={c} className="text-ink-2" />
            </Button>
          ))}
        </div>
      </Spec>
      <Spec name="on any surface, two sizes" state={[["color", "currentColor"], ["sizes", "default, sm"]]} layout="stack" canvasClassName="gap-6">
        <p className="m-0 text-body text-ink-2">
          Press <Kbd keys="⌘K" /> to search, or <Kbd keys="/" /> when you're not typing.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="primary" kbd="⌘↵">
            Deploy
          </Button>
          <Button variant="secondary" kbd="⌘R">
            Re-run
          </Button>
          <Button variant="danger" kbd="⌘⌫">
            Delete
          </Button>
          <Button variant="secondary" size="sm" kbd="⌘D">
            Duplicate
          </Button>
        </div>
        <div className="flex items-center gap-2 rounded-control bg-ink px-2.5 py-1.5 text-small font-control text-on-ink">
          Redo <Kbd keys="⇧⌘Z" size="sm" />
        </div>
      </Spec>
    </Section>
  );
}
