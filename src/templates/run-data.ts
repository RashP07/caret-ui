import type { LogLine } from "@/components";

/*
 * Seed data for the run detail template: one agent run, step by step. Each step says how long the
 * simulation spends on it and the log lines it prints along the way; `tokens` is what it adds to
 * the run's model usage.
 */

export const RUN = {
  id: "run_8f2a91",
  title: "Add dark-mode tokens",
  repo: "agent-console",
  branch: "theme-toggle",
  commit: "4c1e9b7d2a",
  agent: "lunch-picker",
  model: "Balanced",
  /** Context window, in tokens. */
  window: 200_000,
  /** Dollars per 1,000 tokens. */
  rate: 0.003,
};

export type StepKey = "clone" | "install" | "plan" | "edit" | "typecheck" | "test" | "deploy";

export interface RunStep {
  key: StepKey;
  title: string;
  /** What it touched, once it's done. */
  description: string;
  /** Simulated length, ms. */
  ms: number;
  tokens: number;
  log: LogLine[];
}

export const RUN_STEPS: RunStep[] = [
  {
    key: "clone",
    title: "Clone agent-console",
    description: "theme-toggle at 4c1e9b7",
    ms: 900,
    tokens: 0,
    log: [
      { text: "$ git clone --depth 1 -b theme-toggle git@github.com:caret/agent-console.git", level: "muted" },
      { text: "Cloning into 'agent-console'..." },
      { text: "Receiving objects: 100% (412/412), 1.84 MiB | 9.2 MiB/s, done." },
    ],
  },
  {
    key: "install",
    title: "Install dependencies",
    description: "412 packages from the lockfile",
    ms: 1600,
    tokens: 0,
    log: [
      { text: "$ pnpm install --frozen-lockfile", level: "muted" },
      { text: "Lockfile is up to date, resolution step is skipped" },
      { text: "Packages: +412" },
      { text: "WARN  deprecated inflight@1.0.6: not supported, leaks memory", level: "warn" },
      { text: "Progress: resolved 412, reused 409, downloaded 3, added 412, done" },
      { text: "Done in 3.1s", level: "ok" },
    ],
  },
  {
    key: "plan",
    title: "Plan the change",
    description: "3 files to edit, 1 to add",
    ms: 2000,
    tokens: 18_400,
    log: [
      { text: "agent: reading src/styles/tokens.css, src/app/layout.tsx", level: "muted" },
      { text: "agent: found 2 hard-coded colors outside tokens", level: "muted" },
      { text: "agent: plan ready (4 steps)" },
    ],
  },
  {
    key: "edit",
    title: "Edit 3 files",
    description: "theme-toggle.tsx, tokens.css, layout.tsx",
    ms: 2200,
    tokens: 31_200,
    log: [
      { text: "agent: write src/components/theme-toggle.tsx (+33)" },
      { text: "agent: edit src/styles/tokens.css (+7 −5)" },
      { text: "agent: edit src/app/layout.tsx (+3 −1)" },
    ],
  },
  {
    key: "typecheck",
    title: "Typecheck",
    description: "No errors in 214 files",
    ms: 1300,
    tokens: 0,
    log: [
      { text: "$ pnpm tsc -b", level: "muted" },
      { text: "Found 0 errors. Watching for file changes.", level: "ok" },
    ],
  },
  {
    key: "test",
    title: "Run tests",
    description: "48 passed, 1 skipped",
    ms: 2400,
    tokens: 2_100,
    log: [
      { text: "$ pnpm test --run", level: "muted" },
      { text: " ✓ src/components/theme-toggle.test.tsx (6 tests) 41ms", level: "ok" },
      { text: " ✓ src/styles/tokens.test.ts (12 tests) 18ms", level: "ok" },
      { text: " ↓ src/app/layout.test.tsx > hydrates without a flash (skipped: needs a browser)", level: "warn" },
      { text: " ✓ src/lib/theme.test.ts (30 tests) 64ms", level: "ok" },
      { text: "" },
      { text: " Test Files  4 passed (4)" },
      { text: "      Tests  48 passed | 1 skipped (49)" },
      { text: "   Duration  1.92s" },
    ],
  },
  {
    key: "deploy",
    title: "Deploy a preview",
    description: "theme-toggle.agent-console.dev",
    ms: 1800,
    tokens: 0,
    log: [
      { text: "$ caret deploy --preview", level: "muted" },
      { text: "Uploading 38 files (212 KB)" },
      { text: "Building in iad1" },
      { text: "Preview ready: https://theme-toggle.agent-console.dev", level: "ok" },
    ],
  },
];

export const PLAN = [
  "Move the two hard-coded colors in layout.tsx onto tokens.",
  "Give every token a light and a dark value with light-dark().",
  "Add a ThemeToggle that sets data-mode and remembers it.",
  "Typecheck, test, and deploy a preview to check it in both modes.",
];

export const TEST_SUMMARY = [
  "Test Files  4 passed (4)",
  "     Tests  48 passed | 1 skipped (49)",
  "  Duration  1.92s",
  "",
  "skipped: layout.test.tsx > hydrates without a flash",
  "  reason: needs a browser; covered by the preview check",
];
