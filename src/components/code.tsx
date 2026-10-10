import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconButton, Morph } from "./button";

/* ---------- highlighting (token classes come from theme tokens) ---------- */

const KW = "import|from|export|const|let|var|function|return|if|else|type|interface|default|new|await|async|true|false|null|as";
const TOK = new RegExp(
  String.raw`(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|` +
    "`(?:[^`\\\\]|\\\\.)*`" +
    String.raw`)|\b(${KW})\b|(#[0-9A-Fa-f]{3,8}\b|\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(?=\()|(<\/?[A-Z][\w.]*|--[\w-]+)`,
  "gm",
);
const CLS = ["", "c", "s", "k", "n", "f", "t"];

/** Tokenize one line into spans with .tk-* classes. */
export function highlight(src: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOK.lastIndex = 0;
  while ((m = TOK.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index));
    const group = m.findIndex((g, i) => i > 0 && g !== undefined);
    out.push(
      <span key={m.index} className={`tk-${CLS[group]}`}>
        {m[0]}
      </span>,
    );
    last = TOK.lastIndex;
    if (m[0] === "") TOK.lastIndex++;
  }
  if (last < src.length) out.push(src.slice(last));
  return out;
}

/* ---------- small parts ---------- */

/** Language tag, e.g. "TSX". */
export function Lang({ children }: { children: ReactNode }) {
  return (
    // Sits on the sunken code head: a surface tag with a control-strength edge (≥ 3:1 on sunken in every theme).
    <span className="mono rounded-inline border border-border-control bg-surface px-1.5 py-px text-caption font-heading text-ink">{children}</span>
  );
}

export interface DiffStat {
  added: number;
  removed: number;
}

/** "+156 −23": additions in success, deletions in danger. */
export function Diffstat({ added, removed, className }: DiffStat & { className?: string }) {
  return (
    <span className={cn("inline-flex gap-1.5 text-caption font-control tabular-nums", className)}>
      <span className="text-success">+{added}</span>
      {removed > 0 && <span className="text-danger">−{removed}</span>}
    </span>
  );
}

const COPY_FAILED = "Unable to copy. Select the text and copy it manually.";

/**
 * Copy with feedback: `copied` drives the copy → check morph, `message` the
 * tooltip, and `announcer` (render it once, anywhere) says the result in a
 * polite live region, because a tooltip alone isn't read out.
 */
export function useCopy(onCopy?: () => void) {
  const [status, setStatus] = useState<"copied" | "failed" | null>(null);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy(text: string) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      /* clipboard blocked */
    }
    if (ok) onCopy?.();
    setStatus(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    // A failure stays up long enough to read the way out.
    timer.current = window.setTimeout(() => setStatus(null), ok ? 1100 : 4000);
  }
  const message = status === "copied" ? "Copied" : status === "failed" ? COPY_FAILED : "";
  const announcer = (
    <span role="status" aria-live="polite" className="sr-only-caret">
      {message}
    </span>
  );
  return { copied: status === "copied", message, copy, announcer };
}

/** Copy button whose tooltip and live region confirm the copy. */
export function CopyButton({ text, label = "Copy code", className }: { text: () => string; label?: string; className?: string }) {
  const { copied, message, copy, announcer } = useCopy();
  return (
    <>
      <IconButton
        label={label}
        tip={message || label}
        className={className}
        // State is visible on the control: the icon morphs copy → check, then back.
        icon={<Morph swapKey={copied ? "check" : "copy"}>{copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}</Morph>}
        onClick={() => copy(text())}
      />
      {announcer}
    </>
  );
}

/* ---------- Code block ---------- */

export interface CodeProps {
  lang: string;
  /** File name or path in the head. */
  name: string;
  lines: string[];
  /** Number of the first line minus one. */
  start?: number;
  stat?: DiffStat;
  className?: string;
}

/** A code block: head (lang, name, diffstat, copy) + numbered lines. */
export function Code({ lang, name, lines, start = 0, stat, className }: CodeProps) {
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-card border border-line bg-surface", className)}>
      <CodeHead lang={lang} name={name} stat={stat} copy={() => lines.join("\n")} />
      <pre
        className="code-lines mono m-0 overflow-x-auto py-2.5 text-code leading-[1.85] text-ink"
        style={{ "--start": start } as React.CSSProperties}
      >
        {lines.map((l, i) => (
          <span key={i} className="ln">
            {highlight(l).length ? highlight(l) : " "}
          </span>
        ))}
      </pre>
    </div>
  );
}

export function CodeHead({
  lang,
  name,
  stat,
  copy,
  copyLabel,
}: {
  lang: string;
  name: string;
  stat?: DiffStat;
  copy: () => string;
  copyLabel?: string;
}) {
  return (
    // The copy button sits 8px in from the rounded corner, so its ring is never clipped.
    <div className="flex h-12 flex-none items-center gap-2.5 border-b border-line bg-sunken pr-2 pl-3">
      <Lang>{lang}</Lang>
      <FilePath path={name} />
      {stat && <Diffstat {...stat} className="ml-auto" />}
      <span className={cn("flex", !stat && "ml-auto")}>
        <CopyButton text={copy} label={copyLabel} />
      </span>
    </div>
  );
}

/** A path that truncates its directory, never the file name. Full path in the title. */
function FilePath({ path }: { path: string }) {
  const cut = path.lastIndexOf("/") + 1;
  return (
    <span title={path} className="mono flex min-w-0 text-small text-ink-2">
      {cut > 0 && <span className="min-w-0 truncate text-ink-3">{path.slice(0, cut)}</span>}
      <span className="flex-none whitespace-nowrap">{path.slice(cut)}</span>
    </span>
  );
}

/* ---------- Diff ---------- */

export type DiffLine = ["+" | "-" | " ", string];

export function diffStatOf(lines: DiffLine[]): DiffStat {
  return {
    added: lines.filter((l) => l[0] === "+").length,
    removed: lines.filter((l) => l[0] === "-").length,
  };
}

export interface DiffProps {
  lang: string;
  path: string;
  lines: DiffLine[];
  /** Hunk header, e.g. "@@ -1,9 +1,12 @@ :root". */
  hunk?: string;
  className?: string;
}

/** A code block showing a diff. Fills its container's height and scrolls inside. */
export function Diff({ lang, path, lines, hunk, className }: DiffProps) {
  let o = 1;
  let n = 1;
  return (
    <div className={cn("flex min-h-0 min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface", className)}>
      <CodeHead
        lang={lang}
        name={path}
        stat={diffStatOf(lines)}
        copyLabel="Copy file"
        copy={() => lines.filter((l) => l[0] !== "-").map((l) => l[1]).join("\n")}
      />
      <pre
        tabIndex={0}
        aria-label={`Diff of ${path}`}
        className="mono m-0 min-h-0 flex-1 overflow-auto pt-2 pb-4 text-code leading-[1.8] text-ink"
      >
        {hunk && <div className="mb-1 border-b border-line bg-sunken px-3.5 py-1.5 whitespace-pre text-ink-3">{hunk}</div>}
        {lines.map(([sign, text], i) => {
          const num = sign === "-" ? o++ : sign === "+" ? n++ : (o++, n++);
          return (
            <div
              key={i}
              className={cn(
                "grid min-w-max grid-cols-[3em_1.6em_1fr] pr-3.5 whitespace-pre",
                sign === "+" && "bg-success-soft",
                sign === "-" && "bg-danger-soft",
              )}
            >
              <span className="pr-[.4em] text-right text-ink-3 select-none">{num}</span>
              <span
                className={cn(
                  "text-center text-ink-3 select-none",
                  sign === "+" && "text-success",
                  sign === "-" && "text-danger",
                )}
              >
                {sign === "+" ? "+" : sign === "-" ? "−" : ""}
              </span>
              <span className={cn(sign === "-" && "text-ink-2")}>{text ? highlight(text) : " "}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
