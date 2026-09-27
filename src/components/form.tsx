import { Form as BaseForm } from "@base-ui/react/form";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/*
 * Form. Validation runs on submit, then re-runs as you fix each field.
 * Submitting with errors blocks the submit and moves focus to the first
 * invalid field; each error sits under its field and says exactly what to
 * change. Server errors come back through `errors`, keyed by field name.
 *
 * Give every <Field> a `name` and, where needed, a `validate` that returns
 * a sentence ("Use at least 3 characters."), not a code.
 */

export type FormErrors = Record<string, string | string[]>;

export interface FormProps extends Omit<ComponentProps<typeof BaseForm>, "className" | "onFormSubmit"> {
  /** Called with the named values once every field is valid. */
  onFormSubmit?: (values: Record<string, unknown>) => void;
  /** Server-side errors keyed by field name; shown under their fields. */
  errors?: FormErrors;
  className?: string;
}

export function Form({ onFormSubmit, className, ...props }: FormProps) {
  return (
    <BaseForm
      noValidate
      onFormSubmit={onFormSubmit ? (values) => onFormSubmit(values) : undefined}
      className={cn("flex w-full min-w-0 flex-col gap-5", className)}
      {...props}
    />
  );
}

/** The actions row at the end of a form: right-aligned, primary action last. */
export function FormActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-end gap-2 border-t border-dashed border-line-strong pt-4", className)}
      {...props}
    />
  );
}
