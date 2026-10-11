import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { usePageTheme, type Accent, type Mode, type ThemeName } from "@/lib/theme";
import { DocsContext } from "../docs-context";
import { QuickSearch } from "./quick-search";
import { THEME_PANEL_WIDTH, ThemePanel } from "./theme-panel";
import { useMediaQuery } from "@/lib/use-media-query";

function isTyping() {
  const a = document.activeElement as HTMLElement | null;
  return !!a && (/INPUT|TEXTAREA|SELECT/.test(a.tagName) || a.isContentEditable);
}

/**
 * Everything every docs route shares: the page theme, Quick Search, the theme
 * panel, and the page shortcuts.
 */
export function DocsRoot({ children }: { children: ReactNode }) {
  const page = usePageTheme();
  const { theme, mode, accent, custom, setCustom } = page;
  // The page's choices are what analytics wants to know about; the setters record them.
  const setTheme = (t: ThemeName) => {
    page.setTheme(t);
    track("theme_changed", { theme: t });
  };
  const setMode = (m: Mode) => {
    page.setMode(m);
    track("mode_changed", { mode: m });
  };
  const setAccent = (a: Accent) => {
    page.setAccent(a);
    track("accent_changed", { accent: a });
  };
  const [searchOpen, setSearchOpen] = useState(false);
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  // Docked beside the page on wide screens: the page makes room instead of being covered.
  const docked = !useMediaQuery("(max-width: 1000px)");
  const navigate = useNavigate();

  // ⌘K anywhere, or "/" when not typing: Quick Search. "B" when not typing: browse components.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => {
          if (!o) track("search_opened", { via: "shortcut" });
          return !o;
        });
        return;
      }
      if (isTyping() || e.metaKey || e.ctrlKey || e.altKey || document.querySelector("[role='dialog'],[role='alertdialog']")) return;
      if (e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
        track("search_opened", { via: "slash" });
      }
      if ((e.key === "b" || e.key === "B") && !e.repeat) navigate({ to: "/components" });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <DocsContext.Provider
      value={{ theme, setTheme, mode, setMode, accent, setAccent, custom, setCustom, openSearch: () => {
          setSearchOpen(true);
          track("search_opened", { via: "click" });
        }, themePanelOpen, setThemePanelOpen }}
    >
      <div
        className="transition-[padding] duration-settle ease-drawer"
        style={{ paddingRight: themePanelOpen && docked ? THEME_PANEL_WIDTH : 0 }}
      >
        {children}
      </div>
      <ThemePanel />
      <QuickSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </DocsContext.Provider>
  );
}
