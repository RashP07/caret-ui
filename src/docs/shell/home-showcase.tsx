import {
  ArrowUpRightIcon,
  CheckIcon,
  LinkIcon,
  PlusIcon,
  RocketLaunchIcon,
  ShuffleIcon,
  TextBIcon,
  TextItalicIcon,
  TrashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccentPicker,
  Accordion,
  AccordionItem,
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  CheckboxChoice,
  Consequences,
  Field,
  IconButton,
  Input,
  Meter,
  Nested,
  NumberField,
  OTPField,
  Progress,
  RadioChoice,
  RadioGroup,
  Seg,
  Select,
  Slider,
  SwitchChoice,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TabList,
  TabPanel,
  Tabs,
  ThemeSwatch,
  toast,
  Toggle,
  ToggleGroup,
  type BadgeTone,
} from "@/components";
import { cn } from "@/lib/cn";
import { ACCENTS, THEME_INFO, THEMES, ThemeScope, type Accent, type PresetName, type ResolvedMode } from "@/lib/theme";
import { PAGES } from "../registry";
import { Corners, SHEET } from "./construction";
import { pageLink } from "./links";

/*
 * The showcase: the landing page's body is the components themselves. A bento of live, working
 * demos (every one is the real export, and each cell links to its page), under a bar that re-themes
 * the whole grid in place. Then a strip of the overlays, which can't sit live in a grid, as thumbnails.
 */

const page = (slug: string) => PAGES.find((p) => p.slug === slug)!;

/** One cell of the bento: the demo on the drafting ground, its name as a link underneath. */
function Cell({ slug, className, children }: { slug: string; className?: string; children: ReactNode }) {
  const p = page(slug);
  return (
    <div className={cn("relative flex min-w-0 flex-col bg-page shadow-[0_0_0_1px_var(--frame)]", className)}>
      <div className="flex min-h-[248px] flex-1 items-center justify-center p-8 @max-[559px]:p-4">
        {children}
      </div>
      <Link
        {...pageLink(p)}
        className="group flex h-10 items-center gap-2 border-t border-(--frame) bg-surface px-4 text-small text-ink-2 no-underline hover:bg-hover hover:text-ink"
      >
        <span className="font-control">{p.title}</span>
        <ArrowUpRightIcon
          size={14}
          aria-hidden
          className="ms-auto text-ink-3 transition-[translate,color] duration-settle ease-drawer group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
        />
      </Link>
    </div>
  );
}

/* ---------- the demos ---------- */

const TOOLS = ["Headless browser", "Vector search", "SQL database"];

/** Switches and a nested checkbox group: the parent box follows its children, and sets them all. */
function NotificationsDemo() {
  const [tools, setTools] = useState<string[]>(["Headless browser", "SQL database"]);
  const all = tools.length === TOOLS.length;
  return (
    <Card className="w-full max-w-[340px]">
      <CardBody className="flex flex-col gap-5">
        <div>
          <CardTitle>Notifications</CardTitle>
          <p className="m-0 mt-1 text-small text-ink-2">Where lunch-picker reports back.</p>
        </div>
        <div className="flex flex-col gap-1">
          <SwitchChoice label="Run finished" description="One message per run." defaultChecked />
          <SwitchChoice label="Run failed" description="Right away, with the log." defaultChecked />
          <SwitchChoice label="Weekly digest" description="Mondays at 9:00." />
        </div>
        <div className="flex flex-col gap-0.5 border-t border-line pt-4">
          <CheckboxChoice
            label="Tools it may use"
            checked={all}
            indeterminate={!all && tools.length > 0}
            onCheckedChange={() => setTools(all ? [] : TOOLS)}
          />
          <Nested>
            {TOOLS.map((t) => (
              <CheckboxChoice
                key={t}
                label={t}
                checked={tools.includes(t)}
                onCheckedChange={(on) => setTools((ts) => (on ? [...ts, t] : ts.filter((x) => x !== t)))}
              />
            ))}
          </Nested>
        </div>
      </CardBody>
    </Card>
  );
}

const REGIONS = [
  {
    options: [
      { value: "eu", label: "Frankfurt" },
      { value: "us", label: "Virginia" },
      { value: "ap", label: "Tokyo" },
    ],
  },
];

function SettingsDemo() {
  const [name, setName] = useState("ship-it");
  const [region, setRegion] = useState("eu");
  const [saving, setSaving] = useState(false);
  const valid = /^[a-z0-9-]+$/.test(name);
  function save() {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      toast("Settings saved", { tone: "success" });
    }, 900);
  }
  return (
    <Card className="w-full max-w-[340px]">
      <CardBody className="flex flex-col gap-4">
        <CardTitle>Settings</CardTitle>
        <Field label="Agent name" error={valid ? undefined : "Lowercase letters, numbers and dashes."}>
          <Input value={name} onChange={(e) => setName(e.target.value)} valid={valid} />
        </Field>
        <SwitchChoice label="Autodeploy" defaultChecked />
        <Select label="Region" value={region} onValueChange={setRegion} groups={REGIONS} />
        <Button variant="primary" loading={saving} disabled={!valid} onClick={save}>
          Save
        </Button>
      </CardBody>
    </Card>
  );
}

const AGENT = "lunch-picker";

/** The destructive confirm, drawn in place: typing the name unlocks the button. */
function DialogDemo() {
  const [typed, setTyped] = useState("");
  return (
    <div
      role="group"
      aria-labelledby="show-dlg-title"
      className="w-full max-w-[380px] overflow-hidden rounded-dialog bg-surface text-ink shadow-modal"
    >
      <div className="px-6 pt-6 pb-4">
        <div aria-hidden className="mb-4 grid size-9 place-items-center rounded-control bg-danger-soft text-danger">
          <WarningCircleIcon size={18} />
        </div>
        <p id="show-dlg-title" className="m-0 mb-1.5 text-title font-heading text-balance">
          Delete {AGENT}?
        </p>
        <p className="m-0 text-control text-pretty text-ink-2">This removes the agent and everything it remembers.</p>
      </div>
      <div className="px-6 pt-1 pb-5">
        <Consequences items={["212 past votes", "2 scheduled runs"]} />
        <Field
          label={
            <>
              Type <code className="rounded-inline bg-sunken px-1 py-px text-caption">{AGENT}</code> to confirm
            </>
          }
        >
          <Input value={typed} onValueChange={(v: string) => setTyped(v)} autoComplete="off" spellCheck={false} />
        </Field>
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-[color-mix(in_srgb,var(--sunken)_45%,var(--surface))] px-6 py-3">
        <Button variant="secondary" onClick={() => setTyped("")}>
          Keep
        </Button>
        <Button
          variant="danger"
          disabled={typed !== AGENT}
          onClick={() => {
            setTyped("");
            toast(`Deleted ${AGENT}`, { tone: "danger", action: { label: "Undo", onClick: () => {} } });
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

function ScheduleDemo() {
  return (
    <RadioGroup defaultValue="hour" className="w-full max-w-[320px]">
      <RadioChoice value="demand" label="On demand" description="Only when someone starts it." />
      <RadioChoice value="hour" label="Every hour" description="On the hour, around the clock." />
      <RadioChoice value="weekdays" label="Weekdays at 11:30" description="In the workspace time zone." />
    </RadioGroup>
  );
}

type Run = { name: string; tone: BadgeTone; status: string; secs: number };
const RUNS: Run[] = [
  { name: "lunch-picker", tone: "ok", status: "Ready", secs: 83 },
  { name: "invoices", tone: "live", status: "Building", secs: 0 },
  { name: "standup-notes", tone: "ok", status: "Ready", secs: 142 },
  { name: "pr-reviewer", tone: "danger", status: "Failed", secs: 12 },
];
const duration = (s: number) => (s ? `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s` : "—");

function TableDemo() {
  const [sort, setSort] = useState<"ascending" | "descending">("descending");
  const [selected, setSelected] = useState("standup-notes");
  const rows = [...RUNS].sort((a, b) => (sort === "ascending" ? a.secs - b.secs : b.secs - a.secs));
  return (
    <Table className="w-full max-w-[560px]">
      <TableHeader>
        <TableRow>
          <TableHead>Agent</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="end" sort={sort} onSort={() => setSort((s) => (s === "ascending" ? "descending" : "ascending"))}>
            Duration
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.name} selected={r.name === selected} onClick={() => setSelected(r.name)}>
            <TableCell className="font-control">{r.name}</TableCell>
            <TableCell>
              <Badge tone={r.tone} dot>
                {r.status}
              </Badge>
            </TableCell>
            <TableCell numeric>{duration(r.secs)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BudgetDemo() {
  const [budget, setBudget] = useState(120);
  const [retries, setRetries] = useState<number | null>(3);
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-6">
      <Slider
        label="Monthly budget"
        value={budget}
        onValueChange={setBudget}
        min={0}
        max={400}
        step={10}
        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      />
      <NumberField label="Retries" value={retries} onValueChange={setRetries} min={0} max={10} className="w-[150px]" />
    </div>
  );
}

function ButtonsDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="primary" kbd="⌘↵" onClick={() => toast("Deploy started")}>
          Deploy
        </Button>
        <Button variant="secondary">Open logs</Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="accent" icon={<CheckIcon />}>
          Approve
        </Button>
        <IconButton variant="danger" label="Delete" icon={<TrashIcon />} />
        <IconButton variant="secondary" label="Add tool" icon={<PlusIcon />} />
      </div>
      <ToggleGroup framed multiple defaultValue={["bold"]} aria-label="Format">
        <Toggle value="bold" label="Bold" icon={<TextBIcon />} />
        <Toggle value="italic" label="Italic" icon={<TextItalicIcon />} />
        <Toggle value="link" label="Link" icon={<LinkIcon />} />
      </ToggleGroup>
    </div>
  );
}

function OtpDemo() {
  const [code, setCode] = useState("48");
  const done = code.length === 6;
  return (
    <OTPField
      label="Verification code"
      value={code}
      onValueChange={setCode}
      hint={done ? "Verified. You're in." : "We sent a 6-digit code to priya@studio.dev."}
    />
  );
}

function DeployDemo() {
  // At rest it shows the last deploy, finished; Deploy again runs a fresh one from 0.
  const [value, setValue] = useState(100);
  const [running, setRunning] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearInterval(timer.current), []);
  function deploy() {
    clearInterval(timer.current);
    setValue(0);
    setRunning(true);
    timer.current = window.setInterval(() => {
      setValue((v) => {
        const next = Math.min(100, v + 6 + Math.round(Math.random() * 8));
        if (next >= 100) {
          clearInterval(timer.current);
          setRunning(false);
        }
        return next;
      });
    }, 140);
  }
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-5">
      <Progress
        label={running ? "Deploying lunch-picker" : "Deployed lunch-picker"}
        value={value}
        hint={running ? "Uploading the bundle." : "Live on lunch.studio.dev."}
      />
      <Meter label="Model calls" value={3100} max={5000} valueText={(v) => `${v.toLocaleString()} / 5,000`} />
      <Button size="sm" icon={<RocketLaunchIcon />} onClick={deploy} disabled={running} className="self-start">
        Deploy again
      </Button>
    </div>
  );
}

function TabsDemo() {
  return (
    <Tabs defaultValue="logs" className="w-full max-w-[560px]">
      <TabList aria-label="Run details">
        <Tab value="overview">Overview</Tab>
        <Tab value="logs" count={3}>
          Logs
        </Tab>
        <Tab value="changes" count={2}>
          Changes
        </Tab>
      </TabList>
      <TabPanel value="overview" className="min-h-[104px] text-control text-ink-2">
        Picks lunch every weekday at 11:30 from the team's votes, then posts the winner to #office.
      </TabPanel>
      <TabPanel value="logs" className="min-h-[104px]">
        <div className="mono text-code leading-6 text-ink-2">
          <div>
            <span className="text-ink-3">11:30:00</span> schedule fired
          </div>
          <div>
            <span className="text-ink-3">11:30:02</span> <span className="text-danger">tool timeout</span> retrying
          </div>
          <div>
            <span className="text-ink-3">11:30:04</span> <span className="text-success">ok</span> winner: Dosa Corner
          </div>
        </div>
      </TabPanel>
      <TabPanel value="changes" className="min-h-[104px]">
        <div className="mono overflow-hidden rounded-control border border-line text-code leading-6">
          <div className="bg-danger-soft px-3 text-ink-2">− const hour = 12;</div>
          <div className="bg-success-soft px-3">+ const hour = 11.5;</div>
        </div>
      </TabPanel>
    </Tabs>
  );
}

function AccordionDemo() {
  return (
    <Accordion defaultValue={["billing"]} className="w-full max-w-[320px]">
      <AccordionItem value="stop" title="Why did my run stop?">
        Runs stop after 15 minutes of activity.
      </AccordionItem>
      <AccordionItem value="billing" title="What counts as billed time?">
        Only active time: model calls and tools.
      </AccordionItem>
      <AccordionItem value="state" title="Can agents share state?">
        Yes, through a shared store.
      </AccordionItem>
    </Accordion>
  );
}

/* ---------- the theme bar ---------- */

const THEME_GROUPS = [{ options: THEMES.map((t) => ({ value: t, label: THEME_INFO[t].label })) }];
const pick = <T,>(xs: readonly T[], not?: T) => {
  const pool = xs.filter((x) => x !== not);
  return pool[Math.floor(Math.random() * pool.length)];
};

/**
 * The bento as one specimen frame of 3 / 2 / 1 columns, by the width of the column it sits in (it
 * shares the docs frame with the sidebar, so the window's width says little). Cells share their
 * edges (1px spread shadows over 1px gaps); every layout fills its last row, so the frame is a
 * rectangle and its four outer corners carry the Nodes.
 */
const GRID = "relative grid grid-flow-dense grid-cols-1 gap-px @min-[560px]:grid-cols-2 @min-[960px]:grid-cols-3";
const TALL = "@min-[560px]:row-span-2";
const WIDE = "@min-[560px]:col-span-2";
/** Fills the last row of the 2-column grid, which would otherwise end on a hole. */
const WIDE_AT_2 = "@min-[560px]:col-span-2 @min-[960px]:col-span-1";

export function Showcase() {
  const [theme, setTheme] = useState<PresetName>("neutral");
  const [accent, setAccent] = useState<Accent>("default");
  const [mode, setMode] = useState<ResolvedMode | "auto">("auto");
  const touched = theme !== "neutral" || accent !== "default" || mode !== "auto";

  return (
    <section aria-labelledby="h-showcase" className="@container relative flex flex-col gap-4">
      <h2 id="h-showcase" className="sr-only-caret">
        Live components
      </h2>
      {/* Make it yours: re-themes the grid below, not the page. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Select
          label="Theme"
          hideLabel
          value={theme}
          onValueChange={setTheme}
          groups={THEME_GROUPS}
          lead={<ThemeSwatch theme={theme} />}
          className="w-[168px]"
        />
        <AccentPicker value={accent} onValueChange={setAccent} theme={theme} className="@max-[559px]:hidden" />
        <div className="ms-auto flex items-center gap-2">
          <Seg<ResolvedMode | "auto">
            aria-label="Mode"
            value={mode}
            onValueChange={setMode}
            options={[
              { value: "auto", label: "Auto" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
          <Button
            icon={<ShuffleIcon />}
            onClick={() => {
              setTheme(pick(THEMES, theme));
              setAccent(pick(ACCENTS, accent));
            }}
          >
            Shuffle
          </Button>
          {touched && (
            <Button
              variant="ghost"
              onClick={() => {
                setTheme("neutral");
                setAccent("default");
                setMode("auto");
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <ThemeScope
        theme={theme}
        mode={mode === "auto" ? undefined : mode}
        data-accent={accent === "default" ? undefined : accent}
        // --rule resolves where it's declared, so the sheet's line colour is declared again inside the scope.
        style={SHEET}
        className="text-ink"
      >
        <div className={GRID}>
          <Corners />
          <Cell slug="checkbox" className={TALL}>
            <NotificationsDemo />
          </Cell>
          <Cell slug="form">
            <SettingsDemo />
          </Cell>
          <Cell slug="dialog" className={TALL}>
            <DialogDemo />
          </Cell>
          <Cell slug="radio">
            <ScheduleDemo />
          </Cell>
          <Cell slug="table" className={WIDE}>
            <TableDemo />
          </Cell>
          <Cell slug="slider">
            <BudgetDemo />
          </Cell>
          <Cell slug="button">
            <ButtonsDemo />
          </Cell>
          <Cell slug="otp-field">
            <OtpDemo />
          </Cell>
          <Cell slug="progress">
            <DeployDemo />
          </Cell>
          <Cell slug="tabs" className={WIDE}>
            <TabsDemo />
          </Cell>
          <Cell slug="accordion" className={WIDE_AT_2}>
            <AccordionDemo />
          </Cell>
        </div>
      </ThemeScope>
    </section>
  );
}
