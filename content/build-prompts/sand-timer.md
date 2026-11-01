Add the "Sand Timer" component from Nexus UI to my project.

A session timer drawn as a real hourglass: every grain is simulated on a canvas, piling, sliding and funneling through the neck at exactly the rate the time runs out. Pressing the button turns the glass over.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { SandTimer } from "@/components/sand-timer";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/sand-timer/index.ts ---

```ts
export { SandTimer } from "./sand-timer";
export type { SandTimerProps } from "./sand-timer";
```

--- components/sand-timer/sand-timer.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useEffectEvent, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface SandTimerProps {
  /** How long the full glass takes to run out, in seconds. */
  seconds?: number;
  /** Turns the glass over by itself when it is nearly empty, until someone presses the button. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const COLS = 70, ROWS = 120, CELL = 2;
const MID = ROWS / 2;
const NECK = 2; // cells wide at the narrowest point
// a narrow, warm palette: fine sand reads as one material, not confetti
const SAND = [0xd9b47c, 0xd6b078, 0xdcb880, 0xd3ac73, 0xdab67e];

/** Half-width of the glass at each row, in cells. */
function halfWidth(y: number) {
  const t = Math.abs(y + 0.5 - MID) / MID; // 0 at the neck, 1 at the ends
  let w = NECK / 2 + (COLS / 2 - 1 - NECK / 2) * Math.pow(t, 0.55);
  if (t > 0.86) w *= Math.sqrt(Math.max(0, 1 - ((t - 0.86) / 0.16) ** 2)); // round the ends
  return w;
}
const inside = (x: number, y: number) => y >= 0 && y < ROWS && Math.abs(x + 0.5 - COLS / 2) <= halfWidth(y);

/** Small seeded generator so the sand lays down and slides the same way every time. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Outline of the glass, traced from the same halfWidth the simulation uses. */
function glassPath(inset = 0) {
  const pts: string[] = [];
  for (let y = 0; y <= ROWS; y += 1) {
    const w = Math.max(0.6, halfWidth(Math.min(ROWS - 1, y)) + 0.5 - inset);
    pts.push(`${((COLS / 2 - w) * CELL).toFixed(1)},${(y * CELL).toFixed(1)}`);
  }
  for (let y = ROWS; y >= 0; y -= 1) {
    const w = Math.max(0.6, halfWidth(Math.min(ROWS - 1, y)) + 0.5 - inset);
    pts.push(`${((COLS / 2 + w) * CELL).toFixed(1)},${(y * CELL).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
}

/**
 * A session timer that is a real hourglass. Every grain is simulated: it
 * piles, slides off the slope and funnels through the neck at exactly the rate
 * that empties the top as the time runs out. "Stay signed in" turns the glass
 * over, and whatever had already fallen becomes the new top.
 */
export function SandTimer({ seconds = 30, autoplay = false, enableSound = true }: SandTimerProps) {
  const play = useSound(enableSound);
  const canvas = useRef<HTMLCanvasElement>(null);
  const grid = useRef(new Uint32Array(COLS * ROWS)); // 0 = empty, else colour
  const total = useRef(0);
  const top = useRef(0);
  const paused = useRef(false);
  const alive = useRef(true);
  const [left, setLeft] = useState(seconds);
  const [flips, setFlips] = useState(0);
  const turn = useAnimationControls();
  const touched = useRef(false);
  const started = useRef(false); // the visitor has turned the glass at least once
  const reduce = useReducedMotion();
  const ranOut = useEffectEvent(() => {
    if (started.current) play("done");
  });

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    const rng = mulberry32(0x5a17d);
    const g = grid.current;
    g.fill(0);
    let n = 0;
    for (let y = 0; y < MID - 1; y++) for (let x = 0; x < COLS; x++) {
      if (inside(x, y) && y > ROWS * 0.08) { g[y * COLS + x] = SAND[(rng() * SAND.length) | 0]; n++; }
    }
    total.current = n;

    const c = canvas.current!;
    c.width = COLS; c.height = ROWS;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(COLS, ROWS);
    const px = new Uint32Array(img.data.buffer);
    let raf = 0, last = performance.now(), lastLeft = last, tokens = 0, tick = 0, flowing = 0, empty = false;
    let onScreen = true;

    const frame = (now: number, simulate: boolean) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (simulate && !paused.current) {
        // the neck lets grains through at exactly total/seconds per second
        tokens = Math.min(4, tokens + (dt * total.current) / seconds);
        tick++;
        for (let pass = 0; pass < 2; pass++) {
          for (let y = ROWS - 2; y >= 0; y--) {
            const ltr = (y + tick + pass) % 2 === 0;
            for (let k = 0; k < COLS; k++) {
              const x = ltr ? k : COLS - 1 - k;
              const i = y * COLS + x;
              const v = g[i];
              if (!v) continue;
              const throughNeck = y === MID - 1;
              const tryMove = (nx: number, ny: number) => {
                if (!inside(nx, ny) || g[ny * COLS + nx]) return false;
                if (throughNeck) { if (tokens < 1) return false; tokens -= 1; flowing = 6; }
                g[ny * COLS + nx] = v; g[i] = 0; return true;
              };
              if (tryMove(x, y + 1)) continue;
              const d = rng() < 0.5 ? -1 : 1;
              if (tryMove(x + d, y + 1)) continue;
              tryMove(x - d, y + 1);
            }
          }
        }
      }
      let t = 0;
      for (let i = 0; i < MID * COLS; i++) if (g[i]) t++;
      top.current = t;
      for (let i = 0; i < g.length; i++) {
        const v = g[i];
        if (!v) { px[i] = 0; continue; }
        // grains in free fall are drawn as the stream below, not as loose dots
        const cy = (i / COLS) | 0, cx = i % COLS;
        if (cy >= MID && Math.abs(cx + 0.5 - COLS / 2) < 3 && i + COLS < g.length && !g[i + COLS]) { px[i] = 0; continue; }
        // light the exposed surface and shade deeper sand, so the pile has form
        const above = i >= COLS ? g[i - COLS] : 0, deep = i >= COLS * 4 && g[i - COLS * 4] ? 1 : 0;
        const lift = !above ? 26 : deep ? -10 : 0;
        const r = Math.min(255, Math.max(0, (v >> 16) + lift)), gg = Math.min(255, Math.max(0, ((v >> 8) & 255) + lift)), bb = Math.min(255, Math.max(0, (v & 255) + lift * 0.8));
        px[i] = 0xff000000 | (bb << 16) | (gg << 8) | r;
      }
      ctx.putImageData(img, 0, 0);
      // a falling stream reads as one thread, not a dotted line of grains
      if (flowing > 0) {
        flowing--;
        let y = MID;
        const c0 = COLS / 2 - 1;
        while (y < ROWS - 1 && !(g[(y + 1) * COLS + c0] && g[(y + 2) * COLS + c0] && g[(y + 1) * COLS + c0 + 1])) y++;
        ctx.fillStyle = "rgba(214,176,120,.95)";
        ctx.fillRect(c0 + 0.25, MID - 1, 1.5, y - MID + 2);
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      frame(now, true);
      // keep the readout in step with the sand, five times a second
      if (now - lastLeft >= 200) {
        lastLeft = now;
        const l = Math.ceil((top.current / Math.max(1, total.current)) * seconds);
        setLeft(l);
        if (l <= 0 && !empty) ranOut();
        empty = l <= 0;
      }
    };
    const start = () => {
      if (raf || !onScreen || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // paint the full glass once without advancing time, so a tile that never scrolls into view is not blank
    frame(last, false);
    start();

    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1]?.isIntersecting ?? true;
      if (onScreen) start(); else stop();
    });
    io.observe(c);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [seconds]);

  // Turn the glass over: animate 180°, then flip the grid and snap back to 0°
  // (the glass is symmetrical, so nobody can tell).
  const flip = useCallback(async () => {
    if (paused.current) return;
    paused.current = true;
    try {
      if (!reduce) await turn.start({ rotate: 180, transition: { type: "spring", stiffness: 140, damping: 16 } });
    } catch {
      /* animation was interrupted */
    }
    if (!alive.current) return;
    const g = grid.current, f = new Uint32Array(g.length);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) f[(ROWS - 1 - y) * COLS + (COLS - 1 - x)] = g[y * COLS + x];
    g.set(f);
    turn.set({ rotate: 0 });
    paused.current = false;
    setFlips((n) => n + 1);
  }, [turn, reduce]);

  const autoTap = useEffectEvent(() => play.auto("tap"));

  useEffect(() => {
    if (!autoplay || reduce) return;
    const id = setInterval(() => {
      if (touched.current) { clearInterval(id); return; }
      if (top.current < total.current * 0.45) {
        if (!paused.current) autoTap();
        void flip();
      }
    }, 1500);
    return () => clearInterval(id);
  }, [autoplay, reduce, flip]);

  const out = left <= 0;
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, "0");
  return (
    <div className="flex w-[340px] max-w-full flex-col items-center rounded-[28px] bg-white px-6 pb-6 pt-7 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]">
      <div className="flex w-full items-baseline justify-between">
        <span className="text-[14px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{out ? "Session expired" : "Session ends in"}</span>
        <span className={`text-[22px] font-semibold tabular-nums tracking-[-0.02em] ${out ? "text-[#ff3b30] dark:text-[#ff453a]" : "text-[#1d1d1f] dark:text-[#f5f5f7]"}`} aria-live="polite">{mm}:{ss}</span>
      </div>
      <motion.div animate={turn} className="relative my-6" style={{ width: COLS * CELL + 24, height: ROWS * CELL + 28 }}>
        {/* caps */}
        <div className="absolute inset-x-0 top-0 h-[10px] rounded-[5px] bg-gradient-to-b from-[#e8e8ed] to-[#c7c7cc] shadow-[0_1px_2px_rgba(0,0,0,.15)] dark:from-[#48484a] dark:to-[#3a3a3c] dark:shadow-[0_1px_2px_rgba(0,0,0,.5)]" />
        <div className="absolute inset-x-0 bottom-0 h-[10px] rounded-[5px] bg-gradient-to-b from-[#d2d2d7] to-[#aeaeb2] shadow-[0_2px_6px_rgba(0,0,0,.2)] dark:from-[#3a3a3c] dark:to-[#2c2c2e] dark:shadow-[0_2px_6px_rgba(0,0,0,.6)]" />
        {[0, 1].map((s) => <div key={s} className="absolute top-[8px] h-[calc(100%-16px)] w-[3px] rounded-full bg-gradient-to-r from-[#d2d2d7] to-[#aeaeb2] dark:from-[#48484a] dark:to-[#3a3a3c]" style={{ [s ? "right" : "left"]: 4 } as CSSProperties} />)}
        <canvas ref={canvas} className="absolute left-[12px] top-[14px]" style={{ width: COLS * CELL, height: ROWS * CELL, filter: "contrast(1.04) saturate(1.05)", clipPath: `path("${glassPath(0.7)}")` }} aria-hidden="true" />
        <svg className="pointer-events-none absolute left-[12px] top-[14px]" width={COLS * CELL} height={ROWS * CELL} aria-hidden="true">
          <path d={glassPath()} strokeWidth="1.4" className="fill-[rgba(160,190,220,.06)] stroke-[rgba(0,0,0,.18)] dark:fill-[rgba(160,190,220,.08)] dark:stroke-[rgba(255,255,255,.28)]" />
          <path d={glassPath(0.55)} fill="none" strokeWidth="2" strokeLinecap="round" strokeDasharray="34 400" strokeDashoffset="-18" className="stroke-[rgba(255,255,255,.75)] dark:stroke-[rgba(255,255,255,.5)]" />
        </svg>
      </motion.div>
      <div className="flex w-full gap-2">
        <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => { touched.current = true; started.current = true; play("tap"); void flip(); }} className="h-11 flex-1 rounded-full bg-[#0071e3] text-[15px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#0a84ff] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]">
          Stay signed in
        </motion.button>
        <button type="button" className="h-11 rounded-full bg-[#f0f0f3] px-4 text-[15px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]">Sign out</button>
      </div>
      <AnimatePresence>
        {flips > 0 && <motion.span key={flips} className="mt-3 text-[12px] text-[#86868b] dark:text-[#98989d]" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>Turned over {flips}×. The time that had fallen is yours again.</motion.span>}
      </AnimatePresence>
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
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen the first tap anywhere on the page
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

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  const touch = (navigator.maxTouchPoints ?? 0) > 0 || window.matchMedia?.("(pointer: coarse)").matches;
  if (!touch) return;
  const wake = () => {
    if (ctx && ctx.state === "running") return;
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
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```
