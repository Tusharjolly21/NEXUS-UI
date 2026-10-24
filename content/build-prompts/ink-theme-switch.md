# Ink Theme Switch

Add the "Ink Theme Switch" component from Nexus UI to my project.

A dark-mode toggle where the dark version of a settings panel pours out of the switch as a growing ink circle and drains back in when you switch off. The sun pulls in its rays and turns into a crescent moon, and only the component's own panel is themed.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { InkThemeSwitch } from "@/components/ink-theme-switch";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/ink-theme-switch/index.ts ---

```ts
export { InkThemeSwitch } from "./ink-theme-switch";
export type { InkThemeSwitchProps } from "./ink-theme-switch";
```

--- components/ink-theme-switch/ink-theme-switch.tsx ---

```tsx
"use client";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, type MotionValue } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

const W = 320;
const H = 300;
/** Toggle centre, measured from the panel's right and top edges. */
const FROM_RIGHT = 38;
const TY = 34;
/** Radius that covers the whole panel from the toggle, plus a margin. */
const MAX_R = Math.hypot(W - FROM_RIGHT, H - TY) + 20;

const RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  const p = (n: number) => Math.round(n * 1000) / 1000;
  return { x1: p(12 + Math.cos(a) * 8), y1: p(12 + Math.sin(a) * 8), x2: p(12 + Math.cos(a) * 10.5), y2: p(12 + Math.sin(a) * 10.5) };
});

const ROWS: [string, boolean][] = [
  ["Notifications", true],
  ["Auto-update", false],
  ["Share analytics", true],
];

function pour(r: MotionValue<number>, toDark: boolean) {
  return animate(r, toDark ? MAX_R : 0, {
    duration: toDark ? 0.9 : 0.7,
    ease: toDark ? [0.65, 0, 0.35, 1] : [0.5, 0, 0.75, 0],
  });
}

/** The sample settings screen, drawn in one of its two themes. It ignores the site theme on purpose. */
function Panel({ dark, hidden }: { dark: boolean; hidden: boolean }) {
  const c = dark
    ? { bg: "#111113", card: "#1c1c1e", ink: "#f5f5f7", sub: "#a1a1a6", line: "rgba(255,255,255,.08)", accent: "#0a84ff" }
    : { bg: "#f5f5f7", card: "#ffffff", ink: "#1d1d1f", sub: "#6e6e73", line: "rgba(0,0,0,.06)", accent: "#0071e3" };
  return (
    <div className="absolute inset-0 flex flex-col gap-3 p-4" style={{ background: c.bg }} aria-hidden={hidden}>
      <div className="flex h-9 items-center justify-between">
        <span className="text-[17px] font-semibold tracking-[-0.02em]" style={{ color: c.ink }}>
          Settings
        </span>
      </div>
      <div className="rounded-[16px] p-3" style={{ background: c.card }}>
        {ROWS.map(([t, on], i) => (
          <div key={t} className="flex items-center justify-between py-2" style={{ borderTop: i ? `1px solid ${c.line}` : undefined }}>
            <span className="text-[14px]" style={{ color: c.ink }}>
              {t}
            </span>
            <span
              className="flex h-[22px] w-[38px] flex-none items-center rounded-full p-[2px]"
              style={{ background: on ? "#30d158" : dark ? "#3a3a3c" : "#e5e5ea", justifyContent: on ? "flex-end" : "flex-start" }}
            >
              <span className="h-[18px] w-[18px] rounded-full bg-white shadow" />
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-[16px] p-3" style={{ background: c.card }}>
        <span className="h-10 w-10 flex-none rounded-full" style={{ background: `linear-gradient(140deg, ${c.accent}, #bf5af2)` }} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[14px] font-medium" style={{ color: c.ink }}>
            Sam Alvarez
          </span>
          <span className="truncate text-[12px]" style={{ color: c.sub }}>
            Pro plan · renews in 12 days
          </span>
        </span>
      </div>
    </div>
  );
}

export interface InkThemeSwitchProps {
  /** Start with the panel in dark mode. Only this component's own panel is themed; the page is never touched. */
  defaultDark?: boolean;
  /** Called with the new value when the user flips the switch. */
  onChange?: (dark: boolean) => void;
  /** Flips between light and dark every 2.2s until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the panel. */
  className?: string;
}

/**
 * Theme switch that floods. Toggle dark mode and the dark version of the UI
 * pours out of the switch as an ink circle, easing in and out, until it
 * covers everything; switch back and it drains into the button. The sun
 * pulls in its rays and becomes a moon on the way. It themes only its own
 * panel and never changes the site theme or the document's classes.
 */
export function InkThemeSwitch({ defaultDark = false, onChange, autoplay = false, enableSound = true, className = "" }: InkThemeSwitchProps) {
  const play = useSound(enableSound);
  const [dark, setDark] = useState(defaultDark);
  const r = useMotionValue(defaultDark ? MAX_R : 0);
  const id = useId().replace(/:/g, "");
  const clip = useMotionTemplate`circle(${r}px at calc(100% - ${FROM_RIGHT}px) ${TY}px)`;
  const touched = useRef(false);
  const anim = useRef<ReturnType<typeof animate> | undefined>(undefined);

  useEffect(() => () => anim.current?.stop(), []);

  const autoClick = useEffectEvent((to: boolean) => play.auto(to ? "on" : "off"));

  useEffect(() => {
    if (!autoplay) return;
    let on = defaultDark;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      on = !on;
      setDark(on);
      autoClick(on);
      anim.current = pour(r, on);
    }, 2200);
    return () => clearInterval(t);
  }, [autoplay, defaultDark, r]);

  const flip = () => {
    touched.current = true;
    const to = !dark;
    setDark(to);
    play(to ? "on" : "off");
    anim.current = pour(r, to);
    onChange?.(to);
  };

  return (
    <div
      className={`relative max-w-full overflow-hidden rounded-[26px] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_48px_-28px_rgba(0,0,0,.4)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_48px_-28px_rgba(0,0,0,.9)] ${className}`}
      style={{ width: W, height: H }}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <Panel dark={false} hidden={dark} />
      <motion.div className="absolute inset-0" style={{ clipPath: clip, WebkitClipPath: clip }}>
        <Panel dark hidden={!dark} />
      </motion.div>
      <motion.button
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label="Dark mode"
        onClick={flip}
        whileTap={{ scale: 0.88 }}
        className="absolute flex h-9 w-9 items-center justify-center rounded-full outline-none focus-visible:ring-2"
        style={{ right: FROM_RIGHT - 18, top: TY - 18, ["--tw-ring-color" as string]: dark ? "#0a84ff" : "#0071e3" }}
        initial={false}
        animate={{ backgroundColor: dark ? "#2c2c2e" : "#ffffff", boxShadow: dark ? "0 0 0 1px rgba(255,255,255,.12)" : "0 0 0 1px rgba(0,0,0,.08)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <mask id={`moon-${id}`}>
              <rect width="24" height="24" fill="#fff" />
              <motion.circle
                r="7"
                fill="#000"
                initial={false}
                animate={{ cx: dark ? 16 : 30, cy: dark ? 8 : -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              />
            </mask>
          </defs>
          <motion.circle
            cx="12"
            cy="12"
            fill={dark ? "#ffd60a" : "#ff9f0a"}
            mask={`url(#moon-${id})`}
            initial={false}
            animate={{ r: dark ? 8 : 5 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          />
          <motion.g
            initial={false}
            animate={{ scale: dark ? 0 : 1, rotate: dark ? -90 : 0, opacity: dark ? 0 : 1 }}
            style={{ originX: "12px", originY: "12px" }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            stroke="#ff9f0a"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {RAYS.map((l, i) => (
              <line key={i} {...l} />
            ))}
          </motion.g>
        </svg>
      </motion.button>
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```
