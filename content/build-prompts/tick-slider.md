Add the "Tick Slider" component from Nexus UI to my project.

A slider drawn as a row of ticks that fill with colour up to the value. Ticks swell in a wave around the pointer and the needle, the needle leans into the direction it moves and swings upright when it stops, and the number above rolls digit by digit.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { TickSlider } from "@/components/tick-slider";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/tick-slider/index.ts ---

```ts
export { TickSlider } from "./tick-slider";
export type { TickSliderProps, TickSliderSize } from "./tick-slider";
```

--- components/tick-slider/tick-slider.tsx ---

```tsx
"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export type TickSliderSize = "sm" | "md" | "lg";

export type TickSliderProps = {
  /** Controlled value. */
  value?: number;
  /** Starting value when uncontrolled. */
  defaultValue?: number;
  /** Called with the snapped value while dragging and on keyboard changes. */
  onChange?: (value: number) => void;
  /** Called once when a drag or key press settles. */
  onCommit?: (value: number) => void;
  min?: number;
  max?: number;
  /** Values snap to multiples of this. */
  step?: number;
  /** How many tick marks the track is drawn with. */
  ticks?: number;
  /** Visible label above the track (also used as the accessible name). */
  label?: string;
  /** Colour of the filled ticks and the needle. Defaults to system blue. */
  accent?: string;
  size?: TickSliderSize;
  /** Show the rolling number above the track. */
  showValue?: boolean;
  /** Suffix after the number, e.g. "%". */
  unit?: string;
  /** How much ticks near the pointer and the needle grow (0 turns the wave off). */
  magnify?: number;
  /** One-line caption under the track. Pass an empty string to hide it. */
  hint?: string;
  /** Sweeps the needle to a few values until someone touches it. */
  autoplay?: boolean;
  disabled?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
};

const SIZES: Record<TickSliderSize, { h: number; tick: number; gap: number; text: string }> = {
  sm: { h: 18, tick: 2, gap: 4, text: "text-[22px]" },
  md: { h: 26, tick: 3, gap: 5, text: "text-[30px]" },
  lg: { h: 34, tick: 3, gap: 6, text: "text-[36px]" },
};

/** Autoplay stops, as fractions of the range. */
const DEMO = [0.78, 0.22, 0.6, 0.94, 0.4];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function decimalsOf(step: number) {
  const s = String(step);
  return s.includes(".") ? s.split(".")[1].length : 0;
}

/* Rolling number */

function Digit({ digit, reduced }: { digit: number; reduced: boolean }) {
  const y = useSpring(-digit * 10, { stiffness: 300, damping: 22, mass: 0.6 });
  React.useEffect(() => {
    if (reduced) y.jump(-digit * 10);
    else y.set(-digit * 10);
  }, [digit, reduced, y]);
  const top = useTransform(y, (v) => `${v}%`);
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden leading-none [mask-image:linear-gradient(to_bottom,transparent,#000_16%,#000_84%,transparent)]">
      <motion.span className="absolute inset-x-0 top-0 flex flex-col" style={{ y: top }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] text-center leading-none">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function RollingNumber({ value, decimals, reduced }: { value: number; decimals: number; reduced: boolean }) {
  const chars = Math.abs(value).toFixed(decimals).split("");
  return (
    <span className="inline-flex items-center tabular-nums" aria-hidden="true">
      {value < 0 ? <span className="leading-none">-</span> : null}
      {chars.map((c, i) =>
        c === "." ? (
          <span key={`dot-${i}`} className="leading-none">
            .
          </span>
        ) : (
          // keyed from the right so the units stay put when the number gains a digit
          <Digit key={chars.length - i} digit={Number(c)} reduced={reduced} />
        ),
      )}
    </span>
  );
}

/* Tick */

function Tick({
  index,
  count,
  fill,
  pointer,
  needle,
  height,
  width,
  pitch,
  magnify,
}: {
  index: number;
  count: number;
  fill: MotionValue<number>;
  pointer: MotionValue<number>;
  needle: MotionValue<number>;
  height: number;
  width: number;
  pitch: number;
  magnify: number;
}) {
  const at = count === 1 ? 0 : index / (count - 1);
  const center = index * pitch + width / 2;
  const color = useTransform(fill, (f) => (f >= at - 1e-6 ? "var(--tk-on)" : "var(--tk-off)"));
  const boost = useTransform([pointer, needle], ([p, n]: number[]) => {
    const dp = (p - center) / (pitch * 3.4);
    const dn = (n - center) / (pitch * 2.2);
    const fromPointer = p < -999 ? 0 : Math.exp(-dp * dp);
    return Math.max(fromPointer, Math.exp(-dn * dn) * 0.55) * magnify;
  });
  const lift = useSpring(boost, { stiffness: 420, damping: 26 });
  const scaleY = useTransform(lift, (b) => 1 + b);
  return (
    <motion.span
      aria-hidden="true"
      className="block shrink-0 origin-bottom rounded-full"
      style={{ width, height, scaleY, backgroundColor: color }}
    />
  );
}

/**
 * A slider drawn as a row of ticks. Ticks swell in a wave around the pointer
 * and the needle, fill with colour up to the value, and the needle leans
 * into the direction it's moving and swings upright when it stops. The
 * number above rolls digit by digit.
 */
export function TickSlider({
  value: controlled,
  defaultValue = 50,
  onChange,
  onCommit,
  min = 0,
  max = 100,
  step = 1,
  ticks = 36,
  label,
  accent,
  size = "md",
  showValue = true,
  unit,
  magnify = 0.55,
  hint = "Drag across the ticks, or use the arrow keys.",
  autoplay = false,
  disabled = false,
  enableSound = true,
  className,
}: TickSliderProps) {
  const reduced = useReducedMotion() ?? false;
  const play = useSound(enableSound);
  const lastTick = React.useRef(0);
  const [inner, setInner] = React.useState(() => clamp(defaultValue, min, max));
  const value = clamp(controlled ?? inner, min, max);
  const decimals = decimalsOf(step);
  const dims = SIZES[size];
  const count = Math.max(2, Math.round(ticks));
  const trackWidth = count * dims.tick + (count - 1) * dims.gap;
  const pitch = dims.tick + dims.gap;
  const span = max - min || 1;

  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const touched = React.useRef(false);
  const [dragging, setDragging] = React.useState(false);
  const labelId = React.useId();

  const fraction = (value - min) / span;
  const fill = useMotionValue(fraction);
  const pointer = useMotionValue(-1000);
  // The needle trails the fill a little, so it has velocity to lean with.
  const needleF = useSpring(fill, { stiffness: 520, damping: 34 });
  const needle = useTransform(needleF, (f) => clamp(f, 0, 1) * (trackWidth - dims.tick) + dims.tick / 2);
  const velocity = useVelocity(needle);
  const leanRaw = useTransform(velocity, (v) => clamp(v / 90, -16, 16));
  const lean = useSpring(leanRaw, { stiffness: 380, damping: 14 });
  const tilt = useTransform(lean, (l) => (reduced ? 0 : l));
  const needleX = useTransform(needle, (n) => n - 1.5);

  React.useEffect(() => {
    if (reduced) {
      fill.set(fraction);
      return;
    }
    const c = animate(fill, fraction, dragging ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 30 });
    return () => c.stop();
  }, [fraction, dragging, fill, reduced]);

  const snap = React.useCallback(
    (raw: number) => {
      const stepped = Math.round((raw - min) / step) * step + min;
      return Number(clamp(stepped, min, max).toFixed(decimals));
    },
    [min, max, step, decimals],
  );

  const commit = React.useCallback(
    (next: number) => {
      if (controlled === undefined) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  React.useEffect(() => {
    if (!autoplay || controlled !== undefined) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      const f = DEMO[k++ % DEMO.length];
      setInner(Number(clamp(Math.round((min + f * (max - min)) / step) * step, min, max).toFixed(decimals)));
      play.auto("tick", 0.4);
    }, 1900);
    return () => clearInterval(t);
  }, [autoplay, controlled, min, max, step, decimals, play]);

  const valueAt = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return value;
    const r = el.getBoundingClientRect();
    return snap(min + clamp((clientX - r.left) / r.width, 0, 1) * (max - min));
  };

  const localX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return -1000;
    const r = el.getBoundingClientRect();
    const scale = r.width / el.offsetWidth || 1;
    return (clientX - r.left) / scale;
  };

  const latest = React.useRef(value);
  React.useLayoutEffect(() => {
    latest.current = value;
  }, [value]);

  // One quiet tick when the value crosses onto a different tick mark (called from input handlers only).
  const tickIfCrossed = (from: number, to: number, always = false) => {
    const mark = (v: number) => Math.round(((v - min) / span) * (count - 1));
    if (!always && mark(from) === mark(to)) return;
    const now = performance.now();
    if (now - lastTick.current < 40) return;
    lastTick.current = now;
    play("tick", 0.4);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button > 0) return;
    e.preventDefault();
    touched.current = true;
    if (e.isTrusted) trackRef.current?.focus({ preventScroll: true });
    setDragging(true);
    const first = valueAt(e.clientX);
    if (first !== latest.current) {
      tickIfCrossed(latest.current, first);
      latest.current = first;
      commit(first);
    }
    pointer.set(localX(e.clientX));

    const move = (ev: PointerEvent) => {
      pointer.set(localX(ev.clientX));
      const next = valueAt(ev.clientX);
      if (next !== latest.current) {
        tickIfCrossed(latest.current, next);
        latest.current = next;
        commit(next);
      }
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      onCommit?.(latest.current);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const big = Math.max(step, (max - min) / 10);
    const map: Record<string, number> = {
      ArrowRight: value + step,
      ArrowUp: value + step,
      ArrowLeft: value - step,
      ArrowDown: value - step,
      PageUp: value + big,
      PageDown: value - big,
      Home: min,
      End: max,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    touched.current = true;
    const next = snap(map[e.key]);
    if (next !== value) {
      tickIfCrossed(value, next, true);
      commit(next);
      onCommit?.(next);
    }
  };

  const valueText = `${value.toFixed(decimals)}${unit ?? ""}`;

  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-col gap-3 text-[#1d1d1f] [--tk-off:#d2d2d7] dark:text-[#f5f5f7] dark:[--tk-off:#48484a]",
        !accent && "[--tk-on:#0071e3] dark:[--tk-on:#0a84ff]",
        disabled && "opacity-50",
        className,
      )}
      style={accent ? ({ "--tk-on": accent } as React.CSSProperties) : undefined}
    >
      {label || showValue ? (
        <div className="flex items-end justify-between gap-4">
          {label ? (
            <span id={labelId} className="pb-1 text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue ? (
            <output aria-hidden="true" className={cn("flex items-baseline font-semibold leading-none tracking-[-0.04em]", dims.text)}>
              <RollingNumber value={value} decimals={decimals} reduced={reduced} />
              {unit ? <span className="ml-0.5 text-[0.55em] font-medium tracking-normal text-[#86868b] dark:text-[#98989d]">{unit}</span> : null}
            </output>
          ) : null}
        </div>
      ) : null}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueText}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : "Value"}
        aria-disabled={disabled || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => {
          if (!dragging) pointer.set(localX(e.clientX));
        }}
        onPointerLeave={() => {
          if (!dragging) pointer.set(-1000);
        }}
        onKeyDown={onKeyDown}
        className={cn(
          "relative flex cursor-ew-resize touch-none select-none items-end rounded-[10px] outline-none",
          "focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]",
          disabled && "cursor-not-allowed",
        )}
        style={{ width: trackWidth, gap: dims.gap, height: dims.h * 2 }}
      >
        {Array.from({ length: count }, (_, i) => (
          <Tick
            key={i}
            index={i}
            count={count}
            fill={fill}
            pointer={pointer}
            needle={needle}
            height={dims.h}
            width={dims.tick}
            pitch={pitch}
            magnify={reduced ? 0 : magnify}
          />
        ))}
        <motion.span className="pointer-events-none absolute bottom-0 left-0" style={{ x: needleX }} aria-hidden="true">
          <motion.span
            className="block w-[3px] origin-bottom rounded-full bg-[var(--tk-on)]"
            style={{ height: dims.h * 1.9, rotate: tilt }}
          >
            <span className="absolute -left-[3.5px] -top-[5px] block size-[10px] rounded-full bg-[var(--tk-on)] shadow-[0_0_0_2.5px_#fff,0_2px_6px_rgba(0,0,0,.25)] dark:shadow-[0_0_0_2.5px_#1c1c1e,0_2px_6px_rgba(0,0,0,.6)]" />
          </motion.span>
        </motion.span>
      </div>
      {hint ? <span className="text-[12px] text-[#86868b] dark:text-[#98989d]">{hint}</span> : null}
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

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
