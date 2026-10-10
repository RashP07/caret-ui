import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { LayoutGroup, motion, type Transition } from "motion/react";
import { createContext, useContext, useEffect, useId, useRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { settle } from "@/lib/motion";
import { pressClass, useModalityTransition } from "./modality";

/*
 * Tabs. The ink bar is one shared element (a motion layoutId) that glides to
 * the new tab, so you can see where you came from; it moves with transform,
 * never left/width. Arrow keys move and select, Home and End jump — and
 * keyboard changes snap, because keyboard motion only reads as delay.
 * `Seg` is the compact sibling. When the tabs don't fit, the list scrolls
 * sideways and fades the edge that has more tabs past it.
 */

type RootProps = Omit<ComponentProps<typeof BaseTabs.Root>, "className"> & { className?: string };

export function Tabs({ className, ...props }: RootProps) {
  return <BaseTabs.Root className={cn("w-full", className)} {...props} />;
}

/** The ink's transition for this list: glide on pointer, snap on keyboard. */
const InkTransition = createContext<() => Transition>(() => settle);

type ListProps = Omit<ComponentProps<typeof BaseTabs.List>, "className"> & {
  className?: string;
  children: ReactNode;
  /** No baseline rule: for tab bars inside a header that draws its own. */
  flush?: boolean;
};

/**
 * Writes how far the list is from each horizontal edge (px) to
 * --scroll-x-start / --scroll-x-end, which `.scroll-fade-x` reads.
 */
function useEdgeFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const start = Math.max(0, el.scrollLeft);
      const end = Math.max(0, el.scrollWidth - el.clientWidth - el.scrollLeft);
      el.style.setProperty("--scroll-x-start", `${start}px`);
      el.style.setProperty("--scroll-x-end", `${end}px`);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    for (const child of el.children) ro.observe(child);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);
  return ref;
}

export function TabList({ className, children, flush, ...props }: ListProps) {
  const id = useId();
  const { handlers, transition } = useModalityTransition();
  const fadeRef = useEdgeFade<HTMLDivElement>();
  return (
    <LayoutGroup id={id}>
      <InkTransition.Provider value={transition}>
        <BaseTabs.List
          ref={fadeRef}
          activateOnFocus
          {...handlers}
          className={cn(
            // Scrolls sideways when the tabs don't fit (phones), fading the edge with more past it.
            // The baseline is an inset hairline so the scroll box never clips it.
            "scroll-fade-x relative flex gap-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            !flush && "shadow-[inset_0_-1px_0_var(--line)]",
            className,
          )}
          {...props}
        >
          {children}
        </BaseTabs.List>
      </InkTransition.Provider>
    </LayoutGroup>
  );
}

type TabProps = Omit<ComponentProps<typeof BaseTabs.Tab>, "className" | "render"> & {
  className?: string;
  /** Count pill beside the label. Turns accent-soft when the tab is active. */
  count?: ReactNode;
};

export function Tab({ className, count, children, ...props }: TabProps) {
  const inkTransition = useContext(InkTransition);
  return (
    <BaseTabs.Tab
      className={cn(
        "group/tab relative inline-flex flex-none h-[38px] items-center gap-2 rounded-t-button border-0 bg-transparent px-2.5 text-control font-control text-ink-3",
        "transition-[color,scale] duration-instant [transition-timing-function:var(--ease-hover),var(--ease-out)]",
        "hover:text-ink data-active:text-ink",
        pressClass,
        className,
      )}
      render={(tabProps, state) => (
        <button {...tabProps}>
          {tabProps.children}
          {state.active && (
            <motion.span
              aria-hidden
              layoutId="tab-ink"
              transition={inkTransition()}
              className="absolute inset-x-0 bottom-0 h-0.5 rounded-t-[2px] bg-ink"
            />
          )}
        </button>
      )}
      {...props}
    >
      {children}
      {count != null && (
        <span
          className={cn(
            "rounded-pill bg-sunken px-1.5 py-px text-caption tabular-nums text-ink-3",
            "transition-[color,background-color] duration-quick ease-hover",
            "group-data-active/tab:bg-accent-soft group-data-active/tab:text-ink",
          )}
        >
          {count}
        </span>
      )}
    </BaseTabs.Tab>
  );
}

type PanelProps = Omit<ComponentProps<typeof BaseTabs.Panel>, "className"> & { className?: string };

export function TabPanel({ className, ...props }: PanelProps) {
  return (
    <BaseTabs.Panel className={cn("min-h-[120px] px-0.5 pt-4 text-control text-ink-2", className)} {...props} />
  );
}
