import { ArrowDownIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { CopyButton } from "./code";
import { Input } from "./input";

/*
 * LogStream. Output that is still arriving: a build, a test run, an agent's shell. Code is for text
 * that's finished; a log grows at the bottom while you read it.
 *
 * It follows the tail: while you're at the bottom, new lines keep you there. Scroll up to read and
 * it stops following, says how many lines arrived since, and offers the way back ("12 new lines",
 * or End). Lines carry a level, shown as a word-weight change and a status color, never color
 * alone: warnings and errors also get a tinted row. Filtering hides what doesn't match and says
 * how many lines are left. Numbers are the line's real number, so "line 214" means the same
 * thing filtered or not.
 *
 * The body is a focusable region (arrow keys and Page keys scroll it). It's role="log", which is
 * polite by default; a fast build would talk over everything, so it's quiet unless you pass
 * `announce`.
 */

export type LogLevel = "info" | "muted" | "ok" | "warn" | "error";

export interface LogLine {
  text: string;
  level?: LogLevel;
  /** Short time, "14:02:11". */
  time?: string;
}

export interface LogStreamProps {
  lines: LogLine[];
  /** File-like name in the head: "build.log", "pnpm test". */
  name: string;
  /** Still running: shows a live dot in the head. */
  live?: boolean;
  /** Show a filter field in the head. */
  filterable?: boolean;
  /** Wrap long lines instead of scrolling sideways. */
  wrap?: boolean;
  /** Read new lines aloud (role="log" is polite). Off by default. */
  announce?: boolean;
  /** Fires when following the tail turns on or off. */
  onFollowChange?: (following: boolean) => void;
  /** Extra head controls, before Copy. */
  actions?: ReactNode;
  className?: string;
}

const levelRow: Record<LogLevel, string> = {
  info: "text-ink",
  muted: "text-ink-3",
  ok: "text-success",
  warn: "bg-warning-soft text-warning",
  error: "bg-danger-soft text-danger font-heading",
};

const levelWord: Partial<Record<LogLevel, string>> = { warn: "Warning", error: "Error" };

const plural = (n: number, one: string, other: string) => `${n.toLocaleString("en-US")} ${new Intl.PluralRules("en").select(n) === "one" ? one : other}`;

export function LogStream({ lines, name, live, filterable, wrap, announce, onFollowChange, actions, className }: LogStreamProps) {
  const body = useRef<HTMLDivElement>(null);
  const [follow, setFollow] = useState(true);
  const [seen, setSeen] = useState(lines.length);
  const [query, setQuery] = useState("");
  const followRef = useRef(follow);

  const q = query.trim().toLowerCase();
  const shown = lines.map((l, i) => ({ ...l, n: i + 1 })).filter((l) => !q || l.text.toLowerCase().includes(q));
  const unseen = follow ? 0 : Math.max(0, lines.length - seen);

  function setFollowing(on: boolean) {
    if (followRef.current === on) return;
    followRef.current = on;
    setFollow(on);
    onFollowChange?.(on);
  }

  // Following: every new line keeps the view on the tail. Before paint, so it never flickers.
  useLayoutEffect(() => {
    const el = body.current;
    if (!el || !followRef.current) return;
    el.scrollTop = el.scrollHeight;
    setSeen(lines.length);
  }, [lines.length, q]);

  useEffect(() => {
    if (follow) setSeen(lines.length);
  }, [follow, lines.length]);

  function onScroll() {
    const el = body.current;
    if (!el) return;
    const atEnd = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    if (atEnd !== followRef.current) {
      if (!atEnd) setSeen(lines.length);
      setFollowing(atEnd);
    }
  }

  function jump() {
    const el = body.current;
    if (!el) return;
    setFollowing(true);
    // A jump you asked for: instant, since you're waiting to read what's there.
    el.scrollTop = el.scrollHeight;
  }

  return (
    <div className={cn("relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface", className)}>
      {/* Head: matches Code's (sunken, 44px + hairline, sm controls 8px from the edge), so a log and a file sit together. */}
      <div className="flex h-[45px] flex-none items-center gap-3 border-b border-line bg-sunken ps-3 pe-2">
        <span className="mono min-w-0 truncate text-small text-ink-2" title={name}>
          {name}
        </span>
        {live && (
          <span className="inline-flex flex-none items-center gap-1.5 text-caption font-control text-ink">
            <i aria-hidden className="size-1.5 animate-pulse-dot rounded-full bg-accent-strong" />
            Live
          </span>
        )}
        <span className="ms-auto flex-none text-caption text-ink-3 tabular-nums">
          {q ? `${shown.length.toLocaleString("en-US")} of ${plural(lines.length, "line", "lines")}` : plural(lines.length, "line", "lines")}
        </span>
        {filterable && (
          <Input
            aria-label={`Filter ${name}`}
            placeholder="Filter"
            size="sm"
            className="w-44 flex-none max-[520px]:w-32"
            lead={<MagnifyingGlassIcon />}
            value={query}
            onValueChange={(v: string) => setQuery(v)}
          />
        )}
        {actions}
        <CopyButton label="Copy log" size="sm" text={() => lines.map((l) => l.text).join("\n")} className="flex-none" />
      </div>

      <div
        ref={body}
        role="log"
        aria-live={announce ? "polite" : "off"}
        aria-label={name}
        tabIndex={0}
        onScroll={onScroll}
        onKeyDown={(e) => {
          if (e.key === "End" && !e.shiftKey) {
            e.preventDefault();
            jump();
          }
        }}
        style={{ "--digits": String(lines.length).length } as React.CSSProperties}
        // As in Code: 12px to the ink all round (4px pad + the 24px line's leading), 12px between columns.
        className={cn("mono min-h-0 flex-1 overflow-auto overscroll-contain py-1 text-code leading-6", "focus-visible:outline-offset-[-1px]")}
      >
        {shown.length === 0 ? (
          <p className="m-0 px-3 py-2 font-ui text-small text-ink-3">
            {lines.length === 0 ? (live ? "Waiting for output." : "No output.") : `No lines match “${query.trim()}”.`}
          </p>
        ) : (
          shown.map((l) => {
            const level = l.level ?? "info";
            return (
              <div key={l.n} data-level={level} className={cn("grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 pe-3", levelRow[level])}>
                {/* Gutter: the line's real number, ink-3 whatever the level, so it never reads as status. */}
                <span aria-hidden className="ms-3 w-[calc(var(--digits)*1ch)] select-none text-end font-normal text-ink-3 tabular-nums">
                  {l.n}
                </span>
                <span className={cn(wrap ? "break-words whitespace-pre-wrap" : "whitespace-pre")}>
                  {levelWord[level] && <span className="sr-only-caret">{levelWord[level]}: </span>}
                  {l.time && <span className="me-3 font-normal text-ink-3">{l.time}</span>}
                  {l.text || " "}
                </span>
              </div>
            );
          })
        )}
      </div>

      {!follow && (
        // Floats over the log, so it gets the float drop: on a wrapper, since the button's own
        // box-shadow is its ledge.
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <span className="pointer-events-auto rounded-button shadow-float">
            <Button
              size="sm"
              variant="secondary"
              icon={<ArrowDownIcon />}
              kbd="End"
              onClick={jump}
            >
              {unseen > 0 ? plural(unseen, "new line", "new lines") : "Jump to latest"}
            </Button>
          </span>
        </div>
      )}
    </div>
  );
}
