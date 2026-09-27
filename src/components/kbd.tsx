import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Kbd. A shortcut, printed the same way everywhere: one cap per key, split from any
 * spelling ("⌘K", "⌘ K" and "⇧⌘Z" all work). Caps take their color from the text around
 * them (currentColor), so the same component reads right on a primary button, a dark
 * tooltip, a menu row or a paragraph, with no per-place overrides. Screen readers hear the
 * key names ("Command K"); the glyphs are hidden from them.
 */

const MODIFIERS = "⌘⌥⇧⌃";

const SPOKEN: Record<string, string> = {
  "⌘": "Command", "⌥": "Option", "⇧": "Shift", "⌃": "Control",
  "↵": "Enter", "⏎": "Enter", "⌫": "Delete", "⌦": "Forward delete", "⇥": "Tab", "⎋": "Escape",
  "↑": "Up arrow", "↓": "Down arrow", "←": "Left arrow", "→": "Right arrow",
  Esc: "Escape", esc: "Escape", "−": "Minus", "+": "Plus", "\\": "Backslash", "/": "Slash",
  ".": "Period", ",": "Comma", "`": "Backtick",
};

/** Symbol keys come from a fallback font that draws them small; they get a size up to match the letters. */
const SYMBOL = /^[⌘⌥⇧⌃↵⏎⌫⌦⇥⎋↑↓←→]$/;

/** "⇧⌘Z" → ["⇧", "⌘", "Z"]: split on spaces, then peel modifier glyphs off each chunk. */
export function parseKeys(keys: string): string[] {
  return keys
    .trim()
    .split(/\s+/)
    .flatMap((chunk) => {
      const out: string[] = [];
      let rest = chunk;
      while (rest.length > 1 && MODIFIERS.includes(rest[0])) {
        out.push(rest[0]);
        rest = rest.slice(1);
      }
      if (rest) out.push(rest);
      return out;
    });
}

/** A cap tinted from the surrounding text: the border and fill are that color, thinned. */
const capClass = (size: "default" | "sm") =>
  cn(
    "inline-grid place-items-center rounded-inline border border-b-2 px-1 text-caption leading-none text-inherit",
    "border-[color-mix(in_srgb,currentColor_26%,transparent)] bg-[color-mix(in_srgb,currentColor_7%,transparent)]",
    size === "sm" ? "min-h-[18px] min-w-[18px]" : "min-h-5 min-w-5",
  );

export interface KbdProps extends Omit<ComponentProps<"kbd">, "children"> {
  /** The shortcut, e.g. "⌘K", "⇧ ⌘ Z", "Esc". Rendered as one cap per key. */
  keys?: string;
  /** A single cap with custom content, when `keys` doesn't fit. */
  children?: ReactNode;
  /** `sm` for dense rows (small buttons, compact menus). */
  size?: "default" | "sm";
}

export function Kbd({ keys, children, size = "default", className, ...props }: KbdProps) {
  if (keys == null) {
    return (
      <kbd className={cn(capClass(size), className)} {...props}>
        {children}
      </kbd>
    );
  }
  const list = parseKeys(keys);
  return (
    <kbd className={cn("inline-flex flex-none items-center gap-0.5 align-middle", className)} {...props}>
      <span className="sr-only-caret">{list.map((k) => SPOKEN[k] ?? k).join(" ")}</span>
      {list.map((k, i) => (
        <kbd key={i} aria-hidden className={cn(capClass(size), SYMBOL.test(k) && "text-small")}>
          {k}
        </kbd>
      ))}
    </kbd>
  );
}
