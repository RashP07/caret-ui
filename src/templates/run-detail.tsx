import {
  ArrowClockwiseIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  FileIcon,
  LinkIcon,
  SidebarSimpleIcon,
  StopIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogClose,
  Badge,
  Button,
  Callout,
  Card,
  CardText,
  CardTitle,
  Code,
  Crumbs,
  Diff,
  Diffstat,
  diffStatOf,
  Drawer,
  Hint,
  IconButton,
  KeyValue,
  KeyValueItem,
  LogStream,
  Menu,
  MenuItem,
  MenuSeparator,
  Meter,
  NavGroup,
  NavItem,
  Progress,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Timeline,
  TimelineItem,
  toast,
  type LogLine,
  type TimelineStatus,
} from "@/components";
import { cn } from "@/lib/cn";
import { ThemeScope } from "@/lib/theme";
import { PLAN, RUN, RUN_STEPS, TEST_SUMMARY } from "./run-data";
import { FILES } from "./workspace-data";

/*
 * Template: run detail. One agent run on its own page: what it did (Timeline), what it printed
 * (LogStream) and what it changed (Diff), with its properties in a column on the right (KeyValue,
 * Meter, Progress, Callout). Two flush columns split by one hairline, each opening with a 44px
 * header row, so their bottom lines read as one.
 *
 * Layout only. Every piece inside is an existing Caret component; the classes here are grid,
 * flex, gap, padding, size, the hairline between columns, overflow and position.
 *
 * It lays out by its own width: under 1000px the details column leaves the grid and opens as a
 * Drawer from "Details" in the header. Its height is the host's (`className="h-[780px]"`).
 */

type Phase = "running" | "passed" | "canceled";
type StepTime = { start?: number; end?: number };

const SIDE = 320;
const HEAD = "flex h-11 flex-none items-center gap-1 border-b border-line";

const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const full = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "medium" });
const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const rel = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 3 });

/** "2.4s" under a minute, "1m 04s" after. */
function took(ms: number) {
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${Math.floor(s / 60)}m ${String(Math.floor(s % 60)).padStart(2, "0")}s`;
}

function ago(from: number, now: number) {
  const s = Math.round((now - from) / 1000);
  return s < 60 ? rel.format(-s, "second") : rel.format(-Math.round(s / 60), "minute");
}

/** The element's own width, measured before paint. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([e]) => setWidth(e.borderBoxSize[0]?.inlineSize ?? e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export function RunDetail({ className }: { className?: string }) {
  const [rootRef, width] = useWidth<HTMLDivElement>();
  const narrow = width !== null && width <= 1000;
  const [detailsOpen, setDetailsOpen] = useState(false);

  /* ---------- the run: a simulation that walks the steps and streams their logs ---------- */
  const [runKey, setRunKey] = useState(0);
  const [phase, setPhase] = useState<Phase>("running");
  const [current, setCurrent] = useState(0);
  const [times, setTimes] = useState<StepTime[]>([]);
  const [lines, setLines] = useState<LogLine[]>([]);
  const [tokens, setTokens] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const timers = useRef<number[]>([]);

  const stopTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    const t0 = Date.now();
    setStartedAt(t0);
    setNow(t0);
    setPhase("running");
    setCurrent(0);
    setTimes([]);
    setLines([{ text: `Run ${RUN.id} queued by ${RUN.agent}`, level: "muted", time: clock.format(t0) }]);
    setTokens(0);

    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    let offset = 400;
    RUN_STEPS.forEach((step, i) => {
      const begin = offset;
      at(begin, () => {
        setCurrent(i);
        setTimes((all) => {
          const next = [...all];
          next[i] = { start: Date.now() };
          return next;
        });
      });
      // Its lines arrive spread across the step.
      step.log.forEach((line, j) => {
        at(begin + ((j + 1) * step.ms) / (step.log.length + 1), () =>
          setLines((all) => [...all, { ...line, time: clock.format(Date.now()) }]),
        );
      });
      offset += step.ms;
      at(offset, () => {
        setTimes((all) => {
          const next = [...all];
          next[i] = { ...next[i], end: Date.now() };
          return next;
        });
        setTokens((t) => t + step.tokens);
      });
    });
    at(offset + 50, () => {
      setCurrent(RUN_STEPS.length);
      setPhase("passed");
      setLines((all) => [...all, { text: `Run passed in ${took(Date.now() - t0)}`, level: "ok", time: clock.format(Date.now()) }]);
    });
    return stopTimers;
  }, [runKey]);

  // The clock ticks only while something is running.
  useEffect(() => {
    if (phase !== "running") return;
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [phase]);

  const [confirmCancel, setConfirmCancel] = useState(false);
  function cancel() {
    setConfirmCancel(false);
    stopTimers();
    setPhase("canceled");
    setNow(Date.now());
    setLines((all) => [...all, { text: "Run canceled by you. Nothing was deployed.", level: "warn", time: clock.format(Date.now()) }]);
    toast("Run canceled");
  }

  function rerun() {
    stopTimers();
    setRunKey((k) => k + 1);
    setPreviewKept(false);
    toast(`Re-running ${RUN.id}`);
  }

  const running = phase === "running";
  const done = times.filter((t) => t?.end).length;
  // Running and canceled read the clock (it stops ticking at cancel); a finished run ends with its last step.
  const elapsed = (phase === "passed" ? Math.max(startedAt, ...Array.from(times, (t) => t?.end ?? 0)) : now) - startedAt;

  function statusOf(i: number): TimelineStatus {
    const t = times[i];
    if (t?.end) return "done";
    if (phase === "running" && i === current && t?.start) return "running";
    if (phase === "canceled") return "skipped";
    return "pending";
  }

  /* ---------- changes ---------- */
  const editDone = !!times[RUN_STEPS.findIndex((s) => s.key === "edit")]?.end;
  const changed = editDone ? FILES : [];
  const [fileIdx, setFileIdx] = useState(0);
  const filesRef = useRef<HTMLElement>(null);
  const file = changed[Math.min(fileIdx, changed.length - 1)];

  function pickFile(i: number) {
    setFileIdx(i);
    requestAnimationFrame(() => (filesRef.current?.querySelector("[aria-current='true']") as HTMLElement | null)?.focus());
  }

  /* ---------- details ---------- */
  const [previewKept, setPreviewKept] = useState(false);
  const expires = new Date(startedAt + 7 * 864e5);

  const badge =
    phase === "running" ? (
      <Badge tone="live" dot>
        Running
      </Badge>
    ) : phase === "passed" ? (
      <Badge tone="ok" dot>
        Passed
      </Badge>
    ) : (
      <Badge>Canceled</Badge>
    );

  const details: ReactNode = (
    <div className="flex flex-col gap-6">
      <KeyValue>
        <KeyValueItem label="Run ID" mono copy={RUN.id} copyLabel="Copy run ID">
          {RUN.id}
        </KeyValueItem>
        <KeyValueItem label="Agent">{RUN.agent}</KeyValueItem>
        <KeyValueItem label="Model">{RUN.model}</KeyValueItem>
        <KeyValueItem label="Branch" mono>
          {RUN.branch}
        </KeyValueItem>
        <KeyValueItem label="Commit" mono copy={RUN.commit} copyLabel="Copy commit SHA">
          {RUN.commit.slice(0, 7)}
        </KeyValueItem>
        <KeyValueItem label="Started">
          <span title={full.format(startedAt)}>{ago(startedAt, now)}</span>
        </KeyValueItem>
        <KeyValueItem label="Duration" numeric>
          {took(elapsed)}
        </KeyValueItem>
        <KeyValueItem label="Tokens" numeric>
          {tokens.toLocaleString("en-US")}
        </KeyValueItem>
        <KeyValueItem label="Cost" numeric>
          {money.format((tokens / 1000) * RUN.rate)}
        </KeyValueItem>
      </KeyValue>

      <Progress
        label="Steps"
        value={(done / RUN_STEPS.length) * 100}
        tone={phase === "canceled" ? "danger" : "ink"}
        hint={
          phase === "canceled"
            ? `Stopped after ${done} of ${RUN_STEPS.length} steps.`
            : `${done} of ${RUN_STEPS.length} steps done.`
        }
      />
      <Meter
        label="Context used"
        value={(tokens / RUN.window) * 100}
        valueText={() => `${tokens.toLocaleString("en-US")} / ${RUN.window.toLocaleString("en-US")}`}
        hint="Plans and edits fill it; installs and tests barely touch it."
      />

      {phase === "passed" && !previewKept && (
        <Callout
          tone="warning"
          title={`Preview expires ${day.format(expires)}`}
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setPreviewKept(true);
                toast("Preview kept until you delete it", { tone: "success" });
              }}
            >
              Keep preview
            </Button>
          }
        >
          theme-toggle.agent-console.dev comes down in 7 days. Keep it to share it longer.
        </Callout>
      )}
      {phase === "canceled" && (
        <Callout title="You stopped this run" icon={<StopIcon />}>
          Nothing was deployed. Re-run to start again from a fresh clone.
        </Callout>
      )}
    </div>
  );

  /* ---------- keyboard: R re-runs once the run has ended ---------- */
  function onAppKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, [role='menu'], [contenteditable='true']")) return;
    if (e.key.toLowerCase() === "r" && !e.metaKey && !e.ctrlKey && !e.altKey && !running) {
      e.preventDefault();
      rerun();
    }
  }

  return (
    <ThemeScope
      ref={rootRef}
      aria-label="Run detail"
      role="region"
      onKeyDown={onAppKeyDown}
      className={cn("relative grid h-full min-h-0 grid-cols-[minmax(0,1fr)_var(--side)] overflow-hidden border border-line bg-page text-ink", className)}
      style={{ "--side": narrow ? "0px" : `${SIDE}px` } as React.CSSProperties}
    >
      {/* ---------- the run ---------- */}
      <section aria-label="Run" className="flex min-h-0 min-w-0 flex-col">
        <header className={cn(HEAD, "gap-2 ps-4 pe-1.5")}>
          <Crumbs className="min-w-0 flex-1" items={[RUN.repo, "Runs", RUN.id]} hideOnSmall={[0, 1]} />
          <span className="flex flex-none">{badge}</span>
          <div className="flex flex-none items-center gap-1">
            {running ? (
              <AlertDialog
                open={confirmCancel}
                onOpenChange={setConfirmCancel}
                trigger={
                  <Button size="sm" variant="secondary" icon={<StopIcon />}>
                    Cancel run
                  </Button>
                }
                icon={<StopIcon size={18} />}
                title="Cancel this run?"
                description="The agent stops after the current command. Edits stay on the branch; nothing is deployed."
                footer={
                  <>
                    <AlertDialogClose render={<Button variant="secondary">Keep running</Button>} />
                    <Button variant="danger" onClick={cancel}>
                      Cancel run
                    </Button>
                  </>
                }
              />
            ) : (
              <Button size="sm" variant="secondary" icon={<ArrowClockwiseIcon />} kbd="R" onClick={rerun}>
                Re-run
              </Button>
            )}
            <Menu align="end" trigger={<IconButton size="sm" label="More actions" icon={<DotsThreeIcon weight="bold" />} />}>
              <MenuItem
                icon={<LinkIcon />}
                onClick={() => {
                  navigator.clipboard?.writeText(`https://caret.dev/${RUN.repo}/runs/${RUN.id}`).catch(() => {});
                  toast("Link copied");
                }}
              >
                Copy link
              </MenuItem>
              <MenuItem icon={<DownloadSimpleIcon />} onClick={() => toast(`Downloaded ${RUN.id}.log`)}>
                Download logs
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                danger
                icon={<TrashIcon />}
                onClick={() => toast(`Deleted ${RUN.id}`, { action: { label: "Undo", onClick: () => toast(`Restored ${RUN.id}`) } })}
              >
                Delete run
              </MenuItem>
            </Menu>
            {narrow && (
              <IconButton size="sm" label="Details" icon={<SidebarSimpleIcon />} onClick={() => setDetailsOpen(true)} />
            )}
          </div>
        </header>

        <Tabs defaultValue="timeline" className="flex min-h-0 flex-1 flex-col">
          {/* Summary, then line tabs: this is the page's own section bar. */}
          <div className={cn("flex-none px-6 pt-5", narrow && "px-4 pt-4")}>
            <h2 className="m-0 text-title font-heading">{RUN.title}</h2>
            <Hint className="mt-1 mb-3">
              {RUN.agent} on {RUN.repo}, branch {RUN.branch}
            </Hint>
            <TabList aria-label="Run views">
              <Tab value="timeline" count={`${done}/${RUN_STEPS.length}`}>
                Timeline
              </Tab>
              <Tab value="logs" count={lines.length}>
                Logs
              </Tab>
              <Tab value="changes" count={changed.length}>
                Changes
              </Tab>
            </TabList>
          </div>

          <TabPanel value="timeline" className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-4 pb-6 data-hidden:hidden", narrow && "px-4")}>
            <div className="max-w-[760px]">
              <Timeline aria-label="Steps">
                {RUN_STEPS.map((step, i) => {
                  const status = statusOf(i);
                  const t = times[i];
                  const interrupted = phase === "canceled" && t?.start && !t.end;
                  const duration = t?.start ? took((t.end ?? now) - t.start) : "—";
                  const detail =
                    step.key === "plan" ? (
                      <ol className="m-0 flex list-decimal flex-col gap-1 ps-5">
                        {PLAN.map((p) => (
                          <li key={p}>
                            <CardText>{p}</CardText>
                          </li>
                        ))}
                      </ol>
                    ) : step.key === "edit" ? (
                      <Diff className="max-h-[320px]" lang={FILES[1].lang} path={FILES[1].path} lines={FILES[1].lines} hunk={FILES[1].hunk} />
                    ) : step.key === "test" ? (
                      <Code lang="TXT" name="pnpm test --run" lines={TEST_SUMMARY} />
                    ) : undefined;
                  return (
                    <TimelineItem
                      key={`${runKey}-${step.key}`}
                      status={status}
                      title={step.title}
                      description={interrupted ? "Stopped by you" : status === "done" ? step.description : undefined}
                      time={t?.start ? clock.format(t.start) : undefined}
                      timeTitle={t?.start ? full.format(t.start) : undefined}
                      duration={interrupted ? undefined : duration}
                    >
                      {status === "done" ? detail : undefined}
                    </TimelineItem>
                  );
                })}
              </Timeline>
              {phase === "canceled" && <Hint className="mt-3">You stopped this run. Nothing was deployed.</Hint>}
            </div>
          </TabPanel>

          {/* Kept mounted, so the log keeps its scroll position and follow state between tabs. */}
          <TabPanel keepMounted value="logs" className={cn("flex min-h-0 flex-1 flex-col p-4 data-hidden:hidden", !narrow && "px-6")}>
            <LogStream className="flex-1" name={`${RUN.id}.log`} live={running} filterable lines={lines} />
          </TabPanel>

          <TabPanel value="changes" className="flex min-h-0 flex-1 flex-col p-0 data-hidden:hidden">
            {!file ? (
              <div className="grid flex-1 place-items-center p-6">
                <Card empty>
                  <CardTitle>No changes yet</CardTitle>
                  <CardText>Files the agent edits show up here once the edit step finishes.</CardText>
                </Card>
              </div>
            ) : (
              <div className={cn("grid min-h-0 flex-1", narrow ? "grid-rows-[auto_minmax(0,1fr)]" : "grid-cols-[260px_minmax(0,1fr)]")}>
                <nav
                  ref={filesRef}
                  aria-label="Changed files"
                  className={cn("flex min-w-0 flex-col gap-px p-1.5", narrow ? "border-b border-line" : "border-r border-line")}
                  onKeyDown={(e) => {
                    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                    e.preventDefault();
                    pickFile((fileIdx + (e.key === "ArrowDown" ? 1 : -1) + changed.length) % changed.length);
                  }}
                >
                  <NavGroup>
                    {changed.map((f, i) => (
                      <NavItem
                        key={f.path}
                        icon={<FileIcon />}
                        path={f.path}
                        current={f === file}
                        meta={<Diffstat {...diffStatOf(f.lines)} />}
                        trail={f.status && <Badge>{f.status}</Badge>}
                        onClick={() => pickFile(i)}
                      />
                    ))}
                  </NavGroup>
                </nav>
                {/* Flush: the panel is its frame. */}
                <Diff key={file.path} className="min-h-0 rounded-none border-0" lang={file.lang} path={file.path} lines={file.lines} hunk={file.hunk} />
              </div>
            )}
          </TabPanel>
        </Tabs>
      </section>

      {/* ---------- details: a column when there's room, a drawer when there isn't ---------- */}
      {narrow ? (
        <Drawer open={detailsOpen} onOpenChange={setDetailsOpen} title="Details" description={RUN.id}>
          {details}
        </Drawer>
      ) : (
        <aside aria-label="Details" className="flex min-h-0 min-w-0 flex-col overflow-hidden border-l border-line bg-surface">
          <div className={cn(HEAD, "ps-4 pe-1.5")}>
            <h2 className="m-0 text-control font-control">Details</h2>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-2 pb-5">{details}</div>
        </aside>
      )}
    </ThemeScope>
  );
}
