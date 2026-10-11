import type { SelectGroup } from "@/components";

/* Sample data for the settings template. */

export type Section = "general" | "models" | "keys" | "usage" | "danger";

export const SECTIONS: { value: Section; label: string }[] = [
  { value: "general", label: "General" },
  { value: "models", label: "Models" },
  { value: "keys", label: "API keys" },
  { value: "usage", label: "Usage" },
  { value: "danger", label: "Danger zone" },
];

export const BRANCHES: SelectGroup[] = [
  {
    options: [
      { value: "main", label: "main", description: "Agents open pull requests against it." },
      { value: "develop", label: "develop" },
      { value: "staging", label: "staging" },
    ],
  },
];

export const TIMEZONES: SelectGroup[] = [
  {
    options: [
      { value: "Europe/London", label: "London", meta: "UTC+1" },
      { value: "America/New_York", label: "New York", meta: "UTC−4" },
      { value: "Asia/Kolkata", label: "Kolkata", meta: "UTC+5:30" },
      { value: "Asia/Tokyo", label: "Tokyo", meta: "UTC+9" },
    ],
  },
];

export const SCOPES: SelectGroup[] = [
  {
    options: [
      { value: "read", label: "Read only", description: "List agents and read runs." },
      { value: "run", label: "Run agents", description: "Everything in Read, plus start and stop runs." },
      { value: "admin", label: "Full access", description: "Everything, including members and billing." },
    ],
  },
];

export const SCOPE_LABEL: Record<string, string> = { read: "Read only", run: "Run agents", admin: "Full access" };

export const TOOLS = [
  { value: "shell", label: "Run shell commands", description: "Inside the run's sandbox. Never on your machine." },
  { value: "edit", label: "Edit files", description: "Changes stay on a branch until you merge them." },
  { value: "web", label: "Browse the web", description: "Read public pages to look things up." },
  { value: "deploy", label: "Deploy", description: "Push to preview environments. Production always asks first." },
];

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scope: string;
  /** Minutes ago. */
  created: number;
  /** Minutes ago, or null if never used. */
  lastUsed: number | null;
}

const DAY = 60 * 24;

export const KEYS: ApiKey[] = [
  { id: "k1", name: "ci-runner", prefix: "crt_live_8f2a", scope: "run", created: 92 * DAY, lastUsed: 14 },
  { id: "k2", name: "slack-bot", prefix: "crt_live_31cd", scope: "read", created: 40 * DAY, lastUsed: 3 * 60 },
  { id: "k3", name: "local-dev", prefix: "crt_live_c07e", scope: "admin", created: 6 * DAY, lastUsed: null },
];

export const COST_BY_AGENT = [
  { name: "lunch-picker", runs: 412, calls: 1840, cost: 18.4 },
  { name: "invoice-checker", runs: 96, calls: 1205, cost: 31.75 },
  { name: "nightly-report", runs: 30, calls: 418, cost: 6.2 },
];

/** "3 hours ago", from minutes ago. */
export function relative(minutes: number) {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (minutes < 60) return rtf.format(-minutes, "minute");
  if (minutes < DAY) return rtf.format(-Math.round(minutes / 60), "hour");
  if (minutes < 30 * DAY) return rtf.format(-Math.round(minutes / DAY), "day");
  return rtf.format(-Math.round(minutes / (30 * DAY)), "month");
}

export function plural(n: number, one: string, other: string) {
  return `${n.toLocaleString("en-US")} ${new Intl.PluralRules("en").select(n) === "one" ? one : other}`;
}

/** A fresh secret, shown once. */
export function newSecret() {
  const hex = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, "0");
  return `crt_live_${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`;
}
