import { Menu as BaseMenu } from "@base-ui/react/menu";
import { CaretRightIcon, CheckIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Kbd } from "./kbd";
import { usePortalTheme } from "@/lib/theme";
import { keyboardInstant } from "./select";

/*
 * Menu. A list of actions (not values — that's Select). Arrow keys move,
 * Enter or Space runs the item, Escape closes and returns focus to the
 * trigger, typing a letter jumps to the match, → opens a submenu and ←
 * closes it. Menus inherit their trigger's radius (--r-control); rows are
 * button-shaped (--r-button). Items print their shortcut, so the fastest
 * path is visible where the slow one is.
 *
 * The item parts work unchanged inside ContextMenu and Menubar.
 */

/* ---------- shared classes (context-menu.tsx and menubar.tsx reuse these) ---------- */

export const actionMenuPopupClass = cn(
  "min-w-[220px] max-w-[min(320px,var(--available-width))] max-h-(--available-height) overflow-y-auto",
  "rounded-control border border-line bg-surface p-1 text-ink shadow-float outline-none",
  "origin-(--transform-origin) transition-[opacity,scale] duration-quick ease-out",
  "data-starting-style:scale-[.98] data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-instant",
  "data-instant:transition-none",
);

export const actionMenuItemClass = cn(
  // [icon] label · shortcut · mark. The icon column exists only when some item in this menu has an
  // icon (see Lead), and checkbox/radio marks sit at the trailing edge, so no row starts empty.
  "group/item flex cursor-default items-center gap-2.5 rounded-button px-2.5 py-2 text-control outline-none select-none",
  // Highlight is the hover fill, so ink-3 shortcuts keep 4.5:1 on it.
  "data-highlighted:bg-hover",
  "[&_[data-menu-icon]]:text-ink-3 data-highlighted:[&_[data-menu-icon]]:text-ink",
  "data-disabled:cursor-not-allowed data-disabled:text-ink-disabled data-disabled:[&_[data-menu-icon]]:text-ink-disabled",
);

const dangerItemClass =
  "text-danger data-highlighted:bg-danger-soft [&_[data-menu-icon]]:text-danger data-highlighted:[&_[data-menu-icon]]:text-danger data-disabled:data-highlighted:bg-hover";

/**
 * The leading icon column. With an icon it's a 16px slot; without one it's a
 * placeholder that only takes space when another item in the same menu has an
 * icon, so labels stay aligned without every plain menu starting with a gap.
 */
function Lead({ icon }: { icon?: ReactNode }) {
  return icon ? (
    <span data-menu-icon className="flex w-4 flex-none items-center justify-center">
      {icon}
    </span>
  ) : (
    <span aria-hidden className="hidden w-4 flex-none [[role=menu]:has([data-menu-icon])_&]:block" />
  );
}

/** A plain-text label, for the `title` that reveals a truncated row. */
function textOf(node: ReactNode) {
  return typeof node === "string" ? node : undefined;
}

/** A checkbox / radio mark at the trailing edge; springs in from 90%. */
const markClass =
  "flex w-4 flex-none items-center justify-center transition-[opacity,scale] duration-quick ease-spring data-unchecked:scale-[.9] data-unchecked:opacity-0";

export const menuPositionerProps = { sideOffset: 6, collisionPadding: 8, className: "z-[70] outline-none" } as const;

/* ---------- root ---------- */

export interface MenuProps {
  /** The element that opens the menu: a Button or IconButton. */
  trigger: ReactElement;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  /** Also open on hover, e.g. in a toolbar of menus. */
  openOnHover?: boolean;
  className?: string;
}

export function Menu({ trigger, children, open, onOpenChange, side = "bottom", align = "start", openOnHover, className }: MenuProps) {
  return (
    <BaseMenu.Root open={open} onOpenChange={(o) => onOpenChange?.(o)}>
      <BaseMenu.Trigger render={trigger} openOnHover={openOnHover} />
      <MenuPopup side={side} align={align} className={className}>
        {children}
      </MenuPopup>
    </BaseMenu.Root>
  );
}

/** Portal + positioner + popup. Used by Menu and each MenubarMenu. */
export function MenuPopup({
  children,
  side = "bottom",
  align = "start",
  sideOffset = menuPositionerProps.sideOffset,
  alignOffset,
  className,
}: {
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right" | "inline-end";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  className?: string;
}) {
  const portalTheme = usePortalTheme();
  return (
    <BaseMenu.Portal {...portalTheme}>
      <BaseMenu.Positioner
        {...menuPositionerProps}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        <BaseMenu.Popup className={keyboardInstant(cn(actionMenuPopupClass, className))}>{children}</BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

/* ---------- items ---------- */

function Shortcut({ keys }: { keys?: string }) {
  return keys ? <Kbd keys={keys} size="sm" className="ml-4 text-ink-3 group-data-disabled/item:text-ink-disabled" /> : null;
}

export interface MenuItemProps extends Omit<ComponentProps<typeof BaseMenu.Item>, "className" | "children"> {
  /** Leading icon. Other items in the same menu keep a matching gap so labels align; a menu with no icons has no gap. */
  icon?: ReactNode;
  /** Shortcut printed on the right, e.g. "⌘ D". */
  kbd?: string;
  /** Destructive: danger text, danger-soft highlight. Name the object in the label. */
  danger?: boolean;
  children: ReactNode;
  className?: string;
}

export function MenuItem({ icon, kbd, danger, children, className, ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item className={cn(actionMenuItemClass, danger && dangerItemClass, className)} {...props}>
      <Lead icon={icon} />
      <span className="min-w-0 flex-1 truncate" title={textOf(children)}>{children}</span>
      <Shortcut keys={kbd} />
    </BaseMenu.Item>
  );
}

export interface MenuLinkItemProps extends Omit<ComponentProps<typeof BaseMenu.LinkItem>, "className" | "children"> {
  icon?: ReactNode;
  children: ReactNode;
}

/** An item that navigates. Renders a real <a>, so it can open in a new tab. */
export function MenuLinkItem({ icon, children, ...props }: MenuLinkItemProps) {
  return (
    <BaseMenu.LinkItem className={cn(actionMenuItemClass, "no-underline")} {...props}>
      <Lead icon={icon} />
      <span className="min-w-0 flex-1 truncate" title={textOf(children)}>{children}</span>
    </BaseMenu.LinkItem>
  );
}

export interface MenuCheckboxItemProps extends Omit<ComponentProps<typeof BaseMenu.CheckboxItem>, "className" | "children"> {
  kbd?: string;
  children: ReactNode;
}

/** An on/off setting. Stays open on click so several can be toggled in a row. */
export function MenuCheckboxItem({ kbd, children, ...props }: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem className={actionMenuItemClass} {...props}>
      <Lead />
      <span className="min-w-0 flex-1 truncate" title={textOf(children)}>{children}</span>
      <Shortcut keys={kbd} />
      <BaseMenu.CheckboxItemIndicator keepMounted className={cn(markClass, "text-ink group-data-disabled/item:text-ink-disabled")}>
        <CheckIcon />
      </BaseMenu.CheckboxItemIndicator>
    </BaseMenu.CheckboxItem>
  );
}

export function MenuRadioGroup(props: Omit<ComponentProps<typeof BaseMenu.RadioGroup>, "className">) {
  return <BaseMenu.RadioGroup {...props} />;
}

export interface MenuRadioItemProps extends Omit<ComponentProps<typeof BaseMenu.RadioItem>, "className" | "children"> {
  kbd?: string;
  children: ReactNode;
}

/** One of a set, inside <MenuRadioGroup>. */
export function MenuRadioItem({ kbd, children, ...props }: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem className={actionMenuItemClass} {...props}>
      <Lead />
      <span className="min-w-0 flex-1 truncate" title={textOf(children)}>{children}</span>
      <Shortcut keys={kbd} />
      <BaseMenu.RadioItemIndicator keepMounted className={markClass}>
        <span className="size-1.5 rounded-full bg-ink group-data-disabled/item:bg-ink-disabled" />
      </BaseMenu.RadioItemIndicator>
    </BaseMenu.RadioItem>
  );
}

export function MenuSeparator() {
  return <BaseMenu.Separator className="-mx-1 my-1 h-px bg-line" />;
}

/** A labelled section. The label is a MenuLabel-styled group label. */
export function MenuGroup({ label, children }: { label?: ReactNode; children: ReactNode }) {
  return (
    <BaseMenu.Group>
      {label && <BaseMenu.GroupLabel className="px-2.5 pt-2 pb-1 text-caption text-ink-3">{label}</BaseMenu.GroupLabel>}
      {children}
    </BaseMenu.Group>
  );
}

export interface MenuSubmenuProps {
  label: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

/** A nested menu. Opens on hover, → or Enter; ← closes it. */
export function MenuSubmenu({ label, icon, children, disabled }: MenuSubmenuProps) {
  return (
    <BaseMenu.SubmenuRoot disabled={disabled}>
      <BaseMenu.SubmenuTrigger className={cn(actionMenuItemClass, "data-popup-open:bg-pressed")}>
        <Lead icon={icon} />
        <span className="min-w-0 flex-1 truncate" title={textOf(label)}>{label}</span>
        <CaretRightIcon size={14} className="ml-4 flex-none text-ink-3 group-data-disabled/item:text-ink-disabled" aria-hidden />
      </BaseMenu.SubmenuTrigger>
      <MenuPopup side="inline-end" align="start" sideOffset={2} alignOffset={-5}>
        {children}
      </MenuPopup>
    </BaseMenu.SubmenuRoot>
  );
}
