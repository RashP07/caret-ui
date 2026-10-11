import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { LayoutGroup, motion, type Transition } from "motion/react";
import { createContext, useContext, useId, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";
import { settle } from "@/lib/motion";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/cn";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./button";
import { Kbd } from "./kbd";
import { pressClass, pressColorTransition, useModalityTransition } from "./modality";
import { Tooltip } from "./tooltip";

/*
 * Links. Something that goes somewhere is an <a>; something that does something is a Button.
 * Each form below keeps that: Enter follows it, the browser can open it in a new tab, and
 * screen readers call it a link. What changes is how loud it is where it sits.
 *
 *   inline  running text: link color and an underline, so it never rides on color alone
 *   quiet   meta lines and footers: ink-2 with a line-strong underline that turns ink on hover
 *   code    a path or symbol in an agent reply: mono, on the inline-code chip
 *   nav     a top bar (inside NavLinks): plain text; the current page is ink with an accent bar on
 *           the bar's bottom edge that glides from the page you left
 *
 * LinkButton is a link that looks like a Button (one primary path, "Open pull request"), and
 * Citation is the numbered source mark an agent puts after a claim.
 *
 * External links (another origin) get a 12px ↗ and open in a new tab; the screen reader hears
 * "opens in a new tab", so the arrow is never the only cue.
 */

export type LinkVariant = "inline" | "quiet" | "code" | "nav";

/** Absolute http(s) links to another origin. Relative paths, hashes and mailto stay in place. */
export function isExternalHref(href: string | undefined) {
  if (!href || !/^https?:\/\//i.test(href)) return false;
  if (typeof window === "undefined") return true;
  try {
    return new URL(href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

/** The ↗ and its spoken twin. The arrow is decoration; the words carry it. */
function ExternalMark({ size = 12 }: { size?: 12 | 14 }) {
  return (
    <>
      <ArrowUpRightIcon aria-hidden size={size} weight="bold" className="inline-block flex-none" />
      <span className="sr-only-caret"> (opens in a new tab)</span>
    </>
  );
}

const variants: Record<LinkVariant, string> = {
  // The `link` utility: --link, a 1px underline 2px down, --link-hover on hover.
  inline: cn(
    "link rounded-[2px] decoration-skip-ink",
    "transition-[color,text-decoration-color] duration-instant ease-hover",
    "visited:text-link",
  ),
  // The same vocabulary as the PreviewCard trigger: quiet until you point at it, never unmarked.
  quiet: cn(
    "rounded-[2px] text-ink-2 underline decoration-line-strong decoration-1 underline-offset-2",
    "transition-[color,text-decoration-color] duration-instant ease-hover",
    "hover:text-ink hover:decoration-ink",
  ),
  // Inline code that goes somewhere: the chip says "this is code", the underline says "this is a link".
  code: cn(
    "mono rounded-inline border border-line bg-sunken px-1 py-px text-caption text-link",
    "underline decoration-1 underline-offset-2 [box-decoration-break:clone]",
    "transition-[color,background-color,text-decoration-color] duration-instant ease-hover",
    "hover:bg-hover hover:text-link-hover",
  ),
  // A top-bar link: plain text, no face. It stretches to the bar's height, so the current mark sits
  // on the bar's bottom edge, where a tab's ink would. Hover is color only: it's seen constantly.
  nav: cn(
    "relative inline-flex min-h-9 items-center gap-1.5 self-stretch px-3 text-control font-control text-ink-2 no-underline select-none",
    "touch:min-h-11",
    "transition-colors duration-instant ease-hover",
    "hover:text-ink [&>svg]:text-ink-3 [&>svg]:transition-colors [&>svg]:duration-instant hover:[&>svg]:text-ink",
    "aria-[current=page]:text-ink aria-[current=page]:[&>svg]:text-ink",
  ),
};

/* ---------- nav links ---------- */

const NavLinksContext = createContext<{ transition: () => Transition } | null>(null);

export interface NavLinksProps extends ComponentProps<"nav"> {
  /** Names the landmark, e.g. "Workspace". */
  "aria-label": string;
}

/**
 * A row of nav links: a <nav> landmark that stretches its links to its height. The current mark
 * is one shared element, so it glides from the page you left (and snaps when the keyboard moved it).
 * Give it the bar's height and its bottom hairline; the mark lands on that line.
 */
export function NavLinks({ className, children, ...props }: NavLinksProps) {
  const id = useId();
  const { handlers, transition } = useModalityTransition(settle);
  return (
    <NavLinksContext.Provider value={{ transition }}>
      <LayoutGroup id={id}>
        <nav {...handlers} className={cn("flex min-w-0 items-stretch gap-1", className)} {...props}>
          {children}
        </nav>
      </LayoutGroup>
    </NavLinksContext.Provider>
  );
}

/** The current page's mark: a 2px accent-strong bar under the label, on the bar's bottom edge. */
function NavBar() {
  const group = useContext(NavLinksContext);
  return (
    <motion.span
      aria-hidden
      layoutId={group ? "nav-link-current" : undefined}
      transition={group?.transition()}
      className="absolute inset-x-3 bottom-0 h-0.5 rounded-[1px] bg-accent-strong"
    />
  );
}

/** Class names for a link form, for the rare element that can't take <Link render>. */
export function linkClass(variant: LinkVariant = "inline") {
  return variants[variant];
}

export interface LinkProps extends ComponentProps<"a"> {
  variant?: LinkVariant;
  /** Leading icon (nav only: a 16px Phosphor icon). */
  icon?: ReactNode;
  /** The current page (nav): sets aria-current="page". */
  current?: boolean;
  /** Force the external mark and new tab on or off. Defaults to "href is another origin". */
  external?: boolean;
  /** Render as another element, e.g. a router's <Link to>. Props and classes merge onto it. */
  render?: useRender.RenderProp;
}

export function Link({ variant = "inline", icon, current, external, render, className, children, ...props }: LinkProps) {
  const isExternal = external ?? isExternalHref(props.href);
  const isNav = variant === "nav";

  return useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(
      {
        "aria-current": current ? "page" : undefined,
        // A nav link is a pick among pages; links in text stay silent, like the web.
        onClick: isNav ? () => playSound("select") : undefined,
        target: isExternal ? "_blank" : undefined,
        rel: isExternal ? "noopener noreferrer" : undefined,
        className: cn(variants[variant], className),
        children: (
          <>
            {isNav && icon}
            {children}
            {isNav && current && <NavBar />}
            {isExternal && (
              // A non-breaking join, so the arrow never wraps onto a line of its own.
              <>
                {isNav ? null : "⁠"}
                <span className={cn(isNav ? "flex" : "ms-0.5 inline-block align-[-1px]")}>
                  <ExternalMark size={12} />
                </span>
              </>
            )}
          </>
        ),
      },
      props,
    ),
  });
}

/* ---------- link button ---------- */

export interface LinkButtonProps extends ComponentProps<"a"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon. */
  icon?: ReactNode;
  /** Trailing icon. External links get ↗ here unless you pass one. */
  trail?: ReactNode;
  /** Shortcut printed on the face. */
  kbd?: string;
  external?: boolean;
  render?: useRender.RenderProp;
}

/**
 * A link that looks like a Button: the same face, ledge, press travel and optical padding. Use it
 * when the main action on a surface is going somewhere ("Open pull request", "View run"). It stays
 * a link: Enter follows it (Space scrolls, as it does on every link), and there is no disabled
 * form. A link that can't go anywhere is a disabled Button, or nothing.
 */
export function LinkButton({
  variant = "secondary",
  size,
  icon,
  trail,
  kbd,
  external,
  render,
  className,
  children,
  onKeyDown,
  onKeyUp,
  onBlur,
  onPointerDown,
  ...props
}: LinkButtonProps) {
  // Enter presses the key down, the same as a Button, so the keyboard sees the press too.
  const [keyDown, setKeyDown] = useState(false);
  const isExternal = external ?? isExternalHref(props.href);
  const isIconOnly = !children && !!icon;
  const end = trail ?? (isExternal ? <ArrowUpRightIcon aria-hidden size={size === "sm" ? 14 : 16} /> : null);

  return useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(
      {
        target: isExternal ? "_blank" : undefined,
        rel: isExternal ? "noopener noreferrer" : undefined,
        // Optical spacing, read by buttonClass: the icon side and the trailing side take --pad-icon.
        ...({ "data-lead": (icon != null && !isIconOnly) || undefined, "data-trail": (kbd != null || end != null) || undefined } as object),
        className: cn(buttonClass(variant, { icon: isIconOnly, pressed: keyDown, size }), className),
        onKeyDown: (e: KeyboardEvent<HTMLAnchorElement>) => {
          if (e.key === "Enter") {
            setKeyDown(true);
            if (!e.repeat) playSound("press");
          }
          onKeyDown?.(e);
        },
        onKeyUp: (e: KeyboardEvent<HTMLAnchorElement>) => {
          setKeyDown(false);
          onKeyUp?.(e);
        },
        onBlur: (e) => {
          setKeyDown(false);
          onBlur?.(e);
        },
        onPointerDown: (e) => {
          if (e.button === 0) playSound("press");
          onPointerDown?.(e);
        },
        children: (
          <span className="inline-flex min-w-0 items-center gap-2">
            {icon}
            {children != null && <span className="min-w-0 truncate">{children}</span>}
            {kbd && <Kbd keys={kbd} size={size === "sm" ? "sm" : "default"} />}
            {end}
            {isExternal && <span className="sr-only-caret"> (opens in a new tab)</span>}
          </span>
        ),
      },
      props,
    ),
  });
}

/* ---------- citation ---------- */

export interface CitationProps extends Omit<ComponentProps<"a">, "title" | "children"> {
  /** The source's number in this reply, from 1. */
  n: number;
  /** What the source is: the tooltip, and part of the accessible name. */
  title: string;
  /** Where it lives, e.g. "github.com" or "src/lib/theme.ts". Shown under the title. */
  source?: string;
}

/**
 * A numbered source mark after a claim in an agent reply: a 20px pill in the text, its number in
 * tabular figures. Hover or focus names the source; the link opens it. It sits in a sentence, so the
 * inline-target exception to the 24px minimum applies, and it still grows to 44px on touch.
 */
export function Citation({ n, title, source, href, className, ...props }: CitationProps) {
  const isExternal = isExternalHref(href);
  return (
    <Tooltip
      label={
        <span className="flex flex-col">
          <span>{title}</span>
          {source && <span className="mono text-caption font-normal">{source}</span>}
        </span>
      }
    >
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        aria-label={`Source ${n}: ${title}${isExternal ? " (opens in a new tab)" : ""}`}
        className={cn(
          "relative mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-pill border border-line bg-sunken px-1.5 align-[2px]",
          "text-caption font-control tabular-nums text-ink-2 no-underline select-none",
          pressColorTransition,
          pressClass,
          "hover:border-line-strong hover:bg-hover hover:text-ink",
          "touch:before:absolute touch:before:top-1/2 touch:before:left-1/2 touch:before:size-11 touch:before:-translate-1/2 touch:before:content-['']",
          className,
        )}
        {...props}
      >
        {n}
      </a>
    </Tooltip>
  );
}
