import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconButton, Morph } from "./button";
import { useCopy } from "./code";

/*
 * KeyValue. The properties of one thing: a run's id, model, duration and cost; a key's scope and
 * last use. A real <dl>, one row per property, rows split by hairlines. Keys are quiet (ink-3),
 * values are ink; a value that is literally code (an id, a SHA, a path) is mono, and numbers
 * line up with tabular-nums. A value worth pasting somewhere carries its own copy button, which
 * confirms like every other copy in Caret.
 *
 * `columns` puts the key beside the value (keys share one width, set by the longest); `stack`
 * puts it above, for narrow panels. Every row is at least 36px, whether or not it has a button,
 * so a list with some copyable values doesn't jump.
 */

export interface KeyValueProps extends ComponentProps<"dl"> {
  layout?: "columns" | "stack";
}

export function KeyValue({ layout = "columns", className, ...props }: KeyValueProps) {
  return (
    <dl
      data-layout={layout}
      className={cn(
        "group/kv m-0 grid min-w-0",
        layout === "columns" ? "grid-cols-[minmax(0,max-content)_minmax(0,1fr)] gap-x-6" : "grid-cols-1",
        className,
      )}
      {...props}
    />
  );
}

export interface KeyValueItemProps extends Omit<ComponentProps<"div">, "children"> {
  label: ReactNode;
  children: ReactNode;
  /** The value is code: an id, a hash, a path, a key. */
  mono?: boolean;
  /** Numbers that line up: counts, durations, money. */
  numeric?: boolean;
  /** Text to copy (usually the value). Shows a copy button. */
  copy?: string;
  /** What the copy button copies, for its name: "Copy run ID". */
  copyLabel?: string;
}

export function KeyValueItem({ label, children, mono, numeric, copy, copyLabel, className, ...props }: KeyValueItemProps) {
  return (
    <div
      className={cn(
        // One row of the parent grid: subgrid, so every key shares the longest key's width.
        "col-span-full grid grid-cols-subgrid items-center border-b border-line last:border-b-0",
        "group-data-[layout=stack]/kv:gap-0.5 group-data-[layout=stack]/kv:py-2",
        className,
      )}
      {...props}
    >
      <dt className="flex min-h-9 items-center text-small text-ink-3 group-data-[layout=stack]/kv:min-h-0">{label}</dt>
      <dd className="m-0 flex min-h-9 min-w-0 items-center gap-1 group-data-[layout=stack]/kv:min-h-7">
        <span
          title={typeof children === "string" ? children : undefined}
          className={cn("min-w-0 truncate text-small text-ink", mono && "mono", numeric && "tabular-nums")}
        >
          {children}
        </span>
        {copy != null && <CopyValue text={copy} label={copyLabel ?? (typeof label === "string" ? `Copy ${label.toLowerCase()}` : "Copy")} />}
      </dd>
    </div>
  );
}

function CopyValue({ text, label }: { text: string; label: string }) {
  const { copied, message, copy, announcer } = useCopy();
  return (
    <>
      <IconButton
        size="sm"
        className="flex-none"
        label={label}
        tip={message || label}
        icon={<Morph swapKey={copied ? "check" : "copy"}>{copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}</Morph>}
        sound={false}
        onClick={() => copy(text)}
      />
      {announcer}
    </>
  );
}
