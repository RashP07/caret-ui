import { ArrowCounterClockwiseIcon, PlayIcon, StopIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Button, Code, Hint, LogStream, Seg, Timeline, TimelineItem, type LogLine, type TimelineStatus } from "@/components";
import { Section, Spec, type Pairs } from "./spec";

/* =========================================================
   Timeline
   ========================================================= */

const STEPS = [
  { title: "Clone agent-console", duration: "3s" },
  { title: "Install dependencies", duration: "18s", description: "pnpm install, 412 packages from cache" },
  { title: "Plan the change", duration: "9s" },
  { title: "Edit 3 files", duration: "24s" },
  { title: "Run tests", duration: "41s" },
  { title: "Deploy preview", duration: "12s" },
];

export function TimelineSection() {
  const [at, setAt] = useState(4);
  const [failed, setFailed] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearInterval(timer.current), []);

  function run() {
    clearInterval(timer.current);
    setFailed(false);
    setAt(0);
    timer.current = window.setInterval(() => {
      setAt((a) => {
        if (a + 1 >= STEPS.length) clearInterval(timer.current);
        return Math.min(STEPS.length, a + 1);
      });
    }, 900);
  }

  function fail() {
    clearInterval(timer.current);
    setFailed(true);
  }

  const status = (i: number): TimelineStatus =>
    i < at ? "done" : i === at ? (failed ? "failed" : at < STEPS.length ? "running" : "done") : failed ? "skipped" : "pending";
  const running = !failed && at < STEPS.length;
  const state: Pairs = [
    ["step", at < STEPS.length ? `${at + 1}/${STEPS.length}` : "done"],
    ["status", failed ? "failed" : running ? "running" : "passed"],
  ];

  return (
    <Section
      id="timeline"
      title="Timeline"
      lede="Use a timeline for what a whole run did, in order. Trace is the same idea folded inside one reply; a timeline gives each step its status, its time and, when there's more to say, a panel with the detail. Every status has its own glyph, and screen readers hear it as a word."
    >
      <Spec name="a run, with detail behind steps" state={state} layout="stack" canvasClassName="items-stretch gap-4">
        <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4">
          <Timeline aria-label="Run steps">
            {STEPS.map((s, i) => {
              const st = status(i);
              const detail =
                i === 2 ? (
                  <p className="m-0 text-small text-ink-2">
                    Add light and dark values for every surface token, then a toggle that sets data-mode on the root. No component
                    needs to change.
                  </p>
                ) : i === 3 ? (
                  <Code
                    lang="CSS"
                    name="src/styles/tokens.css"
                    lines={[":root {", "  --page: light-dark(#f7f6f3, #161513);", "  --surface: light-dark(#fff, #1d1c1a);", "}"]}
                  />
                ) : i === 4 && failed ? (
                  <Hint className="text-danger">invoices.test.ts: expected 3 rows, got 2.</Hint>
                ) : undefined;
              return (
                <TimelineItem
                  key={s.title}
                  status={st}
                  title={s.title}
                  description={i === 4 && failed ? "1 test failed in invoices.test.ts" : s.description}
                  time={st === "pending" || st === "skipped" ? undefined : `14:02:${String(11 + i * 9).padStart(2, "0")}`}
                  duration={st === "done" || (st === "failed" && i === at) ? s.duration : st === "running" ? "…" : "—"}
                  defaultOpen={i === 3}
                >
                  {detail}
                </TimelineItem>
              );
            })}
          </Timeline>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={running ? <StopIcon /> : at === 0 ? <PlayIcon /> : <ArrowCounterClockwiseIcon />} onClick={running ? fail : run}>
              {running ? "Fail this step" : "Run again"}
            </Button>
          </div>
        </div>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Log stream
   ========================================================= */

const OUTPUT: LogLine[] = [
  { text: "$ pnpm test", level: "muted" },
  { text: "RUN  v3.2.4 /workspace/agent-console" },
  { text: "✓ src/lib/theme.test.ts (12 tests) 41ms", level: "ok" },
  { text: "✓ src/components/button.test.tsx (8 tests) 96ms", level: "ok" },
  { text: "stderr | src/lib/palette.test.ts", level: "muted" },
  { text: "Hue drift above 4° in sand/dark accent-strong", level: "warn" },
  { text: "✓ src/lib/palette.test.ts (31 tests) 210ms", level: "ok" },
  { text: "✓ src/components/table.test.tsx (14 tests) 133ms", level: "ok" },
  { text: "× src/billing/invoices.test.ts > groups by month", level: "error" },
  { text: "  AssertionError: expected 3 rows, got 2", level: "error" },
  { text: "    at invoices.test.ts:48:21", level: "muted" },
  { text: "✓ src/templates/workspace.test.tsx (6 tests) 88ms", level: "ok" },
  { text: "Test Files  1 failed | 6 passed (7)" },
  { text: "     Tests  1 failed | 78 passed (79)" },
  { text: "  Duration  2.41s" },
];

const time = (i: number) => `14:03:${String(2 + i).padStart(2, "0")}`;

export function LogStreamSection() {
  // The previous run's output, then this run's first n lines.
  const [n, setN] = useState(OUTPUT.length);
  const [follow, setFollow] = useState(true);
  const [wrap, setWrap] = useState<"scroll" | "wrap">("scroll");
  const timer = useRef(0);
  useEffect(() => () => clearInterval(timer.current), []);

  function play() {
    clearInterval(timer.current);
    setN(1);
    timer.current = window.setInterval(() => {
      setN((c) => {
        if (c + 1 >= OUTPUT.length) clearInterval(timer.current);
        return Math.min(OUTPUT.length, c + 1);
      });
    }, 450);
  }

  const lines = [...OUTPUT, ...OUTPUT.slice(0, n)].map((l, i) => ({ ...l, time: time(i) }));
  const live = n < OUTPUT.length;
  const state: Pairs = [
    ["lines", String(lines.length)],
    ["following", String(follow)],
    ["live", String(live)],
  ];

  return (
    <Section
      id="log-stream"
      title="Log stream"
      lede="Use a log stream for output that's still arriving: a build, a test run, an agent's shell. It follows the tail while you're at the bottom. Scroll up to read and it stops, counts what arrived since, and offers the way back. Filter to find a line; the numbers stay the real ones."
    >
      <Spec name="live, filter, follow the tail" state={state} layout="stack" canvasClassName="items-stretch gap-4">
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3">
          <LogStream
            className="h-[320px]"
            name="pnpm test"
            live={live}
            filterable
            wrap={wrap === "wrap"}
            lines={lines}
            onFollowChange={setFollow}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" icon={<PlayIcon />} onClick={play} disabled={live}>
              {live ? "Running" : "Run tests"}
            </Button>
            <Seg
              aria-label="Long lines"
              value={wrap}
              onValueChange={setWrap}
              options={[
                { value: "scroll", label: "Scroll" },
                { value: "wrap", label: "Wrap" },
              ]}
            />
          </div>
        </div>
      </Spec>
    </Section>
  );
}
