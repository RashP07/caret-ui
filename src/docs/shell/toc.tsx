import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger, MenuLabel, NavGroup, NavItem, Threads } from "@/components";
import { cn } from "@/lib/cn";
import { COLUMN_PAD } from "./construction";

interface Entry {
  id: string;
  text: string;
}

/** The H2 anchors of the page (specimen titles become anchors in page mode). */
function useEntries(containerId: string): Entry[] {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [entries, setEntries] = useState<Entry[]>([]);

  // Collect headings, and watch for them changing as the page swaps or sections expand.
  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;
    const read = () => {
      const hs = [...root.querySelectorAll<HTMLElement>("h2[id]")];
      setEntries((prev) => {
        const next = hs.map((h) => ({ id: h.id, text: h.textContent ?? "" }));
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    };
    read();
    // The observer fires before the browser paints; committing synchronously puts the list
    // on screen in the same frame as the headings, so the compact list never pushes the page down.
    const mo = new MutationObserver(() => flushSync(read));
    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [containerId, pathname]);

  return entries;
}

/**
 * "On this page". Reads the page's H2 anchors, follows the one you're reading,
 * and snaps while you scroll — scroll-spy fires constantly, so it never glides.
 * A click glides.
 */
export function OnThisPage({ containerId }: { containerId: string }) {
  const entries = useEntries(containerId);
  const [active, setActive] = useState<string | null>(null);
  const [instant, setInstant] = useState(true);
  const lock = useRef<string | null>(null);

  useEffect(() => {
    setActive(entries[0]?.id ?? null);
    if (!entries.length) return;
    const io = new IntersectionObserver(
      (list) => {
        if (lock.current) return;
        const visible = list.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setInstant(true);
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-72px 0px -65% 0px" },
    );
    entries.forEach((e) => {
      const el = document.getElementById(e.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [entries]);

  if (entries.length < 2) return null;

  return (
    <nav aria-label="On this page" className="flex flex-col gap-1">
      <MenuLabel className="px-2 pt-0">On this page</MenuLabel>
      <NavGroup instant={instant}>
        <Threads className="ml-2">
          {entries.map((e) => (
            <NavItem
              key={e.id}
              render={<a href={`#${e.id}`} />}
              current={active === e.id}
              onClick={() => {
                setInstant(false);
                setActive(e.id);
                // Hold scroll-spy until the smooth scroll lands.
                lock.current = e.id;
                const release = () => {
                  lock.current = null;
                  removeEventListener("scrollend", release);
                };
                addEventListener("scrollend", release);
                setTimeout(release, 1200);
              }}
            >
              {e.text}
            </NavItem>
          ))}
        </Threads>
      </NavGroup>
    </nav>
  );
}

/**
 * "On this page" where there's no room for the column: a disclosure at the top
 * of the page listing the same headings. Following a link closes it. Drawn as a band
 * across the reading column, closed by a rule with Nodes where it meets the frame lines.
 */
export function OnThisPageCompact({ containerId, className }: { containerId: string; className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const entries = useEntries(containerId);
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  if (entries.length < 2) return null;

  return (
    <nav aria-label="On this page" className={cn("py-2", COLUMN_PAD, className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger meta={entries.length}>On this page</CollapsibleTrigger>
        <CollapsiblePanel>
          <Threads className="ml-1.5 pr-px">
            {entries.map((e) => (
              <NavItem key={e.id} render={<a href={`#${e.id}`} />} onClick={() => setOpen(false)}>
                {e.text}
              </NavItem>
            ))}
          </Threads>
        </CollapsiblePanel>
      </Collapsible>
    </nav>
  );
}
