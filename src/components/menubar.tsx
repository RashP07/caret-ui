import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { usePortalTheme } from "@/lib/theme";
import { menuPositionerProps } from "./menu";
import { keyboardInstant } from "./select";

/*
 * Menubar. A row of menus with one tab stop: ←/→ move between menus (and
 * move the open menu along with you), ↓ or Enter opens, Escape closes.
 * Triggers are dense, like a compact Select, because a menubar lives in
 * chrome, not in content. Fill each menu with the Menu item parts.
 *
 * One shared menu. Every trigger opens the same popup (Base UI detached
 * triggers + payload), so moving from File to Edit glides the popup to its
 * new trigger, resizes it to the new list, and slides the content across in
 * the direction you moved — instead of one menu closing and another opening.
 * Keyboard moves snap (keyboardInstant); reduced motion keeps only the fade.
 */

/*
 * The payload is only a stable id. Base UI restarts its size animation
 * whenever the payload object changes, so menu content lives in a map that
 * each MenubarMenu refreshes on render, and the shared popup reads it by id.
 */
interface MenubarPayload {
  id: string;
}

interface MenubarContextValue {
  handle: BaseMenu.Handle<MenubarPayload>;
  register: (id: string, onOpenChange: ((open: boolean) => void) | undefined) => () => void;
  contents: Map<string, ReactNode>;
}

const MenubarContext = createContext<MenubarContextValue | null>(null);

const positionerClass = cn(
  menuPositionerProps.className,
  "h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)",
  "transition-[top,left,right,bottom] duration-quick ease-out data-instant:transition-none",
);

const popupClass = cn(
  "relative h-(--popup-height,auto) w-(--popup-width,auto)",
  "rounded-control border border-line bg-surface text-ink shadow-float outline-none",
  "origin-(--transform-origin) transition-[width,height,opacity,scale] duration-quick ease-out",
  "data-starting-style:scale-[.98] data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-instant",
  "data-instant:transition-none",
);

const viewportClass = cn(
  "relative block h-full w-full overflow-clip",
  // Both lists keep the popup's inner width while they cross, so neither reflows mid-slide.
  "[&_[data-current]]:w-[calc(var(--popup-width)-2px)] [&_[data-previous]]:w-[calc(var(--popup-width)-2px)]",
  "[&_[data-current]]:transition-[translate,opacity,filter] [&_[data-previous]]:transition-[translate,opacity,filter]",
  "[&_[data-current]]:duration-quick [&_[data-previous]]:duration-instant [&_[data-current]]:ease-out [&_[data-previous]]:ease-out",
  // The new list arrives from the side you moved toward; the old one leaves the other way, blurred.
  "[&_[data-current][data-starting-style]]:opacity-0 [&_[data-current][data-starting-style]]:blur-[2px]",
  "[&_[data-previous][data-ending-style]]:opacity-0 [&_[data-previous][data-ending-style]]:blur-[2px]",
  "data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-6 data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-6",
  "data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-6 data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-6",
  "[[data-instant]_&_[data-current]]:transition-none [[data-instant]_&_[data-previous]]:transition-none",
);

export function Menubar({
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof BaseMenubar>, "className"> & { className?: string }) {
  const portalTheme = usePortalTheme();
  const [handle] = useState(() => BaseMenu.createHandle<MenubarPayload>());
  const callbacks = useRef(new Map<string, ((open: boolean) => void) | undefined>());
  const active = useRef<string | null>(null);

  const contents = useRef(new Map<string, ReactNode>()).current;
  const value = useRef<MenubarContextValue>({
    handle,
    contents,
    register: (id, cb) => {
      callbacks.current.set(id, cb);
      return () => void callbacks.current.delete(id);
    },
  }).current;

  // Per-menu onOpenChange keeps working with one shared popup: the menu
  // being left hears "closed", the one being entered hears "open".
  const activateRef = useRef(activate);
  activateRef.current = activate;
  function activate(id: string | null) {
    if (active.current === id) return;
    if (active.current) callbacks.current.get(active.current)?.(false);
    active.current = id;
    if (id) callbacks.current.get(id)?.(true);
  }

  return (
    <BaseMenubar
      className={cn("inline-flex items-center gap-0.5 rounded-control border border-line bg-surface p-1", className)}
      {...props}
    >
      <MenubarContext.Provider value={value}>
        {children}
        <BaseMenu.Root handle={handle} onOpenChange={(open) => !open && activate(null)}>
          {({ payload }) => (
            <BaseMenu.Portal {...portalTheme}>
              <BaseMenu.Positioner
                side="bottom"
                align="start"
                sideOffset={7}
                alignOffset={-4}
                collisionPadding={menuPositionerProps.collisionPadding}
                className={keyboardInstant(positionerClass)}
              >
                <BaseMenu.Popup className={keyboardInstant(popupClass)}>
                  <BaseMenu.Viewport className={viewportClass}>
                    {payload && <div className="min-w-[220px] max-w-[320px] p-1">{contents.get(payload.id)}</div>}
                  </BaseMenu.Viewport>
                  {payload && <ActiveReporter id={payload.id} onChange={activateRef.current} />}
                </BaseMenu.Popup>
              </BaseMenu.Positioner>
            </BaseMenu.Portal>
          )}
        </BaseMenu.Root>
      </MenubarContext.Provider>
    </BaseMenubar>
  );
}

/** Reports which menu the shared popup is showing, on open and on every move. */
function ActiveReporter({ id, onChange }: { id: string; onChange: (id: string | null) => void }) {
  const change = useRef(onChange);
  change.current = onChange;
  useEffect(() => {
    change.current(id);
  }, [id]);
  return null;
}

export interface MenubarMenuProps {
  label: ReactNode;
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function MenubarMenu({ label, children, onOpenChange }: MenubarMenuProps) {
  const ctx = useContext(MenubarContext);
  const id = useId();
  const cb = useRef(onOpenChange);
  cb.current = onOpenChange;
  useEffect(() => ctx?.register(id, (o) => cb.current?.(o)), [ctx, id]);

  if (!ctx) throw new Error("MenubarMenu must be inside a Menubar");
  // Refresh this menu's content (rendered before the shared popup, which reads it).
  ctx.contents.set(id, children);
  const payload = useMemo(() => ({ id }), [id]);

  return (
    <BaseMenu.Trigger
      id={id}
      handle={ctx.handle}
      payload={payload}
      className={cn(
        "inline-flex min-h-[30px] items-center rounded-button border-0 bg-transparent px-2.5 py-1 text-small font-control text-ink-2",
        "transition-colors duration-instant ease-hover hover:bg-hover hover:text-ink",
        "data-popup-open:bg-pressed data-popup-open:text-ink",
        "data-disabled:cursor-not-allowed data-disabled:bg-transparent data-disabled:text-ink-disabled",
      )}
    >
      {label}
    </BaseMenu.Trigger>
  );
}
