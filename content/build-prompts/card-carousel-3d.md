Add the "3D Card Carousel" component from Nexus UI to my project.

Product cards standing round a 3D cylinder. Drag or fling it and it coasts, then clicks into place with the nearest card facing you; spin it fast and the cards swing outward and settle back in as it slows, with wheel, arrow keys, dots and a tap on any card also working.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { CardCarousel3D } from "@/components/card-carousel-3d";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/card-carousel-3d/card-carousel-3d.tsx ---

```tsx
"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
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

export type CarouselCard = {
  id: string;
  name: string;
  price: string;
  /** Optional product photo (any URL you host). Without it a phone is drawn in `color`. */
  image?: string;
  /** Finish colour for the drawn product. */
  color?: string;
};

export type CardCarousel3DProps = {
  cards?: CarouselCard[];
  /** Cylinder radius in px. Defaults to a radius that fits the cards edge to edge. */
  radius?: number;
  /** Card width in px. */
  itemWidth?: number;
  /** Card height in px. */
  itemHeight?: number;
  /** CSS perspective in px. */
  perspective?: number;
  /** Drift continuously (pauses under the pointer). */
  autoRotate?: boolean;
  /** Drift speed multiplier. */
  autoSpeed?: number;
  /** Drag and wheel speed multiplier. */
  scrollSpeed?: number;
  /** Direction for drift and autoplay. */
  direction?: "cw" | "ccw";
  /** Called with the index of the card that settles in front. */
  onChange?: (index: number) => void;
  /** Hint under the dots. Empty string hides it. */
  hint?: string;
  /** Steps to the next card every 2.4s until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
};

export const DEFAULT_CARDS: CarouselCard[] = [
  { id: "pro-max", name: "Lumen Pro Max", price: "From $1,199", color: "#c9b8a3" },
  { id: "pro", name: "Lumen Pro", price: "From $999", color: "#3a3a3c" },
  { id: "air", name: "Lumen Air", price: "From $899", color: "#a9c7e8" },
  { id: "lumen", name: "Lumen", price: "From $799", color: "#f2a7c3" },
  { id: "mini", name: "Lumen Mini", price: "From $599", color: "#9fd9b3" },
  { id: "se", name: "Lumen SE", price: "From $429", color: "#f5f5f7" },
];

/** Read the clock from event handlers only. */
const clock = () => performance.now();
const mod = (a: number, n: number) => ((a % n) + n) % n;

function Phone({ color, gid }: { color: string; gid: string }) {
  return (
    <svg viewBox="0 0 120 160" className="h-full w-auto" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
          <stop offset=".45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity=".18" />
        </linearGradient>
      </defs>
      <rect x="24" y="10" width="72" height="140" rx="16" fill="#000" opacity=".12" transform="translate(4 4)" />
      <rect x="24" y="10" width="72" height="140" rx="16" fill={color} stroke="rgba(0,0,0,.12)" />
      <rect x="24" y="10" width="72" height="140" rx="16" fill={`url(#${gid})`} />
      <rect x="31" y="17" width="34" height="34" rx="10" fill="rgba(0,0,0,.14)" />
      <circle cx="41" cy="27" r="6.5" fill="#1d1d1f" stroke="rgba(255,255,255,.35)" />
      <circle cx="56" cy="27" r="6.5" fill="#1d1d1f" stroke="rgba(255,255,255,.35)" />
      <circle cx="41" cy="42" r="6.5" fill="#1d1d1f" stroke="rgba(255,255,255,.35)" />
      <circle cx="56" cy="42" r="2.4" fill="#fff" opacity=".7" />
      <circle cx="60" cy="112" r="9" fill="none" stroke="rgba(0,0,0,.14)" strokeWidth="2" />
    </svg>
  );
}

function Card({
  card,
  index,
  step,
  rot,
  radius,
  width,
  height,
  onPick,
  gid,
}: {
  gid: string;
  card: CarouselCard;
  index: number;
  step: number;
  rot: MotionValue<number>;
  radius: MotionValue<number>;
  width: number;
  height: number;
  onPick: () => void;
}) {
  const angle = index * step;
  const facing = useTransform(rot, (r) => Math.round(Math.cos(((angle + r) * Math.PI) / 180) * 1000) / 1000);
  const scrim = useTransform(facing, [0, 1], [0.5, 0]);
  const backOpacity = useTransform(facing, (f) => Math.round(Math.max(0, -f) * 700) / 1000);
  const transform = useMotionTemplate`rotateY(${angle}deg) translateZ(${radius}px)`;
  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2, transform, transformStyle: "preserve-3d" }}
    >
      {/* Back of the card, seen through the far side of the ring. */}
      <motion.span
        className="absolute inset-0 rounded-[24px] bg-[#e8e8ed] dark:bg-[#2c2c2e]"
        style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", opacity: backOpacity }}
        aria-hidden="true"
      />
      <button
        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onPick}
        className="relative flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-white p-3 text-left shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.45)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]"
      >
        <span className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[16px] bg-[#f5f5f7] py-2 dark:bg-[#2c2c2e]">
          {card.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          ) : (
            <Phone color={card.color ?? "#d2d2d7"} gid={gid} />
          )}
        </span>
        <span className="mt-2.5 block truncate px-1 text-[14px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{card.name}</span>
        <span className="block px-1 text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{card.price}</span>
        <motion.span className="pointer-events-none absolute inset-0 rounded-[24px] bg-[#f5f5f7] dark:bg-black" style={{ opacity: scrim }} />
      </button>
    </motion.div>
  );
}

/**
 * Product cards standing round a cylinder. Drag or fling it and it coasts,
 * then clicks into place with the nearest card facing you; spin it fast and
 * the cards swing outward and settle back in as it slows. Wheel, arrow keys,
 * dots and a tap on any card all work.
 */
export function CardCarousel3D({
  cards = DEFAULT_CARDS,
  radius,
  itemWidth = 168,
  itemHeight = 220,
  perspective = 1100,
  autoRotate = false,
  autoSpeed = 1,
  scrollSpeed = 1,
  direction = "cw",
  onChange,
  hint = "Drag, scroll or use the arrow keys.",
  autoplay = false,
  enableSound = true,
  className = "",
}: CardCarousel3DProps) {
  const play = useSound(enableSound);
  // When the visitor last moved the carousel, and when autoplay last stepped it. The `autoRotate` drift sets neither, so it stays silent.
  const userAt = useRef(-Infinity);
  const autoAt = useRef(-Infinity);
  const lastTick = useRef(0);
  const lastIdx = useRef(0);
  const n = Math.max(1, cards.length);
  const step = 360 / n;
  const still = useReducedMotion() === true;
  const fit = Math.round(((itemWidth / 2) / Math.tan(Math.PI / Math.max(3, n))) * 1.16);
  const baseR = radius ?? fit;
  const sign = direction === "cw" ? 1 : -1;

  const rot = useMotionValue(0);
  const vel = useVelocity(rot);
  // Centrifugal spread: cards swing out while spinning fast, then spring back in.
  const spread = useSpring(
    useTransform(vel, (v) => (still ? 0 : Math.min(60, Math.abs(v) * 0.05))),
    { stiffness: 140, damping: 14 },
  );
  const r = useTransform(spread, (s) => baseR + s);
  const back = useTransform(r, (x) => -x);
  const tilt = useSpring(useTransform(vel, (v) => (still ? -4 : -4 + Math.max(-6, Math.min(6, v * -0.01)))), { stiffness: 160, damping: 16 });

  const [active, setActive] = useState(0);
  const settled = useRef(0);
  const run = useRef<AnimationPlaybackControls | undefined>(undefined);
  const touched = useRef(false);
  const hovering = useRef(false);
  const dragging = useRef(false);
  const from = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  /** Frames the drift waits after anyone moves the carousel. */
  const quiet = useRef(0);
  const wheelT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useMotionValueEvent(rot, "change", (v) => {
    const i = mod(Math.round(-v / step), n);
    setActive(i);
    if (i !== lastIdx.current) {
      lastIdx.current = i;
      const now = performance.now();
      if (now - lastTick.current > 40) {
        if (dragging.current || now - userAt.current < 1600) {
          lastTick.current = now;
          play("tick", 0.4);
        } else if (now - autoAt.current < 1600) {
          lastTick.current = now;
          play.auto("tick", 0.4);
        }
      }
    }
  });

  const snapTo = (target: number, velocity = 0) => {
    userAt.current = clock();
    run.current?.stop();
    quiet.current = 100;
    run.current = animate(rot, target, { type: "spring", stiffness: still ? 600 : 170, damping: still ? 60 : 19, velocity });
    const i = mod(Math.round(-target / step), n);
    if (i !== settled.current) {
      settled.current = i;
      onChange?.(i);
    }
  };
  const goTo = (i: number) => {
    const cur = rot.get();
    const want = -i * step;
    // Shortest way round.
    const delta = mod(want - cur + 180, 360) - 180;
    snapTo(Math.round((cur + delta) / step) * step);
  };
  const nudge = (d: number) => snapTo((Math.round(rot.get() / step) - d) * step);

  useEffect(() => () => run.current?.stop(), []);

  useEffect(() => {
    if (!autoRotate) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (quiet.current > 0) quiet.current -= 1;
      else if (!hovering.current && !dragging.current) {
        rot.set(rot.get() - sign * autoSpeed * dt * 0.012);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoRotate, autoSpeed, sign, rot]);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      run.current?.stop();
      autoAt.current = clock();
      run.current = animate(rot, (Math.round(rot.get() / step) - sign) * step, { type: "spring", stiffness: 120, damping: 16 });
    }, 2400);
    return () => clearInterval(t);
  }, [autoplay, step, sign, rot]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      e.preventDefault();
      touched.current = true;
      userAt.current = clock();
      run.current?.stop();
      quiet.current = 100;
      rot.set(rot.get() - d * 0.18 * scrollSpeed);
      clearTimeout(wheelT.current);
      wheelT.current = setTimeout(() => {
        run.current = animate(rot, Math.round(rot.get() / step) * step, { type: "spring", stiffness: 170, damping: 19 });
      }, 140);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(wheelT.current);
    };
  }, [rot, scrollSpeed, step]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") nudge(1);
    else if (e.key === "ArrowLeft") nudge(-1);
    else if (e.key === "Home") goTo(0);
    else if (e.key === "End") goTo(n - 1);
    else return;
    e.preventDefault();
    touched.current = true;
  };

  const k = 0.32 * scrollSpeed;
  const current = cards[active];

  return (
    <div className={`flex w-full max-w-full flex-col items-center gap-3 overflow-hidden ${className}`}>
      <motion.div
        ref={stage}
        role="region"
        aria-roledescription="carousel"
        aria-label="Products"
        tabIndex={0}
        onKeyDown={onKey}
        onPointerEnter={() => {
          hovering.current = true;
        }}
        onPointerLeave={() => {
          hovering.current = false;
        }}
        onPointerDown={() => {
          touched.current = true;
          userAt.current = clock();
          run.current?.stop();
        }}
        onPanStart={() => {
          dragging.current = true;
          from.current = rot.get();
        }}
        onPan={(_, info) => {
          userAt.current = clock();
          rot.set(from.current + info.offset.x * k);
        }}
        onPanEnd={(_, info) => {
          dragging.current = false;
          userAt.current = clock();
          quiet.current = 120;
          run.current = animate(rot, [rot.get()], {
            type: "inertia",
            velocity: info.velocity.x * k,
            power: 0.35,
            timeConstant: 260,
            modifyTarget: (v) => Math.round(v / step) * step,
          });
          const i = mod(Math.round(-(rot.get() + info.velocity.x * k * 0.5) / step), n);
          if (i !== settled.current) {
            settled.current = i;
            onChange?.(i);
          }
        }}
        className="relative w-full cursor-grab touch-pan-y select-none rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:focus-visible:ring-[#0a84ff]"
        style={{ height: itemHeight + 36, perspective }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 h-0 w-0"
          style={{ transformStyle: "preserve-3d", z: back, rotateX: tilt, rotateY: rot }}
        >
          {cards.map((c, i) => (
            <Card key={c.id} gid={`cc3d-${uid}-${i}`} card={c} index={i} step={step} rot={rot} radius={r} width={itemWidth} height={itemHeight} onPick={() => goTo(i)} />
          ))}
        </motion.div>
      </motion.div>

      <div className="flex flex-col items-center" aria-live="polite">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{current?.name}</span>
        <span className="text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{current?.price}</span>
      </div>
      <div className="flex items-center gap-1" role="group" aria-label="Choose product">
        {cards.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-label={`Show ${c.name}`}
            aria-current={i === active}
            onClick={() => {
              touched.current = true;
              goTo(i);
            }}
            className="grid h-6 place-items-center rounded-full px-1 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
          >
            <motion.span
              className={`block h-[7px] rounded-full ${i === active ? "bg-[#1d1d1f] dark:bg-[#f5f5f7]" : "bg-[#d2d2d7] dark:bg-[#48484a]"}`}
              animate={{ width: i === active ? 20 : 7 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        ))}
      </div>
      {hint ? <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</span> : null}
    </div>
  );
}

export default CardCarousel3D;
```

--- components/card-carousel-3d/index.ts ---

```ts
export { CardCarousel3D } from "./card-carousel-3d";
export type { CarouselCard, CardCarousel3DProps } from "./card-carousel-3d";
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
