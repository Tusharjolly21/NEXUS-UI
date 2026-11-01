Add the "Circular Carousel" component from Nexus UI to my project.

Cards hung round the rim of a wheel, with the active card at the top and its neighbours tipping away down each side. Drag or fling the wheel and it coasts to the nearest card while the cards swing on their pins and settle, and the counter in the middle rolls to the new number; arrows, dots and keys work too.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { CircularCarousel } from "@/components/circular-carousel";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/circular-carousel/circular-carousel.tsx ---

```tsx
"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  tag?: string;
  /** Tag colour. Defaults to a system accent per card. */
  accent?: string;
}

export interface CircularCarouselProps {
  items?: CarouselItem[];
  /** Controlled active card. */
  activeIndex?: number;
  /** Called with the new active index. */
  onActiveChange?: (index: number) => void;
  /** Steps to the next card every `autoPlayInterval` ms until someone touches it. */
  autoplay?: boolean;
  /** @deprecated Same as `autoplay`. */
  autoPlay?: boolean;
  /** Time between autoplay steps, in ms. */
  autoPlayInterval?: number;
  /** Hint under the controls. Empty string hides it. */
  hint?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
}

const DEFAULT_ITEMS: CarouselItem[] = [
  { id: "plan", tag: "Plan", title: "Shape the brief", description: "Goals, audience and the one thing to get right." },
  { id: "sketch", tag: "Sketch", title: "Rough it out", description: "Fast frames to find the flow before the polish." },
  { id: "build", tag: "Build", title: "Make it real", description: "Components, data and motion wired together." },
  { id: "test", tag: "Test", title: "Watch people use it", description: "Five sessions find most of the rough edges." },
  { id: "ship", tag: "Ship", title: "Put it out", description: "Release, measure and write down what you learned." },
  { id: "learn", tag: "Learn", title: "Loop back", description: "Feed what you saw into the next brief." },
];

/** Read the clock from event handlers only. */
const clock = () => performance.now();
const ACCENTS = ["#0071e3", "#bf5af2", "#ff9f0a", "#30b65a", "#ff375f", "#5e5ce6"];
const CW = 164;
const CH = 104;
const R = 300;
const STEP = 27;
/** Rounded so server and browser print identical styles. */
const r3 = (v: number) => Math.round(v * 1000) / 1000;
const wrap = (o: number, n: number) => {
  const h = n / 2;
  return ((((o + h) % n) + n) % n) - h;
};

function WheelCard({
  item,
  index,
  n,
  pos,
  sway,
  onPick,
}: {
  item: CarouselItem;
  index: number;
  n: number;
  pos: MotionValue<number>;
  sway: MotionValue<number>;
  onPick: () => void;
}) {
  const off = useTransform(pos, (p) => wrap(index - p, n));
  const theta = useTransform(off, (o) => o * STEP);
  const x = useTransform(theta, (t) => r3(R * Math.sin((t * Math.PI) / 180)));
  const y = useTransform(theta, (t) => r3(R * (1 - Math.cos((t * Math.PI) / 180))));
  // Cards hang off the wheel: they swing with its momentum, then settle (follow-through).
  const rotate = useTransform([theta, sway, off], ([t, s, o]) => r3((t as number) + (s as number) * (1 - Math.min(1, Math.abs(o as number)) * 0.4)));
  const scale = useTransform(off, (o) => r3(1 - Math.min(2.5, Math.abs(o)) * 0.07));
  const opacity = useTransform(off, (o) => r3(Math.max(0, 1 - Math.max(0, Math.abs(o) - 1.2) * 1.1)));
  const zIndex = useTransform(off, (o) => 10 - Math.round(Math.abs(o) * 2));
  const ring = useTransform(off, (o) => Math.max(0, 1 - Math.abs(o) * 2));
  const accent = item.accent ?? ACCENTS[index % ACCENTS.length];

  return (
    <motion.div className="absolute left-1/2 top-0" style={{ width: CW, height: CH, marginLeft: -CW / 2, x, y, rotate, scale, opacity, zIndex }}>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onPick}
        className="relative flex h-full w-full flex-col justify-between rounded-[20px] bg-white p-3.5 text-left text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_18px_34px_-22px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_18px_34px_-22px_rgba(0,0,0,.9)]"
      >
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-[20px]"
          style={{ opacity: ring, boxShadow: `0 0 0 2px ${accent}` }}
        />
        {item.tag ? (
          <span className="self-start rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: `${accent}1a`, color: accent }}>
            {item.tag}
          </span>
        ) : (
          <span />
        )}
        <span className="block">
          <span className="block truncate text-[14px] font-semibold leading-tight tracking-[-0.02em]">{item.title}</span>
          <span className="mt-0.5 line-clamp-2 block text-[11px] leading-[1.35] text-[#6e6e73] dark:text-[#a1a1a6]">{item.description}</span>
        </span>
      </button>
    </motion.div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

/**
 * Cards hung round the rim of a wheel. Drag or fling the wheel and it coasts
 * to the nearest card; the cards swing on their pins as it turns and settle
 * when it stops, and the counter in the middle rolls to the new number.
 */
export function CircularCarousel({
  items = DEFAULT_ITEMS,
  activeIndex: controlled,
  onActiveChange,
  autoplay,
  autoPlay,
  autoPlayInterval = 2600,
  hint = "Drag the wheel, or use the arrow keys.",
  enableSound = true,
  className = "",
}: CircularCarouselProps) {
  const play = useSound(enableSound);
  // When the visitor last moved the wheel, and when autoplay last did. A controlled `activeIndex` sets neither, so it stays silent.
  const userAt = useRef(-Infinity);
  const autoAt = useRef(-Infinity);
  const lastTick = useRef(0);
  const n = Math.max(1, items.length);
  const still = useReducedMotion() === true;
  const pos = useMotionValue(controlled ?? 0);
  const vel = useVelocity(pos);
  const sway = useSpring(
    useTransform(vel, (v) => (still ? 0 : Math.max(-22, Math.min(22, v * -7)))),
    { stiffness: 120, damping: 7, mass: 0.6 },
  );
  const [active, setActive] = useState(((controlled ?? 0) % n + n) % n);
  const [dir, setDir] = useState(1);
  const run = useRef<AnimationPlaybackControls | undefined>(undefined);
  const touched = useRef(false);
  const from = useRef(0);
  const reported = useRef(active);

  const shown = useRef(active);
  useMotionValueEvent(pos, "change", (p) => {
    const i = ((Math.round(p) % n) + n) % n;
    if (i === shown.current) return;
    setDir(wrap(i - shown.current, n) >= 0 ? 1 : -1);
    shown.current = i;
    setActive(i);
    const now = performance.now();
    if (now - lastTick.current > 40) {
      if (now - userAt.current < 1600) {
        lastTick.current = now;
        play("tick", 0.4);
      } else if (now - autoAt.current < 1600) {
        lastTick.current = now;
        play.auto("tick", 0.4);
      }
    }
  });

  const settle = (target: number, velocity = 0) => {
    userAt.current = clock();
    run.current?.stop();
    run.current = animate(pos, target, still ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 18, velocity });
    const i = ((Math.round(target) % n) + n) % n;
    if (i !== reported.current) {
      reported.current = i;
      onActiveChange?.(i);
    }
  };
  const goTo = (i: number) => {
    const p = pos.get();
    settle(Math.round(p + wrap(i - p, n)));
  };
  const step = (d: number) => settle(Math.round(pos.get()) + d);

  // Controlled mode: follow the prop the short way round.
  useEffect(() => {
    if (controlled === undefined) return;
    const p = pos.get();
    const target = Math.round(p + wrap(controlled - p, n));
    if (target === Math.round(p)) return;
    reported.current = ((controlled % n) + n) % n;
    run.current?.stop();
    run.current = animate(pos, target, { type: "spring", stiffness: 150, damping: 18 });
  }, [controlled, n, pos]);

  useEffect(() => () => run.current?.stop(), []);

  const demo = autoplay ?? autoPlay ?? false;
  useEffect(() => {
    if (!demo) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      run.current?.stop();
      autoAt.current = clock();
      run.current = animate(pos, Math.round(pos.get()) + 1, { type: "spring", stiffness: 110, damping: 14 });
    }, Math.max(1000, autoPlayInterval));
    return () => clearInterval(t);
  }, [demo, autoPlayInterval, pos]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "Home") goTo(0);
    else if (e.key === "End") goTo(n - 1);
    else return;
    e.preventDefault();
    touched.current = true;
  };

  const item = items[active];
  const num = String(active + 1).padStart(2, "0");

  return (
    <div
      className={`flex w-full max-w-full flex-col items-center gap-3 overflow-hidden ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <motion.div
        role="region"
        aria-roledescription="carousel"
        aria-label="Cards"
        tabIndex={0}
        onKeyDown={onKey}
        onPanStart={() => {
          userAt.current = clock();
          run.current?.stop();
          from.current = pos.get();
        }}
        onPan={(_, info) => {
          userAt.current = clock();
          pos.set(from.current - info.offset.x / 120);
        }}
        onPanEnd={(_, info) => {
          userAt.current = clock();
          const at = Math.round(pos.get());
          const land = (v: number) => Math.round(Math.max(at - 3, Math.min(at + 3, v)));
          run.current = animate(pos, [pos.get()], {
            type: "inertia",
            velocity: -info.velocity.x / 120,
            power: 0.25,
            timeConstant: 240,
            modifyTarget: land,
          });
          const i = ((land(pos.get() - (info.velocity.x / 120) * 0.25) % n) + n) % n;
          if (i !== reported.current) {
            reported.current = i;
            onActiveChange?.(i);
          }
        }}
        className="relative h-[214px] w-full max-w-[540px] cursor-grab touch-pan-y select-none rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:focus-visible:ring-[#0a84ff]"
      >
        <div className="absolute inset-x-0 top-3">
          {items.map((it, i) => (
            <WheelCard key={it.id} item={it} index={i} n={n} pos={pos} sway={sway} onPick={() => goTo(i)} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center" aria-live="polite">
          <span className="flex items-baseline gap-1.5 tabular-nums">
            <span className="relative inline-flex h-[40px] overflow-hidden text-[38px] font-semibold leading-[40px] tracking-[-0.05em] text-[#1d1d1f] dark:text-[#f5f5f7]">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.span
                  key={num}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ y: d * 30, opacity: 0 }),
                    center: { y: 0, opacity: 1 },
                    exit: (d: number) => ({ y: d * -30, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                >
                  {num}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">/ {String(n).padStart(2, "0")}</span>
          </span>
          <span className="sr-only">{item ? `${item.title}. ${item.description}` : ""}</span>
        </div>
      </motion.div>

      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            touched.current = true;
            step(-1);
          }}
          aria-label="Previous card"
          className="grid size-9 place-items-center rounded-full bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
        >
          <Chevron dir="left" />
        </motion.button>
        <div className="flex items-center" role="group" aria-label="Choose card">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              aria-label={`Go to ${it.title}`}
              aria-current={i === active}
              onClick={() => {
                touched.current = true;
                goTo(i);
              }}
              className="grid h-6 place-items-center rounded-full px-[3px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
            >
              <motion.span
                className={`block h-1.5 rounded-full ${i === active ? "bg-[#1d1d1f] dark:bg-[#f5f5f7]" : "bg-[#d2d2d7] dark:bg-[#48484a]"}`}
                animate={{ width: i === active ? 18 : 6 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          ))}
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            touched.current = true;
            step(1);
          }}
          aria-label="Next card"
          className="grid size-9 place-items-center rounded-full bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
        >
          <Chevron dir="right" />
        </motion.button>
      </div>
      {hint ? <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</span> : null}
    </div>
  );
}

export default CircularCarousel;
```

--- components/circular-carousel/index.ts ---

```ts
export { CircularCarousel } from "./circular-carousel";
export type { CircularCarouselProps, CarouselItem } from "./circular-carousel";
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
