/*
 * Caret palette engine. OKLCH color math, a contrast solver, and harmony rules that turn a
 * small theme spec (brand hue, vibrancy, neutral tint, contrast, radius) into every token,
 * for light and dark. One engine for both uses: scripts/themes/gen.mjs writes the preset
 * themes into tokens.css with it, and the theme builder runs it live in the browser, so a
 * custom theme carries exactly the guarantees the presets do.
 *
 * No imports: Node runs this file directly (type stripping) for the generator.
 */

export type LCH = [number, number, number];
export type RGB = [number, number, number];
export type Mode = "light" | "dark";
export type Contrast = "standard" | "high";
export type Radius = "sharp" | "default" | "round";

export interface ThemeSpec {
  label: string;
  /** Brand hue, 0–360. */
  hue: number;
  /** 0–1: brand chroma as a share of the most the hue can hold at its lightness (equal vividness across hues). */
  vibrancy: number;
  /** 0–1: how far the greys lean toward `neutralHue`. */
  tint: number;
  /** Hue the greys lean toward. Default: the brand hue, so neutrals and brand agree. */
  neutralHue?: number;
  /** Hue of the ink. Default: `neutralHue`. */
  inkHue?: number;
  /** Monochrome: the accent is the ink itself. */
  mono?: boolean;
  contrast: Contrast;
  radius: Radius;
  /** What primary buttons are made of. */
  primary: "ink" | "brand";
  /** Focus ring in light mode (dark mode always uses the accent). */
  focusLight?: "ink" | "accent";
}

/* ---------------- color math ---------------- */

export function oklchToLinear([L, C, H]: LCH): RGB {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export const inGamut = (c: LCH) => oklchToLinear(c).every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** The most chroma sRGB can show at this lightness and hue. */
export function maxChroma(L: number, H: number): number {
  let lo = 0, hi = 0.4;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut([L, mid, H])) lo = mid; else hi = mid;
  }
  return lo;
}

export const clampGamut = ([L, C, H]: LCH): LCH => (inGamut([L, C, H]) ? [L, C, H] : [L, maxChroma(L, H), H]);

const enc = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const toRgb = (c: LCH): RGB => oklchToLinear(c).map((v) => clamp01(enc(clamp01(v)))) as RGB;

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

export function wcag(a: RGB, b: RGB): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** APCA Lc (SAPC 0.0.98G-4g), absolute value. */
export function apca(txt: RGB, bg: RGB): number {
  const Y = ([r, g, b]: RGB) => {
    let y = 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
    if (y < 0.022) y += (0.022 - y) ** 1.414;
    return y;
  };
  const Yt = Y(txt), Yb = Y(bg);
  if (Math.abs(Yb - Yt) < 0.0005) return 0;
  const s = Yb > Yt ? (Yb ** 0.56 - Yt ** 0.57) * 1.14 : (Yb ** 0.65 - Yt ** 0.62) * 1.14;
  return Math.abs(Math.abs(s) < 0.1 ? 0 : (s - Math.sign(s) * 0.027) * 100);
}

export function hexToOklch(hex: string): LCH | null {
  const m = hex.trim().replace(/^#/, "").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => lin(parseInt(h.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const mm = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * mm - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * mm + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * mm - 0.808675766 * s;
  const C = Math.hypot(A, B);
  return [L, C, ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}

export function css([L, C, H]: LCH, alpha?: number): string {
  const n = (v: number, d: number) => String(+v.toFixed(d)).replace(/^-0$/, "0");
  return `oklch(${n(L, 3)} ${n(C, 3)} ${n(H, 1)}${alpha != null ? ` / ${alpha}` : ""})`;
}

/* ---------------- solver ---------------- */

/**
 * The gentlest lightness that still clears every target: the lightest L for text darker than
 * its grounds, the darkest for text lighter than them. Chroma may depend on L (vibrancy).
 */
function solveL(fg: (L: number) => LCH, bgs: RGB[], min: number, side: "dark" | "light", lc = 0): LCH {
  const ok = (L: number) => {
    const c = toRgb(clampGamut(fg(L)));
    return bgs.every((bg) => wcag(c, bg) >= min * 1.015 && apca(c, bg) >= lc + 0.5);
  };
  let lo = 0, hi = 1;
  if (side === "dark") {
    if (!ok(0)) return clampGamut(fg(0));
    for (let i = 0; i < 36; i++) { const m = (lo + hi) / 2; if (ok(m)) lo = m; else hi = m; }
    return clampGamut(fg(lo));
  }
  if (!ok(1)) return clampGamut(fg(1));
  for (let i = 0; i < 36; i++) { const m = (lo + hi) / 2; if (ok(m)) hi = m; else lo = m; }
  return clampGamut(fg(hi));
}

/* ---------------- harmony ---------------- */

const angDist = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);
const wrap = (h: number) => ((h % 360) + 360) % 360;

/** Status hues keep their meaning; each may move inside its range to stay clear of the brand. */
const STATUS_HUES = {
  danger: { base: 27, range: [-8, 40] },
  success: { base: 150, range: [128, 172] },
  warning: { base: 62, range: [48, 92] },
  info: { base: 245, range: [212, 268] },
} as const;
export type Status = keyof typeof STATUS_HUES;
export const STATUSES = Object.keys(STATUS_HUES) as Status[];
const CLEARANCE = 35;

export function statusHue(s: Status, brand: number, mono = false): number {
  const { base, range } = STATUS_HUES[s];
  if (mono || angDist(base, brand) >= CLEARANCE) return base;
  // Try both directions, clamped to the status's range; keep whichever ends up farther away.
  const toward = (dir: number) => {
    let h = base;
    for (let step = 0; step <= range[1] - range[0]; step++) {
      h = base + dir * step;
      if (h < range[0] || h > range[1]) { h -= dir; break; }
      if (angDist(wrap(h), brand) >= CLEARANCE) break;
    }
    return h;
  };
  const a = toward(1), b = toward(-1);
  return wrap(angDist(wrap(a), brand) >= angDist(wrap(b), brand) ? a : b);
}

/** Links follow the brand unless it reads as a warning or an error; then they stay blue. */
const linkHue = (brand: number, mono?: boolean) =>
  mono || angDist(brand, 20) < 50 || angDist(brand, 70) < 25 ? 256 : brand;

/* ---------------- grounds ---------------- */

const GROUNDS: Record<Contrast, Record<Mode, Record<string, number>>> = {
  standard: {
    light: { page: 0.966, surface: 0.992, sunken: 0.936, hover: 0.944, pressed: 0.905, selected: 0.924 },
    dark: { page: 0.195, surface: 0.228, sunken: 0.165, hover: 0.272, pressed: 0.315, selected: 0.292 },
  },
  high: {
    light: { page: 0.955, surface: 1, sunken: 0.925, hover: 0.925, pressed: 0.875, selected: 0.9 },
    dark: { page: 0.13, surface: 0, sunken: 0.19, hover: 0.21, pressed: 0.27, selected: 0.24 },
  },
};
export const TEXT_GROUNDS = ["page", "surface", "sunken", "hover", "pressed", "selected"];
const INDICATOR_GROUNDS = ["page", "surface", "sunken", "hover"];

export const RADII: Record<Radius, Record<string, string>> = {
  sharp: { "r-inline": "2px", "r-button": "2px", "r-control": "4px", "r-card": "6px", "r-dialog": "8px" },
  default: { "r-inline": "4px", "r-button": "4px", "r-control": "8px", "r-card": "12px", "r-dialog": "16px" },
  round: { "r-inline": "6px", "r-button": "8px", "r-control": "12px", "r-card": "16px", "r-dialog": "20px" },
};

/* ---------------- theme → tokens ---------------- */

export type Palette = Record<string, LCH>;

/**
 * Every color token for one mode. `extraGrounds` widens the set of grounds text is solved
 * against (the primary-color presets must clear every theme's grounds at once).
 */
export function buildMode(spec: ThemeSpec, mode: Mode, extraGrounds: RGB[] = []): Palette {
  const dark = mode === "dark";
  const high = spec.contrast === "high";
  const min = high ? 7 : 4.5;
  const text = dark ? "light" : "dark";
  const nh = spec.neutralHue ?? spec.hue;
  const ih = spec.inkHue ?? nh;
  const gcLight = Math.min(spec.tint, 1) * 0.03;
  const gc = dark ? gcLight * 1.6 : gcLight;
  const t: Palette = {};
  const G = GROUNDS[spec.contrast][mode];
  for (const [k, L] of Object.entries(G)) t[k] = clampGamut([L, k === "surface" && !dark ? gc * 0.5 : gc, nh]);
  const bg = (keys: string[]) => [...keys.map((k) => toRgb(t[k])), ...extraGrounds];

  const inkC = Math.min(0.006 + spec.tint * 0.04, 0.035);
  const inkL = high ? (dark ? 1 : 0) : dark ? 0.955 : 0.21;
  t.ink = clampGamut([inkL, dark ? inkC * 0.5 : inkC, ih]);
  t["ink-hover"] = clampGamut([dark ? inkL - 0.1 : inkL + 0.1, t.ink[1], ih]);
  t["on-ink"] = dark ? [...t.page] : [G.surface === 1 ? 1 : 0.985, gc * 0.5, nh];
  const inkAt = (c: number) => (L: number): LCH => [L, c, ih];
  t["ink-2"] = solveL(inkAt(inkC * 0.9), bg(TEXT_GROUNDS), high ? 10 : 7, text, 60);
  t["ink-3"] = solveL(inkAt(inkC * 0.8), bg(TEXT_GROUNDS), min, text, 45);
  t["ink-disabled"] = solveL(inkAt(inkC * 0.5), bg(["surface", "sunken", "page"]), high ? 4.5 : 3, text);

  if (high) {
    t.line = solveL((L) => [L, gc, nh], bg(["page", "surface"]), 3, text);
    t["line-strong"] = solveL((L) => [L, gc, nh], bg(["page", "surface", "sunken"]), 4.5, text);
    t["border-control"] = [...t.ink];
  } else {
    t.line = clampGamut([dark ? G.surface + 0.085 : G.surface - 0.1, gc * 1.5, nh]);
    t["line-strong"] = clampGamut([dark ? G.surface + 0.145 : G.surface - 0.16, gc * 1.5, nh]);
    t["border-control"] = solveL(inkAt(inkC * 0.6), bg(INDICATOR_GROUNDS), 3, text);
  }

  // Brand: a fill, its text, a soft tint, and an indicator strong enough for marks and focus.
  const h = spec.hue;
  const vib = Math.max(0, Math.min(spec.vibrancy, 1));
  if (spec.mono) {
    t.accent = [...t.ink];
    t["on-accent"] = [...t["on-ink"]];
    t["accent-soft"] = clampGamut(dark ? [0.3, 0.004, ih] : [0.94, 0.004, ih]);
  } else {
    const at = (share: number) => (L: number): LCH => [L, share * maxChroma(L, h), h];
    if (!dark) {
      // White text needs a fill dark enough to carry it. Yellows (amber to lime) turn olive
      // when darkened, so they stay bright and carry dark text instead; every other hue is a
      // deep fill with white text.
      const onLight: LCH = [0.99, 0.005, h];
      const onDark: LCH = [0.2, 0.04, h];
      const yellow = angDist(h, 97) <= 28;
      if (yellow) {
        const bright = solveL(at(vib), [toRgb(onDark)], min, "light");
        t.accent = clampGamut(at(vib)(Math.max(bright[0], high ? 0.86 : 0.8)));
        t["on-accent"] = onDark;
      } else {
        t.accent = solveL(at(vib), [toRgb(onLight)], min, "dark");
        t["on-accent"] = onLight;
      }
    } else {
      const onDark: LCH = [0.2, 0.04, h];
      const fill = solveL(at(vib * 0.9), bg(INDICATOR_GROUNDS), 3, "light");
      // Yellows go muddy below ~0.8; everything else reads well from 0.72.
      let L = Math.max(fill[0], angDist(h, 97) <= 28 ? 0.8 : 0.72);
      while (L < 0.97 && wcag(toRgb(clampGamut(at(vib * 0.9)(L))), toRgb(onDark)) < min * 1.015) L += 0.01;
      t.accent = clampGamut(at(vib * 0.9)(L));
      t["on-accent"] = onDark;
    }
    t["accent-soft"] = clampGamut(dark ? [0.3, 0.02 + 0.05 * vib, h] : [0.94, 0.012 + 0.04 * vib, h]);
  }
  const indicatorMin = high ? 4.5 : 3;
  const accentPasses = bg(INDICATOR_GROUNDS).every((g) => wcag(toRgb(t.accent), g) >= indicatorMin * 1.015);
  t["accent-strong"] = high
    ? [...t.ink]
    : accentPasses
      ? [...t.accent]
      : solveL((L) => [L, vib * maxChroma(L, h), h], bg(INDICATOR_GROUNDS), 3, text);
  const focusFromAccent = high && dark ? (accentPasses ? t.accent : t.ink) : t["accent-strong"];
  t.focus = [...(!dark && (spec.focusLight === "ink" || high) ? t.ink : focusFromAccent)];
  t.caret = [...(dark ? t["accent-strong"] : t.ink)];

  const lh = linkHue(h, spec.mono);
  t.link = solveL((L) => [L, high ? 0.2 : 0.16, lh], bg(INDICATOR_GROUNDS), min, text, 45);
  t["link-hover"] = clampGamut([t.link[0] + (dark ? 0.07 : -0.07), t.link[1], lh]);

  for (const s of STATUSES) {
    const sh = statusHue(s, h, spec.mono);
    const c = high ? 0.2 : 0.16;
    t[`${s}-soft`] = clampGamut(dark ? [0.285, 0.055, sh] : [0.95, 0.04, sh]);
    t[s] = solveL((L) => [L, c, sh], bg([...INDICATOR_GROUNDS, `${s}-soft`]), min, text, 45);
    t[`${s}-line`] = solveL((L) => [L, c, sh], bg(["page", "surface", `${s}-soft`]), 3, text);
    if (s === "warning") {
      t[`${s}-solid`] = clampGamut([dark ? 0.82 : 0.8, 0.15, sh]);
      t[`on-${s}`] = [0.2, 0.04, sh];
    } else {
      t[`on-${s}`] = [1, 0, 0];
      t[`${s}-solid`] = solveL((L) => [L, c, sh], [toRgb([1, 0, 0])], min, "dark");
    }
  }

  // Charts: six hues spaced evenly around the brand, at one vividness.
  const chartHues = spec.mono ? [256, 150, 62, 322, 196, 27] : [0, 1, 2, 3, 4, 5].map((k) => wrap(h + k * 60));
  chartHues.forEach((ch, k) => {
    const share = 0.55 + 0.35 * (spec.mono ? 0.8 : vib);
    const [L, c, hh] = solveL((L) => [L, share * maxChroma(L, ch), ch], bg(["page", "surface"]), 3, text);
    t[`chart-${k + 1}`] = clampGamut([dark ? Math.max(L, 0.72) : L, c, hh]);
    if (dark) t[`chart-${k + 1}`] = clampGamut([t[`chart-${k + 1}`][0], share * maxChroma(t[`chart-${k + 1}`][0], ch), ch]);
  });

  // Primary button: ink by default, the brand fill when the spec says so.
  if (spec.primary === "brand") {
    t["btn-primary"] = [...t.accent];
    t["btn-primary-hover"] = clampGamut([t.accent[0] + (dark ? -0.05 : -0.04), t.accent[1], t.accent[2]]);
    t["btn-primary-ledge"] = clampGamut([t.accent[0] - (dark ? 0.3 : 0.18), t.accent[1], t.accent[2]]);
    t["on-btn-primary"] = [...t["on-accent"]];
  } else {
    t["btn-primary"] = dark ? [...t.ink] : [Math.min(inkL + 0.07, 0.3), t.ink[1], ih];
    t["btn-primary-hover"] = dark ? [inkL - 0.07, t.ink[1], ih] : [Math.min(inkL + 0.13, 0.36), t.ink[1], ih];
    t["btn-primary-ledge"] = dark ? [inkL - 0.3, t.ink[1], ih] : [Math.max(inkL - 0.1, 0), t.ink[1], ih];
    t["on-btn-primary"] = [...t["on-ink"]];
  }
  return t;
}

export interface Theme {
  spec: ThemeSpec;
  light: Palette;
  dark: Palette;
}

export function buildTheme(spec: ThemeSpec, extraGrounds?: Record<Mode, RGB[]>): Theme {
  return { spec, light: buildMode(spec, "light", extraGrounds?.light), dark: buildMode(spec, "dark", extraGrounds?.dark) };
}

/* ---------------- checks ---------------- */

export interface Check {
  group: string;
  fg: string;
  bg: string;
  mode: Mode;
  ratio: number;
  target: number;
  lc: number;
  pass: boolean;
}

/** Every pairing the system promises, measured. */
export function checkTheme(theme: Theme): Check[] {
  const high = theme.spec.contrast === "high";
  const min = high ? 7 : 4.5;
  const out: Check[] = [];
  for (const mode of ["light", "dark"] as const) {
    const t = theme[mode];
    const need = (group: string, fg: string, bg: string, target: number) => {
      const a = toRgb(t[fg]), b = toRgb(t[bg]);
      const ratio = wcag(a, b);
      out.push({ group, fg, bg, mode, ratio, target, lc: apca(a, b), pass: ratio >= target });
    };
    for (const bg of TEXT_GROUNDS) {
      need("Text", "ink", bg, 7);
      need("Text", "ink-2", bg, high ? 10 : 7);
      need("Text", "ink-3", bg, min);
    }
    for (const bg of ["surface", "sunken"]) need("Text", "ink-disabled", bg, high ? 4.5 : 3);
    for (const bg of INDICATOR_GROUNDS) need("Controls", "border-control", bg, 3);
    for (const bg of ["page", "surface", "sunken"]) need("Controls", "focus", bg, 3);
    need("Controls", "caret", "surface", 3);
    for (const bg of ["page", "surface"]) need("Brand", "accent-strong", bg, 3);
    need("Brand", "on-accent", "accent", min);
    need("Brand", "on-btn-primary", "btn-primary", min);
    need("Brand", "on-btn-primary", "btn-primary-hover", min);
    for (const bg of ["page", "surface"]) need("Brand", "link", bg, min);
    for (const s of STATUSES) {
      need("Status", s, "surface", min);
      need("Status", s, `${s}-soft`, min);
      need("Status", `on-${s}`, `${s}-solid`, min);
      need("Status", `${s}-line`, "surface", 3);
    }
    for (let k = 1; k <= 6; k++) need("Charts", `chart-${k}`, "surface", 3);
  }
  return out;
}

/* ---------------- output ---------------- */

/** Token name → CSS value, both modes folded into light-dark(). */
export function themeVars(theme: Theme, { radius = theme.spec.radius !== "default" } = {}): Record<string, string> {
  const { light: L, dark: D, spec } = theme;
  const v: Record<string, string> = {};
  for (const k of Object.keys(L)) v[k] = css(L[k]) === css(D[k]) ? css(L[k]) : `light-dark(${css(L[k])}, ${css(D[k])})`;
  const ld = (a: string, b: string) => `light-dark(${a}, ${b})`;
  const ink = (m: Mode, a: number) => css([Math.min(theme[m].ink[0], 0.25), theme[m].ink[1], theme[m].ink[2]], a);
  const high = spec.contrast === "high";
  Object.assign(v, {
    "accent-halo": ld(css(L.accent, 0.38), css(D.accent, 0.32)),
    "btn-secondary-hl": ld("oklch(1 0 0 / 0.6)", "oklch(1 0 0 / 0.06)"),
    "btn-secondary-ledge": "var(--line-strong)",
    "well-shadow": ld(ink("light", 0.06), "oklch(0 0 0 / 0.28)"),
    dot: ld(css(L.ink, high ? 0.2 : 0.13), css(D.ink, high ? 0.2 : 0.09)),
    scrim: ld(ink("light", 0.42), "oklch(0.08 0.005 260 / 0.62)"),
    "e-float": `0 1px 0 ${ld(ink("light", 0.04), "oklch(1 0 0 / 0.04)")}, 0 8px 24px -6px ${ld(ink("light", 0.18), "oklch(0 0 0 / 0.6)")}, 0 2px 6px -2px ${ld(ink("light", 0.1), "oklch(0 0 0 / 0.3)")}`,
    "e-modal": `0 0 0 1px ${ld("oklch(0 0 0 / 0)", "oklch(1 0 0 / 0.06)")}, 0 24px 64px -12px ${ld(ink("light", 0.35), "oklch(0 0 0 / 0.75)")}, 0 4px 12px -4px ${ld(ink("light", 0.14), "oklch(0 0 0 / 0.4)")}`,
    stroke: high ? "1.5px" : "1px",
    "focus-width": high ? "3px" : "2px",
    pattern: "radial-gradient(var(--dot) 1px, transparent 1.2px)",
    "pattern-size": "16px 16px",
  });
  if (radius) Object.assign(v, RADII[spec.radius]);
  return v;
}

export function cssBlock(selector: string, vars: Record<string, string>, comment?: string): string {
  const body = Object.entries(vars).map(([k, val]) => `  --${k}: ${val};`).join("\n");
  return `${comment ? `/* ${comment} */\n` : ""}${selector} {\n${body}\n}\n`;
}

/* ---------------- presets ---------------- */

const base = { contrast: "standard", radius: "default", primary: "ink" } as const;

/** The curated themes: starting points in the builder, static blocks in tokens.css. */
export const PRESETS: Record<string, ThemeSpec> = {
  neutral: { ...base, label: "Neutral", hue: 78, vibrancy: 0.95, tint: 0.2, neutralHue: 95, inkHue: 260, focusLight: "ink" },
  zinc: { ...base, label: "Zinc", hue: 286, vibrancy: 0, tint: 0.07, mono: true },
  stone: { ...base, label: "Stone", hue: 55, vibrancy: 0.35, tint: 0.23, neutralHue: 70 },
  slate: { ...base, label: "Slate", hue: 259, vibrancy: 0.9, tint: 0.37, neutralHue: 250 },
  indigo: { ...base, label: "Indigo", hue: 277, vibrancy: 0.9, tint: 0.27, neutralHue: 275 },
  teal: { ...base, label: "Teal", hue: 190, vibrancy: 0.85, tint: 0.23, neutralHue: 200, inkHue: 220 },
  sand: { ...base, label: "Sand", hue: 40, vibrancy: 0.75, tint: 0.53, neutralHue: 78, inkHue: 48 },
  contrast: { ...base, label: "Contrast", contrast: "high", hue: 100, vibrancy: 1, tint: 0, focusLight: "ink" },
};

/** Primary colors: one brand hue at one vividness, over any preset (data-accent). */
export const ACCENT_HUES: Record<string, { label: string; hue: number }> = {
  blue: { label: "Blue", hue: 255 },
  indigo: { label: "Indigo", hue: 277 },
  violet: { label: "Violet", hue: 300 },
  pink: { label: "Pink", hue: 350 },
  red: { label: "Red", hue: 25 },
  orange: { label: "Orange", hue: 48 },
  amber: { label: "Amber", hue: 80 },
  green: { label: "Green", hue: 150 },
  teal: { label: "Teal", hue: 185 },
};

/** What a primary color overrides: everything that follows the brand hue. */
export const ACCENT_KEYS = [
  "accent", "on-accent", "accent-soft", "accent-strong", "focus", "caret", "link", "link-hover",
  "btn-primary", "btn-primary-hover", "btn-primary-ledge", "on-btn-primary",
  ...STATUSES.flatMap((s) => [s, `${s}-soft`, `${s}-line`, `${s}-solid`, `on-${s}`]),
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6",
];

/** The builder's default: a fresh spec to start from. */
export const DEFAULT_SPEC: ThemeSpec = { ...base, label: "Custom", hue: 262, vibrancy: 0.85, tint: 0.3, primary: "brand" };
