import type { ComponentProps, ReactNode } from "react";
import {
  ArrowDownIcon, ArrowElbowDownLeftIcon, ArrowFatUpIcon, ArrowLeftIcon, ArrowLineRightIcon,
  ArrowRightIcon, ArrowUpIcon, BackspaceIcon, CommandIcon, ControlIcon, OptionIcon,
  type Icon,
} from "@phosphor-icons/react";
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

/** Symbol keys are drawn as icons: as text they fall back to whatever system font has the glyph,
 *  so their size, weight and baseline drift from cap to cap. Escape reads better spelled out. */
const GLYPH: Record<string, Icon> = {
  "⌘": CommandIcon, "⌥": OptionIcon, "⇧": ArrowFatUpIcon, "⌃": ControlIcon,
  "↵": ArrowElbowDownLeftIcon, "⏎": ArrowElbowDownLeftIcon, "⌫": BackspaceIcon, "⌦": BackspaceIcon,
  "⇥": ArrowLineRightIcon, "↑": ArrowUpIcon, "↓": ArrowDownIcon, "←": ArrowLeftIcon, "→": ArrowRightIcon,
};
const LABEL: Record<string, string> = { "⎋": "esc" };

function capContent(k: string, size: "default" | "sm") {
  const Glyph = GLYPH[k];
  if (!Glyph) return LABEL[k] ?? k;
  // Forward delete is backspace pointing the other way.
  return <Glyph size={size === "sm" ? 10 : 12} weight="bold" className={k === "⌦" ? "-scale-x-100" : undefined} />;
}

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

/** A cap tinted from the surrounding text: the key is that color dimmed (a shortcut is secondary
 *  to its label), and the border and fill are thinned from the dimmed color, so 40% and 11% here
 *  land at about 26% and 7% of the surrounding text.
 *  A fixed height (not min-height) so icon caps and letter caps always line up. The 2px ledge
 *  leaves an odd face (17px, 15px at sm); 1px of bottom padding makes the content box even
 *  (16, 14) so 12px text and 12/10px glyphs center on whole pixels. */
const capClass = (size: "default" | "sm") =>
  cn(
    "inline-grid place-items-center rounded-inline border border-b-2 px-1 pb-px text-caption leading-none",
    "text-[color-mix(in_srgb,currentColor_65%,transparent)]",
    "border-[color-mix(in_srgb,currentColor_40%,transparent)] bg-[color-mix(in_srgb,currentColor_11%,transparent)]",
    size === "sm" ? "h-[18px] min-w-[18px]" : "h-5 min-w-5",
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
        <kbd key={i} aria-hidden className={capClass(size)}>
          {capContent(k, size)}
        </kbd>
      ))}
    </kbd>
  );
}
