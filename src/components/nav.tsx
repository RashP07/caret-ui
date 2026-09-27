import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import { LayoutGroup, motion, type Transition } from "motion/react";
import { createContext, useContext, useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { glide, instant as instantTransition } from "@/lib/motion";
import { pressColorTransition } from "./modality";

const ThreadsContext = createContext(false);
/** Set inside a NavGroup: the current-row highlight is shared, and this is how it moves. */
const NavGroupContext = createContext<{ transition: Transition | undefined } | null>(null);

export interface NavGroupProps {
  children: ReactNode;
  /**
   * Snap instead of glide. Pass it while the current row changes for a reason
   * the user didn't point at — scroll-spy, keyboard — where motion is noise.
   */
  instant?: boolean;
}

/**
 * Wrap one navigable list (a sidebar, a file list). The current-row highlight
 * becomes one shared element that glides to the new row instead of jumping,
 * so you can see where you came from. Scoped: two groups never trade highlights.
 */
export function NavGroup({ children, instant = false }: NavGroupProps) {
  const id = useId();
  // undefined = MotionConfig's default (the `settle` spring).
  return (
    <NavGroupContext.Provider value={{ transition: instant ? instantTransition : glide }}>
      <LayoutGroup id={id}>{children}</LayoutGroup>
    </NavGroupContext.Provider>
  );
}

export interface NavItemProps extends Omit<ComponentProps<"button">, "children"> {
  /** Leading icon. */
  icon?: ReactNode;
  children?: ReactNode;
  /** Trailing meta: a time, a count, a diffstat. */
  meta?: ReactNode;
  /** Trailing badge or other status. */
  trail?: ReactNode;
  /** The current row: sets aria-current. */
  current?: boolean;
  /** Something is running here: the meta gets a pulsing accent dot (read out as "running"). */
  live?: boolean;
  /** Render a file path in mono: the dimmed directory truncates, the file name stays. Replaces children. */
  path?: string;
  /** Render as another element, e.g. <a href>. */
  render?: useRender.RenderProp;
}

/**
 * A row in a list you navigate: threads, files, settings nav.
 * Button-shaped, so it gets the button radius. The current row wears the
 * selected fill, ink text at heading weight and, in threads, an accent mark.
 * Rows are full width, so press answers in color, never scale.
 */
export function NavItem({ icon, children, meta, trail, current, live, path, render, className, ...props }: NavItemProps) {
  const nested = useContext(ThreadsContext);
  const shared = useContext(NavGroupContext);

  let name: ReactNode = <span className="min-w-0 flex-1 truncate">{children}</span>;
  if (path) {
    const parts = path.split("/");
    const file = parts.pop();
    // The directory gives way first; the file name only truncates once the directory is gone.
    name = (
      <span title={path} className="mono flex min-w-0 flex-1 text-caption">
        {parts.length > 0 && <span className="min-w-0 shrink-[1000] truncate text-ink-3">{parts.join("/")}/</span>}
        <span className="min-w-0 truncate">{file}</span>
      </span>
    );
  }

  const content = (
    <>
      {current && (
        <>
          {/* The raised face of the current row. While it glides it passes over other rows,
              so every row's content sits one layer above it (see [&>*:not([data-nav-face])]). */}
          <motion.span
            aria-hidden
            data-nav-face="face"
            layoutId={shared ? "nav-current" : undefined}
            transition={shared?.transition}
            className="absolute inset-0 rounded-button bg-selected"
          />
          {/* In threads, the accent marks the thread line beside the current row. */}
          {nested && (
            <motion.span
              aria-hidden
              data-nav-face="mark"
              layoutId={shared ? "nav-mark" : undefined}
              transition={shared?.transition}
              className="absolute top-2 -left-[11px] h-3.5 w-[3px] rounded-[2px] bg-accent-strong"
            />
          )}
        </>
      )}
      {icon}
      {name}
      {meta != null && (
        <span className={cn("ml-auto flex-none text-caption font-normal tabular-nums text-ink-3", live && "text-ink")}>
          {live && (
            <>
              <span aria-hidden className="mr-1.5 inline-block size-1.5 animate-pulse-dot rounded-full bg-accent-strong align-[1px]" />
              <span className="sr-only-caret">running, </span>
            </>
          )}
          {meta}
        </span>
      )}
      {trail}
    </>
  );

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        type: render ? undefined : "button",
        "aria-current": current ? "true" : undefined,
        className: cn(
          "group/nav relative flex w-full items-center gap-2.5 rounded-button border-0 bg-transparent px-2 text-left font-control text-ink-2 no-underline",
          // Rows live in clipped lists (scroll areas, collapsing panels): the focus ring sits inside.
          "-outline-offset-2",
          pressColorTransition,
          "hover:bg-hover hover:text-ink active:bg-pressed",
          // Content rides above any gliding face, this row's or a neighbour's.
          "[&>*:not([data-nav-face])]:relative [&>*:not([data-nav-face])]:z-[1]",
          "[&>svg]:flex-none [&>svg]:text-ink-3 [&>svg]:transition-colors [&>svg]:duration-instant [&>svg]:ease-hover hover:[&>svg]:text-ink",
          // Any aria-current but "false" (routers set "page"; NavItem sets "true").
          "[&[aria-current]:not([aria-current=false])]:font-heading [&[aria-current]:not([aria-current=false])]:text-ink",
          "[&[aria-current]:not([aria-current=false])]:hover:bg-transparent [&[aria-current]:not([aria-current=false])>svg]:text-ink",
          nested ? "h-[30px] text-small" : "h-8 text-control",
          className,
        ),
        children: content,
      },
      props,
    ),
  });
}

/** Nested rows under a parent NavItem, hung from a thread line. */
export function Threads({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <ThreadsContext.Provider value={true}>
      <div
        className={cn(
          "relative ml-[15px] flex flex-col gap-px pl-2.5",
          "before:absolute before:top-0.5 before:bottom-0.5 before:left-0 before:w-px before:bg-line before:content-['']",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ThreadsContext.Provider>
  );
}
