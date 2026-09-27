// Writes src/styles/tokens.css from the palette engine (src/lib/palette.ts): every preset
// theme, both modes, and the primary-color overrides. Run: npm run tokens.
// Exits non-zero if any promised pairing fails.
import { readFileSync, writeFileSync } from "node:fs";
import {
  ACCENT_HUES,
  ACCENT_KEYS,
  PRESETS,
  buildTheme,
  checkTheme,
  css,
  cssBlock,
  themeVars,
  toRgb,
} from "../../src/lib/palette.ts";

let failures = 0;
const report = (label, checks) => {
  const bad = checks.filter((c) => !c.pass);
  failures += bad.length;
  const worst = checks.reduce((a, c) => (c.ratio / c.target < a.ratio / a.target ? c : a));
  console.log(
    `${label.padEnd(22)} ${bad.length ? `FAIL ${bad.length}` : "all pass"}  (tightest: ${worst.fg} / ${worst.bg} ${worst.mode} ${worst.ratio.toFixed(2)} ≥ ${worst.target})`,
  );
  for (const b of bad) console.log(`   ✗ ${b.mode} ${b.fg} / ${b.bg} ${b.ratio.toFixed(2)} < ${b.target}`);
};

/* ---------- presets ---------- */
const themes = {};
const blocks = [];
for (const [name, spec] of Object.entries(PRESETS)) {
  const theme = buildTheme(spec);
  themes[name] = theme;
  report(name, checkTheme(theme));
  const sel = name === "neutral" ? `:root,\n[data-theme="neutral"]` : `[data-theme="${name}"]`;
  blocks.push(`/* ---------- ${spec.label} ---------- */\n${cssBlock(sel, themeVars(theme, { radius: false }))}`);
}

/* ---------- primary colors ---------- */
// Solved against every preset's grounds at once (Contrast keeps its own colors), then checked
// merged over each preset, exactly as the page renders them.
const hosts = Object.keys(PRESETS).filter((n) => n !== "contrast");
const grounds = (mode) => hosts.flatMap((n) => ["page", "surface", "sunken", "hover"].map((k) => toRgb(themes[n][mode][k])));
const accentBlocks = [];
for (const [name, { label, hue }] of Object.entries(ACCENT_HUES)) {
  const spec = { label, hue, vibrancy: 0.9, tint: 0.3, contrast: "standard", radius: "default", primary: "brand" };
  const accent = buildTheme(spec, { light: grounds("light"), dark: grounds("dark") });
  const merged = hosts.flatMap((n) => {
    const pick = (m) => Object.fromEntries(ACCENT_KEYS.map((k) => [k, accent[m][k]]));
    const caret = (m) => (m === "dark" ? accent.dark["accent-strong"] : themes[n].light.ink);
    return checkTheme({
      spec: PRESETS[n],
      light: { ...themes[n].light, ...pick("light"), caret: caret("light") },
      dark: { ...themes[n].dark, ...pick("dark"), caret: caret("dark") },
    });
  });
  report(`primary ${name}`, merged);
  const all = themeVars(accent, { radius: false });
  const vars = Object.fromEntries(ACCENT_KEYS.filter((k) => k !== "caret").map((k) => [k, all[k]]));
  vars["accent-halo"] = all["accent-halo"];
  // Light caret stays the host theme's ink; dark follows the brand.
  vars.caret = `light-dark(var(--ink), ${css(accent.dark["accent-strong"])})`;
  // The element carrying data-accent, and themed scopes beneath it that don't set their own.
  const sel = [
    `[data-accent="${name}"]:is(:root, [data-theme]):not([data-theme="contrast"], [data-theme="custom"])`,
    `[data-accent="${name}"] [data-theme]:not([data-accent], [data-theme="contrast"], [data-theme="custom"])`,
  ].join(",\n");
  accentBlocks.push(`/* ---------- Primary: ${label} ---------- */\n${cssBlock(sel, vars)}`);
}

console.log(`\nfailures: ${failures}`);

const TOKENS = new URL("../../src/styles/tokens.css", import.meta.url);
const current = readFileSync(TOKENS, "utf8");
const head = current.slice(0, current.indexOf("/* ---------- Neutral ----------"));
writeFileSync(
  TOKENS,
  head +
    blocks.join("\n") +
    "\n/* =========================================================\n" +
    "   Primary colors: data-accent on any element replaces the brand-colored\n" +
    "   tokens beneath it (not in Contrast or a custom theme). data-accent=\"default\"\n" +
    "   keeps the theme's own.\n" +
    "   ========================================================= */\n\n" +
    accentBlocks.join("\n"),
);
console.log("wrote src/styles/tokens.css");
if (failures) process.exit(1);
