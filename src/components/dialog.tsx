import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { WarningCircleIcon, XIcon } from "@phosphor-icons/react";
import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { playOpenSound } from "@/lib/sound";
import { usePortalTheme } from "@/lib/theme";
import { Button, IconButton } from "./button";
import { Field, Input } from "./input";

/*
 * Dialog. Two kinds, one look:
 * - `Dialog` (Base UI Dialog) for focused tasks you can walk away from: a
 *   settings form, a detail view. Escape, the backdrop and the close button
 *   all dismiss it.
 * - `AlertDialog` (Base UI AlertDialog) only for decisions that can't wait.
 *   It doesn't close on a backdrop click; you have to answer.
 * Both trap focus, close on Escape and return focus to where it came from.
 */

/** The scrim behind modal overlays (dialogs, drawers). */
export const overlayBackdropClass = cn(
  "fixed inset-0 z-[110] min-h-dvh bg-scrim backdrop-blur-[3px]",
  "transition-opacity duration-settle ease-out data-ending-style:opacity-0 data-ending-style:duration-quick data-starting-style:opacity-0",
);

export type DialogSize = "sm" | "md" | "lg";

/** Widths never exceed the viewport minus a 16px gutter each side. */
const dialogWidth: Record<DialogSize, string> = {
  sm: "w-[min(400px,calc(100vw-32px))]",
  md: "w-[min(480px,calc(100vw-32px))]",
  lg: "w-[min(640px,calc(100vw-32px))]",
};

/*
 * Header, body, footer. Only the body scrolls, so the title, the close
 * button and the actions stay put however long the form gets.
 */
const dialogPopupClass = cn(
  "fixed inset-0 z-[111] m-auto flex h-fit max-h-[calc(100dvh-32px)] flex-col overflow-hidden rounded-dialog bg-surface text-ink shadow-modal outline-none",
  "transition-[opacity,scale,translate] duration-settle ease-spring",
  "data-starting-style:translate-y-2.5 data-starting-style:scale-[.97] data-starting-style:opacity-0",
  "data-ending-style:translate-y-1.5 data-ending-style:scale-[.98] data-ending-style:opacity-0 data-ending-style:duration-quick data-ending-style:ease-out",
);

const titleClass = "m-0 mb-1.5 text-title font-heading text-balance";
const descriptionClass = "m-0 text-control text-pretty text-ink-2";
/* The body's top padding leaves room for a focus ring on its first field. */
const bodyClass = "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-1 pb-5";
const footClass =
  "flex flex-none flex-wrap justify-end gap-2 border-t border-line bg-[color-mix(in_srgb,var(--sunken)_45%,var(--surface))] px-6 py-3";
/* Last in DOM order so focus starts on the content. */
const closeClass = "absolute top-3 right-3";

interface OverlayProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The element that opens the dialog. */
  trigger?: ReactElement;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  /** Focus this element when the dialog opens (defaults to the first focusable). */
  initialFocus?: React.RefObject<HTMLElement | null>;
  /** Width: sm 400px, md 480px (default), lg 640px — each capped at the viewport minus 32px. */
  size?: DialogSize;
}

/* ---------- Dialog: dismissible ---------- */

export interface DialogProps extends OverlayProps {
  /** Footer actions, right-aligned. Wrap a dismiss action in <DialogClose>. Omit for a footer-less dialog. */
  footer?: ReactNode;
}

export function Dialog({ open, onOpenChange, trigger, title, description, children, footer, initialFocus, size = "md" }: DialogProps) {
  const portalTheme = usePortalTheme();
  return (
    <BaseDialog.Root open={open} onOpenChange={(o, d) => {
        playOpenSound(o, d);
        onOpenChange?.(o);
      }}>
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <BaseDialog.Portal {...portalTheme}>
        <BaseDialog.Backdrop className={overlayBackdropClass} />
        <BaseDialog.Popup initialFocus={initialFocus} className={cn(dialogPopupClass, dialogWidth[size])}>
          <div className={cn("flex-none px-6 pt-6", children ? "pb-4" : "pb-5")}>
            <BaseDialog.Title className={cn(titleClass, "pr-8")}>{title}</BaseDialog.Title>
            <BaseDialog.Description className={descriptionClass}>{description}</BaseDialog.Description>
          </div>
          {children && <div className={bodyClass}>{children}</div>}
          {footer && <div className={footClass}>{footer}</div>}
          {/* Last in DOM order: focus starts on the content, not on "Close". */}
          <BaseDialog.Close render={<IconButton label="Close" icon={<XIcon />} className={closeClass} />} />
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/** Closes the surrounding Dialog. Pass the button to render: `<DialogClose render={<Button>Cancel</Button>} />`. */
export function DialogClose({ render }: { render: ReactElement }) {
  return <BaseDialog.Close render={render} />;
}

/* ---------- AlertDialog: must be answered ---------- */

export interface AlertDialogProps extends OverlayProps {
  /** Tinted icon well above the title (danger). */
  icon?: ReactNode;
  /** Footer actions, right-aligned. Wrap the way out in <AlertDialogClose>. */
  footer: ReactNode;
}

export function AlertDialog({
  open,
  onOpenChange,
  trigger,
  icon,
  title,
  description,
  children,
  footer,
  initialFocus,
  size = "md",
}: AlertDialogProps) {
  const portalTheme = usePortalTheme();
  return (
    <BaseAlertDialog.Root open={open} onOpenChange={(o, d) => {
        playOpenSound(o, d);
        onOpenChange?.(o);
      }}>
      {trigger && <BaseAlertDialog.Trigger render={trigger} />}
      <BaseAlertDialog.Portal {...portalTheme}>
        <BaseAlertDialog.Backdrop className={overlayBackdropClass} />
        <BaseAlertDialog.Popup initialFocus={initialFocus} className={cn(dialogPopupClass, dialogWidth[size])}>
          <div className={cn("flex-none px-6 pt-6", children ? "pb-4" : "pb-5")}>
            {icon && (
              <div aria-hidden className="mb-4 grid size-9 place-items-center rounded-control bg-danger-soft text-danger">
                {icon}
              </div>
            )}
            <BaseAlertDialog.Title className={cn(titleClass, "pr-8")}>{title}</BaseAlertDialog.Title>
            <BaseAlertDialog.Description className={descriptionClass}>{description}</BaseAlertDialog.Description>
          </div>
          {children && <div className={bodyClass}>{children}</div>}
          <div className={footClass}>{footer}</div>
          {/* Last in DOM order: without initialFocus, focus lands on the first (safe) footer action. */}
          <BaseAlertDialog.Close render={<IconButton label="Close" icon={<XIcon />} className={closeClass} />} />
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Portal>
    </BaseAlertDialog.Root>
  );
}

/** Closes the surrounding AlertDialog. */
export function AlertDialogClose({ render }: { render: ReactElement }) {
  return <BaseAlertDialog.Close render={render} />;
}

/** The exact list of what will be lost. */
export function Consequences({ items }: { items: ReactNode[] }) {
  return (
    <ul className="m-0 mb-4 flex list-none flex-col gap-1.5 rounded-control border border-line bg-sunken p-3 text-small text-ink-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2">
          <XIcon size={14} className="flex-none text-danger" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}

export interface DestructiveDialogProps {
  trigger: ReactElement;
  /** The object's name. Typing it unlocks the confirm button. */
  name: string;
  title: ReactNode;
  description: ReactNode;
  consequences: ReactNode[];
  /** Verb + object, e.g. "Delete agent". */
  confirmLabel: string;
  /** Keep + object, e.g. "Keep agent". */
  cancelLabel: string;
  onConfirm: () => void;
  onOpenChange?: (open: boolean) => void;
  /** Called with what's been typed so far, for state readouts. */
  onTyped?: (typed: string) => void;
}

/** Lists what will be lost and requires typing the name to unlock the confirm button. */
export function DestructiveDialog({
  trigger,
  name,
  title,
  description,
  consequences,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onOpenChange,
  onTyped,
}: DestructiveDialogProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const unlocked = typed === name;

  function change(next: boolean) {
    setOpen(next);
    if (next) setTyped("");
    onOpenChange?.(next);
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={change}
      trigger={trigger}
      initialFocus={inputRef}
      icon={<WarningCircleIcon size={18} />}
      title={title}
      description={description}
      footer={
        <>
          <AlertDialogClose render={<Button variant="secondary">{cancelLabel}</Button>} />
          <Button
            variant="danger"
            type="submit"
            form="destructive-confirm"
            disabled={!unlocked}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Consequences items={consequences} />
      <form
        id="destructive-confirm"
        onSubmit={(e) => {
          e.preventDefault();
          if (!unlocked) return;
          change(false);
          onConfirm();
        }}
      >
        <Field
          label={
            <>
              Type{" "}
              <code className="rounded-inline bg-sunken px-1 py-px text-caption">{name}</code>{" "}
              to confirm
            </>
          }
        >
          <Input
            ref={inputRef}
            value={typed}
            autoComplete="off"
            spellCheck={false}
            onValueChange={(v: string) => {
              setTyped(v);
              onTyped?.(v);
            }}
          />
        </Field>
      </form>
    </AlertDialog>
  );
}
