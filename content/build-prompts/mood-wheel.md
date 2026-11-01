# Mood Wheel

Add the "Mood Wheel" component from Nexus UI to my project.

Feelings laid along the rim of a wheel that you drag, scroll or arrow through. The word at the centre gets bracketed, fills the sentence below and the orb beside it melts into that mood's colours.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { MoodWheel, DEFAULT_MOODS } from "@/components/mood-wheel";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/mood-wheel/index.ts ---

```ts
export { MoodWheel, DEFAULT_MOODS } from "./mood-wheel";
export type { MoodWheelProps, Mood } from "./mood-wheel";
```

--- components/mood-wheel/mood-wheel.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface Mood {
  /** The word on the wheel. */
  word: string;
  /** Main orb colour. */
  a: string;
  /** Light orb colour, used near the highlight. */
  b: string;
}

export interface MoodWheelProps {
  /** Words on the wheel, top to bottom, each with its two orb colours. */
  moods?: Mood[];
  /** Spins to a random mood every 2 s until someone drags, scrolls or uses the keys. */
  autoplay?: boolean;
  /** Size of the wheel the words sit on, in px. Smaller curves the words more tightly, larger lays them out flatter. */
  radius?: number;
  /** Gap between neighbouring words around the wheel, in radians. Larger spreads the words further apart. */
  spacing?: number;
  /** Width and height of the colour orb, in px. */
  orbSize?: number;
  /** How far the wheel keeps rolling after you let go, 1 is the default. Higher glides further, lower stops sooner. */
  glide?: number;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

export const DEFAULT_MOODS: Mood[] = [
  { word: "Calm", a: "#8ec5ff", b: "#d7f0ff" },
  { word: "Curious", a: "#7ee0c3", b: "#e3fff4" },
  { word: "Hopeful", a: "#ffd36e", b: "#fff4d1" },
  { word: "Playful", a: "#ff9fd0", b: "#ffe6f3" },
  { word: "Proud", a: "#ffb057", b: "#ffeacc" },
  { word: "Restless", a: "#ff7a6b", b: "#ffe0db" },
  { word: "Tired", a: "#a7a3d9", b: "#ebe9ff" },
  { word: "Tender", a: "#f6a6b2", b: "#ffe9ec" },
  { word: "Focused", a: "#5aa7ff", b: "#dceeff" },
  { word: "Grateful", a: "#9fd36b", b: "#eefcd9" },
];

const STEP = 0.32; // radians between words
const R = 220;
const ORB = 150;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function Word({ i, pos, text, step, r }: { i: number; pos: MotionValue<number>; text: string; step: number; r: number }) {
  const a = useTransform(pos, (p) => (i - p) * step);
  const x = useTransform(a, (v) => Math.cos(v) * r - r);
  const y = useTransform(a, (v) => Math.sin(v) * r);
  const rotate = useTransform(a, (v) => (v * 180) / Math.PI);
  const opacity = useTransform(a, (v) => Math.max(0, 1 - Math.abs(v) / 1.25));
  const scale = useTransform(a, (v) => 1 + Math.max(0, 0.45 - Math.abs(v) * 1.2));
  return (
    <motion.span
      aria-hidden="true"
      className="absolute left-[68px] top-1/2 -mt-[14px] origin-left whitespace-nowrap text-[20px] font-medium tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]"
      style={{ x, y, rotate, opacity, scale }}
    >
      {text}
    </motion.span>
  );
}

/**
 * Feelings laid along the rim of a wheel. Drag or scroll it and the words roll
 * past; the one at the centre gets bracketed, fills the sentence, and the orb
 * beside it melts into that mood's colours.
 */
export function MoodWheel({ moods = DEFAULT_MOODS, autoplay = false, radius = R, spacing = STEP, orbSize = ORB, glide = 1, enableSound = true }: MoodWheelProps) {
  const reduce = useReducedMotion();
  const wheelR = clamp(radius, 100, 360);
  const wheelStep = clamp(spacing, 0.2, 0.6);
  const orb = clamp(orbSize, 60, 200);
  const roll = clamp(glide, 0.25, 4);
  const play = useSound(enableSound);
  const pos = useMotionValue(2);
  const [idx, setIdx] = useState(2);
  const drag = useRef<{ y: number; p: number; v: number; ly: number; lt: number } | null>(null);
  const touched = useRef(false);
  const wheelT = useRef<number | undefined>(undefined);
  const last = moods.length - 1;
  const lastWord = useRef(2);
  const lastTick = useRef(0);

  useMotionValueEvent(pos, "change", (p) => {
    const n = Math.max(0, Math.min(last, Math.round(p)));
    setIdx(n);
    // One quiet tick each time a new word reaches the centre, for the visitor's hand and for the autoplay spin alike.
    if (n === lastWord.current) return;
    lastWord.current = n;
    const now = performance.now();
    if (now - lastTick.current > 40) {
      if (touched.current) {
        lastTick.current = now;
        play("tick", 0.5);
      } else if (autoplay) {
        lastTick.current = now;
        play.auto("tick", 0.5);
      }
    }
  });

  const settle = (velocity = 0) =>
    animate(pos, [pos.get()], {
      type: "inertia",
      velocity,
      power: 0.4,
      timeConstant: 260 * roll,
      modifyTarget: (t) => Math.max(0, Math.min(last, Math.round(t))),
      min: 0,
      max: last,
      bounceStiffness: 300,
      bounceDamping: 30,
    });
  const go = (i: number) => animate(pos, i, { type: "spring", stiffness: 140, damping: 20 });

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) return;
      animate(pos, Math.floor(Math.random() * moods.length), { type: "spring", stiffness: 140, damping: 20 });
    }, 2000);
    return () => clearInterval(t);
  }, [autoplay, pos, moods.length]);

  useEffect(() => () => window.clearTimeout(wheelT.current), []);

  const m = moods[Math.min(idx, last)] ?? moods[0];
  if (!m) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative h-[280px] w-[420px] max-w-full cursor-grab touch-none select-none overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 active:cursor-grabbing dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
        role="slider"
        tabIndex={0}
        aria-label="Mood"
        aria-orientation="vertical"
        aria-valuetext={m.word}
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={idx}
        onKeyDown={(e) => {
          let next: number | null = null;
          if (e.key === "ArrowDown" || e.key === "ArrowRight") next = Math.min(last, idx + 1);
          if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = Math.max(0, idx - 1);
          if (e.key === "Home") next = 0;
          if (e.key === "End") next = last;
          if (next === null) return;
          e.preventDefault();
          touched.current = true;
          go(next);
        }}
        onWheel={(e) => {
          touched.current = true;
          pos.set(Math.max(-0.4, Math.min(moods.length - 0.6, pos.get() + e.deltaY * 0.004)));
          window.clearTimeout(wheelT.current);
          wheelT.current = window.setTimeout(() => settle(0), 120);
        }}
        onPointerDown={(e) => {
          touched.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { y: e.clientY, p: pos.get(), v: 0, ly: e.clientY, lt: performance.now() };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const now = performance.now();
          d.v = (d.ly - e.clientY) / 40 / Math.max(0.008, (now - d.lt) / 1000);
          d.ly = e.clientY;
          d.lt = now;
          pos.set(d.p + (d.y - e.clientY) / 40);
        }}
        onPointerUp={() => {
          if (drag.current) {
            settle(drag.current.v);
            drag.current = null;
          }
        }}
        onPointerCancel={() => {
          if (drag.current) {
            settle(0);
            drag.current = null;
          }
        }}
      >
        {/* orb */}
        <motion.div
          className="absolute right-8 top-1/2 rounded-full"
          style={{ width: orb, height: orb, marginTop: -orb / 2 }}
          initial={false}
          animate={{
            background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${m.b} 30%, ${m.a} 72%, ${m.a} 100%)`,
            boxShadow: `0 30px 60px -20px ${m.a}`,
          }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          className="absolute right-8 top-1/2 rounded-full mix-blend-overlay"
          animate={reduce ? { rotate: 0 } : { rotate: 360 }}
          transition={reduce ? { duration: 0 } : { duration: 14, repeat: Infinity, ease: "linear" }}
          style={{ width: orb, height: orb, marginTop: -orb / 2, background: "conic-gradient(from 0deg, rgba(255,255,255,.5), rgba(255,255,255,0) 40%, rgba(255,255,255,.4) 70%, rgba(255,255,255,0))" }}
        />
        {/* wheel */}
        {moods.map((md, i) => (
          <Word key={`${md.word}-${wheelR}-${wheelStep}`} i={i} pos={pos} text={md.word} step={wheelStep} r={wheelR} />
        ))}
        {/* brackets around the centre slot */}
        <span className="pointer-events-none absolute left-[50px] top-1/2 -mt-[22px] h-[44px] w-[8px] rounded-l-md border-y-2 border-l-2 border-[#1d1d1f] dark:border-[#f5f5f7]" aria-hidden="true" />
        <span className="pointer-events-none absolute left-[196px] top-1/2 -mt-[22px] h-[44px] w-[8px] rounded-r-md border-y-2 border-r-2 border-[#1d1d1f] dark:border-[#f5f5f7]" aria-hidden="true" />
      </div>
      <p className="m-0 flex items-baseline gap-1.5 text-[17px] text-[#6e6e73] dark:text-[#a1a1a6]" aria-live="polite">
        Today I feel
        <span className="relative inline-flex h-6 overflow-hidden font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={m.word}
              initial={{ y: 22, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -22, opacity: 0, filter: "blur(4px)" }}
            >
              {m.word.toLowerCase()}.
            </motion.span>
          </AnimatePresence>
        </span>
      </p>
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
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
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
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
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
