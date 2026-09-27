import { CalendarBlankIcon, PlusIcon } from "@phosphor-icons/react";
import { useState, type MouseEvent } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Seg,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
  type BadgeTone,
  type TableDensity,
} from "@/components";
import { Section, Spec } from "./spec";

/* =========================================================
   Table
   ========================================================= */

type Status = "ready" | "building" | "queued" | "failed" | "canceled";

interface Deploy {
  id: string;
  name: string;
  status: Status;
  sha: string;
  /** Seconds; null while it hasn't finished. */
  duration: number | null;
  /** Minutes ago. */
  updated: number;
}

const DEPLOYS: Deploy[] = [
  { id: "d1", name: "lunch-picker", status: "ready", sha: "3f9a2c1", duration: 83, updated: 2 },
  { id: "d2", name: "invoice-reconciler", status: "building", sha: "b71e04d", duration: null, updated: 0 },
  { id: "d3", name: "standup-summarizer", status: "ready", sha: "9c2d6ab", duration: 142, updated: 18 },
  { id: "d4", name: "support-inbox-triage-eu-west-canary", status: "ready", sha: "e04f7b3", duration: 317, updated: 64 },
  { id: "d5", name: "release-notes-writer", status: "queued", sha: "1a8c5e0", duration: null, updated: 1 },
  { id: "d6", name: "pr-reviewer", status: "failed", sha: "77d0b92", duration: 12, updated: 190 },
  { id: "d7", name: "calendar-assistant", status: "ready", sha: "c5b1e8f", duration: 58, updated: 1440 },
  { id: "d8", name: "expense-auditor", status: "canceled", sha: "0e9d4a7", duration: 204, updated: 4320 },
];

const STATUS: Record<Status, { tone: BadgeTone; label: string; dot?: boolean }> = {
  ready: { tone: "ok", label: "Ready", dot: true },
  building: { tone: "live", label: "Building", dot: true },
  queued: { tone: "neutral", label: "Queued" },
  failed: { tone: "danger", label: "Failed", dot: true },
  canceled: { tone: "neutral", label: "Canceled" },
};

const formatDuration = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`);

function formatAgo(min: number) {
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  if (min < 1440) return `${Math.floor(min / 60)} h ago`;
  return `${Math.floor(min / 1440)} d ago`;
}

type SortKey = "name" | "duration" | "updated";
type Sort = { key: SortKey; dir: "ascending" | "descending" };

function compare(a: Deploy, b: Deploy, { key, dir }: Sort) {
  const flip = dir === "ascending" ? 1 : -1;
  if (key === "name") return a.name.localeCompare(b.name) * flip;
  if (key === "updated") return (b.updated - a.updated) * flip; // ascending = oldest first
  // Unfinished runs sink to the bottom whichever way you sort.
  if (a.duration == null) return b.duration == null ? 0 : 1;
  if (b.duration == null) return -1;
  return (a.duration - b.duration) * flip;
}

/** Keep row clicks (select) away from the controls inside the row. */
const stop = (e: MouseEvent) => e.stopPropagation();

function DeploymentsSpec() {
  const [sort, setSort] = useState<Sort>({ key: "updated", dir: "descending" });
  const [density, setDensity] = useState<TableDensity>("default");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(["d3"]));
  const [opened, setOpened] = useState<string | null>(null);

  const rows = [...DEPLOYS].sort((a, b) => compare(a, b, sort));
  const all = selected.size === DEPLOYS.length;
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const sortable = (key: SortKey) => ({
    sort: sort.key === key ? sort.dir : ("none" as const),
    onSort: () => setSort((s) => ({ key, dir: s.key === key && s.dir === "ascending" ? "descending" : "ascending" })),
  });
  const total = DEPLOYS.reduce((sum, d) => sum + (d.duration ?? 0), 0);

  return (
    <Spec
      name="sortable, selectable, two densities"
      state={[
        ["sort", `${sort.key} ${sort.dir}`],
        ["density", density],
        ["selected", `${selected.size} of ${DEPLOYS.length}`],
        ["opened", opened ? `"${opened}"` : "none"],
      ]}
      layout="stack"
      canvasClassName="gap-5"
    >
      <Seg
        aria-label="Row density"
        value={density}
        onValueChange={setDensity}
        options={[
          { value: "default", label: "Default" },
          { value: "compact", label: "Compact" },
        ]}
      />
      <Table aria-label="Deployments" density={density} className="w-full max-w-[760px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 pe-0">
              <Checkbox
                aria-label="Select all deployments"
                className="mt-0"
                checked={all}
                indeterminate={selected.size > 0 && !all}
                onCheckedChange={(on) => setSelected(on ? new Set(DEPLOYS.map((d) => d.id)) : new Set())}
              />
            </TableHead>
            <TableHead {...sortable("name")}>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Commit</TableHead>
            <TableHead align="end" {...sortable("duration")}>
              Duration
            </TableHead>
            <TableHead align="end" {...sortable("updated")}>
              Updated
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((d) => {
            const s = STATUS[d.status];
            return (
              <TableRow key={d.id} selected={selected.has(d.id)} onClick={() => toggle(d.id)}>
                <TableCell className="pe-0" onClick={stop}>
                  <Checkbox aria-label={`Select ${d.name}`} className="mt-0" checked={selected.has(d.id)} onCheckedChange={() => toggle(d.id)} />
                </TableCell>
                <TableCell truncate title={d.name} className="min-w-40">
                  <a
                    href="#table"
                    className="font-control text-ink no-underline hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpened(d.name);
                    }}
                  >
                    {d.name}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge tone={s.tone} dot={s.dot}>
                    {s.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="mono text-small text-ink-2">{d.sha}</span>
                </TableCell>
                <TableCell numeric>
                  {d.duration == null ? (
                    <>
                      <span aria-hidden className="text-ink-3">—</span>
                      <span className="sr-only-caret">Not finished</span>
                    </>
                  ) : (
                    formatDuration(d.duration)
                  )}
                </TableCell>
                <TableCell numeric className="text-ink-3">
                  {formatAgo(d.updated)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-ink-2">
              Build time, {DEPLOYS.length} deployments
            </TableCell>
            <TableCell numeric>{formatDuration(total)}</TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </Spec>
  );
}

const TOOLS = ["read-state", "menu-lookup", "http.get", "search", "write-state", "slack.post"];
const STEPS = Array.from({ length: 24 }, (_, i) => ({
  step: i + 1,
  tool: TOOLS[(i * 5) % TOOLS.length],
  ms: 40 + ((i * 137) % 900),
  tokens: 180 + ((i * 611) % 4200),
}));

function StickySpec() {
  return (
    <Spec
      name="sticky header, compact, in a height-limited frame"
      state={[["stickyHeader", "true"], ["density", "compact"], ["rows", String(STEPS.length)]]}
      canvasClassName="items-start"
    >
      <Table caption="Run 1,284: 24 tool calls" stickyHeader density="compact" className="max-h-[300px] w-full max-w-[560px]">
        <TableHeader>
          <TableRow>
            <TableHead align="end" className="w-12">
              Step
            </TableHead>
            <TableHead>Tool</TableHead>
            <TableHead align="end">Time</TableHead>
            <TableHead align="end">Tokens</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {STEPS.map((s) => (
            <TableRow key={s.step}>
              <TableCell numeric className="text-ink-3">
                {s.step}
              </TableCell>
              <TableCell>
                <span className="mono text-small">{s.tool}</span>
              </TableCell>
              <TableCell numeric>{s.ms} ms</TableCell>
              <TableCell numeric>{s.tokens.toLocaleString("en-US")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Spec>
  );
}

const SCHEDULES = [
  { agent: "lunch-picker", cron: "Weekdays at 11:30", next: "in 2 h", last: "ok" },
  { agent: "standup-summarizer", cron: "Weekdays at 9:45", next: "tomorrow", last: "ok" },
  { agent: "expense-auditor", cron: "1st of the month", next: "in 4 d", last: "failed" },
] as const;

type LoadState = "loaded" | "loading" | "empty";

function StatesSpec() {
  const [state, setState] = useState<LoadState>("loading");
  const rows = state === "loaded" ? SCHEDULES.length : 0;
  return (
    <Spec
      name="loading and empty"
      state={[["state", state], ["aria-busy", String(state === "loading")], ["rows", String(rows)]]}
      layout="stack"
      canvasClassName="gap-5"
    >
      <Seg
        aria-label="Data state"
        value={state}
        onValueChange={setState}
        options={[
          { value: "loaded", label: "Loaded" },
          { value: "loading", label: "Loading" },
          { value: "empty", label: "Empty" },
        ]}
      />
      <Table aria-label="Scheduled runs" aria-busy={state === "loading" || undefined} className="w-full max-w-[560px]">
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead align="end">Next run</TableHead>
            <TableHead>Last run</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {state === "loading" && <TableSkeleton columns={4} rows={3} label="Loading scheduled runs" />}
          {state === "empty" && (
            <TableEmpty
              colSpan={4}
              icon={<CalendarBlankIcon size={18} />}
              title="No scheduled runs"
              description="Give an agent a schedule and its next run shows up here. Runs you start by hand are under Deployments."
              action={
                <Button variant="secondary" icon={<PlusIcon />}>
                  Add a schedule
                </Button>
              }
            />
          )}
          {state === "loaded" &&
            SCHEDULES.map((s) => (
              <TableRow key={s.agent}>
                <TableCell className="font-control">{s.agent}</TableCell>
                <TableCell className="text-ink-2">{s.cron}</TableCell>
                <TableCell numeric>{s.next}</TableCell>
                <TableCell>
                  <Badge tone={s.last === "ok" ? "ok" : "danger"} dot>
                    {s.last === "ok" ? "Succeeded" : "Failed"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Spec>
  );
}

export function TableSection() {
  return (
    <Section
      id="table"
      title="Table"
      lede="Use a table for rows people scan, compare and act on. Numbers sit on the end edge in tabular figures so digits line up. A wide table scrolls sideways inside its frame, which then takes focus."
    >
      <DeploymentsSpec />
      <StickySpec />
      <StatesSpec />
    </Section>
  );
}
