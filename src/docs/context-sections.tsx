import { useRef } from "react";
import { InputSection } from "./component-sections";
import { useDocs } from "./docs-context";
import { ColorSection, FocusSection, ThemesSection } from "./foundations";
import { usePageScheme } from "@/lib/use-page-scheme";

/* Sections that read page state, wrapped so every page body is a plain component. */

export function ColorPage() {
  const scheme = usePageScheme();
  return <ColorSection themeKey={`${useDocs().theme}:${scheme}`} />;
}

export function ThemesPage() {
  const { theme, setTheme, mode, setMode, accent, setAccent } = useDocs();
  return <ThemesSection theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} accent={accent} setAccent={setAccent} />;
}

export function FocusPage() {
  return <FocusSection />;
}

export function InputPage() {
  const searchRef = useRef<HTMLInputElement>(null);
  return <InputSection searchRef={searchRef} />;
}
