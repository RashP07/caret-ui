import { createContext, useCallback, useContext, useEffect, useState, type ComponentPropsWithRef, type ElementType } from "react";
import { buildTheme, cssBlock, themeVars, type ThemeSpec } from "./palette";

/*
 * Themes × modes. A theme is a palette (data-theme); a mode picks its light
 * or dark variant (data-mode). Every token holds both variants, so any
 * element can carry either attribute, and a scope with a theme but no mode
 * follows the mode it sits in.
 */

/** The curated presets. A page can also run a `custom` theme made in the theme builder. */
export const THEMES = ["neutral", "zinc", "stone", "slate", "indigo", "teal", "sand", "contrast"] as const;
export type PresetName = (typeof THEMES)[number];
export type ThemeName = PresetName | "custom";

/** A chosen mode. `system` follows the OS. */
export const MODES = ["system", "light", "dark"] as const;
export type Mode = (typeof MODES)[number];
export type ResolvedMode = Exclude<Mode, "system">;

export const THEME_INFO: Record<ThemeName, { label: string; short: string; description: string }> = {
  neutral: { label: "Neutral", short: "Warm grey, amber accent", description: "The default. Warm grey paper, graphite ink, amber for attention." },
  zinc: { label: "Zinc", short: "Pure grey, monochrome", description: "Achromatic greys with the ink as the accent. Nothing competes with the content." },
  stone: { label: "Stone", short: "Warm grey, taupe accent", description: "Warm greys with a quiet taupe accent. Soft, and still all business." },
  slate: { label: "Slate", short: "Cool blue-grey, blue accent", description: "Cool blue-grey grounds with a blue accent. Reads as familiar product UI." },
  indigo: { label: "Indigo", short: "Cool grey, indigo accent", description: "Cool greys with an indigo accent, the familiar look of modern product tools." },
  teal: { label: "Teal", short: "Cool neutral, teal accent", description: "Cool neutral greys with a muted teal accent. Calm, clinical, trustworthy." },
  sand: { label: "Sand", short: "Warm, terracotta accent", description: "Warm sand grounds, brown ink and a terracotta accent, for long sessions." },
  contrast: { label: "Contrast", short: "Maximum legibility", description: "Black and white, heavier strokes and a thicker focus ring. Every text pairing clears WCAG AAA." },
  custom: { label: "Custom", short: "Made in the theme builder", description: "Your own brand color, greys, contrast and radius, solved to the same guarantees as the presets." },
};

/**
 * Primary colors. Any of these replaces the theme's accent and colors the primary
 * button (data-accent); `default` keeps the theme's own. Contrast ignores them.
 */
export const ACCENTS = ["default", "blue", "indigo", "violet", "pink", "red", "orange", "amber", "green", "teal"] as const;
export type Accent = (typeof ACCENTS)[number];

export const ACCENT_INFO: Record<Accent, { label: string }> = {
  default: { label: "Theme default" },
  blue: { label: "Blue" },
  indigo: { label: "Indigo" },
  violet: { label: "Violet" },
  pink: { label: "Pink" },
  red: { label: "Red" },
  orange: { label: "Orange" },
  amber: { label: "Amber" },
  green: { label: "Green" },
  teal: { label: "Teal" },
};

export const MODE_INFO: Record<Mode, { label: string }> = {
  system: { label: "System" },
  light: { label: "Light" },
  dark: { label: "Dark" },
};

const THEME_KEY = "caret-theme";
const MODE_KEY = "caret-mode";
const ACCENT_KEY = "caret-accent";
const CUSTOM_KEY = "caret-custom";
/** The custom theme's generated CSS, cached so index.html can apply it before first paint. */
const CUSTOM_CSS_KEY = "caret-custom-css";
const CUSTOM_STYLE_ID = "caret-custom-theme";

/**
 * The CSS for a custom theme: every token, on [data-theme="custom"]. The :root form outranks
 * the default theme's `:root` block, which would otherwise win on source order.
 */
export function customThemeCss(spec: ThemeSpec): string {
  return cssBlock(`:root[data-theme="custom"],\n[data-theme="custom"]`, themeVars(buildTheme(spec), { radius: true }));
}

function injectCustomCss(text: string) {
  let el = document.getElementById(CUSTOM_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = CUSTOM_STYLE_ID;
    document.head.append(el);
  }
  el.textContent = text;
}

function readCustom(): ThemeSpec | null {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? (JSON.parse(raw) as ThemeSpec) : null;
  } catch {
    return null;
  }
}

/** Earlier theme names, mapped to the theme and mode that replaced them. */
const LEGACY: Record<string, [ThemeName, Mode]> = {
  auto: ["neutral", "system"],
  vellum: ["neutral", "light"],
  graphite: ["neutral", "dark"],
  cyanotype: ["slate", "dark"],
  riso: ["slate", "light"],
  dusk: ["sand", "dark"],
};

function read(): { theme: ThemeName; mode: Mode; accent: Accent; custom: ThemeSpec | null } {
  try {
    const t = localStorage.getItem(THEME_KEY) ?? "neutral";
    const m = localStorage.getItem(MODE_KEY);
    const a = localStorage.getItem(ACCENT_KEY) ?? "default";
    const accent = (ACCENTS as readonly string[]).includes(a) ? (a as Accent) : "default";
    const custom = readCustom();
    if (t in LEGACY) return { theme: LEGACY[t][0], mode: (m as Mode) ?? LEGACY[t][1], accent, custom };
    const valid = (THEMES as readonly string[]).includes(t) || (t === "custom" && custom);
    return {
      theme: valid ? (t as ThemeName) : "neutral",
      mode: (MODES as readonly string[]).includes(m ?? "") ? (m as Mode) : "system",
      accent,
      custom,
    };
  } catch {
    return { theme: "neutral", mode: "system", accent: "default", custom: null };
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked: the choice still applies for this visit */
  }
}

/**
 * The page theme, mode and primary color: `data-theme` / `data-mode` / `data-accent` on
 * <html>, persisted. `system` removes data-mode; `default` removes data-accent. A custom
 * theme (from the builder) is injected as a style block for [data-theme="custom"].
 */
export function usePageTheme() {
  const [state, setState] = useState(read);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", state.theme);
    if (state.mode === "system") root.removeAttribute("data-mode");
    else root.setAttribute("data-mode", state.mode);
    if (state.accent === "default") root.removeAttribute("data-accent");
    else root.setAttribute("data-accent", state.accent);
  }, [state]);

  const setTheme = useCallback((theme: ThemeName) => {
    setState((s) => ({ ...s, theme }));
    save(THEME_KEY, theme);
  }, []);
  const setMode = useCallback((mode: Mode) => {
    setState((s) => ({ ...s, mode }));
    save(MODE_KEY, mode);
  }, []);

  const setAccent = useCallback((accent: Accent) => {
    setState((s) => ({ ...s, accent }));
    save(ACCENT_KEY, accent);
  }, []);

  // A saved custom theme's CSS is usually already in (index.html injects the cached copy);
  // regenerate it once from the spec so an engine update never leaves it stale.
  useEffect(() => {
    if (state.custom) injectCustomCss(customThemeCss(state.custom));
  }, [state.custom]);

  /** Make `spec` the page's custom theme and switch to it. */
  const setCustom = useCallback((spec: ThemeSpec) => {
    const text = customThemeCss(spec);
    injectCustomCss(text);
    save(CUSTOM_KEY, JSON.stringify(spec));
    save(CUSTOM_CSS_KEY, text);
    save(THEME_KEY, "custom");
    setState((s) => ({ ...s, custom: spec, theme: "custom" }));
  }, []);

  return { theme: state.theme, mode: state.mode, accent: state.accent, custom: state.custom, setTheme, setMode, setAccent, setCustom };
}

/**
 * Scoped themes. Anything that portals out of the tree (menus, tooltips,
 * dialogs) reads the nearest scope and re-applies it on its portal, so a
 * popup opened inside a dark Slate template stays dark Slate.
 */
interface Scope {
  theme?: ThemeName;
  mode?: ResolvedMode;
}
const ThemeScopeContext = createContext<Scope>({});

export function useThemeScope() {
  return useContext(ThemeScopeContext);
}

/** Props to spread on a Base UI `Portal` so it inherits the scoped theme and mode. */
export function usePortalTheme(): { "data-theme"?: ThemeName; "data-mode"?: ResolvedMode } {
  const { theme, mode } = useThemeScope();
  return { ...(theme && { "data-theme": theme }), ...(mode && { "data-mode": mode }) };
}

type ThemeScopeProps<T extends ElementType> = {
  as?: T;
  theme?: ThemeName;
  /** Force light or dark here; omit to follow the surrounding mode. */
  mode?: ResolvedMode;
} & Omit<ComponentPropsWithRef<T>, "as" | "theme" | "mode">;

export function ThemeScope<T extends ElementType = "div">({ as, theme, mode, ...props }: ThemeScopeProps<T>) {
  const Comp: ElementType = as ?? "div";
  const parent = useThemeScope();
  return (
    <ThemeScopeContext.Provider value={{ theme: theme ?? parent.theme, mode: mode ?? parent.mode }}>
      <Comp data-theme={theme} data-mode={mode} {...props} />
    </ThemeScopeContext.Provider>
  );
}
