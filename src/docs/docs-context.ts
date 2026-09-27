import { createContext, useContext } from "react";
import type { ThemeSpec } from "@/lib/palette";
import type { Accent, Mode, ThemeName } from "@/lib/theme";

/** Page-level state the docs share: the page theme, Quick Search, the theme panel. */
export interface DocsState {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
  /** The saved custom theme, if one was made in the builder. */
  custom: ThemeSpec | null;
  setCustom: (spec: ThemeSpec) => void;
  openSearch: () => void;
  /** The theme side panel, docked beside the page. */
  themePanelOpen: boolean;
  setThemePanelOpen: (open: boolean) => void;
}

export const DocsContext = createContext<DocsState | null>(null);

export function useDocs(): DocsState {
  const ctx = useContext(DocsContext);
  if (!ctx) throw new Error("useDocs must be used inside the docs root");
  return ctx;
}
