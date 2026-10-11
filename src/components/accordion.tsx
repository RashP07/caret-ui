import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { CaretDownIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { playSound } from "@/lib/sound";
import { panelContentClass, panelHeightClass } from "./collapsible";

/*
 * Accordion. A stack of questions or settings groups in one hairline panel.
 * Each header is a button in the Tab order (APG: no roving focus); Enter or
 * Space opens it. The panel height moves on ease-in-out from --accordion-panel-height and the
 * content fades in just behind it (and out ahead of it), so text never shows clipped mid-line.
 * The caret turns so you can see which rows are open.
 */

type RootProps = Omit<ComponentProps<typeof BaseAccordion.Root>, "className"> & { className?: string };

/** The panel. Pass `multiple` to let several items stay open. It clips to its corners, so triggers draw their ring inside. */
export function Accordion({ className, ...props }: RootProps) {
  return (
    <BaseAccordion.Root
      className={cn("flex w-full flex-col overflow-hidden rounded-card border-stroke border-line bg-surface", className)}
      {...props}
    />
  );
}

export interface AccordionItemProps {
  value: string;
  title: ReactNode;
  /** Right-aligned meta in the header, e.g. a count. */
  meta?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({ value, title, meta, disabled, children, className }: AccordionItemProps) {
  return (
    <BaseAccordion.Item
      value={value}
      disabled={disabled}
      onOpenChange={(open) => playSound(open ? "open" : "close")}
      className={cn("border-b border-line last:border-b-0", className)}
    >
      <BaseAccordion.Header className="m-0 text-[inherit] font-[inherit]">
        <BaseAccordion.Trigger
          className={cn(
            "group/acc flex min-h-12 w-full items-center gap-3 border-0 bg-transparent ps-4 pe-3 py-3 text-start text-control font-control text-ink",
            // A full-width row: hover and press answer in color only, never scale.
            "transition-[background-color] duration-instant ease-hover",
            "not-data-disabled:hover:bg-hover not-data-disabled:active:bg-pressed",
            "data-disabled:cursor-not-allowed data-disabled:text-ink-disabled",
          )}
        >
          <span className="min-w-0 flex-1 text-balance">{title}</span>
          {meta != null && (
            <span className="flex-none text-caption font-normal tabular-nums text-ink-3 group-data-disabled/acc:text-ink-disabled">
              {meta}
            </span>
          )}
          <CaretDownIcon
            aria-hidden
            className="flex-none text-ink-3 transition-transform duration-quick ease-out group-data-panel-open/acc:rotate-180 group-data-disabled/acc:text-ink-disabled"
          />
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
      <BaseAccordion.Panel className={cn(panelHeightClass, "h-(--accordion-panel-height)")}>
        <div className={cn(panelContentClass, "px-4 pb-4 text-control leading-5.5 text-pretty text-ink-2")}>{children}</div>
      </BaseAccordion.Panel>
    </BaseAccordion.Item>
  );
}
