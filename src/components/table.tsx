import { CaretDownIcon, CaretUpDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { createContext, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { pressColorTransition } from "./modality";
import { ScrollArea } from "./scroll-area";

/*
 * Table. Plain semantic elements (Base UI has none) inside a Caret scroll
 * area, so a wide table scrolls sideways on the same thin bars as everything
 * else. Once it overflows, the region is named and takes focus, so it can be
 * scrolled from the keyboard. Rows are 40px (32px compact, 44px on touch);
 * cells stay on one line unless you say otherwise (`whitespace-normal`).
 */

export type TableDensity = "default" | "compact";
export type TableAlign = "start" | "center" | "end";
export type TableSort = "ascending" | "descending" | "none";

const TableContext = createContext<{ density: TableDensity; stickyHeader: boolean }>({
  density: "default",
  stickyHeader: false,
});

const alignClass: Record<TableAlign, string> = { start: "text-start", center: "text-center", end: "text-end" };

/** Shared by every cell, header or body, so a row is the same height whatever it holds. */
function cellClass(density: TableDensity) {
  return cn(
    "px-3 align-middle whitespace-nowrap touch:h-11",
    density === "compact" ? "h-8 py-1" : "h-10 py-2",
  );
}

/** Which ways the table overflows the scroll viewport (the scroll area's content wrapper sits between them). */
function useOverflow(ref: RefObject<HTMLTableElement | null>) {
  const [overflow, setOverflow] = useState({ x: false, y: false });
  useEffect(() => {
    const table = ref.current;
    const viewport = table?.parentElement?.parentElement;
    if (!table || !viewport) return;
    const check = () => {
      const x = viewport.scrollWidth > viewport.clientWidth + 1;
      const y = viewport.scrollHeight > viewport.clientHeight + 1;
      setOverflow((o) => (o.x === x && o.y === y ? o : { x, y }));
    };
    const ro = new ResizeObserver(check);
    ro.observe(viewport);
    ro.observe(table);
    return () => ro.disconnect();
  }, [ref]);
  return overflow;
}

export interface TableProps extends ComponentProps<"table"> {
  /** Row height: 40px, or 32px for dense data. Rows are 44px on touch either way. */
  density?: TableDensity;
  /** Pin the header row while the body scrolls. Give the frame a height (`className`, e.g. `max-h-80`). */
  stickyHeader?: boolean;
  /** Names the table. Prefer it to `aria-label` when the name should be visible. */
  caption?: ReactNode;
  /** Keep the caption for screen readers only. */
  hideCaption?: boolean;
  /** Size the frame (height, width). The table fills it; `tableClassName` styles the table itself. */
  className?: string;
  tableClassName?: string;
}

/** Rows of data in a hairline frame: scan, sort, select. */
export function Table({ density = "default", stickyHeader = false, caption, hideCaption, className, tableClassName, children, ...props }: TableProps) {
  const ref = useRef<HTMLTableElement>(null);
  const overflow = useOverflow(ref);
  const name = props["aria-label"] ?? (typeof caption === "string" ? caption : undefined);
  return (
    <TableContext.Provider value={{ density, stickyHeader }}>
      <ScrollArea
        aria-label={overflow.x || overflow.y ? (name ?? "Table") : undefined}
        // A column flex frame lets the viewport shrink to a max-height, not only a fixed one.
        className={cn("flex flex-col rounded-card border-stroke border-line bg-surface [&>:first-child]:min-h-0", className)}
        // Room under the last row for the horizontal bar, so it never sits on text.
        contentClassName={overflow.x ? "pb-2.5" : undefined}
      >
        <table ref={ref} className={cn("w-full border-separate border-spacing-0 text-control text-ink", tableClassName)} {...props}>
          {caption != null && (
            <caption className={cn("px-3 pt-3 pb-1 text-start text-control font-control text-balance text-ink", hideCaption && "sr-only-caret")}>
              {caption}
            </caption>
          )}
          {children}
        </table>
      </ScrollArea>
    </TableContext.Provider>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  const { stickyHeader } = useContext(TableContext);
  return (
    <thead
      className={cn(
        "[&>tr>*]:border-b [&>tr>*]:border-line",
        // On the cells, not the row: that's what sticks reliably, and it keeps the divider with it.
        stickyHeader && "[&>tr>*]:sticky [&>tr>*]:top-0 [&>tr>*]:z-[2] [&>tr>*]:bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("[&>tr:not(:last-child)>*]:border-b [&>tr>*]:border-line", className)} {...props} />;
}

/** Totals and summaries, below a divider. */
export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return <tfoot className={cn("font-control [&>tr>*]:border-t [&>tr>*]:border-line", className)} {...props} />;
}

/** Not color alone: a selected row also carries an accent bar on its start edge. */
const selectedMarkClass = cn(
  "data-selected:[&>:first-child]:relative",
  "data-selected:[&>:first-child]:before:absolute data-selected:[&>:first-child]:before:inset-y-0 data-selected:[&>:first-child]:before:start-0",
  "data-selected:[&>:first-child]:before:w-0.5 data-selected:[&>:first-child]:before:bg-accent-strong data-selected:[&>:first-child]:before:content-['']",
);

export interface TableRowProps extends ComponentProps<"tr"> {
  /** The selected row: selected fill, an accent bar and aria-selected. Pass false on selectable rows that aren't. */
  selected?: boolean;
  /** Hover fill and pointer. On by default when the row has onClick; give it a keyboard path too (a checkbox, a link). */
  interactive?: boolean;
}

export function TableRow({ selected, interactive, className, ...props }: TableRowProps) {
  const hover = interactive ?? props.onClick != null;
  return (
    <tr
      aria-selected={selected}
      data-selected={selected || undefined}
      className={cn(
        "transition-[background-color] duration-instant ease-hover",
        hover && "cursor-pointer not-data-selected:hover:bg-hover",
        "data-selected:bg-selected",
        selectedMarkClass,
        className,
      )}
      {...props}
    />
  );
}

export interface TableHeadProps extends Omit<ComponentProps<"th">, "align"> {
  align?: TableAlign;
  /** Current sort of this column. Sets aria-sort; with onSort, the label becomes a button. */
  sort?: TableSort;
  onSort?: () => void;
}

/** A column header. Sortable headers are buttons, so the sort is reachable from the keyboard. */
export function TableHead({ align = "start", sort, onSort, scope = "col", className, children, ...props }: TableHeadProps) {
  const { density } = useContext(TableContext);
  const sorted = sort === "ascending" || sort === "descending";
  const Icon = sort === "ascending" ? CaretUpIcon : sort === "descending" ? CaretDownIcon : CaretUpDownIcon;
  return (
    <th
      scope={scope}
      aria-sort={sorted ? sort : undefined}
      className={cn(cellClass(density), "text-small font-control text-ink-2", alignClass[align], className)}
      {...props}
    >
      {onSort ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            // Negative margin keeps the label on the column's edge; the ring sits inside the clipped frame.
            "-mx-1.5 inline-flex min-h-6 items-center gap-1 rounded-inline border-0 bg-transparent px-1.5 text-inherit -outline-offset-2",
            pressColorTransition,
            "hover:bg-hover hover:text-ink",
            // End-aligned labels keep their text on the numbers' edge: the caret goes first.
            align === "end" && "flex-row-reverse",
            sorted && "text-ink",
          )}
        >
          {children}
          <Icon aria-hidden weight="bold" className={cn("size-3 flex-none", sorted ? "text-ink" : "text-ink-3")} />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export interface TableCellProps extends Omit<ComponentProps<"td">, "align"> {
  align?: TableAlign;
  /** Numbers: end-aligned, tabular figures, so digits line up down the column. */
  numeric?: boolean;
  /**
   * One line with an ellipsis; this column gives up width first. Give it a floor (`min-w-40`)
   * so it doesn't vanish on narrow screens. String children become the title.
   */
  truncate?: boolean;
}

export function TableCell({ align, numeric, truncate, title, className, children, ...props }: TableCellProps) {
  const { density } = useContext(TableContext);
  return (
    <td
      title={title ?? (truncate && typeof children === "string" ? children : undefined)}
      className={cn(cellClass(density), alignClass[align ?? (numeric ? "end" : "start")], numeric && "tabular-nums", className)}
      {...props}
    >
      {truncate ? (
        // minmax(0, auto): the column's minimum drops to zero but it still asks for its full width,
        // so it truncates only when space runs out. The -m-1 p-1 keeps focus rings inside unclipped.
        <div className="grid grid-cols-[minmax(0,auto)]">
          <span className="-m-1 truncate p-1">{children}</span>
        </div>
      ) : (
        children
      )}
    </td>
  );
}

export interface TableEmptyProps extends Omit<ComponentProps<"td">, "title"> {
  /** How many columns the table has, so the message spans them all. */
  colSpan: number;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** A way forward, e.g. a Button. */
  action?: ReactNode;
}

/** A full-width row that says why there's nothing here, and what to do about it. */
export function TableEmpty({ colSpan, icon, title, description, action, className, ...props }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn("px-6 py-10 text-center", className)} {...props}>
        <div className="mx-auto flex max-w-[40ch] flex-col items-center gap-1">
          {icon && (
            <span aria-hidden className="mb-2 grid size-[34px] place-items-center rounded-control border border-line bg-sunken text-ink-2">
              {icon}
            </span>
          )}
          <p className="m-0 text-control font-control text-balance text-ink">{title}</p>
          {description && <p className="m-0 text-small text-pretty text-ink-2">{description}</p>}
          {action && <div className="mt-3 flex flex-wrap justify-center gap-2">{action}</div>}
        </div>
      </td>
    </tr>
  );
}

const SKELETON_WIDTHS = ["w-3/5", "w-2/5", "w-4/5", "w-1/2", "w-1/3", "w-2/3", "w-3/4"];

export interface TableSkeletonProps {
  columns: number;
  rows?: number;
  /** Read to screen readers in place of the bars. Set aria-busy on the Table while it shows. */
  label?: string;
}

/** Placeholder rows at the table's density, so nothing jumps when the data lands. No shimmer; a slow fade, off with reduced motion. */
export function TableSkeleton({ columns, rows = 5, label = "Loading" }: TableSkeletonProps) {
  const { density } = useContext(TableContext);
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r}>
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className={cellClass(density)}>
              {r === 0 && c === 0 && <span className="sr-only-caret">{label}</span>}
              <span
                aria-hidden
                className={cn("block h-2 rounded-pill bg-line motion-safe:animate-pulse", SKELETON_WIDTHS[(r * 3 + c) % SKELETON_WIDTHS.length])}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
