import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { CheckIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { ACCENT_INFO, ACCENTS, ThemeScope, type Accent, type ResolvedMode, type ThemeName } from "@/lib/theme";
import { Tooltip } from "./tooltip";

/*
 * ThemeSwatch. A theme's colors, read live from its own tokens: each swatch
 * is a ThemeScope, so it can never drift from the theme it names.
 *   dots  — surface, ink and accent, overlapping in a pill. For pickers.
 *   strip — page, surface, ink, accent, danger, success. For theme cards.
 *   pair  — the light and dark grounds side by side, with the accent between.
 *   circles — overlapping circles: light ground, soft accent, accent, dark ground.
 *             For theme pickers, where both modes matter.
 * Without `mode` it follows the mode it sits in.
 */

const DOTS = ["bg-surface", "bg-ink", "bg-accent"];
const STRIP = ["bg-page", "bg-surface", "bg-ink", "bg-accent", "bg-danger", "bg-success"];

export interface ThemeSwatchProps {
  theme: ThemeName;
  mode?: ResolvedMode;
  form?: "dots" | "strip" | "pair" | "circles";
  className?: string;
}

export function ThemeSwatch({ theme, mode, form = "dots", className }: ThemeSwatchProps) {
  if (form === "strip") {
    return (
      <ThemeScope as="span" theme={theme} mode={mode} aria-hidden className={cn("flex gap-1", className)}>
        {STRIP.map((c) => (
          // ≤3px: a decorative mark, not a container.
          <i key={c} className={cn("h-3.5 flex-1 rounded-[3px] shadow-[inset_0_0_0_1px_var(--line-strong)]", c)} />
        ))}
      </ThemeScope>
    );
  }

  if (form === "circles") {
    // Light ground → soft accent → accent → dark ground, overlapping like a palette card.
    // Pinned to their modes, so a theme's palette reads the same in light and dark pages.
    // The faint inner edge only matters where a circle matches the panel behind it.
    const circle = "size-6 flex-none rounded-full shadow-[inset_0_0_0_1px_var(--line)] [&:not(:first-child)]:-ml-2";
    return (
      <span aria-hidden className={cn("inline-flex flex-none items-center", className)}>
        <ThemeScope as="span" theme={theme} mode="light" className={cn(circle, "bg-page")} />
        <ThemeScope as="span" theme={theme} mode="light" className={cn(circle, "bg-accent-soft")} />
        <ThemeScope as="span" theme={theme} mode="light" className={cn(circle, "bg-accent")} />
        <ThemeScope as="span" theme={theme} mode="dark" className={cn(circle, "bg-page")} />
      </span>
    );
  }

  if (form === "pair") {
    return (
      <span aria-hidden className={cn("relative inline-flex h-3.5 w-[30px] flex-none overflow-hidden rounded-pill shadow-[0_0_0_1px_var(--line-strong)]", className)}>
        <ThemeScope as="span" theme={theme} mode="light" className="flex-1 bg-page" />
        <ThemeScope as="span" theme={theme} mode="dark" className="flex-1 bg-page" />
        <ThemeScope as="span" theme={theme} className="absolute inset-y-[3px] left-1/2 w-2 -translate-x-1/2 rounded-full bg-accent" />
      </span>
    );
  }

  return (
    <ThemeScope
      as="span"
      theme={theme}
      mode={mode}
      aria-hidden
      className={cn("inline-flex flex-none rounded-pill bg-page p-0.5 shadow-[0_0_0_1px_var(--line-strong)]", className)}
    >
      {DOTS.map((d, i) => (
        <i key={d} className={cn("size-2.5 rounded-full shadow-[0_0_0_1.5px_var(--page)]", d, i > 0 && "-ml-[3px]")} />
      ))}
    </ThemeScope>
  );
}

export interface AccentPickerProps {
  value: Accent;
  onValueChange: (accent: Accent) => void;
  /** The theme the circles are drawn in: "Theme default" shows this theme's own accent. */
  theme: ThemeName;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Primary color picker: one circle per accent, each drawn by its own data-accent, so it
 * shows exactly the color it will apply. Arrows move between them (a radio group).
 */
export function AccentPicker({ value, onValueChange, theme, disabled, className, ...aria }: AccentPickerProps) {
  return (
    <BaseRadioGroup
      aria-label={aria["aria-label"] ?? "Primary color"}
      value={value}
      onValueChange={(v) => onValueChange(v as Accent)}
      disabled={disabled}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {ACCENTS.map((a) => (
        <Tooltip key={a} label={ACCENT_INFO[a].label}>
          <BaseRadio.Root
            value={a}
            aria-label={ACCENT_INFO[a].label}
            data-theme={theme}
            data-accent={a}
            className={cn(
              "grid size-7 place-items-center rounded-full bg-accent text-on-accent shadow-[inset_0_0_0_1px_var(--line)] touch:size-10",
              "transition-[scale,box-shadow] duration-instant ease-out not-data-disabled:active:scale-90",
              // Chosen: a ring cut out of the ground, plus the tick.
              "data-checked:shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--ink)]",
              "data-disabled:cursor-not-allowed data-disabled:opacity-40",
            )}
          >
            <BaseRadio.Indicator className="grid place-items-center">
              <CheckIcon size={14} weight="bold" aria-hidden />
            </BaseRadio.Indicator>
          </BaseRadio.Root>
        </Tooltip>
      ))}
    </BaseRadioGroup>
  );
}
