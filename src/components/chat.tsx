import { Collapsible } from "@base-ui/react/collapsible";
import { Meter } from "@base-ui/react/meter";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import {
  ArrowUpIcon,
  CaretRightIcon,
  CheckIcon,
  CircleNotchIcon,
  CopyIcon,
  StopIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { playSound } from "@/lib/sound";
import { IconButton, Morph } from "./button";
import { useCopy } from "./code";
import { panelContentClass, panelHeightClass } from "./collapsible";
import { Tooltip, TooltipGroup } from "./tooltip";

/*
 * Chat. The trace shows what the agent did before answering and collapses
 * once the answer is done ("Worked for 41s"). The reply streams with the
 * accent caret as the write head. The composer's Send becomes Stop while
 * busy (Esc stops). The context meter turns danger-colored at ≥85%.
 *
 * Layout answers the column's own width, not the viewport: Messages is a
 * size container, so a chat in a narrow pane lays out like one on a phone.
 *
 * The look follows the rest of Caret: no bubbles. Your message is a plain block
 * of the surface ground, with no edge; the agent's reply is text on the page.
 * The composer is a field (--r-control) with its controls 4px in, so every
 * 28px button inside is concentric with it (8 − 4 = 4).
 */

/* ---------- messages ---------- */

/**
 * The message column. Messages arrive with a short rise (4px + opacity, on
 * --d-quick) — each one as it's inserted, via @starting-style. For the batch
 * present when the column mounts (opening a thread: give it `key={thread}`),
 * they stagger 40ms apart, capped at 200ms. Purely visual: nothing waits on it.
 */
export function Messages({ className, ...props }: ComponentProps<"div">) {
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className={cn(
        "@container flex flex-col gap-5",
        "[&>*]:transition-[opacity,translate] [&>*]:duration-quick [&>*]:ease-out",
        "[&>*]:starting:translate-y-1 [&>*]:starting:opacity-0",
        entering && [
          "[&>*:nth-child(2)]:delay-[calc(40ms*var(--motion-scale))]",
          "[&>*:nth-child(3)]:delay-[calc(80ms*var(--motion-scale))]",
          "[&>*:nth-child(4)]:delay-[calc(120ms*var(--motion-scale))]",
          "[&>*:nth-child(5)]:delay-[calc(160ms*var(--motion-scale))]",
          "[&>*:nth-child(n+6)]:delay-[calc(200ms*var(--motion-scale))]",
        ],
        className,
      )}
      {...props}
    />
  );
}

export function MsgUser({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "max-w-[min(85%,560px)] self-end rounded-control bg-surface px-3 py-2",
        "text-body break-words whitespace-pre-wrap text-ink @max-[600px]:max-w-[92%]",
        className,
      )}
      {...props}
    />
  );
}

export function MsgAgent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2.5 text-body leading-6 text-ink",
        "[&_p]:m-0 [&_p]:max-w-[68ch]",
        "[&_p_code]:rounded-inline [&_p_code]:border [&_p_code]:border-line [&_p_code]:bg-sunken [&_p_code]:px-1 [&_p_code]:py-px [&_p_code]:text-caption",
        className,
      )}
      {...props}
    />
  );
}

/** The write head: an accent caret at the end of streaming text. */
export function StreamCaret() {
  return (
    <span
      aria-hidden
      className="ml-px inline-block h-4 w-0.5 animate-blink rounded-[1px] bg-accent align-[-3px]"
    />
  );
}

/** A row of status badges under a reply. */
export function Checks({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-wrap gap-1.5", className)} {...props} />;
}

/* ---------- trace ---------- */

export interface TraceStep {
  label: string;
  /** Elapsed time, e.g. "0:11". */
  time?: string;
  /** `now` = in progress: spinner instead of a tick. */
  state?: "done" | "now";
}

export interface TraceProps {
  steps: TraceStep[];
  /** Live: "Working" with a pulsing dot. Otherwise shows `summary`. */
  live?: boolean;
  summary: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

/**
 * What the agent did before answering. Collapses once the answer is done. The steps open and close
 * like any collapsible: height on ease-in-out, the list fading in just behind it. The rail starts
 * right under the trigger, with no gap.
 */
export function Trace({ steps, live, summary, open, onOpenChange, defaultOpen }: TraceProps) {
  return (
    <Collapsible.Root
      open={open}
      onOpenChange={(o) => {
        playSound(o ? "open" : "close");
        onOpenChange?.(o);
      }} defaultOpen={defaultOpen} className="flex flex-col">
      <Collapsible.Trigger
        className={cn(
          "-ms-1 inline-flex min-h-6 items-center gap-1.5 self-start rounded-button border-0 bg-transparent ps-1 pe-2 text-small text-ink-3 touch:min-h-11",
          "hover:bg-hover hover:text-ink",
          "[&>svg]:transition-transform [&>svg]:duration-quick [&>svg]:ease-out data-panel-open:[&>svg]:rotate-90",
        )}
      >
        <CaretRightIcon size={14} aria-hidden />
        {live ? (
          <span className="inline-flex items-center gap-1.5 text-ink before:size-1.5 before:animate-pulse-dot before:rounded-full before:bg-accent before:content-['']">
            Working
          </span>
        ) : (
          <span>{summary}</span>
        )}
      </Collapsible.Trigger>
      <Collapsible.Panel className={cn(panelHeightClass, "h-(--collapsible-panel-height)")}>
        <ol
          // The rail hangs from the caret: 6px in puts the 1px line on the 14px caret's centre (a
          // hairline may take the odd half). The steps keep their 13px inset: 6 + 1 + 6.
          className={cn(
            panelContentClass,
            "m-0 ms-1.5 flex list-none flex-col gap-1.5 border-s border-line py-0.5 ps-1.5 text-small text-ink-2",
          )}
        >
          {steps.map((s, i) => (
            <li
              key={i}
              className={cn(
                "flex items-start gap-2 transition-[opacity,translate] duration-quick ease-out",
                // A new step rises into place as the agent reaches it.
                "starting:translate-y-1 starting:opacity-0",
                s.state === "now" && "text-ink",
              )}
            >
              {s.state === "now" ? (
                <CircleNotchIcon size={12} className="mt-1 flex-none animate-spin text-ink-3" aria-label="In progress" />
              ) : (
                <CheckIcon size={12} className="mt-1 flex-none text-success" aria-label="Done" />
              )}
              <span className="min-w-0 flex-1 break-words">{s.label}</span>
              {s.time && <span className="flex-none text-caption leading-[inherit] text-ink-3 tabular-nums">{s.time}</span>}
            </li>
          ))}
        </ol>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

/* ---------- actions ---------- */

export type Vote = "good" | "bad" | null;

export interface MsgActionsProps {
  vote?: Vote;
  onVote?: (vote: Vote) => void;
  /** Called after the reply was copied. */
  onCopy?: () => void;
  copyText?: () => string;
}

/** Feedback + copy under a reply. The votes are one toggle group: pick one, or neither. */
export function MsgActions({ vote, onVote, onCopy, copyText }: MsgActionsProps) {
  const { copied, message, copy, announcer } = useCopy(onCopy);
  // Toggled on reads as pressed, not hover: the pressed fill plus a filled icon.
  const pressed = "aria-pressed:[--bg:var(--pressed)]";
  return (
    <TooltipGroup>
      <div className="-ms-1 flex gap-0.5">
        <ToggleGroup
          value={vote ? [vote] : []}
          onValueChange={(v) => {
            playSound(v.length ? "on" : "off");
            onVote?.((v[0] as Vote) ?? null);
          }}
          aria-label="Rate this response"
          className="flex gap-0.5"
        >
          <Toggle
            value="good"
            render={<IconButton label="Good response" size="sm" sound={false} className={pressed} icon={<ThumbsUpIcon size={16} weight={vote === "good" ? "fill" : "regular"} />} />}
          />
          <Toggle
            value="bad"
            render={<IconButton label="Bad response" size="sm" sound={false} className={pressed} icon={<ThumbsDownIcon size={16} weight={vote === "bad" ? "fill" : "regular"} />} />}
          />
        </ToggleGroup>
        <IconButton
          size="sm"
          label="Copy response"
          tip={message || "Copy response"}
          icon={
            <Morph swapKey={copied ? "check" : "copy"}>
              {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
            </Morph>
          }
          sound={false}
          onClick={() => copy(copyText?.() ?? "")}
        />
        {announcer}
      </div>
    </TooltipGroup>
  );
}

/* ---------- context meter ---------- */

export interface ContextMeterProps {
  /** Percent of the context window used, 0–100. */
  value: number;
  /** Makes the meter a button, e.g. to open context details. */
  onClick?: () => void;
  /**
   * Tooltip at ≥85%: say what your product does next, e.g. "Older messages
   * will be summarized." Defaults to how full it is.
   */
  hotText?: string;
  className?: string;
}

/** How full the context window is. Danger-colored at ≥85%. */
export function ContextMeter({ value, onClick, hotText, className }: ContextMeterProps) {
  const p = Math.max(0, Math.min(100, Math.round(value)));
  const hot = p >= 85;
  const tip = hot ? (hotText ?? `Context ${p}% full`) : `Context used: ${p}% of the window`;
  const cls = cn(
    "inline-flex min-h-6.5 items-center gap-1.5 rounded-pill border border-line bg-sunken py-0.5 ps-1.5 pe-2 text-caption text-ink tabular-nums",
    hot && "border-danger-line bg-danger-soft text-danger",
    onClick ? "cursor-pointer hover:bg-hover" : "cursor-default",
    className,
  );
  const meter = (
    <Meter.Root value={p} aria-label="Context used" render={<span />} className="inline-flex items-center gap-1.5">
      <span aria-hidden className="ctx-ring" style={{ "--p": p, "--ring": hot ? "var(--danger)" : "var(--ink)" } as React.CSSProperties} />
      <Meter.Value render={<span />}>{() => `${p}%`}</Meter.Value>
    </Meter.Root>
  );
  return (
    <Tooltip label={tip}>
      {onClick ? (
        <button type="button" onClick={onClick} className={cls}>
          {meter}
        </button>
      ) : (
        <span tabIndex={0} className={cls}>
          {meter}
        </span>
      )}
    </Tooltip>
  );
}

/* ---------- composer ---------- */

export interface ComposerProps {
  /** Called with the trimmed text. */
  onSend: (text: string) => void;
  /** While busy, Send becomes Stop and Esc stops. */
  busy?: boolean;
  onStop?: () => void;
  onChange?: (text: string) => void;
  placeholder?: string;
  /** Left of the spacer: attach etc. */
  tools?: ReactNode;
  /** Right of the spacer, before Send: model picker, dictate. */
  controls?: ReactNode;
  textareaRef?: React.Ref<HTMLTextAreaElement>;
  className?: string;
}

export function Composer({
  onSend,
  busy = false,
  onStop,
  onChange,
  placeholder = "Ask for a change, or describe what you need",
  tools,
  controls,
  textareaRef,
  className,
}: ComposerProps) {
  const [text, setText] = useState("");
  const ta = useRef<HTMLTextAreaElement | null>(null);
  const id = useId();

  // Grow with the text, up to 180px; and again when the width changes, since the same text (or
  // the placeholder) wraps to a different number of lines. A height set while the composer sat in
  // a narrow column would otherwise stick after it widens.
  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    const grow = () => {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 180) + "px";
    };
    grow();
    let width = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      grow();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  const canSend = !!text.trim();

  function fire() {
    if (busy) {
      playSound("off");
      return onStop?.();
    }
    const t = text.trim();
    if (!t) return;
    playSound("send");
    setText("");
    onChange?.("");
    onSend(t);
  }

  return (
    // The box wears the textarea's focus line (data-focus-proxy), on click too; Attach,
    // the model picker, Dictate and Send keep their own. 8px outer = 4px buttons + 4px inset.
    <div
      data-focus-target
      className={cn(
        "flex min-w-0 flex-col rounded-control border-stroke border-border-field bg-surface",
        "transition-[border-color] duration-instant has-[[data-focus-proxy]:focus]:field-focus",
        "not-has-[[data-focus-proxy]:focus]:hover:border-border-control",
        className,
      )}
    >
      <label htmlFor={id} className="sr-only-caret">
        Message the agent
      </label>
      <textarea
        id={id}
        data-focus-proxy
        ref={(el) => {
          ta.current = el;
          if (typeof textareaRef === "function") textareaRef(el);
          else if (textareaRef) (textareaRef as React.RefObject<HTMLTextAreaElement | null>).current = el;
        }}
        rows={1}
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          onChange?.(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            fire();
          }
          if (e.key === "Escape" && busy) {
            e.preventDefault();
            onStop?.();
          }
        }}
        className="block max-h-[180px] min-h-11 w-full resize-none rounded-t-control border-0 bg-transparent px-3 pt-2.5 pb-1 text-input-touch text-ink placeholder:text-ink-3 sm:text-body"
      />
      {/* One shared tooltip for the row: attach, dictate, send. */}
      <TooltipGroup>
        {/* Pickers in `controls` shrink first; buttons keep their size and Send never leaves the row. */}
        <div className="flex min-w-0 items-center gap-0.5 p-1 pt-0.5 [&>button]:flex-none">
          {tools}
          <div className="min-w-0 flex-1" />
          <div className="flex min-w-0 items-center justify-end gap-1 [&>*]:min-w-0 [&>button]:flex-none">{controls}</div>
          <IconButton
            className="flex-none"
            size="sm"
            variant="primary"
            label={busy ? "Stop" : "Send"}
            kbd={busy ? "Esc" : "↵"}
            icon={<Morph swapKey={busy ? "stop" : "send"}>{busy ? <StopIcon weight="fill" /> : <ArrowUpIcon weight="bold" />}</Morph>}
            disabled={!busy && !canSend}
            // Send and Stop have their own sounds, played by fire(), so Enter in the box sounds the same.
            sound={false}
            onClick={fire}
          />
        </div>
      </TooltipGroup>
    </div>
  );
}

/** The row under a composer: branch, directory, mode, context. */
export function ComposerFoot({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-wrap items-center gap-1 pt-1.5 text-small text-ink-3", className)} {...props} />;
}
