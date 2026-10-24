# Animated Tabs

Add the "Animated Tabs" component from Nexus UI to my project.

A settings panel with a sliding segmented control: rows slide in from the side you moved towards, the panel resizes to fit, and each row has an iOS-style switch whose knob stretches while pressed.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { Switch, AnimatedTabs } from "@/components/animated-tabs/animated-tabs";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/animated-tabs/animated-tabs.tsx ---

```tsx
"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  accent?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

/** iOS-style switch: the knob stretches while pressed and springs across. */
export function Switch({ checked, onChange, label, accent = "#34c759", enableSound = true }: SwitchProps) {
  const play = useSound(enableSound);
  const [pressed, setPressed] = useState(false);
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        play(checked ? "off" : "on");
        onChange(!checked);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className="relative flex h-[31px] w-[51px] flex-none items-center rounded-full p-[2px] transition-colors duration-200 [--sw-off:#e9e9eb] dark:[--sw-off:#39393d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
      style={{ justifyContent: checked ? "flex-end" : "flex-start", backgroundColor: checked ? accent : "var(--sw-off)" }}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 35 }}
        animate={{ width: pressed ? 34 : 27 }}
        className="h-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,.15),0_3px_1px_rgba(0,0,0,.06)]"
      />
    </motion.button>
  );
}

interface Row { label: string; hint: string; on: boolean }
const TABS: { id: string; label: string; rows: Row[] }[] = [
  { id: "general", label: "General", rows: [
    { label: "Automatic updates", hint: "Install updates overnight", on: true },
    { label: "Reduce motion", hint: "Use simpler transitions", on: false },
    { label: "Show previews", hint: "Display content in lists", on: true },
  ] },
  { id: "alerts", label: "Notifications", rows: [
    { label: "Mentions", hint: "When someone tags you", on: true },
    { label: "Weekly digest", hint: "A summary every Monday", on: false },
  ] },
  { id: "privacy", label: "Privacy", rows: [
    { label: "Share analytics", hint: "Help improve the product", on: false },
    { label: "Personalized tips", hint: "Based on how you work", on: true },
    { label: "Location access", hint: "Only while using the app", on: false },
    { label: "Read receipts", hint: "Let others see when you’ve read", on: true },
  ] },
];

export interface AnimatedTabsProps {
  accent?: string;
  /** Switches tabs by itself until the user interacts. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

export function AnimatedTabs({ accent = "#34c759", autoplay = false, enableSound = true }: AnimatedTabsProps) {
  const play = useSound(enableSound);
  const group = useId();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [values, setValues] = useState(() => TABS.map((t) => t.rows.map((r) => r.on)));
  const touched = useRef(false);
  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const go = (i: number) => {
    if (i !== index) play("tick", 0.6);
    setDir(i > index ? 1 : -1);
    setIndex(i);
  };

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      k++;
      if (k % 2 === 1) {
        const ri = k % TABS[index].rows.length;
        play.auto(valuesRef.current[index][ri] ? "off" : "on");
        setValues((v) => v.map((rows, ti) => (ti === index ? rows.map((x, ri) => (ri === k % rows.length ? !x : x)) : rows)));
      } else {
        const next = (index + 1) % TABS.length;
        play.auto("tick", 0.6);
        setDir(1);
        setIndex(next);
      }
    }, 1600);
    return () => clearInterval(t);
  }, [autoplay, index, play]);

  const tab = TABS[index];

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-4" onPointerDown={() => (touched.current = true)}>
      <div role="tablist" aria-label="Settings" className="relative grid grid-cols-3 rounded-xl bg-[#e8e8ed] p-[3px] dark:bg-[#3a3a3c]">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={i === index}
            id={`${group}-tab-${t.id}`}
            aria-controls={`${group}-panel`}
            type="button"
            onClick={() => go(i)}
            className="relative z-10 h-8 rounded-[9px] text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]"
          >
            {i === index && <motion.span layoutId={`${group}-pill`} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#636366]" />}
            {t.label}
          </button>
        ))}
      </div>
      <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }} className="relative overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_10px_30px_-18px_rgba(0,0,0,.25)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]" id={`${group}-panel`} role="tabpanel">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.ul
            key={tab.id}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 60, opacity: 0, filter: "blur(4px)" }),
              center: { x: 0, opacity: 1, filter: "blur(0px)" },
              exit: (d: number) => ({ x: d * -60, opacity: 0, filter: "blur(4px)" }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="divide-y divide-[#e8e8ed] dark:divide-[#3a3a3c]"
          >
            {tab.rows.map((r, ri) => (
              <motion.li key={r.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + ri * 0.04 }} className="flex items-center gap-4 px-[18px] py-3">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-medium tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{r.label}</span>
                  <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">{r.hint}</span>
                </span>
                <Switch
                  label={r.label}
                  accent={accent}
                  enableSound={enableSound}
                  checked={values[index][ri]}
                  onChange={(v) => setValues((all) => all.map((rows, ti) => (ti === index ? rows.map((x, xi) => (xi === ri ? v : x)) : rows)))}
                />
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </motion.div>
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

# Elastic Tabs

Add the "Elastic Tabs" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { ElasticTabs } from "@/components/animated-tabs/elastic-tabs";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/animated-tabs/elastic-tabs.tsx ---

```tsx
"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface ElasticTabItem {
  id: string;
  label: string;
  /** What the panel shows while this tab is selected. */
  content: ReactNode;
}

export interface ElasticTabsProps {
  /** The tabs. Defaults to a small analytics dashboard: Overview, Traffic, Reports and Alerts. */
  tabs?: ElasticTabItem[];
  /** Accessible name for the tab list. */
  label?: string;
  /** Called with the tab id whenever the selected tab changes. */
  onChange?: (id: string) => void;
  /** Steps through the tabs every 2.4s until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the card. */
  className?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

function Stat({ k, v, d }: { k: string; v: string; d: string }) {
  return (
    <div className="min-w-0 rounded-[16px] bg-[#f5f5f7] p-4 dark:bg-[#2c2c2e]">
      <div className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{k}</div>
      <div className="mt-1 truncate text-[24px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{v}</div>
      <div className="text-[12px] font-medium text-[#1a7f37] dark:text-[#30d158]">{d}</div>
    </div>
  );
}

const DEFAULT_TABS: ElasticTabItem[] = [
  {
    id: "overview",
    label: "Overview",
    content: (
      <div className="grid grid-cols-3 gap-2">
        <Stat k="Visitors" v="48.2k" d="+12%" />
        <Stat k="Signups" v="1,904" d="+8%" />
        <Stat k="Revenue" v="$31k" d="+21%" />
      </div>
    ),
  },
  {
    id: "traffic",
    label: "Traffic",
    content: (
      <div className="rounded-[16px] bg-[#f5f5f7] p-4 dark:bg-[#2c2c2e]">
        <div className="flex justify-between text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
          <span>Last 14 days</span>
          <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Peak 6.1k</span>
        </div>
        <svg viewBox="0 0 300 90" className="mt-2 block w-full overflow-visible" aria-hidden="true">
          <motion.path
            d="M0 70 C 20 66, 30 50, 50 54 S 80 72, 100 58 S 130 30, 150 36 S 180 60, 200 44 S 240 12, 260 22 S 290 30, 300 18"
            fill="none"
            className="stroke-[#0071e3] dark:stroke-[#0a84ff]"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: [0.3, 0, 0.2, 1] }}
          />
          <motion.circle
            cx="300"
            cy="18"
            r="4"
            className="fill-[#0071e3] dark:fill-[#0a84ff]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            transition={{ delay: 0.85, type: "spring", stiffness: 500, damping: 18 }}
          />
        </svg>
      </div>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    content: (
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {["Weekly summary.pdf", "Cohorts, October.csv", "Funnel breakdown.pdf"].map((f, i) => (
          <motion.li
            key={f}
            className="flex items-center justify-between gap-3 rounded-[14px] bg-[#f5f5f7] px-4 py-3 text-[14px] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <span className="min-w-0 truncate">{f}</span>
            <span className="flex-none text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{["2 MB", "640 kB", "1.1 MB"][i]}</span>
          </motion.li>
        ))}
      </ul>
    ),
  },
  {
    id: "alerts",
    label: "Alerts",
    content: (
      <div className="rounded-[16px] bg-[#f5f5f7] p-4 text-[14px] leading-[1.5] text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]">
        No alerts right now. We&apos;ll tell you when signups drop more than <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">20% below</span> the weekly average.
      </div>
    ),
  },
];

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

/**
 * Tabs whose pill stretches as it travels: the edge in front leaps ahead and
 * the edge behind catches up, so the highlight moves like something elastic
 * instead of sliding. The labels under the pill invert to white exactly where
 * it covers them, the panel slides in from the side you moved toward, and the
 * frame eases to the new height.
 */
export function ElasticTabs({ tabs = DEFAULT_TABS, label = "Dashboard", onChange, autoplay = false, className = "", enableSound = true }: ElasticTabsProps) {
  const play = useSound(enableSound);
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const count = tabs.length;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const L = useMotionValue(0);
  const R = useMotionValue(0);
  const clip = useMotionTemplate`inset(0 calc(100% - ${R}px) 0 ${L}px round 999px)`;
  const W = useMotionTemplate`calc(${R}px - ${L}px)`;
  const first = useRef(true);
  const touched = useRef(false);
  const index = useRef(0);
  const onChangeRef = useRef(onChange);
  const [h, setH] = useState<number | "auto">("auto");
  const active = useDemoActive(root, autoplay && !reduce);

  const edges = (k: number): readonly [number, number] | null => {
    const b = btns.current[k];
    return b ? [b.offsetLeft, b.offsetLeft + b.offsetWidth] : null;
  };

  useEffect(() => {
    index.current = i;
    onChangeRef.current = onChange;
  });

  // The pill: the leading edge springs hard, the trailing edge lags behind.
  useLayoutEffect(() => {
    const e = edges(i);
    if (!e) return;
    const [l, r] = e;
    if (first.current) {
      L.set(l);
      R.set(r);
      first.current = false;
      return;
    }
    if (reduce) {
      L.set(l);
      R.set(r);
      return;
    }
    const forward = r > R.get();
    const lead = { type: "spring" as const, stiffness: 520, damping: 34 };
    const trail = { type: "spring" as const, stiffness: 170, damping: 22 };
    const a = animate(L, l, forward ? trail : lead);
    const b = animate(R, r, forward ? lead : trail);
    return () => {
      a.stop();
      b.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, reduce]);

  // Keep the pill on its tab when the bar resizes (font load, container width).
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    let ready = false;
    const ro = new ResizeObserver(() => {
      if (!ready) {
        ready = true;
        return;
      }
      const e = edges(index.current);
      if (!e) return;
      L.set(e[0]);
      R.set(e[1]);
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The frame follows the panel's height.
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const select = (k: number) => {
    if (k === index.current || k < 0 || k >= count) return;
    setDir(k > index.current ? 1 : -1);
    setI(k);
    index.current = k;
    const t = tabs[k];
    if (t) onChangeRef.current?.(t.id);
  };

  useEffect(() => {
    if (!autoplay || reduce || !active || count < 2) return;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      play.auto("tick", 0.6);
      select((index.current + 1) % count);
    }, 2400);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, active, count]);

  const go = (k: number) => {
    touched.current = true;
    if (k !== index.current && k >= 0 && k < count) play("tick", 0.6);
    select(k);
  };
  const key = (e: KeyboardEvent) => {
    let k = -1;
    if (e.key === "ArrowRight") k = (i + 1) % count;
    else if (e.key === "ArrowLeft") k = (i - 1 + count) % count;
    else if (e.key === "Home") k = 0;
    else if (e.key === "End") k = count - 1;
    if (k < 0) return;
    e.preventDefault();
    go(k);
    btns.current[k]?.focus();
  };

  const current = tabs[i] ?? tabs[0];
  if (!current) return null;
  const panelId = `${uid}-panel`;
  const tabId = (k: number) => `${uid}-tab-${k}`;
  const labelClass = "relative h-10 flex-none rounded-full px-3 text-[13px] font-medium sm:px-5 sm:text-[14px]";

  return (
    <div
      ref={root}
      className={`w-[480px] max-w-full rounded-[28px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-5 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
      onPointerDownCapture={() => {
        touched.current = true;
      }}
      onFocusCapture={() => {
        touched.current = true;
      }}
    >
      <div ref={bar} className="relative flex w-fit max-w-full overflow-x-auto rounded-full bg-[#f5f5f7] p-1 dark:bg-[#2c2c2e]" role="tablist" aria-label={label} onKeyDown={key}>
        {tabs.map((t, k) => (
          <button
            key={t.id}
            ref={(el) => {
              btns.current[k] = el;
            }}
            id={tabId(k)}
            type="button"
            role="tab"
            aria-selected={i === k}
            aria-controls={panelId}
            tabIndex={i === k ? 0 : -1}
            onClick={() => go(k)}
            className={`${labelClass} text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7] ${FOCUS}`}
          >
            {t.label}
          </button>
        ))}
        {/* the elastic pill */}
        <motion.span className="pointer-events-none absolute bottom-1 top-1 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" style={{ left: L, width: W }} aria-hidden="true" />
        {/* the same labels inverted, clipped to the pill */}
        <motion.div className="pointer-events-none absolute inset-0 flex p-1" style={{ clipPath: clip, WebkitClipPath: clip }} aria-hidden="true">
          {tabs.map((t) => (
            <span key={t.id} className={`${labelClass} inline-flex items-center text-white dark:text-[#1d1d1f]`}>
              {t.label}
            </span>
          ))}
        </motion.div>
      </div>
      <motion.div className="relative mt-4 overflow-hidden" animate={{ height: h }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 32 }}>
        <div ref={panel} id={panelId} role="tabpanel" aria-labelledby={tabId(Math.min(i, count - 1))}>
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.div
              key={current.id}
              custom={dir}
              variants={{
                in: (d: number) => (reduce ? { opacity: 0 } : { x: d * 40, opacity: 0, filter: "blur(4px)" }),
                show: { x: 0, opacity: 1, filter: "blur(0px)" },
                out: (d: number) => (reduce ? { opacity: 0 } : { x: d * -40, opacity: 0, filter: "blur(4px)" }),
              }}
              initial="in"
              animate="show"
              exit="out"
              transition={{ type: "spring", stiffness: 340, damping: 32, filter: { duration: 0.2 }, opacity: { duration: 0.2 } }}
            >
              {current.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
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

# Document Tabs

Add the "Document Tabs" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { DocumentTabs } from "@/components/animated-tabs/document-tabs";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/animated-tabs/document-tabs.tsx ---

```tsx
"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { AnimatePresence, Reorder, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface DocumentTab {
  id: number;
  title: string;
  /** Shown in the address bar while the tab is active. */
  url: string;
  /** Colour of the tab icon and the page header. */
  color: string;
  /** One letter shown on the icon. */
  letter: string;
}

export interface DocumentTabsProps {
  /** The tabs it starts with. Closing the last one brings these back. Defaults to Roadmap, Pricing page draft and Analytics. */
  initialTabs?: DocumentTab[];
  /** Called with the tab id when the active tab changes. */
  onActiveChange?: (id: number) => void;
  /** Opens, switches, reorders and closes tabs on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the window. */
  className?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const START: DocumentTab[] = [
  { id: 1, title: "Roadmap", url: "nexus.app/roadmap", color: "#0a84ff", letter: "R" },
  { id: 2, title: "Pricing page draft", url: "nexus.app/pricing", color: "#bf5af2", letter: "P" },
  { id: 3, title: "Analytics", url: "nexus.app/analytics", color: "#30d158", letter: "A" },
];
const NEW_TABS = [
  { title: "Docs", url: "nexus.app/docs", color: "#ff9f0a", letter: "D" },
  { title: "Changelog", url: "nexus.app/changelog", color: "#ff375f", letter: "C" },
  { title: "Settings", url: "nexus.app/settings", color: "#5e5ce6", letter: "S" },
];
const MAX_TABS = 6;
const FIRST_NEW_ID = 10;
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

/**
 * A document tab strip for editors and dashboards. Drag tabs to reorder and
 * the others slide out of the way, close one and its neighbours close the
 * gap, open a new one and it grows in from the plus. The active tab joins the
 * page below it, and the address and content follow whatever you pick.
 */
export function DocumentTabs({ initialTabs = START, onActiveChange, autoplay = false, className = "", enableSound = true }: DocumentTabsProps) {
  const play = useSound(enableSound);
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const [tabs, setTabs] = useState(initialTabs);
  const [active, setActive] = useState(() => (initialTabs[1] ?? initialTabs[0])?.id ?? 0);
  const nextId = useRef(FIRST_NEW_ID);
  const touched = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const refocus = useRef<number | null>(null);
  const step = useRef(0);
  const [stripW, setStripW] = useState(420);
  const demoOn = useDemoActive(root, autoplay && !reduce);

  const tabsRef = useRef(tabs);
  const activeRef = useRef(active);
  const onActiveRef = useRef(onActiveChange);
  useEffect(() => {
    tabsRef.current = tabs;
    activeRef.current = active;
    onActiveRef.current = onActiveChange;
  });

  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStripW(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Tell the parent when the active tab changes (not on mount).
  const announced = useRef(active);
  useEffect(() => {
    if (announced.current === active) return;
    announced.current = active;
    onActiveRef.current?.(active);
  }, [active]);

  // Keep keyboard focus on a tab that was just moved with the arrow keys.
  useEffect(() => {
    const id = refocus.current;
    if (id === null) return;
    refocus.current = null;
    strip.current?.querySelector<HTMLElement>(`[data-tab="${id}"]`)?.focus();
  }, [tabs]);

  const add = () => {
    if (tabsRef.current.length >= MAX_TABS) return;
    const t = NEW_TABS[nextId.current % NEW_TABS.length];
    const tab = { ...t, id: nextId.current++ };
    setTabs((x) => (x.length >= MAX_TABS ? x : [...x, tab]));
    setActive(tab.id);
  };
  const close = (id: number) => {
    const list = tabsRef.current;
    const i = list.findIndex((t) => t.id === id);
    if (i < 0) return;
    const next = list.filter((t) => t.id !== id);
    if (!next.length) {
      setTabs(initialTabs);
      setActive((initialTabs[0] ?? { id: 0 }).id);
      return;
    }
    if (id === activeRef.current) setActive(next[Math.min(i, next.length - 1)].id);
    setTabs(next);
  };
  const move = (id: number, by: number) => {
    const list = tabsRef.current;
    const i = list.findIndex((t) => t.id === id);
    const j = i + by;
    if (i < 0 || j < 0 || j >= list.length) return;
    const a = [...list];
    [a[i], a[j]] = [a[j], a[i]];
    refocus.current = id;
    setTabs(a);
  };
  const focusTab = (id: number) => {
    if (activeRef.current !== id) play("tick", 0.6);
    setActive(id);
    strip.current?.querySelector<HTMLElement>(`[data-tab="${id}"]`)?.focus();
  };
  const onTabKey = (e: KeyboardEvent, t: DocumentTab, i: number) => {
    if (e.target !== e.currentTarget) return;
    touched.current = true;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeRef.current !== t.id) play("tick", 0.6);
      setActive(t.id);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      play("swipe", 0.4);
      close(t.id);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const by = e.key === "ArrowLeft" ? -1 : 1;
      if (e.altKey) move(t.id, by);
      else {
        const n = tabsRef.current[i + by];
        if (n) focusTab(n.id);
      }
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const n = tabsRef.current[e.key === "Home" ? 0 : tabsRef.current.length - 1];
      if (n) focusTab(n.id);
    }
  };

  // Demo: open a tab, switch, reorder, close the new one, and around again.
  useEffect(() => {
    if (!autoplay || reduce || !demoOn) return;
    const script = [
      () => {
        if (tabsRef.current.length < MAX_TABS) play.auto("pop", 0.6);
        add();
      },
      () => {
        const second = tabsRef.current[1];
        if (second) {
          if (activeRef.current !== second.id) play.auto("tick", 0.6);
          setActive(second.id);
        }
      },
      () => {
        if (tabsRef.current.length >= 2) play.auto("drop", 0.5);
        setTabs((x) => {
          if (x.length < 2) return x;
          const a = [...x];
          [a[0], a[1]] = [a[1], a[0]];
          return a;
        });
      },
      () => {
        const x = tabsRef.current;
        const last = x[x.length - 1];
        if (last && last.id >= FIRST_NEW_ID) {
          play.auto("swipe", 0.4);
          close(last.id);
        }
      },
    ];
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      script[step.current++ % script.length]();
    }, 1600);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, demoOn, play]);

  const cur = tabs.find((t) => t.id === active) ?? tabs[0];
  // The active tab keeps room for its title; the rest share what's left and drop to just an icon when tight.
  const room = stripW - 52;
  const even = room / Math.max(1, tabs.length);
  const activeW = Math.min(190, Math.max(Math.min(150, room * 0.45), even));
  const otherW = tabs.length > 1 ? Math.max(32, Math.min(190, (room - activeW) / (tabs.length - 1))) : activeW;
  const hintId = `${uid}-hint`;

  return (
    <div
      ref={root}
      className={`w-[600px] max-w-full overflow-hidden rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.07),0_30px_60px_-32px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_30px_60px_-32px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <span id={hintId} className="sr-only">
        Arrow keys switch tabs. Alt with an arrow key moves the tab. Delete closes it.
      </span>
      <div ref={strip} className="flex items-end bg-[#e9e9ee] px-2 pt-2 dark:bg-black">
        <Reorder.Group as="div" axis="x" values={tabs} onReorder={setTabs} className="flex min-w-0 items-end overflow-x-clip" role="tablist" aria-label="Open documents" aria-describedby={hintId}>
          <AnimatePresence initial={false}>
            {tabs.map((t, i) => {
              const on = t.id === (cur?.id ?? -1);
              const nextOn = tabs[i + 1]?.id === cur?.id;
              const showTitle = on || otherW >= 96;
              return (
                <Reorder.Item
                  key={t.id}
                  value={t}
                  as="div"
                  id={`${uid}-tab-${t.id}`}
                  data-tab={t.id}
                  role="tab"
                  aria-selected={on}
                  aria-controls={`${uid}-page`}
                  aria-keyshortcuts="Delete"
                  tabIndex={on ? 0 : -1}
                  onKeyDown={(e) => onTabKey(e, t, i)}
                  onPointerDown={() => {
                    if (!on) play("tick", 0.6);
                    setActive(t.id);
                  }}
                  onDragEnd={() => play("drop", 0.5)}
                  className="group relative flex h-10 flex-none cursor-default select-none items-center outline-none focus-visible:z-20 [&:focus-visible>span:first-child]:outline-2 [&:focus-visible>span:first-child]:-outline-offset-2 [&:focus-visible>span:first-child]:outline-[#0071e3] dark:[&:focus-visible>span:first-child]:outline-[#0a84ff]"
                  style={{ zIndex: on ? 10 : 1 }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: on ? activeW : otherW, opacity: 1 }}
                  exit={{ width: 0, opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                  transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 420, damping: 36 }}
                  whileDrag={{ scale: 1.03, boxShadow: "0 8px 20px -8px rgba(0,0,0,.3)", borderRadius: 12 }}
                >
                  {/* tab surface; the active one flows into the toolbar with little curved feet */}
                  <span className={`absolute inset-0 rounded-t-[12px] transition-colors ${on ? "bg-white dark:bg-[#1c1c1e]" : "group-hover:bg-white/50 dark:group-hover:bg-white/10"}`} />
                  {on && (
                    <>
                      <svg className="absolute -left-[10px] bottom-0" width="10" height="10" aria-hidden="true">
                        <path d="M10 0v10H0a10 10 0 0010-10z" className="fill-white dark:fill-[#1c1c1e]" />
                      </svg>
                      <svg className="absolute -right-[10px] bottom-0" width="10" height="10" aria-hidden="true">
                        <path d="M0 0v10h10A10 10 0 010 0z" className="fill-white dark:fill-[#1c1c1e]" />
                      </svg>
                    </>
                  )}
                  {!on && !nextOn && i < tabs.length - 1 && <span className="absolute right-0 top-1/2 h-4 w-px -translate-y-1/2 bg-[#c7c7cc] dark:bg-[#48484a]" />}
                  <span className={`relative flex min-w-0 flex-1 items-center gap-2 pr-1.5 ${showTitle ? "pl-3" : "justify-center pl-1.5"}`} title={t.title}>
                    <span className="flex h-4 w-4 flex-none items-center justify-center rounded-[4px] text-[10px] font-bold text-white" style={{ background: t.color }} aria-hidden="true">
                      {t.letter}
                    </span>
                    {showTitle ? <span className={`truncate text-[13px] ${on ? "font-medium text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}>{t.title}</span> : <span className="sr-only">{t.title}</span>}
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={`Close ${t.title}`}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        touched.current = true;
                        play("swipe", 0.4);
                        close(t.id);
                      }}
                      className={`ml-auto h-5 w-5 flex-none items-center justify-center rounded-full text-[#6e6e73] hover:bg-black/10 dark:text-[#a1a1a6] dark:hover:bg-white/15 ${on ? "flex opacity-100" : otherW >= 96 ? "flex opacity-0 group-hover:opacity-100" : "hidden"}`}
                    >
                      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true">
                        <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </span>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
        <motion.button
          type="button"
          layout={!reduce}
          whileTap={reduce ? undefined : { scale: 0.9 }}
          onClick={() => {
            touched.current = true;
            play("pop", 0.6);
            add();
          }}
          disabled={tabs.length >= MAX_TABS}
          aria-label="New tab"
          className={`mb-1.5 ml-2 flex h-7 w-7 flex-none items-center justify-center rounded-full text-[#1d1d1f] hover:bg-black/5 disabled:opacity-30 dark:text-[#f5f5f7] dark:hover:bg-white/10 ${FOCUS}`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>
      {/* toolbar and page */}
      <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2 dark:border-white/10">
        <div className="flex h-8 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-full bg-[#f5f5f7] px-3.5 text-[13px] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" strokeWidth="2.6" className="flex-none stroke-[#6e6e73] dark:stroke-[#a1a1a6]" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" />
          </svg>
          <span className="relative h-[18px] min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={cur?.url} className="block truncate leading-[18px]" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.2 }}>
                {cur?.url}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      </div>
      <div id={`${uid}-page`} role="tabpanel" aria-labelledby={cur ? `${uid}-tab-${cur.id}` : undefined} className="relative h-[220px] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {cur && (
            <motion.div key={cur.id} className="absolute inset-0 p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[12px] text-[16px] font-bold text-white" style={{ background: cur.color }} aria-hidden="true">
                  {cur.letter}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{cur.title}</div>
                  <div className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">Edited 4 minutes ago</div>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-2.5">
                {[92, 78, 85, 60].map((w, k) => (
                  <motion.span
                    key={k}
                    className={`h-3 rounded-full ${k === 0 ? "" : "bg-[#f0f0f3] dark:bg-[#2c2c2e]"}`}
                    style={{ width: `${w}%`, ...(k === 0 ? { background: `${cur.color}33` } : {}) }}
                    initial={{ scaleX: 0.6, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.05 * k, duration: 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
