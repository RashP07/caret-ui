import { useDeferredValue, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  CheckboxChoice,
  Field,
  Input,
  Progress,
  Seg,
  Slider,
  SwitchChoice,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ThemeSwatch,
  toast,
} from "@/components";
import { cn } from "@/lib/cn";
import {
  buildTheme,
  checkTheme,
  cssBlock,
  DEFAULT_SPEC,
  hexToOklch,
  maxChroma,
  PRESETS,
  themeVars,
  type Check,
  type Contrast,
  type Radius,
  type ThemeSpec,
} from "@/lib/palette";
import { THEME_INFO, THEMES, type PresetName } from "@/lib/theme";
import { track } from "@/lib/analytics";
import { useDocs } from "./docs-context";
import { Section } from "./spec";

/* ---------- the spec ↔ a shareable URL ---------- */

const RADIUS_CODE: Record<Radius, string> = { sharp: "s", default: "d", round: "r" };

function specToQuery(s: ThemeSpec): string {
  const q = new URLSearchParams({
    h: String(Math.round(s.hue)),
    v: String(Math.round(s.vibrancy * 100)),
    t: String(Math.round(s.tint * 100)),
    c: s.contrast === "high" ? "h" : "s",
    r: RADIUS_CODE[s.radius],
    p: s.primary === "brand" ? "b" : "i",
  });
  if (s.mono) q.set("m", "1");
  if (s.neutralHue != null) q.set("nh", String(Math.round(s.neutralHue)));
  if (s.inkHue != null) q.set("ih", String(Math.round(s.inkHue)));
  return q.toString();
}

function specFromQuery(search: string): ThemeSpec | null {
  const q = new URLSearchParams(search);
  if (!q.has("h")) return null;
  const num = (k: string, d: number) => (q.has(k) && !Number.isNaN(+q.get(k)!) ? +q.get(k)! : d);
  const radius = (Object.keys(RADIUS_CODE) as Radius[]).find((r) => RADIUS_CODE[r] === q.get("r")) ?? "default";
  return {
    label: "Custom",
    hue: num("h", DEFAULT_SPEC.hue) % 360,
    vibrancy: Math.min(num("v", 85), 100) / 100,
    tint: Math.min(num("t", 30), 100) / 100,
    contrast: q.get("c") === "h" ? "high" : "standard",
    radius,
    primary: q.get("p") === "i" ? "ink" : "brand",
    mono: q.get("m") === "1" || undefined,
    neutralHue: q.has("nh") ? num("nh", 0) : undefined,
    inkHue: q.has("ih") ? num("ih", 0) : undefined,
  };
}

const toStyle = (vars: Record<string, string>) =>
  Object.fromEntries(Object.entries(vars).map(([k, v]) => [`--${k}`, v])) as CSSProperties;

async function copy(text: string, done: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(done, { tone: "success" });
  } catch {
    toast("Couldn't copy. Select and copy it manually.", { tone: "danger" });
  }
}

/* ---------- preview ---------- */

const CHART = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5", "bg-chart-6"];

/** A small settings screen made of real components: what a theme looks like in use. Shared with the home page. */
export function SampleSettings({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <Card>
        <CardBody className="flex flex-col gap-3">
          <CardTitle>Deploy settings</CardTitle>
          <Field label="Agent name" hint="Lowercase letters, numbers and dashes.">
            <Input defaultValue="lunch-picker" />
          </Field>
          <SwitchChoice label="Deploy on push" defaultChecked />
          <CheckboxChoice label="Notify the team" defaultChecked />
          <Progress label="Build" value={64} />
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Deploy</Button>
            <Button variant="secondary">Preview</Button>
            <Button variant="danger">Delete</Button>
          </div>
        </CardBody>
      </Card>
      <div className="flex flex-wrap gap-1.5">
        <Badge tone="ok">Ready</Badge>
        <Badge tone="live" dot>
          Running
        </Badge>
        <Badge tone="warning">Queued</Badge>
        <Badge tone="danger">Failed</Badge>
        <Badge tone="info">Info</Badge>
      </div>
      <p className="m-0 text-small text-pretty text-ink-2">
        Read the <a className="link" href="#top">deploy guide</a> before you ship.
      </p>
      <div aria-hidden className="flex h-12 items-end gap-1.5">
        {[70, 45, 90, 55, 30, 65].map((h, i) => (
          <span key={i} className={cn("w-full rounded-t-[3px]", CHART[i])} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

/** The sample on the candidate theme's tokens, scoped by inline style, so the page itself doesn't change. */
function Preview({ style, mode }: { style: CSSProperties; mode: "light" | "dark" }) {
  return (
    <div data-theme="custom" data-mode={mode} style={style} className="flex min-w-0 flex-col gap-3 rounded-card border border-line bg-page p-4 text-ink">
      <span className="text-caption text-ink-3">{mode === "light" ? "Light" : "Dark"}</span>
      <SampleSettings />
    </div>
  );
}

/* ---------- controls ---------- */

function Label({ children }: { children: string }) {
  return <span className="text-small font-control text-ink-2">{children}</span>;
}

/** The hue range at the current vibrancy, so the slider shows what it picks. */
function HueStrip({ vibrancy }: { vibrancy: number }) {
  const stops = Array.from({ length: 13 }, (_, i) => {
    const h = i * 30;
    return `oklch(0.64 ${(0.25 + 0.75 * vibrancy) * maxChroma(0.64, h)} ${h})`;
  });
  return <div aria-hidden className="h-2 rounded-pill" style={{ background: `linear-gradient(90deg, ${stops.join(", ")})` }} />;
}

/* ---------- report ---------- */

interface Row {
  key: string;
  group: string;
  fg: string;
  bg: string;
  target: number;
  light?: Check;
  dark?: Check;
}

function rowsOf(checks: Check[]): Row[] {
  const map = new Map<string, Row>();
  for (const c of checks) {
    const key = `${c.fg}|${c.bg}`;
    const row = map.get(key) ?? { key, group: c.group, fg: c.fg, bg: c.bg, target: c.target };
    row[c.mode] = c;
    map.set(key, row);
  }
  // Failures first, then the tightest margins.
  const margin = (r: Row) => Math.min((r.light?.ratio ?? 99) / r.target, (r.dark?.ratio ?? 99) / r.target);
  return [...map.values()].sort((a, b) => margin(a) - margin(b));
}

function Ratio({ c }: { c?: Check }) {
  if (!c) return <span className="text-ink-3">—</span>;
  return <span className={cn(!c.pass && "font-control text-danger")}>{c.ratio.toFixed(2)}</span>;
}

/* ---------- the page ---------- */

export function ThemeBuilderSection() {
  const { theme: pageTheme, custom, setCustom, setTheme } = useDocs();
  const [spec, setSpec] = useState<ThemeSpec>(() => specFromQuery(location.search) ?? custom ?? DEFAULT_SPEC);
  const [hex, setHex] = useState("");
  const deferred = useDeferredValue(spec);
  const theme = useMemo(() => buildTheme(deferred), [deferred]);
  const vars = useMemo(() => themeVars(theme, { radius: true }), [theme]);
  const style = useMemo(() => toStyle(vars), [vars]);
  const rows = useMemo(() => rowsOf(checkTheme(theme)), [theme]);
  const failing = rows.filter((r) => !r.light?.pass || !r.dark?.pass).length;

  const update = (patch: Partial<ThemeSpec>) => setSpec((s) => ({ ...s, ...patch, label: "Custom" }));
  // Moving the brand makes the greys follow it (presets may lean elsewhere until then).
  const setHue = (hue: number) => update({ hue, neutralHue: undefined, inkHue: undefined, mono: false });

  const hexColor = hexToOklch(hex);
  useEffect(() => {
    if (!hexColor) return;
    const [L, C, H] = hexColor;
    if (C < 0.02) update({ mono: true, neutralHue: undefined, inkHue: undefined });
    else update({ hue: H, vibrancy: Math.min(1, C / (maxChroma(L, H) || 1)), mono: false, neutralHue: undefined, inkHue: undefined });
    // Only when the pasted value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hex]);

  const exportCss = () =>
    `/* Caret theme, made in the theme builder (${location.origin}/foundations/theme-builder?${specToQuery(spec)}).\n   Put data-theme="brand" on <html> or any element. Every pairing is solved in light and dark. */\n` +
    cssBlock(`[data-theme="brand"]`, themeVars(buildTheme(spec), { radius: true }));

  const apply = () => {
    const previous = pageTheme;
    track("custom_theme_applied", { hue: Math.round(spec.hue), vibrancy: spec.vibrancy, tint: spec.tint, contrast: spec.contrast, radius: spec.radius, primary: spec.primary, mono: !!spec.mono });
    setCustom({ ...spec, label: "Custom" });
    toast("Custom theme applied to the site", {
      tone: "success",
      action: { label: "Undo", onClick: () => setTheme(previous) },
    });
  };

  return (
    <Section
      id="theme-builder"
      title="Theme builder"
      lede="Pick a brand color and tune the greys around it. Every text, border, status and chart color is solved against its grounds as you go, in light and dark, so contrast and harmony can't drift."
    >
      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-8 max-[1100px]:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
            <Preview style={style} mode="light" />
            <Preview style={style} mode="dark" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="m-0 text-title font-heading">Contrast report</h2>
              <Badge tone={failing ? "danger" : "ok"}>
                {failing ? `${failing} failing` : `All ${rows.length} pairings pass`}
              </Badge>
            </div>
            <p className="m-0 text-small text-pretty text-ink-3">
              WCAG 2 ratios for every pairing the system promises, tightest first. Targets: text 4.5:1 (7:1 at high contrast),
              secondary ink 7:1, borders, focus, indicators and charts 3:1.
            </p>
            <Table aria-label="Contrast report" density="compact" stickyHeader className="max-h-[420px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Pairing</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead align="end">Light</TableHead>
                  <TableHead align="end">Dark</TableHead>
                  <TableHead align="end">Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.key}>
                    <TableCell>
                      <span className="mono text-small">{r.fg}</span> <span className="text-ink-3">on</span> <span className="mono text-small">{r.bg}</span>
                    </TableCell>
                    <TableCell className="text-ink-3">{r.group}</TableCell>
                    <TableCell numeric>
                      <Ratio c={r.light} />
                    </TableCell>
                    <TableCell numeric>
                      <Ratio c={r.dark} />
                    </TableCell>
                    <TableCell numeric className="text-ink-3">
                      {r.target}:1
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* Controls stay in view beside the preview, and scroll on their own when taller than the screen. */}
        <aside
          aria-label="Theme controls"
          className="sticky top-20 -mx-1 flex max-h-[calc(100dvh-6rem)] flex-col gap-5 self-start overflow-y-auto px-1 pb-2 max-[1100px]:static max-[1100px]:max-h-none max-[1100px]:overflow-visible"
        >
          <div className="flex flex-col gap-2">
            <Label>Start from</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {THEMES.map((p: PresetName) => (
                <Button
                  key={p}
                  variant="ghost"
                  size="sm"
                  icon={<ThemeSwatch theme={p} form="dots" />}
                  className="justify-start"
                  onClick={() => setSpec({ ...PRESETS[p], label: "Custom" })}
                >
                  {THEME_INFO[p].label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Slider label="Brand hue" value={Math.round(spec.hue)} onValueChange={(v) => setHue(v)} min={0} max={359} renderValue={(f) => `${f[0]}°`} disabled={spec.mono} />
            <HueStrip vibrancy={spec.vibrancy} />
          </div>
          <Field label="Or paste a brand color" hint="A hex value, e.g. #5B4CF0." error={hex && !hexColor ? "Use a hex color like #5B4CF0." : undefined}>
            <Input value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#5B4CF0" spellCheck={false} />
          </Field>
          <Slider
            label="Vibrancy"
            hint="Muted to vivid, as a share of what the hue can hold."
            value={Math.round(spec.vibrancy * 100)}
            onValueChange={(v) => update({ vibrancy: v / 100 })}
            renderValue={(f) => `${f[0]}%`}
            disabled={spec.mono}
          />
          <Slider
            label="Neutral tint"
            hint="Pure grey to greys that lean toward the brand."
            value={Math.round(spec.tint * 100)}
            onValueChange={(v) => update({ tint: v / 100 })}
            renderValue={(f) => `${f[0]}%`}
          />
          <SwitchChoice label="Monochrome" description="The ink is the accent." checked={!!spec.mono} onCheckedChange={(m) => update({ mono: m || undefined })} />

          <div className="flex flex-col gap-2">
            <Label>Primary buttons</Label>
            <Seg aria-label="Primary buttons" value={spec.primary} onValueChange={(p) => update({ primary: p })} options={[{ value: "brand", label: "Brand" }, { value: "ink", label: "Ink" }]} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Contrast</Label>
            <Seg<Contrast> aria-label="Contrast" value={spec.contrast} onValueChange={(c) => update({ contrast: c })} options={[{ value: "standard", label: "Standard (AA)" }, { value: "high", label: "High (AAA)" }]} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Corners</Label>
            <Seg<Radius> aria-label="Corners" value={spec.radius} onValueChange={(r) => update({ radius: r })} options={[{ value: "sharp", label: "Sharp" }, { value: "default", label: "Default" }, { value: "round", label: "Round" }]} />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-line pt-4">
            <Button variant="primary" onClick={apply}>
              Use this theme
            </Button>
            <Button variant="secondary" onClick={() => {
                track("theme_css_copied");
                copy(exportCss(), "CSS copied");
              }}>
              Copy CSS
            </Button>
            <Button variant="ghost" onClick={() => {
                track("theme_link_copied");
                copy(`${location.origin}/foundations/theme-builder?${specToQuery(spec)}`, "Link copied");
              }}>
              Copy link
            </Button>
            <Button variant="ghost" onClick={() => setSpec(DEFAULT_SPEC)}>
              Reset
            </Button>
          </div>
        </aside>

      </div>
    </Section>
  );
}
