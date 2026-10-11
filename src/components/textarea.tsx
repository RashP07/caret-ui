import { Field as BaseField } from "@base-ui/react/field";
import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { wellClass, wellFilledClass, type WellVariant } from "./input";

/*
 * Textarea. The multi-line sibling of Input: the same tinted well, the same one-line focus,
 * the same Field wiring (label above, hint below, error replaces the hint). It grows with its
 * text from `rows` up to `maxRows`, then scrolls, so a long prompt never pushes the form's
 * actions out of view and nobody has to find a resize handle.
 */

export interface TextareaProps extends Omit<ComponentProps<"textarea">, "className" | "onChange"> {
  /** Lines shown when empty. */
  rows?: number;
  /** Lines it grows to before it scrolls. */
  maxRows?: number;
  onValueChange?: (value: string) => void;
  onChange?: ComponentProps<"textarea">["onChange"];
  /** `filled`: no edge until focused, a sunken fill instead. For quiet, dense forms. */
  variant?: WellVariant;
  className?: string;
}

/** One line of text-control (20px); the well adds 8px above and below. */
const LINE = 20;

/**
 * The control well and its textarea. Use inside <Field> (the label and hint are wired to it), or
 * alone with an aria-label. Text sits 12px in like Input's; 16px on phones so iOS doesn't zoom.
 */
export function Textarea({ rows = 3, maxRows = 10, value, onValueChange, onChange, variant = "outline", className, ...props }: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  // Grow with the text, and again when the width changes (the same text wraps differently).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const grow = () => {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, maxRows * LINE + 16) + "px";
    };
    grow();
    let width = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      grow();
    });
    ro.observe(el);
    el.addEventListener("input", grow);
    return () => {
      ro.disconnect();
      el.removeEventListener("input", grow);
    };
  }, [value, maxRows]);

  return (
    <div
      data-focus-target
      className={cn(
        wellClass,
        // wellClass reads read-only and disabled from an <input>; a textarea says the same.
        "has-[textarea[readonly]]:bg-surface",
        "has-[textarea:disabled]:cursor-not-allowed has-[textarea:disabled]:border-line-strong has-[textarea:disabled]:bg-sunken",
        variant === "filled" && wellFilledClass,
        className,
      )}
    >
      <BaseField.Control
        data-focus-proxy
        ref={ref as React.Ref<HTMLElement>}
        render={<textarea rows={rows} />}
        value={value as string | undefined}
        onChange={onChange as unknown as ComponentProps<typeof BaseField.Control>["onChange"]}
        onValueChange={(v) => onValueChange?.(v)}
        {...(props as Omit<ComponentProps<typeof BaseField.Control>, "className">)}
        className={cn(
          "block w-full min-w-0 resize-none border-0 bg-transparent px-3 py-2 text-input-touch text-ink outline-none placeholder:text-ink-3 sm:text-control",
          "overflow-y-auto overscroll-contain",
          "disabled:cursor-not-allowed disabled:text-ink-disabled disabled:placeholder:text-ink-disabled",
        )}
      />
    </div>
  );
}
