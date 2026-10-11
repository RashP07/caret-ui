import { useSyncExternalStore } from "react";

/*
 * Sound feedback. Off by default, behind one flag: `setSoundEnabled(true)` (persisted per browser).
 * While it's off, `playSound` returns at once and no AudioContext is ever created, so the
 * feature costs nothing for anyone who hasn't opted in.
 *
 * Like motion, a sound only answers something the person did: a press, a flip, a pick, a copy.
 * Never on hover, never on focus, never for a change the app made by itself, never on key repeat.
 * Every sound is synthesized (no files): a few milliseconds of sine, triangle or filtered noise
 * under a fast envelope, quiet enough to sit under music. Sounds are named by role, like tokens.
 */

export const SOUNDS = ["press", "on", "off", "check", "uncheck", "select", "tick", "open", "close", "copy", "send", "success", "warning", "danger"] as const;
export type SoundName = (typeof SOUNDS)[number];

export const SOUND_INFO: Record<SoundName, { label: string; use: string }> = {
  press: { label: "Press", use: "Button, IconButton, LinkButton: the key going down" },
  on: { label: "On", use: "Switch and Toggle turning on" },
  off: { label: "Off", use: "Switch and Toggle turning off" },
  check: { label: "Check", use: "Checkbox ticked" },
  uncheck: { label: "Uncheck", use: "Checkbox cleared" },
  select: { label: "Select", use: "Tabs, Seg, Radio: a new pick" },
  tick: { label: "Tick", use: "Slider and NumberField: each step" },
  open: { label: "Open", use: "Menus, selects, popovers, dialogs, drawers, accordions opened by you" },
  close: { label: "Close", use: "The same, closed by you (Escape, outside click, close button)" },
  copy: { label: "Copy", use: "Anything copied to the clipboard" },
  send: { label: "Send", use: "Composer: a message sent" },
  success: { label: "Success", use: "toast tone success" },
  warning: { label: "Warning", use: "toast tone warning" },
  danger: { label: "Danger", use: "toast tone danger, a failed copy" },
};

/* ---------- the flag ---------- */

const ENABLED_KEY = "caret:sound";
const VOLUME_KEY = "caret:sound-volume";

function read(key: string) {
  try {
    return typeof localStorage === "undefined" ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked: the setting lasts for this page only */
  }
}

let enabled = read(ENABLED_KEY) === "on";
let volume = Math.min(1, Math.max(0, Number(read(VOLUME_KEY) ?? 0.6) || 0));
let version = 0;
const listeners = new Set<() => void>();
const emit = () => {
  version++;
  listeners.forEach((l) => l());
};

export function getSoundEnabled() {
  return enabled;
}

/** The flag. Persisted per browser; off until someone turns it on. */
export function setSoundEnabled(on: boolean) {
  enabled = on;
  write(ENABLED_KEY, on ? "on" : "off");
  emit();
}

export function getSoundVolume() {
  return volume;
}

/** 0–1, on top of each sound's own (already quiet) level. */
export function setSoundVolume(v: number) {
  volume = Math.min(1, Math.max(0, v));
  write(VOLUME_KEY, String(volume));
  if (master && ctx) master.gain.setValueAtTime(volume, ctx.currentTime);
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

/** `{ enabled, volume }`, re-rendering when either changes. */
export function useSound() {
  useSyncExternalStore(subscribe, () => version, () => 0);
  return { enabled, volume };
}

/* ---------- the engine ---------- */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
const lastPlayed = new Map<SoundName, number>();

function engine() {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = volume;
  // Each voice is set quiet relative to the others; this makeup gain brings the set to a level that
  // reads on laptop speakers at the default volume, with a compressor so a pile-up never clips.
  const makeup = ctx.createGain();
  makeup.gain.value = 3;
  const limit = ctx.createDynamicsCompressor();
  limit.threshold.value = -12;
  limit.ratio.value = 12;
  master.connect(makeup).connect(limit).connect(ctx.destination);
  // 50ms of white noise, reused for every click.
  noise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.05), ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

/** A pitched blip: attack 2ms, exponential decay. `to` glides the pitch. */
function tone(c: AudioContext, at: number, { freq, to, dur, gain, type = "sine" }: { freq: number; to?: number; dur: number; gain: number; type?: OscillatorType }) {
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, at + dur);
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.002);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(env).connect(master!);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

/** A click: a few ms of band-passed noise, the sound of a key landing. */
function click(c: AudioContext, at: number, { freq, dur, gain }: { freq: number; dur: number; gain: number }) {
  const src = c.createBufferSource();
  src.buffer = noise;
  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = freq;
  band.Q.value = 1.4;
  const env = c.createGain();
  env.gain.setValueAtTime(gain, at);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(band).connect(env).connect(master!);
  src.start(at);
  src.stop(at + dur + 0.01);
}

const VOICES: Record<SoundName, (c: AudioContext, t: number) => void> = {
  press: (c, t) => click(c, t, { freq: 2400, dur: 0.012, gain: 0.22 }),
  on: (c, t) => {
    click(c, t, { freq: 3000, dur: 0.01, gain: 0.12 });
    tone(c, t, { freq: 880, to: 1320, dur: 0.05, gain: 0.05 });
  },
  off: (c, t) => {
    click(c, t, { freq: 2000, dur: 0.01, gain: 0.12 });
    tone(c, t, { freq: 990, to: 660, dur: 0.05, gain: 0.045 });
  },
  check: (c, t) => tone(c, t, { freq: 1568, dur: 0.045, gain: 0.045, type: "triangle" }),
  uncheck: (c, t) => tone(c, t, { freq: 1175, dur: 0.035, gain: 0.035, type: "triangle" }),
  select: (c, t) => {
    click(c, t, { freq: 3200, dur: 0.008, gain: 0.08 });
    tone(c, t, { freq: 1320, dur: 0.03, gain: 0.03 });
  },
  tick: (c, t) => click(c, t, { freq: 4200, dur: 0.006, gain: 0.1 }),
  open: (c, t) => {
    click(c, t, { freq: 1800, dur: 0.01, gain: 0.08 });
    tone(c, t, { freq: 520, to: 780, dur: 0.06, gain: 0.04 });
  },
  close: (c, t) => {
    click(c, t, { freq: 1500, dur: 0.01, gain: 0.07 });
    tone(c, t, { freq: 700, to: 470, dur: 0.05, gain: 0.035 });
  },
  copy: (c, t) => {
    tone(c, t, { freq: 1320, dur: 0.04, gain: 0.04 });
    tone(c, t + 0.05, { freq: 1760, dur: 0.06, gain: 0.04 });
  },
  send: (c, t) => tone(c, t, { freq: 660, to: 1320, dur: 0.09, gain: 0.05 }),
  success: (c, t) => {
    tone(c, t, { freq: 1047, dur: 0.08, gain: 0.045 });
    tone(c, t + 0.07, { freq: 1568, dur: 0.14, gain: 0.045 });
  },
  warning: (c, t) => {
    tone(c, t, { freq: 880, dur: 0.09, gain: 0.045, type: "triangle" });
    tone(c, t + 0.11, { freq: 880, dur: 0.09, gain: 0.04, type: "triangle" });
  },
  danger: (c, t) => {
    tone(c, t, { freq: 523, dur: 0.1, gain: 0.06, type: "triangle" });
    tone(c, t + 0.08, { freq: 392, dur: 0.16, gain: 0.06, type: "triangle" });
  },
};

/** Opens and closes the person caused. Hover, focus and programmatic changes stay silent, and a pick
 *  that closes a popup (item-press) already played its own sound. */
const SILENT_REASONS = new Set(["trigger-hover", "trigger-focus", "focus-out", "item-press", "imperative-action", "none", "list-navigation", "cancel-open"]);

/** For Base UI `onOpenChange(open, details)`: plays `open` / `close` when the person did it. */
export function playOpenSound(open: boolean, details?: { reason?: string }) {
  if (details?.reason && SILENT_REASONS.has(details.reason)) return;
  playSound(open ? "open" : "close");
}

/**
 * Play a sound if the flag is on. Call it from the handler of something the person did, so the
 * browser lets audio start. The same sound twice within 40ms plays once (a group firing per item).
 * `force` plays even with the flag off: for a preview the person asked to hear.
 */
export function playSound(name: SoundName, { force = false }: { force?: boolean } = {}) {
  if ((!enabled && !force) || typeof window === "undefined" || document.hidden) return;
  const c = engine();
  if (!c || !master) return;
  const now = performance.now();
  if (now - (lastPlayed.get(name) ?? -Infinity) < 40) return;
  lastPlayed.set(name, now);
  // Schedule against the clock as it is once the context runs. A suspended context (the first
  // gesture, a tab that idled, Safari's "interrupted") has a frozen currentTime: scheduling on it
  // and resuming later puts the whole envelope in the past, and the sound plays silent.
  if (c.state === "running") VOICES[name](c, c.currentTime + 0.005);
  else void c.resume().then(() => VOICES[name](c, c.currentTime + 0.005), () => {});
}

// Another tab flipped the flag or the volume: follow it here too.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === ENABLED_KEY) enabled = e.newValue === "on";
    else if (e.key === VOLUME_KEY) volume = Math.min(1, Math.max(0, Number(e.newValue ?? 0.6) || 0));
    else return;
    if (master && ctx) master.gain.setValueAtTime(volume, ctx.currentTime);
    emit();
  });
}
