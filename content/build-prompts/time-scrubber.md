Add the "Time Scrubber" component from Nexus UI to my project.

A time picker drawn as a ruler you drag or fling under a fixed needle. The ruler coasts and lands exactly on a snap point, the needle ticks at every interval it crosses and bounces when the ruler lands, the digits roll and a small sky chip shifts from night to dawn to day.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { TimeScrubber } from "@/components/time-scrubber";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/time-scrubber/index.ts ---

```ts
export { TimeScrubber } from "./time-scrubber";
export type { TimeScrubberProps } from "./time-scrubber";
```

--- components/time-scrubber/time-scrubber.tsx ---

```tsx
"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export type TimeScrubberProps = {
  /** Controlled value, in minutes since midnight (0-1439). */
  value?: number;
  /** Starting value when uncontrolled, in minutes since midnight. */
  defaultValue?: number;
  /** Called with the snapped time (minutes since midnight) whenever it changes. */
  onChange?: (minutes: number) => void;
  /** Called once the ruler comes to rest. */
  onCommit?: (minutes: number) => void;
  /** Minutes the ruler snaps to. */
  interval?: number;
  format?: "12h" | "24h";
  /** Colour of the centre needle. Defaults to system blue. */
  accent?: string;
  /** Pixels per minute on the ruler; larger spreads the hours out. */
  density?: number;
  /** Caption above the time, e.g. "Pickup". */
  label?: string;
  /** One-line hint under the ruler. Pass an empty string to hide it. */
  hint?: string;
  /** Flings the ruler to a few times of day until someone touches it. */
  autoplay?: boolean;
  disabled?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
};

const DAY = 24 * 60;
const DEMO = [13 * 60 + 15, 7 * 60 + 45, 19 * 60 + 30, 22 * 60 + 45, 10 * 60];
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function parts(minutes: number, format: "12h" | "24h") {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  if (format === "24h") return { main: `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`, period: "" };
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { main: `${h12}:${String(m).padStart(2, "0")}`, period: h24 < 12 ? "AM" : "PM" };
}

function hourLabel(h: number, format: "12h" | "24h") {
  if (format === "24h") return `${String(h % 24).padStart(2, "0")}:00`;
  const hh = h % 24;
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12} ${hh < 12 ? "AM" : "PM"}`;
}

/** Sky colours through the day: [hour, top, bottom]. */
const SKY: [number, number[], number[]][] = [
  [0, [20, 28, 58], [44, 52, 98]],
  [5, [44, 52, 98], [191, 90, 242]],
  [7, [255, 159, 10], [255, 214, 140]],
  [10, [90, 200, 250], [190, 232, 255]],
  [16, [64, 170, 250], [180, 222, 255]],
  [19, [255, 112, 67], [191, 90, 242]],
  [21, [40, 44, 92], [94, 60, 140]],
  [24, [20, 28, 58], [44, 52, 98]],
];
function skyAt(minutes: number) {
  const h = clamp(minutes / 60, 0, 24);
  let i = 0;
  while (i < SKY.length - 2 && SKY[i + 1][0] <= h) i++;
  const [h0, a0, b0] = SKY[i];
  const [h1, a1, b1] = SKY[i + 1];
  const t = (h - h0) / (h1 - h0 || 1);
  const mix = (a: number[], b: number[]) => a.map((v, k) => Math.round(v + (b[k] - v) * t)).join(",");
  return `linear-gradient(160deg, rgb(${mix(a0, a1)}), rgb(${mix(b0, b1)}))`;
}

/* Rolling digits */

function Digit({ digit, reduced }: { digit: number; reduced: boolean }) {
  const y = useSpring(-digit * 10, { stiffness: 320, damping: 24, mass: 0.5 });
  React.useEffect(() => {
    if (reduced) y.jump(-digit * 10);
    else y.set(-digit * 10);
  }, [digit, reduced, y]);
  const top = useTransform(y, (v) => `${v}%`);
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden leading-none [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)]">
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

function RollingTime({ text, reduced }: { text: string; reduced: boolean }) {
  const chars = text.split("");
  return (
    <span className="inline-flex items-center tabular-nums" aria-hidden="true">
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <Digit key={chars.length - i} digit={Number(c)} reduced={reduced} />
        ) : (
          <span key={`sep-${chars.length - i}`} className="mx-[0.02em] -translate-y-[0.05em] leading-none">
            {c}
          </span>
        ),
      )}
    </span>
  );
}

function SkyGlyph({ day }: { day: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <motion.g initial={false} animate={{ opacity: day ? 1 : 0, scale: day ? 1 : 0.4, rotate: day ? 0 : -90 }} transition={{ type: "spring", stiffness: 380, damping: 20 }} style={{ originX: "50%", originY: "50%" }}>
        <circle cx="8" cy="8" r="3.4" fill="#fff" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          const r3 = (n: number) => Math.round(n * 1000) / 1000;
          return <line key={i} x1={r3(8 + Math.cos(a) * 5.4)} y1={r3(8 + Math.sin(a) * 5.4)} x2={r3(8 + Math.cos(a) * 7)} y2={r3(8 + Math.sin(a) * 7)} stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />;
        })}
      </motion.g>
      <motion.path
        d="M10.8 11.6A5 5 0 0 1 6.3 3.2a5.2 5.2 0 1 0 6.4 7.1 5 5 0 0 1-1.9 1.3Z"
        fill="#fff"
        initial={false}
        animate={{ opacity: day ? 0 : 1, scale: day ? 0.4 : 1, rotate: day ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 20 }}
        style={{ originX: "50%", originY: "50%" }}
      />
    </svg>
  );
}

/**
 * A time picker drawn as a ruler you drag or fling under a fixed needle.
 * The ruler coasts and lands exactly on a snap point, the needle ticks at
 * every interval it crosses and bounces when the ruler lands, the digits
 * roll, and a small sky chip shifts from night to dawn to day.
 */
export function TimeScrubber({
  value: controlled,
  defaultValue = 9 * 60 + 30,
  onChange,
  onCommit,
  interval = 15,
  format = "12h",
  accent,
  density = 1.6,
  label,
  hint = "Drag the ruler, or fling it.",
  autoplay = false,
  disabled = false,
  enableSound = true,
  className,
}: TimeScrubberProps) {
  const reduced = useReducedMotion() ?? false;
  const play = useSound(enableSound);
  const lastTick = React.useRef(0);
  const maxMinute = DAY - interval;
  const snap = React.useCallback((m: number) => clamp(Math.round(m / interval) * interval, 0, maxMinute), [interval, maxMinute]);

  const [inner, setInner] = React.useState(() => snap(defaultValue));
  const value = snap(controlled ?? inner);
  const [shown, setShown] = React.useState(value);

  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [half, setHalf] = React.useState(140);
  const x = useMotionValue(half - value * density);
  const needle = useMotionValue(1);
  const anim = React.useRef<AnimationPlaybackControls | null>(null);
  const dragging = React.useRef(false);
  const touched = React.useRef(false);
  // True while the ruler is moving because autoplay sent it there.
  const autoMove = React.useRef(false);
  const lastEmitted = React.useRef(value);
  const lastShown = React.useRef(value);

  const sky = useTransform(x, (px) => skyAt((half - px) / density));

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setHalf(el.offsetWidth / 2);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const minutesAt = React.useCallback((px: number) => (half - px) / density, [half, density]);
  const pxFor = React.useCallback((m: number) => half - m * density, [half, density]);

  const kick = React.useCallback(
    (amount: number) => {
      if (reduced) return;
      needle.set(amount);
      animate(needle, 1, { type: "spring", stiffness: 700, damping: 12 });
    },
    [needle, reduced],
  );

  const emit = React.useCallback(
    (m: number, notify = true) => {
      if (m === lastEmitted.current) return;
      lastEmitted.current = m;
      if (controlled === undefined) setInner(m);
      if (notify) onChange?.(m);
    },
    [controlled, onChange],
  );

  useMotionValueEvent(x, "change", (px) => {
    const m = snap(minutesAt(px));
    if (m === lastShown.current) return;
    lastShown.current = m;
    setShown(m);
    if (dragging.current || anim.current) {
      kick(1.14);
      if (touched.current) {
        emit(m);
        const now = performance.now();
        if (now - lastTick.current >= 40) {
          lastTick.current = now;
          play("tick", 0.4);
        }
      } else if (autoMove.current) {
        const now = performance.now();
        if (now - lastTick.current >= 150) {
          lastTick.current = now;
          play.auto("tick", 0.3);
        }
      }
    }
  });

  const land = React.useCallback(
    (target: number, notify: boolean) => {
      anim.current = null;
      kick(1.4);
      emit(target, notify);
      if (notify) {
        play("drop", 0.4);
        onCommit?.(target);
      } else if (autoMove.current) {
        play.auto("drop", 0.4);
      }
      autoMove.current = false;
    },
    [emit, kick, onCommit, play],
  );

  const settleTo = React.useCallback(
    (target: number, notify = true, auto = false) => {
      anim.current?.stop();
      autoMove.current = auto;
      if (reduced) {
        x.set(pxFor(target));
        land(target, notify);
        return;
      }
      anim.current = animate(x, pxFor(target), {
        type: "spring",
        stiffness: 200,
        damping: 26,
        onComplete: () => land(target, notify),
      });
    },
    [reduced, x, pxFor, land],
  );

  // Keep the needle on the same minute when the ruler is resized.
  React.useLayoutEffect(() => {
    if (dragging.current || anim.current) return;
    x.jump(pxFor(lastEmitted.current));
  }, [half, density, x, pxFor]);

  // Follow controlled changes.
  React.useEffect(() => {
    if (dragging.current || anim.current) return;
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      settleTo(value, false);
    }
  }, [value, settleTo]);

  React.useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      settleTo(snap(DEMO[k++ % DEMO.length]), false, true);
    }, 2600);
    return () => clearInterval(t);
  }, [autoplay, settleTo, snap]);

  React.useEffect(() => () => anim.current?.stop(), []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button > 0) return;
    e.preventDefault();
    touched.current = true;
    autoMove.current = false;
    if (e.isTrusted) viewportRef.current?.focus({ preventScroll: true });
    anim.current?.stop();
    anim.current = null;
    dragging.current = true;
    const el = viewportRef.current;
    const scale = el ? el.getBoundingClientRect().width / el.offsetWidth || 1 : 1;
    const startX = e.clientX;
    const startPx = x.get();
    const lo = pxFor(maxMinute);
    const hi = pxFor(0);
    let lastX = e.clientX;
    let lastT = performance.now();
    let vel = 0;

    const move = (ev: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      vel = vel * 0.6 + ((ev.clientX - lastX) / scale / dt) * 1000 * 0.4;
      lastX = ev.clientX;
      lastT = now;
      let next = startPx + (ev.clientX - startX) / scale;
      // Rubber band past either end of the day.
      if (next > hi) next = hi + (next - hi) * 0.25;
      if (next < lo) next = lo + (next - lo) * 0.25;
      x.set(next);
    };
    const up = () => {
      dragging.current = false;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (performance.now() - lastT > 90) vel = 0; // held still before letting go
      if (reduced || Math.abs(vel) < 40) {
        settleTo(snap(minutesAt(x.get())));
        return;
      }
      anim.current = animate(x, [x.get()], {
        type: "inertia",
        velocity: vel,
        power: 0.35,
        timeConstant: 280,
        min: lo,
        max: hi,
        bounceStiffness: 260,
        bounceDamping: 28,
        restDelta: 0.5,
        modifyTarget: (t) => pxFor(snap(minutesAt(t))),
        onComplete: () => land(snap(minutesAt(x.get())), true),
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // Wheel and trackpad: one interval per notch.
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el || disabled) return;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      e.preventDefault();
      touched.current = true;
      acc += d;
      if (Math.abs(acc) < 28) return;
      const steps = Math.trunc(acc / 28);
      acc -= steps * 28;
      const base = anim.current ? lastEmitted.current : snap(minutesAt(x.get()));
      settleTo(snap(base + steps * interval));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [disabled, interval, minutesAt, settleTo, snap, x]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const base = anim.current ? lastEmitted.current : value;
    const map: Record<string, number> = {
      ArrowRight: base + interval,
      ArrowUp: base + interval,
      ArrowLeft: base - interval,
      ArrowDown: base - interval,
      PageUp: base + 60,
      PageDown: base - 60,
      Home: 0,
      End: maxMinute,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    touched.current = true;
    settleTo(snap(map[e.key]));
  };

  const { main, period } = parts(shown, format);
  const spokenParts = parts(value, format);
  const spoken = spokenParts.period ? `${spokenParts.main} ${spokenParts.period}` : spokenParts.main;
  const day = shown >= 6 * 60 && shown < 18 * 60;

  const ticks = React.useMemo(() => {
    const out: { m: number; kind: "hour" | "half" | "minor" }[] = [];
    for (let m = 0; m <= DAY; m += 5) out.push({ m, kind: m % 60 === 0 ? "hour" : m % 30 === 0 ? "half" : "minor" });
    return out;
  }, []);

  return (
    <div
      className={cn(
        "inline-flex w-[320px] max-w-full flex-col rounded-[24px] bg-white px-5 pb-4 pt-5 text-[#1d1d1f]",
        "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]",
        "dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]",
        !accent && "[--ts-accent:#0071e3] dark:[--ts-accent:#0a84ff]",
        disabled && "opacity-50",
        className,
      )}
      style={accent ? ({ "--ts-accent": accent } as React.CSSProperties) : undefined}
    >
      <div className="flex items-center gap-3">
        <motion.span className="grid size-9 shrink-0 place-items-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,.35)]" style={{ background: sky }} aria-hidden="true">
          <SkyGlyph day={day} />
        </motion.span>
        <div className="min-w-0">
          {label ? <span className="block text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{label}</span> : null}
          <div className="flex items-baseline gap-1.5 font-semibold">
            <span className="text-[40px] leading-none tracking-[-0.045em]">
              <RollingTime text={main} reduced={reduced} />
            </span>
            {period ? <span className="text-[15px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{period}</span> : null}
          </div>
        </div>
      </div>

      <div
        ref={viewportRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label ?? "Time"}
        aria-valuemin={0}
        aria-valuemax={maxMinute}
        aria-valuenow={value}
        aria-valuetext={spoken}
        aria-disabled={disabled || undefined}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className={cn(
          "relative mt-4 h-[64px] w-full cursor-grab touch-none select-none overflow-hidden rounded-[14px] bg-[#f5f5f7] outline-none active:cursor-grabbing dark:bg-[#2c2c2e]",
          "focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]",
          disabled && "cursor-not-allowed",
        )}
      >
        <div className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent,#000_20%,#000_80%,transparent)]">
          <motion.div className="absolute left-0 top-0 h-full" style={{ x }}>
            {ticks.map(({ m, kind }) => (
              <span
                key={m}
                aria-hidden="true"
                className={cn(
                  "absolute top-[8px] rounded-full",
                  kind === "hour" && "h-[22px] w-[2px] bg-[#1d1d1f] dark:bg-[#f5f5f7]",
                  kind === "half" && "h-[15px] w-px bg-[#1d1d1f]/45 dark:bg-[#f5f5f7]/45",
                  kind === "minor" && "h-[9px] w-px bg-[#1d1d1f]/20 dark:bg-[#f5f5f7]/22",
                )}
                style={{ left: m * density - (kind === "hour" ? 1 : 0.5) }}
              />
            ))}
            {ticks
              .filter((t) => t.kind === "hour" && t.m < DAY)
              .map(({ m }) => (
                <span
                  key={`l-${m}`}
                  aria-hidden="true"
                  className="absolute top-[38px] whitespace-nowrap text-[11px] font-medium tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]"
                  style={{ left: m * density, transform: "translateX(-50%)" }}
                >
                  {hourLabel(m / 60, format)}
                </span>
              ))}
          </motion.div>
        </div>
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[3px] block h-[32px] w-[3px] origin-top rounded-full bg-[var(--ts-accent)] shadow-[0_0_0_2px_#f5f5f7] dark:shadow-[0_0_0_2px_#2c2c2e]"
          style={{ x: "-50%", scaleY: needle }}
        />
      </div>
      {hint ? <span className="mt-2.5 text-center text-[12px] text-[#86868b] dark:text-[#98989d]">{hint}</span> : null}
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

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
