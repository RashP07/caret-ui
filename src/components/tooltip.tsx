import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { usePortalTheme } from "@/lib/theme";
import { Kbd } from "./kbd";
import { keyboardInstant } from "./select";

/**
 * Wrap the app once. 400ms hover delay; after the first tooltip, neighbours
 * open instantly (the provider's warm window), so scanning a toolbar is fast.
 */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <BaseTooltip.Provider delay={400} closeDelay={0} timeout={500}>
      {children}
    </BaseTooltip.Provider>
  );
}

type Side = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** The short label. For icon-only controls, repeat it as `aria-label`. */
  label: ReactNode;
  /** Shortcut printed in the tooltip, space-separated keys: "⇧ ⌘ Z". */
  kbd?: string;
  side?: Side;
  /** The trigger. Must accept a ref and spread props (every Caret control does). */
  children: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/* ---------- the popup, shared by single tooltips and groups ---------- */

const popupClass = [
  "flex max-w-[260px] items-center gap-2 rounded-control bg-ink px-2.5 py-1.5 text-small leading-4.5 font-control text-on-ink",
  // Enter 160ms from the trigger's side; exit faster than it arrived.
  "origin-(--transform-origin) transition-[opacity,scale,translate] duration-quick ease-out",
  "data-starting-style:scale-[.97] data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-instant",
  "data-[side=top]:data-starting-style:translate-y-1 data-[side=bottom]:data-starting-style:-translate-y-1",
  // Neighbours open instantly: no delay, no animation.
  "data-instant:transition-none",
].join(" ");

const arrowClass =
  "size-2 rotate-45 rounded-[1px] bg-ink data-[side=bottom]:-top-1 data-[side=top]:-bottom-1 data-[side=left]:-right-1 data-[side=right]:-left-1";

function TooltipContent({ label, kbd }: { label: ReactNode; kbd?: string }) {
  return (
    <>
      <span>{label}</span>
      {kbd && <Kbd keys={kbd} size="sm" className="ms-0.5" />}
    </>
  );
}

/*
 * The gliding group tooltip. Moving from one trigger to its neighbour, the
 * same popup slides to the new anchor, resizes to the new label, and the text
 * crossfades with a short directional slide and a 2px blur (the blur hides the
 * moment two labels overlap). Keyboard moves snap (keyboardInstant); reduced
 * motion drops the slide and size change and keeps the fade.
 */
const groupPositionerClass = cn(
  "z-[100] h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)",
  "transition-[top,left,right,bottom] duration-quick ease-out data-instant:transition-none",
);

const groupPopupClass = cn(
  "relative h-(--popup-height,auto) w-(--popup-width,auto) max-w-[260px] rounded-control bg-ink text-small leading-4.5 font-control text-on-ink",
  "origin-(--transform-origin) transition-[width,height,opacity,scale,translate] duration-quick ease-out",
  "data-starting-style:scale-[.97] data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-instant",
  "data-[side=top]:data-starting-style:translate-y-1 data-[side=bottom]:data-starting-style:-translate-y-1",
  "data-instant:transition-none",
);

const groupViewportClass = cn(
  "relative block h-full w-full overflow-clip px-2.5 py-1.5 [--vp-pad:10px]",
  // Both labels keep the popup's width while they cross, so neither reflows mid-fade.
  "[&_[data-current]]:w-[calc(var(--popup-width)-2*var(--vp-pad))] [&_[data-previous]]:w-[calc(var(--popup-width)-2*var(--vp-pad))]",
  "[&_[data-current]]:flex [&_[data-current]]:items-center [&_[data-current]]:gap-2 [&_[data-previous]]:flex [&_[data-previous]]:items-center [&_[data-previous]]:gap-2",
  "[&_[data-current]]:transition-[translate,opacity,filter] [&_[data-previous]]:transition-[translate,opacity,filter]",
  "[&_[data-current]]:duration-quick [&_[data-previous]]:duration-instant [&_[data-current]]:ease-out [&_[data-previous]]:ease-out",
  // The new label comes in from the side you moved toward; the old one leaves the other way.
  "[&_[data-current][data-starting-style]]:opacity-0 [&_[data-current][data-starting-style]]:blur-[2px]",
  "[&_[data-previous][data-ending-style]]:opacity-0 [&_[data-previous][data-ending-style]]:blur-[2px]",
  "data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-3 data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-3",
  "data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-3 data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-3",
  "[[data-instant]_&_[data-current]]:transition-none [[data-instant]_&_[data-previous]]:transition-none",
);

/* ---------- groups ---------- */

/*
 * The payload is only a stable id: Base UI restarts its size animation when
 * the payload object changes, so labels live in a map each trigger refreshes.
 */
interface TipPayload {
  /** The trigger's id, so the group can tell neighbours apart. */
  id: string;
}

interface TipContent {
  label: ReactNode;
  kbd?: string;
  side?: Side;
}

interface GroupValue {
  handle: BaseTooltip.Handle<TipPayload>;
  contents: Map<string, TipContent>;
  register: (id: string, onOpenChange: ((open: boolean) => void) | undefined) => () => void;
}

const GroupContext = createContext<GroupValue | null>(null);

export interface TooltipGroupProps {
  children: ReactNode;
  /** Default side for tooltips in the group (a trigger's own `side` wins). */
  side?: Side;
}

/**
 * One shared tooltip for a row of controls (toolbars, header icon rows).
 * The first hover waits and fades in as usual; moving to a neighbour glides
 * the same popup across, resizing it and crossfading the label — no
 * fade-out/fade-in flicker between buttons. Keyboard moves snap.
 */
export function TooltipGroup({ children, side = "top" }: TooltipGroupProps) {
  const portalTheme = usePortalTheme();
  const [handle] = useState(() => BaseTooltip.createHandle<TipPayload>());
  const callbacks = useRef(new Map<string, ((open: boolean) => void) | undefined>());
  const active = useRef<string | null>(null);

  const contents = useRef(new Map<string, TipContent>()).current;
  const value = useRef<GroupValue>({
    handle,
    contents,
    register: (id, cb) => {
      callbacks.current.set(id, cb);
      return () => {
        callbacks.current.delete(id);
      };
    },
  }).current;

  // Keep per-trigger onOpenChange callbacks working: tell the old trigger it
  // closed and the new one it opened, whenever the shared popup moves.
  const activateRef = useRef(activate);
  activateRef.current = activate;
  function activate(id: string | null) {
    if (active.current === id) return;
    if (active.current) callbacks.current.get(active.current)?.(false);
    active.current = id;
    if (id) callbacks.current.get(id)?.(true);
  }

  return (
    <GroupContext.Provider value={value}>
      {children}
      <BaseTooltip.Root
        handle={handle}
        onOpenChange={(open, details) => activate(open ? ((details.trigger as HTMLElement | undefined)?.id ?? null) : null)}
      >
        {({ payload }) => (
          <BaseTooltip.Portal {...portalTheme}>
            <BaseTooltip.Positioner
              side={(payload && contents.get(payload.id)?.side) ?? side}
              sideOffset={10}
              collisionPadding={8}
              className={keyboardInstant(groupPositionerClass)}
            >
              <BaseTooltip.Popup className={keyboardInstant(groupPopupClass)}>
                <BaseTooltip.Viewport className={groupViewportClass}>
                  {payload && contents.has(payload.id) && (
                    <TooltipContent label={contents.get(payload.id)!.label} kbd={contents.get(payload.id)!.kbd} />
                  )}
                </BaseTooltip.Viewport>
                <BaseTooltip.Arrow
                  className={keyboardInstant(cn(arrowClass, "transition-[left,top] duration-quick ease-out data-instant:transition-none"))}
                />
                {payload && <ActiveReporter id={payload.id} onChange={activateRef.current} />}
              </BaseTooltip.Popup>
            </BaseTooltip.Positioner>
          </BaseTooltip.Portal>
        )}
      </BaseTooltip.Root>
    </GroupContext.Provider>
  );
}

/**
 * Reports which trigger the shared popup is showing: on open, on every
 * neighbour-to-neighbour move, and (via cleanup) when the popup unmounts.
 */
function ActiveReporter({ id, onChange }: { id: string | undefined; onChange: (id: string | null) => void }) {
  const change = useRef(onChange);
  change.current = onChange;
  useEffect(() => {
    if (!id) return;
    change.current(id);
    return () => change.current(null);
  }, [id]);
  return null;
}

/* ---------- tooltip ---------- */

export function Tooltip({ label, kbd, side, children, open, onOpenChange }: TooltipProps) {
  const portalTheme = usePortalTheme();
  const group = useContext(GroupContext);
  const id = useId();

  // Register the per-trigger callback with the group (a no-op outside one).
  const cb = useRef(onOpenChange);
  cb.current = onOpenChange;
  useEffect(() => group?.register(id, (o) => cb.current?.(o)), [group, id]);

  const payload = useMemo(() => ({ id }), [id]);
  if (group) {
    group.contents.set(id, { label, kbd, side });
    return (
      <BaseTooltip.Trigger
        id={id}
        handle={group.handle}
        payload={payload}
        render={children}
      />
    );
  }

  return (
    <BaseTooltip.Root open={open} onOpenChange={onOpenChange}>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal {...portalTheme}>
        <BaseTooltip.Positioner side={side ?? "top"} sideOffset={10} collisionPadding={8} className="z-[100]">
          <BaseTooltip.Popup className={popupClass}>
            <TooltipContent label={label} kbd={kbd} />
            <BaseTooltip.Arrow className={arrowClass} />
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
