# Mood Wheel

Add the "Mood Wheel" component from Nexus UI to my project.

Feelings laid along the rim of a wheel that you drag, scroll or arrow through. The word at the centre gets bracketed, fills the sentence below and the orb beside it melts into that mood's colours. Also includes Mood Orb, a mood check-in with a ball of liquid chrome beside an arc of feelings: scroll to change the mood, or throw the ball across.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { DEFAULT_MOODS, MoodWheel } from "@/components/mood-wheel/mood-wheel";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

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
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

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
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```

# Mood Orb

Add the "Mood Orb" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { MoodOrb } from "@/components/mood-wheel/mood-orb";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/mood-wheel/mood-orb.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/purity, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type Mood = {
  name: string;
  tint: string;
  warp: number;
  speed: number;
  freq: number;
};
export type MoodOrbProps = {
  question?: string;
  moods?: Mood[];
  defaultMood?: number;
  onLog?: (mood: Mood) => void;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

// each mood has a colour it casts on the chrome, how churned the surface is, how fast it flows and how fine its folds are
const DEFAULT_MOODS: Mood[] = [
  { name: "Joyful", tint: "#ffb347", warp: 0.55, speed: 1.1, freq: 1.5 },
  { name: "Grateful", tint: "#f4a6a0", warp: 0.4, speed: 0.6, freq: 1.3 },
  { name: "Proud", tint: "#e8c15a", warp: 0.5, speed: 0.8, freq: 1.7 },
  { name: "Trusting", tint: "#8fb8ff", warp: 0.3, speed: 0.45, freq: 1.2 },
  { name: "Peaceful", tint: "#7fd4c8", warp: 0.18, speed: 0.28, freq: 1.0 },
  { name: "Disappointed", tint: "#7c8aa5", warp: 0.35, speed: 0.3, freq: 2.1 },
  { name: "Disapproving", tint: "#5c6b8a", warp: 0.6, speed: 0.5, freq: 2.4 },
  { name: "Frustrated", tint: "#ff6b4a", warp: 0.95, speed: 1.4, freq: 2.2 },
  { name: "Anxious", tint: "#a78bfa", warp: 1.1, speed: 1.8, freq: 2.8 },
  { name: "Startled", tint: "#e6f0ff", warp: 0.85, speed: 2.2, freq: 3.2 },
];

const VS = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";
// a ball of liquid chrome: the sphere's normal is folded by a few rounds of domain warping, then it reflects a studio
// with a dark floor, a bright sky and soft bands in the mood's colour
const FS = `precision highp float;
uniform vec2 uRes; uniform float uDpr; uniform float uTime; uniform vec2 uC; uniform float uR; uniform vec2 uSq;
uniform vec3 uTint; uniform float uWarp; uniform float uFreq; uniform float uPulse;
vec3 env(vec3 d){
  // screen y points down, so turn it over: a dark floor below, a pale sky above, two black flags in the studio,
  // a thin warm glow at the horizon and a cool one behind
  vec3 r = vec3(d.x, -d.y, d.z);
  vec3 sky = mix(vec3(0.74, 0.79, 0.88), uTint, 0.14);
  vec3 c = mix(vec3(0.03, 0.035, 0.045), sky, smoothstep(-0.8, -0.2, r.y));
  c = mix(c, vec3(0.93, 0.95, 0.98), smoothstep(0.2, 0.9, r.y) * 0.7);
  c *= 1.0 - 0.88 * smoothstep(0.2, 0.03, abs(r.x + 0.36 + 0.25 * r.y));
  c *= 1.0 - 0.75 * smoothstep(0.14, 0.0, abs(r.x - 0.52 - 0.15 * r.y));
  c += vec3(0.95, 0.6, 0.3) * exp(-pow((r.y + 0.5) / 0.08, 2.0)) * 0.4;
  c += vec3(0.35, 0.45, 0.7) * smoothstep(0.2, 0.9, r.x * 0.5 - r.y * 0.5) * 0.25;
  c += vec3(1.0) * pow(max(0.0, dot(r, normalize(vec3(-0.35, 0.8, 0.5)))), 18.0) * 0.9;
  return c;
}
void main(){
  vec2 f = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 p = (f - uC) / (uR * uSq);
  float r = length(p);
    if (r > 1.0 + 1.5 / uR) {
    gl_FragColor = vec4(0.0);
    return;
  }
  vec3 n = vec3(p, sqrt(max(0.0, 1.0 - r * r)));
  float t = uTime;
  // turn slowly
  float ca = cos(t * 0.15); float sa = sin(t * 0.15);
  vec3 m = vec3(ca * n.x + sa * n.z, n.y, -sa * n.x + ca * n.z);
  vec3 q = m * uFreq;
  for (int i = 0; i < 3; i++) {
    q += uWarp * vec3(sin(q.y * 1.3 + t * 0.9), sin(q.z * 1.7 - t * 0.7), sin(q.x * 1.1 + t * 1.1));
  }
  vec3 bump = vec3(sin(q.x), sin(q.y + 1.3), sin(q.z + 2.1));
  vec3 nn = normalize(n + (0.62 + uPulse * 0.25) * bump * (0.3 + 0.7 * n.z));
  vec3 col = env(reflect(vec3(0.0, 0.0, -1.0), nn));
  // the rim catches more light, the very edge darkens like thick metal
  float fr = pow(1.0 - n.z, 3.0);
  col = mix(col, vec3(0.9, 0.92, 0.96), fr * 0.22);
  col *= 0.78 + 0.22 * smoothstep(0.0, 0.2, n.z);
  float a = clamp((1.0 - r) * uR * 1.2 + 0.5, 0.0, 1.0);
  gl_FragColor = vec4(col * a, a);
}`;

const hexRGB = (h: string) => {
  const v = parseInt(h.slice(1), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
};
type Sp = { x: number; v: number };
const spring = (s: Sp, to: number, k: number, d: number, dt: number) => {
  s.v += ((to - s.x) * k - s.v * d) * dt;
  s.x += s.v * dt;
};
const H = 420;
const STEP = 0.3;

/**
 * A mood check-in: a ball of liquid chrome beside an arc of feelings. Scroll, drag the words or use the arrow keys and
 * the arc rolls around the ball, the chosen word framed in brackets, and the chrome changes with it: calm moods
 * flow slowly in soft colours, tense ones churn fast and fold tightly. Grab the ball and throw it across; it squashes
 * as it flies, lands on the other side on a spring, and the arc of words turns round to face it. Log saves the mood
 * with a pulse through the metal.
 */
export default function MoodOrb({
  question = "How are you feeling?",
  moods = DEFAULT_MOODS,
  defaultMood = 4,
  onLog,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: MoodOrbProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const sfxRef = useRef(sfx);
  sfxRef.current = sfx;
  const [sel, setSel] = useState(defaultMood);
  const selRef = useRef(sel);
  selRef.current = sel;
  const [side, setSide] = useState<0 | 1>(0);
  const sideRef = useRef(side);
  sideRef.current = side;
  const [logged, setLogged] = useState<{ k: number; name: string } | null>(null);
  const [noGL, setNoGL] = useState(false);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const words = useRef<(HTMLButtonElement | null)[]>([]);
  // springs the frame loop reads: the arc's roll, which side the ball is on, a held position while dragging, squash
  const st = useRef({
    roll: { x: defaultMood, v: 0 },
    sideK: { x: 0, v: 0 },
    hold: null as null | number,
    holdV: 0,
    pulse: 0,
    tint: hexRGB(moods[defaultMood].tint),
    warp: moods[defaultMood].warp,
    freq: moods[defaultMood].freq,
    speed: moods[defaultMood].speed,
    time: 0,
  });
  const [w, setW] = useState(440);

  const choose = (i: number) => {
    const n = Math.max(0, Math.min(moods.length - 1, i));
    if (n === selRef.current) return;
    setSel(n);
    sfxRef.current.tick({ freq: 1800 + n * 120, gain: 0.03 });
    sfxRef.current.note(330 * Math.pow(2, (n % 7) / 7), {
      dur: 0.25,
      gain: 0.025,
      bell: 0.3,
    });
  };
  const swap = (to: 0 | 1, v = 0) => {
    if (to !== sideRef.current) {
      setSide(to);
      sfxRef.current.whoosh(500, 2400, { dur: 0.5, gain: 0.04 });
    }
    st.current.sideK.v += v;
  };
  const log = () => {
    st.current.pulse = 1;
    setLogged({ k: Date.now(), name: moods[selRef.current].name });
    onLog?.(moods[selRef.current]);
    sfx.note(659, { dur: 0.25, gain: 0.04, bell: 0.5 });
    sfx.note(988, { at: 0.1, dur: 0.45, gain: 0.04, bell: 0.6 });
  };

  // the ball and the arc, every frame
  useEffect(() => {
    const el = card.current;
    const c = cv.current;
    if (!el || !c) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    const gl = c.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    let prog: WebGLProgram | null = null;
    if (gl) {
      const mk = (t: number, src: string) => {
        const s = gl.createShader(t)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
        return s;
      };
      prog = gl.createProgram()!;
      gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null;
    }
    if (!gl || !prog) setNoGL(true);
    if (gl && prog) {
      gl.useProgram(prog);
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const la = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(la);
      gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
    }
    const U = (n: string) => (gl && prog ? gl.getUniformLocation(prog, n) : null);
    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(el);
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!vis) return;
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      const S = st.current;
      const m = moods[selRef.current];
      const snap = reduce;
      // mood: colour and character drift over
      const want = hexRGB(m.tint);
      const kf = snap ? 1 : Math.min(1, dt * 3);
      S.tint = S.tint.map((v, i) => v + (want[i] - v) * kf);
      S.warp += (m.warp - S.warp) * kf;
      S.freq += (m.freq - S.freq) * kf;
      S.speed += (m.speed - S.speed) * kf;
      S.time += snap ? 0 : dt * S.speed;
      S.pulse *= Math.exp(-dt * 3);
      if (snap) {
        S.roll.x = selRef.current;
        S.sideK.x = sideRef.current;
      } else {
        spring(S.roll, selRef.current, 140, 18, dt);
        if (S.hold === null) spring(S.sideK, sideRef.current, 120, 11, dt);
      }
      const W = el.clientWidth;
      const R = Math.min(96, W * 0.21);
      const leftX = R + 34;
      const rightX = W - R - 34;
      const k = S.hold ?? S.sideK.x;
      const cx = leftX + (rightX - leftX) * k;
      // on its way across the ball swells, as if it passes closer to you
      const mid = Math.sin(Math.PI * Math.max(0, Math.min(1, k)));
      const grow = 1 + 0.42 * mid;
      const cy = H * 0.5;
      // squash along the throw
      const vel = S.hold !== null ? S.holdV : S.sideK.v * (rightX - leftX);
      const sq = snap ? 0 : Math.max(-0.14, Math.min(0.14, vel / 5000));
      // the arc of words hugs the ball on its open side
      const base = Math.PI * Math.max(0, Math.min(1, k));
      const rad = R + 46;
      words.current.forEach((b, i) => {
        if (!b) return;
        const d = i - S.roll.x;
        const th = base + (k < 0.5 ? 1 : -1) * d * STEP;
        const x = cx + Math.cos(th) * rad;
        const y = cy + Math.sin(th) * rad;
        const fade = Math.max(0, 1 - Math.abs(d) * 0.2) * Math.max(0, 1 - mid * 1.6);
        const deg = ((th - base) * 180) / Math.PI;
        const anchor = Math.max(0, Math.min(1, k));
        b.style.transform = `translate(${x}px, ${y}px) translate(${-anchor * 100}%, -50%) rotate(${deg}deg) scale(${1 - Math.min(0.25, Math.abs(d) * 0.06)})`;
        b.style.transformOrigin = anchor > 0.5 ? "100% 50%" : "0% 50%";
        b.style.opacity = fade.toFixed(3);
        b.style.visibility = fade < 0.02 ? "hidden" : "visible";
      });
      if (!gl || !prog) {
        const fb = el.querySelector("[data-fallback]") as HTMLElement | null;
        if (fb) fb.style.transform = `translate(${cx - R}px, ${cy - R}px) scale(${grow})`;
        return;
      }
      const dpr = Math.min(2, devicePixelRatio || 1);
      if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      gl.viewport(0, 0, c.width, c.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U("uRes"), W, H);
      gl.uniform1f(U("uDpr"), dpr);
      gl.uniform1f(U("uTime"), S.time);
      gl.uniform2f(U("uC"), cx, cy);
      gl.uniform1f(U("uR"), R * grow * (1 + S.pulse * 0.06));
      gl.uniform2f(U("uSq"), 1 + Math.abs(sq), 1 - Math.abs(sq) * 0.7);
      gl.uniform3f(U("uTint"), S.tint[0], S.tint[1], S.tint[2]);
      gl.uniform1f(U("uWarp"), 0.32 + S.warp * 0.7);
      gl.uniform1f(U("uFreq"), S.freq);
      gl.uniform1f(U("uPulse"), S.pulse);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      const ext = gl?.getExtension("WEBGL_lose_context");
      window.setTimeout(() => ext?.loseContext(), 300);
    };
  }, [moods, reduce]);

  // grab the ball and throw it to the other side
  const grab = useRef<{
    x0: number;
    k0: number;
    lx: number;
    lt: number;
  } | null>(null);
  const span = () => {
    const W = card.current?.clientWidth ?? 440;
    const R = Math.min(96, W * 0.21);
    return W - 2 * (R + 34);
  };
  const onBall = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const S = st.current;
    grab.current = {
      x0: e.clientX,
      k0: S.sideK.x,
      lx: e.clientX,
      lt: performance.now(),
    };
    S.hold = S.sideK.x;
    S.holdV = 0;
    sfx.tick({ freq: 1400, gain: 0.03 });
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const g = grab.current;
    if (!g) return;
    const S = st.current;
    const raw = g.k0 + (e.clientX - g.x0) / span();
    S.hold = raw < 0 ? raw * 0.25 : raw > 1 ? 1 + (raw - 1) * 0.25 : raw;
    const now = performance.now();
    S.holdV = S.holdV * 0.6 + ((e.clientX - g.lx) / Math.max(1, now - g.lt)) * 1000 * 0.4;
    g.lx = e.clientX;
    g.lt = now;
  };
  const onUp = () => {
    const g = grab.current;
    if (!g) return;
    grab.current = null;
    const S = st.current;
    const k = S.hold ?? 0;
    const v = S.holdV / span();
    S.sideK.x = k;
    S.sideK.v = v;
    S.hold = null;
    const to: 0 | 1 = Math.abs(S.holdV) > 500 ? (S.holdV > 0 ? 1 : 0) : k > 0.5 ? 1 : 0;
    swap(to);
  };

  // autoplay: roll through a few moods, throw the ball across, log one
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const ballXY = () => {
      const W = card.current?.clientWidth ?? 440;
      const R = Math.min(96, W * 0.21);
      return [sideRef.current ? W - R - 34 : R + 34, H * 0.5] as const;
    };
    const run = async () => {
      await wait(1100);
      while (ok()) {
        const seq = sideRef.current ? [7, 8, 9, 1] : [3, 2, 0, 5];
        for (const m of seq) {
          if (!ok()) return;
          choose(m);
          await wait(1500);
        }
        if (!ok()) return;
        // throw it across
        const [bx, by] = ballXY();
        setGhost(true);
        await Promise.all([animate(gx, bx, { duration: 0.6 }), animate(gy, by, { duration: 0.6 })]);
        setGhostDown(true);
        const S = st.current;
        const from = sideRef.current;
        S.hold = from;
        const R = Math.min(96, (card.current?.clientWidth ?? 440) * 0.21);
        let lastK: number = from;
        let lastT = performance.now();
        await animate(0, 1, {
          duration: 0.55,
          ease: [0.5, 0, 0.75, 0.6],
          onUpdate: (u) => {
            const k = from + (from ? -0.55 : 0.55) * u;
            const now = performance.now();
            S.holdV = ((k - lastK) * span()) / Math.max(0.001, (now - lastT) / 1000);
            lastK = k;
            lastT = now;
            S.hold = k;
            gx.set(R + 34 + span() * k);
          },
        });
        setGhostDown(false);
        S.sideK.x = S.hold ?? 0;
        S.sideK.v = S.holdV / span();
        S.hold = null;
        swap(from ? 0 : 1);
        setGhost(false);
        await wait(1600);
        if (!ok()) return;
        await wait(1200);
      }
    };
    run().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const wheelAcc = useRef(0);
  const dragWords = useRef<{ y0: number; s0: number } | null>(null);
  const R = Math.min(96, w * 0.21);

  return (
    <div
      className={`relative w-full max-w-[460px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
      }}
    >
      <div
        ref={card}
        tabIndex={0}
        role="listbox"
        aria-label={question}
        aria-activedescendant={`mood-${sel}`}
        onPointerDown={(e) => {
          if (e.isTrusted) touched.current = true;
        }}
        onWheel={(e) => {
          touched.current = true;
          wheelAcc.current += e.deltaY;
          if (Math.abs(wheelAcc.current) > 36) {
            choose(selRef.current + Math.sign(wheelAcc.current));
            wheelAcc.current = 0;
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            touched.current = true;
            choose(selRef.current + (e.key === "ArrowDown" ? 1 : -1));
          } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            touched.current = true;
            swap(e.key === "ArrowRight" ? 1 : 0);
          } else if (e.key === "Enter") {
            touched.current = true;
            log();
          }
        }}
        className="outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        style={{
          position: "relative",
          height: H,
          borderRadius: 24,
          overflow: "hidden",
          background: "#181818",
          touchAction: "none",
        }}
      >
        <canvas
          ref={cv}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: noGL ? "none" : "block",
          }}
        />
        {noGL && (
          <div
            data-fallback
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: R * 2,
              height: R * 2,
              borderRadius: "50%",
              background: "radial-gradient(circle at 38% 28%, #f4f6fa, #9aa3b2 38%, #23252b 70%, #6b7280 96%)",
            }}
          />
        )}

        {/* the ball's handle */}
        <div
          aria-hidden="true"
          onPointerDown={onBall}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{
            position: "absolute",
            left: side ? w - 2 * R - 34 : 34,
            top: H / 2 - R,
            width: R * 2,
            height: R * 2,
            borderRadius: "50%",
            cursor: "grab",
            zIndex: 2,
          }}
        />

        {/* the arc of feelings */}
        <div
          onPointerDown={(e) => {
            touched.current = true;
            dragWords.current = { y0: e.clientY, s0: selRef.current };
          }}
          onPointerMove={(e) => {
            const d = dragWords.current;
            if (!d || e.buttons === 0) return;
            choose(Math.round(d.s0 + (e.clientY - d.y0) / 34));
          }}
          onPointerUp={() => (dragWords.current = null)}
          style={{ position: "absolute", inset: 0 }}
        >
          {moods.map((m, i) => {
            const on = i === sel;
            return (
              <button
                key={m.name}
                id={`mood-${i}`}
                ref={(b) => void (words.current[i] = b)}
                type="button"
                role="option"
                aria-selected={on}
                tabIndex={-1}
                onClick={() => {
                  touched.current = true;
                  if (i === selRef.current) log();
                  else choose(i);
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  border: 0,
                  background: "transparent",
                  padding: "4px 2px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 400,
                  letterSpacing: "0",
                  color: on ? "#ffffff" : "rgba(255,255,255,0.42)",
                  transition: "color 0.25s",
                }}
              >
                {on && <span style={{ color: "rgba(255,255,255,0.75)", marginRight: 9 }}>[</span>}
                {m.name}
                {on && <span style={{ color: "rgba(255,255,255,0.75)", marginLeft: 9 }}>]</span>}
              </button>
            );
          })}
        </div>

        <span aria-live="polite" className="sr-only">
          {logged ? `Logged ${logged.name.toLowerCase()} for today` : ""}
        </span>

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -13,
              top: -13,
              x: gx,
              y: gy,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: "rgba(255,255,255,0.22)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.75), 0 6px 14px -4px rgba(0,0,0,0.5)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
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
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

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
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
