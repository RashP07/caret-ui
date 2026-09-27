import type { DiffLine, SelectGroup, TraceStep } from "@/components";

export interface ChangedFile {
  path: string;
  lang: string;
  status?: string;
  hunk?: string;
  lines: DiffLine[];
}

const toggleSource = `"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";

type Mode = "light" | "dark";

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    const saved = localStorage.getItem("caret-mode") as Mode | null;
    if (saved) setMode(saved);
  }, []);

  function toggle() {
    const next = mode === "dark" ? "light" : "dark";
    document.documentElement.dataset.mode = next;
    localStorage.setItem("caret-mode", next);
    setMode(next);
  }

  return (
    <Button variant="ghost" aria-label="Dark mode" aria-pressed={mode === "dark"} onClick={toggle}>
      {mode === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}`;

export const FILES: ChangedFile[] = [
  {
    path: "src/components/theme-toggle.tsx",
    lang: "TSX",
    status: "New",
    lines: toggleSource.split("\n").map((t) => ["+", t] as DiffLine),
  },
  {
    path: "src/styles/tokens.css",
    lang: "CSS",
    hunk: "@@ -1,10 +1,12 @@ :root",
    lines: [
      // Each token holds its light and dark value; data-mode only picks the color scheme.
      [" ", ":root {"], ["-", "  --bg: #ffffff;"], ["-", "  --fg: #111111;"], ["+", "  color-scheme: light dark;"], ["+", "  --page: light-dark(#F1F2EE, #141619);"], ["+", "  --ink: light-dark(#16181D, #ECEDE8);"], ["+", "  --accent: light-dark(#F5B21B, #F7BC34);"], [" ", "  --radius: 7px;"], [" ", "}"], [" ", ""],
      ["-", ".dark {"], ["-", "  --bg: #000000;"], ["-", "  --fg: #eeeeee;"], ["+", '[data-mode="dark"] {'], ["+", "  color-scheme: dark;"], [" ", "}"], ["+", '[data-mode="light"] { color-scheme: light; }'],
    ],
  },
  {
    path: "src/app/layout.tsx",
    lang: "TSX",
    hunk: "@@ -1,8 +1,10 @@ RootLayout",
    lines: [
      [" ", 'import "./globals.css";'], ["+", 'import { ThemeScript } from "@/components/theme-script";'], [" ", ""], [" ", "export default function RootLayout({ children }) {"], [" ", "  return ("],
      ["-", '    <html lang="en">'], ["+", '    <html lang="en" suppressHydrationWarning>'], ["+", "      <head><ThemeScript /></head>"], [" ", "      <body>{children}</body>"], [" ", "    </html>"], [" ", "  );"], [" ", "}"],
    ],
  },
  {
    path: "registry.json",
    lang: "JSON",
    hunk: "@@ -3,5 +3,7 @@ items",
    lines: [
      [" ", '  "items": ['], [" ", '    { "name": "button", "type": "registry:ui" },'], ["+", '    { "name": "theme-toggle", "type": "registry:ui",'], ["+", '      "dependencies": ["button"] },'], [" ", '    { "name": "input", "type": "registry:ui" },'], [" ", '    { "name": "dropdown", "type": "registry:ui" }'], [" ", "  ]"],
    ],
  },
];

export const STEPS: TraceStep[] = [
  { label: "Read tokens.css and layout.tsx", time: "0:04" },
  { label: "Moved dark values into light-dark() tokens", time: "0:11" },
  { label: "Created theme-toggle.tsx", time: "0:19" },
  { label: "Ran lint, no problems", time: "0:31" },
  { label: "Ran production build", time: "0:41" },
];

export const USER_1 =
  "Add dark-mode tokens and a reusable theme toggle to the registry. Run lint and a production build when you are done.";

export const RUN_STEPS = ["Reading your message", "Searching the project", "Checking related files", "Writing a reply"];

export const REPLY =
  "This workspace is a template, so the run you just watched is scripted. In a real product this is where the answer streams in, token by token, with the accent-colored caret marking the write head. The trace above stays collapsed once the run finishes, so the reply stays readable but the work is one click away.";

export const MODEL_GROUPS: SelectGroup[] = [
  {
    options: [
      { value: "Quick", label: "Quick", description: "Short replies, lowest cost", meta: "fast" },
      { value: "Balanced", label: "Balanced", description: "Plans before acting", meta: "mid" },
      { value: "Thorough", label: "Thorough", description: "Reads widely, double-checks", meta: "deep" },
    ],
  },
];

export const WORKSPACES: SelectGroup[] = [
  {
    label: "Workspaces",
    options: [
      { value: "PR", label: "Priya Raman", description: "Personal" },
      { value: "ST", label: "Studio team", description: "Pro plan, 6 members" },
    ],
  },
];

export const BRANCHES: SelectGroup[] = [
  {
    label: "Branch",
    options: [
      { value: "main", label: "main", meta: "base" },
      { value: "feat/theme-toggle", label: "feat/theme-toggle", meta: "+4" },
      { value: "release/0.2", label: "release/0.2" },
    ],
  },
];

export const DIRS: SelectGroup[] = [
  {
    label: "Working directory",
    options: [
      { value: "agent-console", label: "agent-console" },
      { value: "caret-ui", label: "caret-ui" },
      { value: "docs-site", label: "docs-site" },
    ],
  },
];

export const MODES: SelectGroup[] = [
  {
    options: [
      { value: "Agent", label: "Agent", description: "Edits files and runs commands" },
      { value: "Ask", label: "Ask", description: "Answers without touching files" },
      { value: "Plan", label: "Plan", description: "Proposes steps, waits for approval" },
    ],
  },
];

export interface Project {
  name: string;
  /** `minutes`: time since the thread was last active. */
  threads?: { name: string; minutes: number; live?: boolean }[];
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** Time since, twice: `short` for the eye ("34m"), `long` for screen readers and sentences ("34 minutes ago"). */
export function ago(minutes: number) {
  if (minutes < 1) return { short: "now", long: "just now" };
  const [value, unit]: [number, "minute" | "hour" | "day"] =
    minutes < 60 ? [minutes, "minute"] : minutes < 1440 ? [Math.round(minutes / 60), "hour"] : [Math.round(minutes / 1440), "day"];
  return { short: `${value}${unit[0]}`, long: relative.format(-value, unit) };
}

export const PROJECTS: Project[] = [
  { name: "caret-ui" },
  {
    name: "agent-console",
    threads: [
      { name: "landing page copy", minutes: 34 },
      { name: "icon set", minutes: 120 },
      { name: "theme toggle", minutes: 0, live: true },
      { name: "mobile nav", minutes: 300 },
      { name: "dropdown refactor", minutes: 1080 },
    ],
  },
  { name: "docs-site" },
  { name: "billing-service" },
];
