import { XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { AccentPicker, Button, IconButton, RadioChoice, RadioGroup, Seg, ThemeSwatch } from "@/components";
import { cn } from "@/lib/cn";
import { duration, ease } from "@/lib/motion";
import { MODE_INFO, MODES, THEME_INFO, THEMES, type Accent, type ThemeName } from "@/lib/theme";
import { useMediaQuery } from "@/lib/use-media-query";
import { useDocs } from "../docs-context";

/** Width of the docked panel; the page makes room for it (see DocsRoot). */
/** The left sidebar's width, so the page sits between two columns of the same size. */
export const THEME_PANEL_WIDTH = 272;

/** Opens and closes the theme side panel. Shows the current theme's swatch and name. */
export function ThemePanelButton() {
  const { theme, themePanelOpen, setThemePanelOpen } = useDocs();
  return (
    <Button
      variant="secondary"
      icon={<ThemeSwatch theme={theme} />}
      aria-expanded={themePanelOpen}
      aria-controls="theme-panel"
      data-theme-panel-trigger
      onClick={() => setThemePanelOpen(!themePanelOpen)}
    >
      <span className="max-[600px]:sr-only-caret">{THEME_INFO[theme].label}</span>
    </Button>
  );
}

/**
 * The theme chooser, as a side panel: docked beside the page, not over it.
 * No backdrop and no focus trap — the page stays live, so you can read a
 * component page while trying themes on it. Wide screens make room for it;
 * phones get a slide-over (DESIGN.md §3: --e-modal for slide-over panels on small screens).
 */
export function ThemePanel() {
  const { theme, setTheme, mode, setMode, accent, setAccent, custom, themePanelOpen, setThemePanelOpen } = useDocs();
  const docked = !useMediaQuery("(max-width: 1000px)");
  const panelRef = useRef<HTMLElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  // On open, start on the chosen theme so arrows move between themes at once.
  useEffect(() => {
    if (!themePanelOpen) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() =>
      panelRef.current?.querySelector<HTMLElement>("[role=radio][aria-checked=true]")?.focus({ preventScroll: true }),
    );
  }, [themePanelOpen]);

  function close() {
    setThemePanelOpen(false);
    const back = returnTo.current?.isConnected ? returnTo.current : document.querySelector<HTMLElement>("[data-theme-panel-trigger]");
    back?.focus({ preventScroll: true });
  }

  return (
    <AnimatePresence>
      {themePanelOpen && (
        <motion.aside
          ref={panelRef}
          id="theme-panel"
          aria-label="Theme"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            }
          }}
          // Arrives on the sheet curve; leaves faster than it came.
          initial={{ transform: "translateX(100%)" }}
          animate={{ transform: "translateX(0%)", transition: { duration: duration.settle, ease: ease.drawer } }}
          exit={{ transform: "translateX(100%)", transition: { duration: duration.quick, ease: ease.out } }}
          style={{ width: docked ? THEME_PANEL_WIDTH : undefined }}
          className={[
            // The left sidebar's mirror: a full-height column on the surface, flush to the edge, one line on its inner side.
            "fixed inset-y-0 right-0 z-30 flex flex-col border-l border-line bg-surface text-ink",
            // phones: the same column, sliding over the page
            docked ? "" : "w-[min(272px,calc(100vw-48px))] shadow-modal",
          ].join(" ")}
        >
          {/* 56px, border-box, like the sidebar's brand row: its bottom line continues the top bar's. */}
          <header className="flex h-14 flex-none items-center gap-2 border-b border-line ps-5 pe-2">
            <h2 className="m-0 flex-1 text-subtitle font-heading">Theme</h2>
            <IconButton label="Close theme panel" kbd="Esc" icon={<XIcon />} onClick={close} />
          </header>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-3 pt-3 pb-6">
            <Seg
              aria-label="Mode"
              value={mode}
              onValueChange={(m) => setMode(m)}
              options={MODES.map((m) => ({ value: m, label: MODE_INFO[m].label }))}
              className="w-full [&>*]:flex-1"
            />
            <AccentRow theme={theme} accent={accent} setAccent={setAccent} />
            <ThemeList theme={theme} setTheme={setTheme} hasCustom={!!custom} />
            <Button variant="secondary" render={<Link to="/foundations/$slug" params={{ slug: "theme-builder" }} />} onClick={close} className="mx-2">
              {custom ? "Edit your theme" : "Make your own theme"}
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/** Every theme as a slim row: name, one line, and its palette circles. Shared with the Themes page. */
export function ThemeList({ theme, setTheme, hasCustom, className }: { theme: ThemeName; setTheme: (t: ThemeName) => void; hasCustom?: boolean; className?: string }) {
  return (
    <RadioGroup aria-label="Page theme" value={theme} onValueChange={(v) => setTheme(v as ThemeName)} className={className}>
      {[...THEMES, ...(hasCustom ? (["custom"] as const) : [])].map((t) => (
        <RadioChoice
          key={t}
          value={t}
          label={
            <span className="flex items-center justify-between gap-3 font-control">
              {THEME_INFO[t].label}
              <ThemeSwatch theme={t} form="circles" />
            </span>
          }
          description={THEME_INFO[t].short}
        />
      ))}
    </RadioGroup>
  );
}

/** The primary color choice, labelled. Contrast keeps its own colors, so it's disabled there. */
export function AccentRow({ theme, accent, setAccent, className }: { theme: ThemeName; accent: Accent; setAccent: (a: Accent) => void; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2 px-2", className)}>
      <span className="text-small font-control text-ink-2">Primary color</span>
      <AccentPicker value={accent} onValueChange={setAccent} theme={theme} disabled={theme === "contrast" || theme === "custom"} className="grid w-fit grid-cols-5" />
      {theme === "contrast" && <span className="text-caption text-ink-3">Contrast keeps its own colors.</span>}
      {theme === "custom" && <span className="text-caption text-ink-3">Your custom theme sets its own brand color.</span>}
    </div>
  );
}
