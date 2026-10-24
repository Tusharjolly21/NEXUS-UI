# Thermo Dial

Add the "Thermo Dial" component from Nexus UI to my project.

A thermostat ring you drag round or step with the arrow keys. Ticks light up to the set point, the glow shifts from cool blue to warm orange, the number rolls and the label says whether it is heating or cooling toward the room temperature.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { ThermoDial } from "@/components/thermo-dial";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/thermo-dial/index.ts ---

```ts
export { ThermoDial } from "./thermo-dial";
export type { ThermoDialProps } from "./thermo-dial";
```

--- components/thermo-dial/thermo-dial.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

/** Rounds SVG coordinates so server and browser maths print the same attribute (no hydration mismatch). */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

export interface ThermoDialProps {
  /** Current room temperature. Sets the marked tick and whether the label reads Heating, Cooling or Holding. */
  room?: number;
  /** Target temperature the dial starts at. */
  defaultValue?: number;
  /** Lowest settable temperature (start of the arc). */
  min?: number;
  /** Highest settable temperature (end of the arc). */
  max?: number;
  /** Increment for dragging and the arrow keys. */
  step?: number;
  /** Called with the new target whenever the user changes it by dragging or with the keyboard. */
  onChange?: (value: number) => void;
  /** Turns the dial to a few set points every 2.4s until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

/** Dial size in px, and its centre. */
const S = 260;
const C = S / 2;
const SWEEP = 270;
const TICKS = 54;
/** Degrees where the arc begins (bottom-left), measured clockwise from 3 o'clock. */
const START = 135;
/** Autoplay set points, as fractions of the range (24.5°, 17°, 27°, 21° on the default 10–30 dial). */
const DEMO = [0.725, 0.35, 0.85, 0.55];

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
/** Cool blue → lavender over the first half of the range, amber → red over the second. */
const rgbAt = (k: number) => {
  const q = Math.max(0, Math.min(1, k));
  return q < 0.5 ? mix([10, 132, 255], [191, 160, 255], q * 2) : mix([255, 179, 64], [255, 69, 58], (q - 0.5) * 2);
};
const rgb = (k: number) => {
  const c = rgbAt(k);
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

/**
 * A thermostat dial. Drag round the ring (or use the arrow keys): ticks light
 * up to the set point, the glow shifts from cool blue to warm orange, the
 * number rolls, and the label says whether it's heating or cooling toward
 * the room's current temperature.
 */
export function ThermoDial({ room = 19.5, defaultValue = 21, min = 10, max = 30, step = 0.5, onChange, autoplay = false, enableSound = true }: ThermoDialProps) {
  const play = useSound(enableSound);
  const lo = Math.min(min, max);
  const hi = Math.max(min, max, lo + step);
  const span = hi - lo;
  // toFixed keeps steps like 0.1 from turning into 21.300000000000001.
  const quantise = (v: number) => Number((Math.round(v / step) * step).toFixed(4));
  const snap = (v: number) => Math.max(lo, Math.min(hi, quantise(v)));
  const initial = snap(defaultValue);
  const set = useMotionValue(initial);
  const smooth = useSpring(set, { stiffness: 220, damping: 26 });
  const [temp, setTemp] = useState(initial);
  useMotionValueEvent(smooth, "change", (v) => setTemp(quantise(v)));
  const knobAngle = useTransform(smooth, (v) => START + ((v - lo) / span) * SWEEP);
  const kx = useTransform(knobAngle, (a) => C + Math.cos((a * Math.PI) / 180) * 104);
  const ky = useTransform(knobAngle, (a) => C + Math.sin((a * Math.PI) / 180) * 104);
  const glow = useTransform(smooth, (v) => {
    const c = rgbAt((v - lo) / span);
    return `radial-gradient(circle, rgba(${c[0]},${c[1]},${c[2]},.33) 0%, transparent 65%)`;
  });
  const ring = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const touched = useRef(false);
  const lastTick = useRef(0);

  // commit only runs from pointer and key handlers, so each step the user takes gets one quiet tick.
  const commit = (v: number) => {
    const next = snap(v);
    if (next === set.get()) return;
    const now = performance.now();
    if (now - lastTick.current >= 40) {
      lastTick.current = now;
      play("tick", 0.3);
    }
    set.set(next);
    onChange?.(next);
  };

  const fromPointer = (e: RPointerEvent) => {
    const el = ring.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let a = (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
    a = (a - START + 360) % 360;
    // In the 90° gap at the bottom, snap to whichever end is nearer.
    if (a > SWEEP) a = a > SWEEP + (360 - SWEEP) / 2 ? 0 : SWEEP;
    commit(lo + (a / SWEEP) * span);
  };

  const key = (e: KeyboardEvent) => {
    let to: number | null = null;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") to = set.get() + step;
    if (e.key === "ArrowDown" || e.key === "ArrowLeft") to = set.get() - step;
    if (e.key === "Home") to = lo;
    if (e.key === "End") to = hi;
    if (to === null) return;
    e.preventDefault();
    touched.current = true;
    set.stop();
    commit(to);
  };

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    let run: ReturnType<typeof animate> | undefined;
    // The same quiet tick a drag plays at each step, a little sparser while the dial turns by itself.
    let ticked = set.get();
    let tickAt = 0;
    const off = set.on("change", (v) => {
      const q = quantise(v);
      if (touched.current || q === ticked) return;
      ticked = q;
      const now = performance.now();
      if (now - tickAt < 150) return;
      tickAt = now;
      play.auto("tick", 0.3);
    });
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      const to = Number((Math.round((lo + DEMO[k++ % DEMO.length] * span) / step) * step).toFixed(4));
      run = animate(set, to, { duration: 1.1, ease: [0.4, 0, 0.2, 1] });
    }, 2400);
    return () => {
      clearInterval(t);
      off();
      run?.stop();
    };
    // quantise is derived from step; play only changes with the sound props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, set, lo, span, step, play]);

  const mode = temp > room + 0.4 ? "Heating" : temp < room - 0.4 ? "Cooling" : "Holding";
  const [whole, half] = temp.toFixed(1).split(".");
  const roomTick = Math.round(((room - lo) / span) * (TICKS - 1));

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={ring}
        role="slider"
        tabIndex={0}
        aria-label="Target temperature"
        aria-valuemin={lo}
        aria-valuemax={hi}
        aria-valuenow={temp}
        aria-valuetext={`${temp} degrees, ${mode.toLowerCase()}`}
        onKeyDown={key}
        onPointerDown={(e) => {
          touched.current = true;
          drag.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          set.stop();
          fromPointer(e);
        }}
        onPointerMove={(e) => {
          if (drag.current) fromPointer(e);
        }}
        onPointerUp={() => {
          drag.current = false;
        }}
        onPointerCancel={() => {
          drag.current = false;
        }}
        className="relative cursor-pointer touch-none select-none rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]"
        style={{ width: S, height: S }}
      >
        <motion.div className="pointer-events-none absolute -inset-6 rounded-full" style={{ background: glow }} />
        <div className="absolute inset-[34px] rounded-full bg-[#1d1d1f] shadow-[inset_0_2px_0_rgba(255,255,255,.12),0_24px_40px_-18px_rgba(0,0,0,.6)] dark:shadow-[inset_0_2px_0_rgba(255,255,255,.12),0_0_0_1px_rgba(255,255,255,.08),0_24px_40px_-18px_rgba(0,0,0,.9)]" />
        <svg className="absolute inset-0" width={S} height={S} aria-hidden="true">
          {Array.from({ length: TICKS }, (_, i) => {
            const a = ((START + (i / (TICKS - 1)) * SWEEP) * Math.PI) / 180;
            const k = i / (TICKS - 1);
            const on = lo + k * span <= temp;
            const big = i === roomTick;
            const r1 = big ? 112 : 116;
            const r2 = 126;
            return (
              <line
                key={i}
                x1={r3(C + Math.cos(a) * r1)}
                y1={r3(C + Math.sin(a) * r1)}
                x2={r3(C + Math.cos(a) * r2)}
                y2={r3(C + Math.sin(a) * r2)}
                strokeWidth={big ? 3 : 2.2}
                strokeLinecap="round"
                className={big ? "stroke-[#1d1d1f] dark:stroke-[#f5f5f7]" : on ? undefined : "stroke-[#d2d2d7] dark:stroke-[#48484a]"}
                style={{ transition: "stroke .15s", stroke: !big && on ? rgb(k) : undefined }}
              />
            );
          })}
        </svg>
        <motion.span
          className="absolute h-[18px] w-[18px] rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,.4)]"
          style={{ left: kx, top: ky, x: "-50%", y: "-50%" }}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-white">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={mode}
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: rgb((temp - lo) / span) }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
            >
              {mode}
            </motion.span>
          </AnimatePresence>
          <span className="flex items-start text-[54px] font-semibold leading-none tracking-[-0.05em] tabular-nums">
            <span className="relative inline-flex overflow-hidden">
              {/* Re-keyed, not AnimatePresence: the number can change every frame while dragging. */}
              <motion.span key={whole} initial={{ y: "45%", opacity: 0.3 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 520, damping: 32 }}>
                {whole}
              </motion.span>
            </span>
            <span className="mt-1 text-[22px] text-white/70">.{half}°</span>
          </span>
          <span className="text-[11px] text-white/55">Room {room.toFixed(1)}°</span>
        </div>
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Drag round the ring.</span>
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
