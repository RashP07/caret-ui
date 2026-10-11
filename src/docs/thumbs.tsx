import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  CaretRightIcon,
  CheckIcon,
  CopyIcon,
  FileIcon,
  FolderIcon,
  GearIcon,
  GitBranchIcon,
  LightningIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PlusIcon,
  RobotIcon,
  TextBIcon,
  TextItalicIcon,
  TrashIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  CardFoot,
  CardHead,
  CardIcon,
  CardSub,
  CardText,
  CardTitle,
  CheckboxChoice,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  ContextMeter,
  Crumbs,
  Diffstat,
  Field,
  Hint,
  IconButton,
  Input,
  Kbd,
  KeyValue,
  KeyValueItem,
  Link,
  LogStream,
  NavLinks,
  Meter,
  MsgAgent,
  MsgUser,
  NavItem,
  NumberField,
  OTPField,
  Progress,
  RadioChoice,
  RadioGroup,
  ScrollArea,
  Select,
  Separator,
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
  Textarea,
  ThemeSwatch,
  Threads,
  Timeline,
  TimelineItem,
  Toggle,
  ToggleGroup,
} from "@/components";
import { floatingArrowClass, floatingPanelClass } from "@/components/popover";
import { actionMenuItemClass, actionMenuPopupClass } from "@/components/menu";
import { menuDescriptionClass, menuItemClass, menuMetaClass, menuPopupClass, selectedTickClass } from "@/components/select";
import { cn } from "@/lib/cn";
import { THEMES, ThemeScope } from "@/lib/theme";

/*
 * Index-card thumbnails. Each is a small, inert, live preview of its page,
 * built from real Caret components (or, where the real thing would portal,
 * static markup reusing the component's exported classes). Content is laid
 * out on a 420×252 artboard and scaled to .7, so it fits a ~300×180 stage.
 * The card supplies the stage (bg-page) and `inert`.
 */

const noop = () => {};

/** Design artboard: 420×252, scaled to 294×176. */
function Artboard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div aria-hidden className="relative h-[176px] w-[294px] overflow-hidden">
      {/* 420×252 at .7 from the top-left corner is exactly 294×176. */}
      <div className={cn("absolute top-0 left-0 flex h-[252px] w-[420px] origin-top-left scale-[.7] items-center justify-center", className)}>
        {children}
      </div>
    </div>
  );
}

/** A static menu row (select-style). */
function StaticOption({ label, description, meta, selected, highlighted }: { label: string; description?: string; meta?: string; selected?: boolean; highlighted?: boolean }) {
  return (
    <div className={menuItemClass} data-selected={selected ? "" : undefined} data-highlighted={highlighted ? "" : undefined}>
      <span className="min-w-0">
        <span className="flex min-w-0 items-baseline gap-1.5">
          <span className="min-w-0 overflow-x-clip text-ellipsis whitespace-nowrap font-control">{label}</span>
          {meta && <span className={cn(menuMetaClass, "flex-none")}>{meta}</span>}
        </span>
        {description && <span className={menuDescriptionClass}>{description}</span>}
      </span>
      <span />
      <CheckIcon className={selectedTickClass} />
    </div>
  );
}

/** A static action-menu row. */
function StaticAction({ icon, label, kbd, highlighted, danger }: { icon?: ReactNode; label: string; kbd?: string; highlighted?: boolean; danger?: boolean }) {
  return (
    <div
      className={cn(actionMenuItemClass, danger && "text-danger [&_[data-menu-icon]]:text-danger")}
      data-highlighted={highlighted ? "" : undefined}
    >
      {icon && (
        <span data-menu-icon className="flex w-4 flex-none items-center justify-center">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {/* Shortcuts print as key caps, like MenuItem; plain meta (a group name) stays text. */}
      {kbd &&
        (/[⌘⌥⇧⌃↵↑↓←→]/.test(kbd) || kbd.length <= 2 ? (
          <Kbd keys={kbd} size="sm" className="ml-4 text-ink-3" />
        ) : (
          <span className="ml-4 flex-none text-caption text-ink-3">{kbd}</span>
        ))}
    </div>
  );
}

/** A static tooltip bubble with its arrow pointing down. */
function StaticTip({ label, kbd }: { label: string; kbd?: string }) {
  return (
    <div className="relative flex items-center gap-2 rounded-control bg-ink px-2.5 py-1.5 text-small leading-4.5 font-control text-on-ink">
      <span>{label}</span>
      {kbd && <Kbd keys={kbd} size="sm" />}
      <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 rounded-[1px] bg-ink" />
    </div>
  );
}

/* ---------- foundations ---------- */

function ColorThumb() {
  const cols = [
    ["bg-page", "bg-surface", "bg-sunken"],
    ["bg-ink", "bg-ink-2", "bg-ink-3"],
    ["bg-line", "bg-line-strong", "bg-hover"],
    ["bg-accent", "bg-accent-soft", "bg-on-accent"],
    ["bg-danger", "bg-danger-soft", "bg-surface"],
    ["bg-success", "bg-success-soft", "bg-surface"],
  ];
  return (
    <Artboard>
      <div className="flex gap-3">
        {cols.map((c, i) => (
          <div key={i} className="flex w-12 flex-col overflow-hidden rounded-card border border-line">
            {c.map((b) => (
              <span key={b} className={cn("h-14 border-b border-line last:border-b-0", b)} />
            ))}
          </div>
        ))}
      </div>
    </Artboard>
  );
}

function ThemesThumb() {
  return (
    <Artboard>
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((t) => (
          <ThemeScope key={t} theme={t} className="flex w-[132px] flex-col gap-2 rounded-card border border-line-strong bg-page p-3 text-ink">
            <span className="flex items-center justify-between text-small font-heading capitalize">
              {t}
              <ThemeSwatch theme={t} form="pair" />
            </span>
            <span className="h-1.5 w-3/4 rounded-[3px] bg-line" />
            <span className="h-1.5 w-1/2 rounded-[3px] bg-accent" />
          </ThemeScope>
        ))}
      </div>
    </Artboard>
  );
}

function TypographyThumb() {
  return (
    <Artboard className="justify-start px-10">
      <div className="flex items-end gap-8">
        <span className="text-display leading-[.85] font-heading">Aa</span>
        <div className="flex flex-col gap-1.5 pb-2">
          <span className="text-h2 font-heading">Scheduled runs</span>
          <span className="text-title font-heading">Connected tools</span>
          <span className="text-body text-ink-2">Keeps its state between runs.</span>
          <span className="mono text-code text-ink-3">--s-4: 16px; ⌘K</span>
        </div>
      </div>
    </Artboard>
  );
}

function SpaceThumb() {
  const steps = [4, 8, 12, 16, 24, 32, 48];
  const radii = ["rounded-tl-inline", "rounded-tl-control", "rounded-tl-card", "rounded-tl-dialog"];
  return (
    <Artboard className="gap-10">
      <div className="flex flex-col gap-2">
        {steps.map((s) => (
          <span key={s} className="flex items-center gap-2">
            <span className="w-8 text-right text-caption text-ink-3 tabular-nums">{s}</span>
            <i className="block h-3 rounded-[2px] border border-accent bg-accent-soft" style={{ width: s * 2.4 }} />
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {radii.map((r) => (
          <span key={r} className={cn("size-16 border-t-2 border-l-2 border-ink bg-sunken", r)} />
        ))}
      </div>
    </Artboard>
  );
}

function MotionThumb() {
  // cubic-bezier curves drawn on a 100×100 box (y flipped).
  const curves: [string, string][] = [
    ["ease-out", "M0 100 C23 0 32 0 100 0"],
    ["ease-in-out", "M0 100 C77 100 17.5 0 100 0"],
    ["ease-spring", "M0 100 C34 -40 50 0 100 0"],
  ];
  return (
    <Artboard className="gap-4">
      {curves.map(([name, d]) => (
        <div key={name} className="flex w-[118px] flex-col gap-2 rounded-card border border-line bg-surface p-3">
          <svg viewBox="-6 -46 112 152" className="h-[88px] w-full overflow-visible">
            <path d="M0 100 H100 M0 100 V0" stroke="var(--line)" strokeWidth="1.5" fill="none" />
            <path d={d} stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="0" r="5" fill="var(--accent)" />
          </svg>
          <span className="mono text-caption text-ink-2">{name}</span>
        </div>
      ))}
    </Artboard>
  );
}

function FocusThumb() {
  return (
    <Artboard className="flex-col gap-4">
      {/* A static ring, as :focus-visible draws it (the card is inert, so it can't really focus). */}
      <Button variant="secondary" className="outline-(length:--focus-width) outline-offset-[calc(-1*var(--focus-width))] outline-focus">
        Save changes
      </Button>
    </Artboard>
  );
}

/* ---------- actions ---------- */

function ButtonThumb() {
  return (
    <Artboard className="flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="primary" kbd="⌘↵">
          Deploy agent
        </Button>
        <Button variant="secondary">Open logs</Button>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="accent" icon={<CheckIcon />}>
          Approve
        </Button>
        <Button variant="danger" icon={<TrashIcon />}>
          Delete
        </Button>
        <IconButton variant="secondary" label="Add tool" icon={<PlusIcon />} />
      </div>
    </Artboard>
  );
}

function ToggleThumb() {
  return (
    <Artboard className="flex-col gap-4">
      <ToggleGroup framed multiple defaultValue={["bold"]} aria-label="Format">
        <Toggle value="bold" label="Bold" icon={<TextBIcon />} />
        <Toggle value="italic" label="Italic" icon={<TextItalicIcon />} />
        <Toggle value="link" label="Link" icon={<LinkIcon />} />
      </ToggleGroup>
      <Toggle label="Wrap long lines" defaultPressed>
        Wrap lines
      </Toggle>
    </Artboard>
  );
}

/* ---------- inputs ---------- */

function InputThumb() {
  return (
    <Artboard className="flex-col items-stretch gap-4 px-12">
      <Field label="Agent name" count="12/32" hint="Lowercase letters, numbers and dashes." className="max-w-none">
        <Input defaultValue="lunch-picker" valid />
      </Field>
      <Input lead={<MagnifyingGlassIcon />} trail={<Kbd keys="/" />} placeholder="Filter by name or status" aria-label="Search runs" />
    </Artboard>
  );
}

function SelectThumb() {
  return (
    <Artboard className="flex-col items-stretch gap-1.5 px-14">
      <Select
        label="Model"
        hideLabel
        value="Balanced"
        onValueChange={noop}
        showMeta
        className="max-w-none"
        groups={[{ options: [{ value: "Balanced", label: "Balanced", meta: "mid" }] }]}
      />
      <div className={cn(menuPopupClass, "min-w-0")}>
        <StaticOption label="Quick" description="Short replies, lowest cost." meta="fast" />
        <StaticOption label="Balanced" description="Plans before acting." meta="mid" selected highlighted />
        <StaticOption label="Thorough" meta="deep" />
      </div>
    </Artboard>
  );
}

function ComboboxThumb() {
  return (
    <Artboard className="flex-col items-stretch gap-1.5 px-14">
      <div className="flex h-9 items-center gap-1.5 rounded-control border border-ink bg-surface px-2">
        <Badge>Headless browser</Badge>
        <Badge>GitHub</Badge>
        <span className="text-control text-ink">sq</span>
        <span className="h-4 w-px animate-blink bg-caret" />
        <CaretDownIcon className="ml-auto text-ink-3" />
      </div>
      <div className={cn(menuPopupClass, "min-w-0")}>
        <StaticOption label="SQL database" description="Read and write structured records." highlighted />
        <StaticOption label="Postgres (read-only)" meta="db" />
      </div>
    </Artboard>
  );
}

function AutocompleteThumb() {
  return (
    <Artboard className="flex-col items-stretch gap-1.5 px-14">
      <div className="flex h-9 items-center gap-2 rounded-control border border-ink bg-surface px-3 text-control">
        <GitBranchIcon className="text-ink-3" />
        feat/
        <span className="-ml-2 h-4 w-px animate-blink bg-caret" />
      </div>
      <div className={cn(menuPopupClass, "min-w-0")}>
        <div className={cn(menuItemClass, "grid-cols-[1fr_auto]")} data-highlighted="">
          <span className="font-control">feat/theme-toggle</span>
          <span className={menuMetaClass}>+4</span>
        </div>
        <div className={cn(menuItemClass, "grid-cols-[1fr_auto]")}>
          <span className="font-control">feat/menubar-glide</span>
          <span className={menuMetaClass}>+2</span>
        </div>
      </div>
    </Artboard>
  );
}

function RadioThumb() {
  return (
    <Artboard className="justify-start px-14">
      <RadioGroup defaultValue="hour">
        <RadioChoice value="demand" label="On demand" description="Only when someone starts it." />
        <RadioChoice value="hour" label="Every hour" description="On the hour, around the clock." />
        <RadioChoice value="weekdays" label="Weekdays at 11:30" description="In the workspace time zone." />
      </RadioGroup>
    </Artboard>
  );
}

function CheckboxThumb() {
  return (
    <Artboard className="justify-start px-14">
      <div className="flex flex-col gap-0.5">
        <CheckboxChoice label="All tools" indeterminate />
        <div className="ml-7 flex flex-col gap-0.5 border-l border-line pl-2.5">
          <CheckboxChoice label="Headless browser" defaultChecked />
          <CheckboxChoice label="Vector search" />
          <CheckboxChoice label="SQL database" defaultChecked />
        </div>
      </div>
    </Artboard>
  );
}

function SwitchThumb() {
  return (
    <Artboard className="px-10">
      <div className="flex w-full flex-col gap-1">
        <SwitchChoice label="Run on every push" description="Starts a run when main changes." defaultChecked />
        <SwitchChoice label="Post results to #office" description="One message per run." />
      </div>
    </Artboard>
  );
}

function SliderThumb() {
  return (
    <Artboard className="flex-col items-stretch gap-6 px-12">
      <Slider label="Monthly budget" value={120} onValueChange={noop} min={0} max={400} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
      <Slider label="Quiet hours" value={[22, 30]} onValueChange={noop} min={12} max={36} renderValue={() => "22:00 – 06:00"} thumbLabels={["Start", "End"]} />
    </Artboard>
  );
}

function NumberFieldThumb() {
  return (
    <Artboard className="gap-4">
      <NumberField label="Retries" value={3} onValueChange={noop} min={0} max={10} className="w-[150px]" />
      <NumberField label="Timeout" value={15} onValueChange={noop} format={{ style: "unit", unit: "minute" }} className="w-[150px]" />
    </Artboard>
  );
}

function OtpFieldThumb() {
  return (
    <Artboard>
      <OTPField label="Verification code" value="4829" onValueChange={noop} hint="We sent a 6-digit code to priya@studio.dev." />
    </Artboard>
  );
}

function FormThumb() {
  return (
    <Artboard className="flex-col items-stretch gap-3 px-14">
      <Field label="Run name" error="Use lowercase letters, numbers and dashes." className="max-w-none">
        <Input defaultValue="Nightly Report" aria-invalid />
      </Field>
      <div className="flex justify-end gap-2 border-t border-dashed border-line-strong pt-3">
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary" kbd="↵">
          Schedule run
        </Button>
      </div>
    </Artboard>
  );
}

/* ---------- overlays ---------- */

function CommandPaletteThumb() {
  return (
    <Artboard className="px-10">
      <div className="w-full overflow-hidden rounded-dialog border border-line bg-surface shadow-modal">
        <div className="flex h-11 items-center gap-2 border-b border-line px-3 text-control">
          <MagnifyingGlassIcon className="text-ink-3" />
          but
          <span className="-ml-1.5 h-4 w-px animate-blink bg-caret" />
          <Kbd keys="Esc" className="ml-auto" />
        </div>
        <div className="p-1">
          <StaticAction label="Button" kbd="Actions" highlighted />
          <StaticAction label="Button group" kbd="Actions" />
          <StaticAction label="Toggle" kbd="Actions" />
        </div>
      </div>
    </Artboard>
  );
}

function TooltipThumb() {
  return (
    <Artboard className="flex-col gap-3">
      <div className="translate-x-[-34px]">
        <StaticTip label="Redo" kbd="⇧ ⌘ Z" />
      </div>
      <div className="inline-flex gap-0.5 rounded-control border border-line bg-surface p-[3px]">
        <IconButton label="Undo" icon={<ArrowCounterClockwiseIcon />} />
        <IconButton label="Redo" icon={<ArrowClockwiseIcon />} aria-pressed />
        <span className="mx-[3px] my-1 w-px bg-line" />
        <IconButton label="Copy link" icon={<LinkIcon />} />
        <IconButton label="Settings" icon={<GearIcon />} />
      </div>
    </Artboard>
  );
}

function PopoverThumb() {
  return (
    <Artboard className="flex-col gap-3">
      <div className={cn(floatingPanelClass, "relative w-[260px] p-4")}>
        <div className="text-control font-heading">Next run</div>
        <p className="m-0 mt-1 text-small text-ink-2">Weekdays at 11:30, in the workspace time zone.</p>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" icon={<PlayIcon />}>
            Run now
          </Button>
        </div>
        <span className={cn(floatingArrowClass, "absolute -bottom-[5px] left-1/2 -translate-x-1/2")} data-side="top" />
      </div>
      <Button variant="secondary">Next run</Button>
    </Artboard>
  );
}

function PreviewCardThumb() {
  return (
    <Artboard className="flex-col gap-3">
      <Card className="w-[250px] shadow-float">
        <CardBody className="p-4">
          <CardHead className="mb-2">
            <CardIcon>
              <PlayIcon />
            </CardIcon>
            <div>
              <CardTitle>Run #482</CardTitle>
              <CardSub>fixed flaky test · 2m 41s</CardSub>
            </div>
          </CardHead>
          <Badge tone="ok" dot>
            Passed
          </Badge>
        </CardBody>
      </Card>
      <p className="m-0 text-control text-ink-2">
        Fixed in <span className="border-b border-ink text-ink">run #482</span>, reviewed by @priya.
      </p>
    </Artboard>
  );
}

function MenuThumb() {
  return (
    <Artboard className="flex-col items-start gap-1.5 px-20">
      <Button variant="secondary" trail={<CaretDownIcon size={14} className="text-ink-3" />}>
        Run actions
      </Button>
      <div className={cn(actionMenuPopupClass, "w-[240px]")}>
        <StaticAction icon={<ArrowClockwiseIcon />} label="Re-run" kbd="⌘ R" highlighted />
        <StaticAction icon={<LinkIcon />} label="Copy link" kbd="⌘ L" />
        <div className="-mx-1 my-1 h-px bg-line" />
        <StaticAction icon={<TrashIcon />} label="Delete run" danger />
      </div>
    </Artboard>
  );
}

function ContextMenuThumb() {
  return (
    <Artboard className="items-start justify-start gap-0 px-8 pt-10">
      <div className="flex w-[180px] flex-none flex-col gap-px rounded-card border border-dashed border-line-strong p-2">
        <NavItem icon={<FileIcon />} path="src/theme-toggle.tsx" current />
        <NavItem icon={<FileIcon />} path="src/tokens.css" />
      </div>
      <div className={cn(actionMenuPopupClass, "mt-8 -ml-8 w-[200px] min-w-0 flex-none")}>
        <StaticAction label="Open file" kbd="↵" highlighted />
        <StaticAction label="Copy path" kbd="⌥ ⌘ C" />
        <StaticAction label="Discard changes" danger />
      </div>
    </Artboard>
  );
}

function MenubarThumb() {
  return (
    <Artboard className="flex-col items-start gap-1.5 px-20">
      <div className="inline-flex items-center gap-0.5 rounded-control border border-line bg-surface p-1 text-small font-control text-ink-2">
        <span className="px-2.5 py-1.5">File</span>
        <span className="rounded-button bg-pressed px-2.5 py-1.5 text-ink">Edit</span>
        <span className="px-2.5 py-1.5">View</span>
        <span className="px-2.5 py-1.5">Run</span>
      </div>
      <div className={cn(actionMenuPopupClass, "ml-10 w-[220px]")}>
        <StaticAction label="Undo" kbd="⌘ Z" highlighted />
        <StaticAction label="Redo" kbd="⇧ ⌘ Z" />
        <div className="-mx-1 my-1 h-px bg-line" />
        <StaticAction label="Find in thread" kbd="⌘ F" />
      </div>
    </Artboard>
  );
}

function DialogThumb() {
  return (
    <Artboard className="bg-scrim">
      <div className="w-[320px] overflow-hidden rounded-dialog bg-surface shadow-modal">
        <div className="flex gap-3 px-5 pt-5 pb-4">
          <div className="grid size-8 flex-none place-items-center rounded-control bg-danger-soft text-danger">
            <WarningCircleIcon />
          </div>
          <div>
            <div className="text-title font-heading">Delete lunch-picker?</div>
            <p className="m-0 mt-1 text-small text-ink-2">Removes the agent and all it remembers.</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-line bg-[color-mix(in_srgb,var(--sunken)_45%,var(--surface))] px-5 py-3">
          <Button variant="secondary">Keep agent</Button>
          <Button variant="danger">Delete lunch-picker</Button>
        </div>
      </div>
    </Artboard>
  );
}

function DrawerThumb() {
  return (
    <Artboard className="justify-end bg-scrim p-0">
      <div className="flex h-full w-[220px] flex-col gap-3 rounded-l-dialog bg-surface p-4 shadow-modal">
        <div className="flex items-center justify-between">
          <span className="text-subtitle font-heading">Run details</span>
          <XIcon className="text-ink-3" />
        </div>
        <Badge tone="live" dot className="self-start">
          Running
        </Badge>
        <Progress label="Test suite" value={64} />
        <Hint>Started by you, 4 minutes ago.</Hint>
      </div>
    </Artboard>
  );
}

/* ---------- structure ---------- */

function CardThumb() {
  return (
    <Artboard>
      <Card className="w-[300px]">
        <CardBody className="p-5">
          <CardHead>
            <CardIcon>
              <LightningIcon />
            </CardIcon>
            <div>
              <CardTitle>lunch-picker</CardTitle>
              <CardSub>3 tools · 2 schedules</CardSub>
            </div>
          </CardHead>
          <CardText>Collects votes each morning and announces the order at 11:30.</CardText>
        </CardBody>
        <CardFoot>
          <Badge tone="ok" dot>
            Healthy
          </Badge>
          <div className="flex-1" />
          <IconButton label="Settings" icon={<GearIcon />} />
        </CardFoot>
      </Card>
    </Artboard>
  );
}

function TableThumb() {
  const rows: [string, "ok" | "live" | "danger", string, string][] = [
    ["lunch-picker", "ok", "Ready", "1m 23s"],
    ["invoices", "live", "Building", "—"],
    ["standup-notes", "ok", "Ready", "2m 22s"],
    ["pr-reviewer", "danger", "Failed", "12s"],
  ];
  return (
    <Artboard>
      <Table className="w-[360px]">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="end" sort="descending" onSort={noop}>
              Duration
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([name, tone, label, time], i) => (
            <TableRow key={name} selected={i === 2}>
              <TableCell className="font-control">{name}</TableCell>
              <TableCell>
                <Badge tone={tone} dot>
                  {label}
                </Badge>
              </TableCell>
              <TableCell numeric>{time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Artboard>
  );
}

function TabsThumb() {
  return (
    <Artboard className="justify-start px-10">
      <Tabs defaultValue="logs">
        <TabList aria-label="Run details">
          <Tab value="overview">Overview</Tab>
          <Tab value="logs" count={128}>
            Logs
          </Tab>
          <Tab value="changes" count={3}>
            Changes
          </Tab>
        </TabList>
        <TabPanel value="logs" className="min-h-0">
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
      </Tabs>
    </Artboard>
  );
}

function AccordionThumb() {
  return (
    <Artboard className="px-10">
      <Accordion defaultValue={["billing"]} className="w-full">
        <AccordionItem value="stop" title="Why did my run stop?">
          Runs stop after 15 minutes.
        </AccordionItem>
        <AccordionItem value="billing" title="What counts as billed time?" meta="2 rules">
          Only active time: model calls and tools.
        </AccordionItem>
        <AccordionItem value="state" title="Can two agents share state?">
          Yes, through a shared store.
        </AccordionItem>
      </Accordion>
    </Artboard>
  );
}

function CollapsibleThumb() {
  return (
    <Artboard className="justify-start px-12">
      <Collapsible defaultOpen className="w-full">
        <CollapsibleTrigger meta="3">Environment variables</CollapsibleTrigger>
        <CollapsiblePanel>
          <div className="mono flex flex-col gap-1 rounded-control border border-line bg-sunken px-3 py-2 text-code text-ink-2">
            <span>OPENAI_BASE_URL</span>
            <span>SLACK_CHANNEL=#office</span>
            <span>TZ=Asia/Kolkata</span>
          </div>
        </CollapsiblePanel>
      </Collapsible>
    </Artboard>
  );
}

function SeparatorThumb() {
  return (
    <Artboard>
      <Card className="w-[300px]">
        <CardBody className="p-4">
          <CardTitle>lunch-picker</CardTitle>
          <div className="mt-1 flex h-4 items-center gap-2 text-caption text-ink-3">
            <span className="mono">main</span>
            <Separator orientation="vertical" />
            <span>3 files changed</span>
            <Separator orientation="vertical" />
            <span>2 minutes ago</span>
          </div>
          <Separator className="my-3" />
          <CardText>Collects votes and announces the order.</CardText>
        </CardBody>
        <Separator dashed />
        <div className="px-4 py-3">
          <Badge tone="ok" dot>
            Healthy
          </Badge>
        </div>
      </Card>
    </Artboard>
  );
}

function ScrollAreaThumb() {
  const lines = ["schedule fired  chooseLunch", "read 9 votes from state", "tool call  menu-lookup", "ranked 4 options", "wrote todaysRuling", "schedule fired  chooseLunch", "read 9 votes from state", "tool call  menu-lookup"];
  return (
    <Artboard>
      <ScrollArea className="h-[190px] w-[300px] rounded-control border border-line bg-sunken" contentClassName="px-3 py-2">
        <div className="mono text-code leading-6 text-ink-2">
          {lines.map((l, i) => (
            <div key={i} className="whitespace-nowrap">
              <span className="text-ink-3">11:30:{String(i * 7).padStart(2, "0")}</span> {l}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Artboard>
  );
}

function NavigationMenuThumb() {
  return (
    <Artboard className="flex-col items-start gap-1.5 px-10">
      <div className="flex items-center gap-1 text-control font-control text-ink-2">
        <span className="flex h-9 items-center gap-1 rounded-button bg-pressed px-3 text-ink">
          Guides <CaretDownIcon size={14} className="rotate-180" />
        </span>
        <span className="flex h-9 items-center gap-1 px-3">
          Reference <CaretDownIcon size={14} />
        </span>
        <span className="flex h-9 items-center px-3">Changelog</span>
      </div>
      <div className={cn(floatingPanelClass, "grid w-[340px] grid-cols-2 gap-1 p-2")}>
        {[
          ["Quick start", "Your first agent in five minutes."],
          ["Schedules", "Cron, intervals and time zones."],
          ["Tools", "Browsers, databases and email."],
          ["State", "What survives restarts."],
        ].map(([t, d], i) => (
          <div key={t} className={cn("rounded-button p-2.5", i === 0 && "bg-hover")}>
            <div className="text-small font-heading">{t}</div>
            <div className="text-caption text-ink-3">{d}</div>
          </div>
        ))}
      </div>
    </Artboard>
  );
}

/* ---------- feedback ---------- */

function ProgressThumb() {
  return (
    <Artboard className="flex-col items-stretch gap-5 px-12">
      <Progress label="Deploying lunch-picker" value={72} hint="Uploading the bundle." />
      <Progress label="Test suite" value={64} tone="danger" hint="3 tests failed. The run continues." />
    </Artboard>
  );
}

function MeterThumb() {
  return (
    <Artboard className="flex-col items-stretch gap-5 px-12">
      <Meter label="Model calls this month" value={3100} max={5000} valueText={(v) => `${v.toLocaleString()} / 5,000`} hint="Resets on the 1st." />
      <Meter label="State storage" value={91} max={100} valueText={(v) => `${v} / 100 MB`} hotHint="Old run logs will be pruned first." />
    </Artboard>
  );
}

/* ---------- agents & templates ---------- */

function ChatThumb() {
  return (
    <Artboard className="flex-col items-stretch gap-3 px-8">
      <MsgUser className="max-w-[80%]">Add dark-mode tokens and a theme toggle.</MsgUser>
      <MsgAgent className="text-control">
        <span className="inline-flex items-center gap-1.5 text-small text-ink-3">
          <CaretRightIcon size={12} /> Worked for 41s
        </span>
        <p>
          Done. Tokens live under <code>data-theme</code>.
        </p>
        <div className="flex items-center gap-2">
          <Badge tone="ok" dot>
            Build passed
          </Badge>
          <Diffstat added={39} removed={6} />
          <ContextMeter value={57} />
        </div>
      </MsgAgent>
    </Artboard>
  );
}

function AgentWorkspaceThumb() {
  // A whole workspace is too much for the artboard at type-scale sizes, so it's laid out at 600×360 and scaled to fit.
  return (
    <Artboard className="items-start justify-start p-0">
      <div className="h-[360px] w-[600px] flex-none origin-top-left scale-[.7] p-4">
        <div className="grid h-full w-full grid-cols-[150px_1fr_170px] gap-2 rounded-card border border-line bg-page p-2 shadow-float">
          <div className="flex min-w-0 flex-col gap-px overflow-hidden pt-1">
            <div className="flex items-center gap-1.5 px-1 pb-1.5 text-small font-heading">
              <Avatar small initials="PR" /> Priya
            </div>
            <NavItem icon={<PlusIcon />}>New</NavItem>
            <NavItem icon={<RobotIcon />}>Agents</NavItem>
            <NavItem icon={<FolderIcon />}>console</NavItem>
            <Threads>
              <NavItem current live meta="now">
                toggle
              </NavItem>
              <NavItem meta="5h">nav</NavItem>
            </Threads>
          </div>
          <Card className="min-w-0 overflow-hidden">
            <div className="flex h-9 items-center border-b border-line px-3">
              <Crumbs items={["console", "toggle"]} />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-3 text-small">
              <div className="self-end rounded-control bg-page px-2.5 py-1">Add a theme toggle.</div>
              <div className="text-ink-2">Done. Tokens under data-theme.</div>
              <div className="mt-auto rounded-control border border-line-strong bg-surface px-2.5 py-2 text-ink-3">Ask for a change…</div>
            </div>
          </Card>
          <Card className="min-w-0 overflow-hidden">
            <div className="flex h-9 items-center gap-1.5 border-b border-line px-3 text-small font-control">
              Changes <span className="rounded-pill bg-accent-soft px-1.5 text-caption tabular-nums">4</span>
            </div>
            <div className="mono flex flex-col text-caption leading-5">
              <div className="bg-success-soft px-2">+ "use client";</div>
              <div className="bg-success-soft px-2">+ import …</div>
              <div className="bg-danger-soft px-2 text-ink-2">− --bg: white;</div>
              <div className="bg-success-soft px-2">+ --page: …</div>
              <div className="px-2 text-ink-3">{"  }"}</div>
            </div>
            <div className="mt-auto flex items-center gap-1.5 border-t border-line p-2 text-ink-3">
              <CopyIcon size={14} />
              <Diffstat added={39} removed={6} />
            </div>
          </Card>
        </div>
      </div>
    </Artboard>
  );
}

function TextareaThumb() {
  return (
    <Artboard className="flex-col items-stretch px-12">
      <Field label="Default instructions" count="96/600" hint="The agent reads this before every run." className="max-w-none">
        <Textarea rows={3} defaultValue="You maintain the agent-console repo. Keep changes small and explain each one in a sentence." />
      </Field>
    </Artboard>
  );
}

function CalloutThumb() {
  return (
    <Artboard className="flex-col items-stretch gap-3 px-10">
      <Callout
        tone="warning"
        title="The deploy key expires in 3 days"
        action={
          <Button size="sm" variant="secondary">
            Rotate key
          </Button>
        }
      >
        Runs that deploy will fail after Friday.
      </Callout>
      <Callout tone="info" title="Runs on main start automatically" />
    </Artboard>
  );
}

function LinkThumb() {
  return (
    <Artboard className="flex-col items-stretch gap-4 px-10">
      <NavLinks aria-label="Workspace" className="h-11 border-b border-line">
        <Link variant="nav" href="#">Overview</Link>
        <Link variant="nav" href="#" current>Runs</Link>
        <Link variant="nav" href="#">Agents</Link>
      </NavLinks>
      <p className="m-0 text-small text-ink">
        Fixed in <Link variant="code" href="#">theme.ts:42</Link>, see <Link href="#">PR #128</Link>.
      </p>
    </Artboard>
  );
}

function KeyValueThumb() {
  return (
    <Artboard className="flex-col items-stretch px-14">
      <KeyValue>
        <KeyValueItem label="Run ID" mono copy="run_8f2a91">
          run_8f2a91
        </KeyValueItem>
        <KeyValueItem label="Branch" mono>
          theme-toggle
        </KeyValueItem>
        <KeyValueItem label="Duration" numeric>
          2m 41s
        </KeyValueItem>
        <KeyValueItem label="Cost" numeric>
          $0.37
        </KeyValueItem>
      </KeyValue>
    </Artboard>
  );
}

function TimelineThumb() {
  return (
    <Artboard className="flex-col items-stretch px-12">
      <Timeline>
        <TimelineItem status="done" title="Install dependencies" time="14:02:20" duration="18s" />
        <TimelineItem status="done" title="Edit 3 files" time="14:02:47" duration="24s" />
        <TimelineItem status="running" title="Run tests" time="14:03:11" duration="…" />
        <TimelineItem status="pending" title="Deploy preview" duration="—" />
      </Timeline>
    </Artboard>
  );
}

function LogStreamThumb() {
  return (
    <Artboard className="items-stretch px-8 py-6">
      <LogStream
        className="w-full"
        name="pnpm test"
        live
        lines={[
          { text: "$ pnpm test", level: "muted" },
          { text: "✓ src/lib/theme.test.ts (12 tests)", level: "ok" },
          { text: "Hue drift above 4° in sand/dark", level: "warn" },
          { text: "× invoices.test.ts > groups by month", level: "error" },
          { text: "✓ src/components/table.test.tsx", level: "ok" },
        ]}
      />
    </Artboard>
  );
}

function SettingsThumb() {
  return (
    <Artboard className="items-start justify-start p-0">
      <div className="h-[360px] w-[600px] flex-none origin-top-left scale-[.7] p-4">
        <div className="grid h-full w-full grid-cols-[150px_1fr] overflow-hidden rounded-card border border-line bg-page shadow-float">
          <div className="flex min-w-0 flex-col gap-px border-e border-line bg-surface p-2">
            <NavItem icon={<GearIcon />} current>
              General
            </NavItem>
            <NavItem icon={<RobotIcon />}>Models</NavItem>
            <NavItem icon={<LinkIcon />}>API keys</NavItem>
            <NavItem icon={<WarningCircleIcon />}>Danger zone</NavItem>
          </div>
          <div className="flex min-w-0 flex-col gap-3 p-4">
            <Field label="Workspace name" count="11/32" className="max-w-none">
              <Input defaultValue="Acme agents" />
            </Field>
            <Field label="Default instructions" className="max-w-none">
              <Textarea rows={2} defaultValue="Keep changes small and open a pull request instead of pushing to main." />
            </Field>
            <Callout tone="warning" title="ci-runner expires in 3 days" />
          </div>
        </div>
      </div>
    </Artboard>
  );
}

function RunDetailThumb() {
  return (
    <Artboard className="items-start justify-start p-0">
      <div className="h-[360px] w-[600px] flex-none origin-top-left scale-[.7] p-4">
        <div className="grid h-full w-full grid-cols-[1fr_190px] overflow-hidden rounded-card border border-line bg-page shadow-float">
          <div className="flex min-w-0 flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
              <Crumbs items={["agent-console", "Runs", "run_8f2a91"]} />
              <Badge tone="live" dot className="ms-auto">
                Running
              </Badge>
            </div>
            <Timeline>
              <TimelineItem status="done" title="Install dependencies" duration="18s" />
              <TimelineItem status="done" title="Edit 3 files" duration="24s" />
              <TimelineItem status="running" title="Run tests" duration="…" />
              <TimelineItem status="pending" title="Deploy a preview" duration="—" />
            </Timeline>
          </div>
          <div className="flex min-w-0 flex-col border-s border-line bg-surface px-3 py-2">
            <KeyValue>
              <KeyValueItem label="Agent">lunch-picker</KeyValueItem>
              <KeyValueItem label="Branch" mono>
                theme-toggle
              </KeyValueItem>
              <KeyValueItem label="Tokens" numeric>
                18,400
              </KeyValueItem>
              <KeyValueItem label="Cost" numeric>
                $0.06
              </KeyValueItem>
            </KeyValue>
          </div>
        </div>
      </div>
    </Artboard>
  );
}

const THUMBS: Record<string, () => ReactNode> = {
  color: ColorThumb,
  themes: ThemesThumb,
  typography: TypographyThumb,
  space: SpaceThumb,
  motion: MotionThumb,
  focus: FocusThumb,
  button: ButtonThumb,
  toggle: ToggleThumb,
  input: InputThumb,
  textarea: TextareaThumb,
  select: SelectThumb,
  combobox: ComboboxThumb,
  autocomplete: AutocompleteThumb,
  radio: RadioThumb,
  checkbox: CheckboxThumb,
  switch: SwitchThumb,
  slider: SliderThumb,
  "number-field": NumberFieldThumb,
  "otp-field": OtpFieldThumb,
  form: FormThumb,
  "command-palette": CommandPaletteThumb,
  tooltip: TooltipThumb,
  popover: PopoverThumb,
  "preview-card": PreviewCardThumb,
  menu: MenuThumb,
  "context-menu": ContextMenuThumb,
  menubar: MenubarThumb,
  dialog: DialogThumb,
  drawer: DrawerThumb,
  card: CardThumb,
  table: TableThumb,
  "key-value": KeyValueThumb,
  link: LinkThumb,
  tabs: TabsThumb,
  accordion: AccordionThumb,
  collapsible: CollapsibleThumb,
  separator: SeparatorThumb,
  "scroll-area": ScrollAreaThumb,
  "navigation-menu": NavigationMenuThumb,
  progress: ProgressThumb,
  meter: MeterThumb,
  callout: CalloutThumb,
  chat: ChatThumb,
  timeline: TimelineThumb,
  "log-stream": LogStreamThumb,
  "agent-workspace": AgentWorkspaceThumb,
  "run-detail": RunDetailThumb,
  settings: SettingsThumb,
};

/** Slugs that have a dedicated thumbnail. */
export const THUMB_SLUGS = Object.keys(THUMBS);

/** Fallback for pages without a dedicated preview: the page's name set in type. */
function FallbackThumb({ slug }: { slug: string }) {
  return (
    <Artboard>
      <span className="mono text-body text-ink-3">{slug}</span>
    </Artboard>
  );
}

/**
 * A small, inert, live preview of a page's component for the index grid.
 * Renders a 294×176 box; give it a ~300×180 stage (bg-page) and
 * wrap it in `inert` so nothing inside takes focus.
 */
export function Thumb({ slug }: { slug: string }): ReactNode {
  const T = THUMBS[slug];
  return T ? <T /> : <FallbackThumb slug={slug} />;
}
