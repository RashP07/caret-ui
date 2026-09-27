import { Toast } from "@base-ui/react/toast";
import { CheckIcon, ExclamationMarkIcon, XIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

/**
 * One manager for the whole app, so `toast()` works from anywhere.
 * Base UI pauses every timer while the window is blurred (another tab, another
 * app) and while the stack is hovered or focused, so nobody misses a toast.
 */
const manager = Toast.createToastManager<ToastData>();

export type ToastTone = "neutral" | "success" | "danger" | "warning" | "info";

export interface ToastOptions {
  /** Colors the leading mark and sets its glyph. `neutral` (default) has no mark. */
  tone?: ToastTone;
  /** A second line under the message. */
  description?: string;
  /** One follow-up, e.g. `{ label: "Undo", onClick: restore }`. Clicking it also closes the toast. */
  action?: { label: string; onClick: () => void };
  /** Ms before it closes; 0 keeps it until dismissed. Default 2400, 4000 with a description, 6000 with an action or for danger. */
  timeout?: number;
}

interface ToastData {
  tone: ToastTone;
  action?: ToastOptions["action"];
}

/**
 * Feedback: short, past tense, says what happened. Returns the toast's id.
 * Danger toasts are announced assertively; the rest politely.
 */
export function toast(message: string, options: ToastOptions = {}) {
  const { tone = "neutral", description, action, timeout } = options;
  return manager.add({
    title: message,
    description,
    timeout: timeout ?? (action || tone === "danger" ? 6000 : description ? 4000 : 2400),
    priority: tone === "danger" ? "high" : "low",
    data: { tone, action },
  });
}

/** Close a toast before its timer runs out (it leaves the same way it would on its own). */
export function dismissToast(id: string) {
  manager.close(id);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider toastManager={manager} limit={3}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed right-[max(16px,env(safe-area-inset-right,0px))] bottom-[calc(16px+env(safe-area-inset-bottom,0px))] z-[120] flex flex-col items-end gap-2 outline-none">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

/*
 * The toast is inverted (ink ground, on-ink text). A tone mark is a
 * {tone}-solid disc with an on-{tone} glyph: that pair is solved to ≥4.5:1
 * in every theme, whatever the ink ground does, and each tone has its own
 * glyph so color isn't the only cue. Info's "i" is an inverted "!".
 */
const toneMark: Record<Exclude<ToastTone, "neutral">, { disc: string; glyph: ReactNode }> = {
  success: { disc: "bg-success-solid text-on-success", glyph: <CheckIcon size={12} weight="bold" /> },
  danger: { disc: "bg-danger-solid text-on-danger", glyph: <XIcon size={12} weight="bold" /> },
  warning: { disc: "bg-warning-solid text-on-warning", glyph: <ExclamationMarkIcon size={12} weight="bold" /> },
  info: { disc: "bg-info-solid text-on-info", glyph: <ExclamationMarkIcon size={12} weight="bold" className="rotate-180" /> },
};

function ToastList() {
  const { toasts } = Toast.useToastManager<ToastData>();
  return toasts.map((t) => {
    const tone = t.data?.tone ?? "neutral";
    const action = t.data?.action;
    const mark = tone === "neutral" ? null : toneMark[tone];
    return (
      <Toast.Root
        key={t.id}
        toast={t}
        className={cn(
          "flex max-w-[min(420px,calc(100vw-32px))] items-start gap-2.5 rounded-card bg-ink px-3 py-2.5 text-control text-on-ink shadow-float",
          // Enters from, and leaves toward, the bottom edge it lives on (its own height, so
          // it works for any toast). Transitions, not keyframes: rapid toasts retarget smoothly.
          "transition-[opacity,translate] duration-settle ease-out",
          "data-starting-style:translate-y-full data-starting-style:opacity-0",
          "data-ending-style:translate-y-full data-ending-style:opacity-0 data-ending-style:duration-quick",
        )}
      >
        {mark && (
          // Centred on the first line (20px line box).
          <span aria-hidden className={cn("mt-px grid size-[18px] flex-none place-items-center rounded-full", mark.disc)}>
            {mark.glyph}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <Toast.Title className="m-0 text-control font-normal text-pretty" />
          {t.description && <Toast.Description className="m-0 mt-0.5 text-small text-pretty text-on-ink" />}
        </div>
        {action && (
          <Toast.Action
            render={<Button variant="secondary" size="sm" className="-my-1 flex-none" />}
            onClick={() => {
              action.onClick();
              manager.close(t.id);
            }}
          >
            {action.label}
          </Toast.Action>
        )}
      </Toast.Root>
    );
  });
}
