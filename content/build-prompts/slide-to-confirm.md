Add the "Slide to Confirm" component from Nexus UI to my project.

A slide-to-confirm track for payments and other deliberate actions. The knob stretches along the track in proportion to how fast you drag it and squashes back when it stops, the label shimmers and fades as you pull, and past the threshold the track floods with the success colour while a check draws itself.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { SlideToConfirm } from "@/components/slide-to-confirm";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/slide-to-confirm/index.ts ---

```ts
export { SlideToConfirm } from "./slide-to-confirm";
export type { SlideToConfirmProps, SlideToConfirmSize, SlideToConfirmStatus } from "./slide-to-confirm";
```

--- components/slide-to-confirm/slide-to-confirm.tsx ---

```tsx
"use client";

import * as React from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type AnimationPlaybackControls,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export type SlideToConfirmSize = "sm" | "md" | "lg";
export type SlideToConfirmStatus = "idle" | "confirming" | "success";

export type SlideToConfirmProps = {
  /** Text inside the track before confirming. */
  label?: string;
  /** Text shown once confirmed. */
  successLabel?: string;
  /** Text shown while `onConfirm` is pending. */
  pendingLabel?: string;
  /** Runs when the knob reaches the end. Return a promise to show a pending state until it settles; reject to bounce back. */
  onConfirm?: () => void | Promise<unknown>;
  /** How far (0-1) the knob must travel before letting go confirms. */
  threshold?: number;
  /** Return to the start this many ms after success. `0` keeps the success state. */
  resetAfter?: number;
  /** Colour of the trail behind the knob and the arrow. Defaults to system blue. */
  accent?: string;
  /** Track colour once confirmed. */
  successColor?: string;
  size?: SlideToConfirmSize;
  /** Track width in px. Defaults per size. */
  width?: number;
  /** Slides itself across and confirms (without calling `onConfirm`) until someone touches it. */
  autoplay?: boolean;
  disabled?: boolean;
  className?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
};

const SIZES: Record<SlideToConfirmSize, { h: number; knob: number; w: number; icon: number; text: string }> = {
  sm: { h: 48, knob: 40, w: 260, icon: 16, text: "text-[14px]" },
  md: { h: 60, knob: 52, w: 300, icon: 18, text: "text-[16px]" },
  lg: { h: 68, knob: 60, w: 340, icon: 20, text: "text-[17px]" },
};

function Arrow({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M10.5 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className="animate-spin" aria-hidden="true">
      <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="2.4" />
      <path d="M10 3a7 7 0 0 1 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function Check({ size, still }: { size: number; still: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <motion.path
        d="M4.5 10.5 8.3 14.2 15.5 6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={still ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.08 }}
      />
    </svg>
  );
}

/**
 * A slide-to-confirm track. The knob is rubbery: it stretches along the
 * track in proportion to how fast you drag it and squashes back when it
 * stops. A trail fills behind it, the label shimmers and fades as you pull,
 * and on release past the threshold the track floods with the success
 * colour while a check draws itself.
 */
export function SlideToConfirm({
  label = "Slide to confirm",
  successLabel = "Confirmed",
  pendingLabel = "Confirming",
  onConfirm,
  threshold = 0.9,
  resetAfter = 2200,
  accent,
  successColor = "#248a3d",
  size = "md",
  width,
  autoplay = false,
  disabled = false,
  className,
  enableSound = true,
}: SlideToConfirmProps) {
  const play = useSound(enableSound);
  const reduced = useReducedMotion() ?? false;
  const dims = SIZES[size];
  const trackW = width ?? dims.w;
  const pad = (dims.h - dims.knob) / 2;
  // The track may be squeezed below `trackW` by `max-w-full`; travel follows the real width.
  const [measured, setMeasured] = React.useState(trackW);
  const max = Math.max(1, Math.min(trackW, measured) - dims.knob - pad * 2);

  const [status, setStatus] = React.useState<SlideToConfirmStatus>("idle");
  const [dragging, setDragging] = React.useState(false);
  const [progressPct, setProgressPct] = React.useState(0);
  const x = useMotionValue(0);
  const shake = useMotionValue(0);
  const anim = React.useRef<AnimationPlaybackControls | null>(null);
  const resetTimer = React.useRef<number | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const touched = React.useRef(false);
  const statusRef = React.useRef(status);
  React.useLayoutEffect(() => {
    statusRef.current = status;
  }, [status]);
  const playRef = React.useRef(play);
  React.useEffect(() => {
    playRef.current = play;
  });

  const progress = useTransform(x, (v) => Math.max(0, Math.min(1, v / max)));
  const labelOpacity = useTransform(progress, [0, 0.45], [1, 0]);
  const labelX = useTransform(progress, [0, 1], [0, 26]);
  const trailWidth = useTransform(x, (v) => Math.max(0, v) + dims.knob + pad * 2);
  const trailOpacity = useTransform(progress, [0, 1], [0.1, 0.28]);
  const knobX = useTransform([x, shake], ([a, b]: number[]) => a + b);

  // Squash and stretch: speed stretches the knob along the track and thins it.
  const velocity = useVelocity(x);
  const stretchRaw = useTransform(velocity, (v) => (reduced ? 0 : Math.min(0.38, Math.abs(v) / 2600)));
  const stretch = useSpring(stretchRaw, { stiffness: 520, damping: 18 });
  const scaleX = useTransform(stretch, (s) => 1 + s);
  const scaleY = useTransform(stretch, (s) => 1 - s * 0.45);
  const originX = useTransform(velocity, (v) => (v < 0 ? 1 : 0));

  React.useEffect(() => progress.on("change", (p) => setProgressPct(Math.round(p * 100))), [progress]);

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setMeasured(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(
    () => () => {
      anim.current?.stop();
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const springTo = React.useCallback(
    (target: number, velocity = 0, onComplete?: () => void) => {
      anim.current?.stop();
      if (reduced) {
        x.set(target);
        onComplete?.();
        return;
      }
      anim.current = animate(x, target, { type: "spring", stiffness: 380, damping: 30, velocity, onComplete });
    },
    [reduced, x],
  );

  const reset = React.useCallback(() => {
    setStatus("idle");
    springTo(0);
  }, [springTo]);

  const succeed = React.useCallback(
    (after = resetAfter) => {
      setStatus("success");
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      if (after > 0) resetTimer.current = window.setTimeout(reset, after);
    },
    [resetAfter, reset],
  );

  const bounceBack = React.useCallback(() => {
    setStatus("idle");
    springTo(0);
    if (!reduced) animate(shake, [0, -8, 7, -4, 3, 0], { duration: 0.45 });
  }, [springTo, shake, reduced]);

  const confirm = React.useCallback(async () => {
    if (statusRef.current !== "idle") return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(12);
    const result = onConfirm?.();
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setStatus("confirming");
      try {
        await result;
        play("success");
        succeed();
      } catch {
        play("error");
        bounceBack();
      }
      return;
    }
    play("success");
    succeed();
  }, [onConfirm, succeed, bounceBack, play]);

  const finish = React.useCallback(() => {
    springTo(max, 0, () => void confirm());
  }, [springTo, max, confirm]);

  React.useEffect(() => {
    if (!autoplay) return;
    let run: AnimationPlaybackControls | undefined;
    let detent = 0;
    let lastTick = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      if (statusRef.current !== "idle") return;
      detent = 0;
      run = animate(x, max, {
        type: "spring",
        stiffness: 60,
        damping: 14,
        restDelta: 0.5,
        onUpdate: (v) => {
          // Same quarter-track ticks as a real drag.
          const d = Math.floor(Math.max(0, Math.min(1, v / max)) * 4);
          if (d === detent) return;
          detent = d;
          const now = performance.now();
          if (!touched.current && now - lastTick > 40) {
            lastTick = now;
            playRef.current.auto("tick", 0.4);
          }
        },
        onComplete: () => {
          if (touched.current) return;
          playRef.current.auto("success");
          succeed(1500);
        },
      });
    }, 3600);
    return () => {
      clearInterval(t);
      run?.stop();
    };
  }, [autoplay, x, max, succeed]);

  const interactive = !disabled && status === "idle";

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    touched.current = true;
    if (!interactive || e.button > 0) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.isTrusted) trackRef.current?.focus({ preventScroll: true });
    anim.current?.stop();
    x.stop();
    setDragging(true);
    const el = trackRef.current;
    const scale = el ? el.getBoundingClientRect().width / el.offsetWidth || 1 : 1;
    const startX = e.clientX;
    const startV = x.get();
    let lastX = e.clientX;
    let lastT = performance.now();
    let vel = 0;
    // A quiet tick each time the knob crosses a quarter of the track.
    const detentAt = (v: number) => Math.floor(Math.max(0, Math.min(1, v / max)) * 4);
    let detent = detentAt(startV);
    let lastTick = 0;

    const move = (ev: PointerEvent) => {
      const now = performance.now();
      vel = ((ev.clientX - lastX) / scale / Math.max(1, now - lastT)) * 1000;
      lastX = ev.clientX;
      lastT = now;
      let next = startV + (ev.clientX - startX) / scale;
      // Rubber band past either end.
      if (next < 0) next *= 0.2;
      if (next > max) next = max + (next - max) * 0.15;
      x.set(next);
      const d = detentAt(next);
      if (d !== detent) {
        detent = d;
        if (now - lastTick > 40) {
          lastTick = now;
          play("tick", 0.4);
        }
      }
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const reach = x.get() / max;
      // A confident flick near the end counts too.
      if (reach >= threshold || (reach > 0.6 && vel > 900)) finish();
      else springTo(0, vel);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // Keyboard: hold Enter or Space to slide across, or step with the arrow keys.
  const holding = React.useRef(false);
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    touched.current = true;
    if (!interactive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (e.repeat || holding.current) return;
      holding.current = true;
      anim.current?.stop();
      const remaining = 1 - x.get() / max;
      anim.current = animate(x, max, {
        duration: reduced ? 0 : 0.8 * remaining,
        ease: [0.4, 0, 0.6, 1],
        onComplete: () => {
          holding.current = false;
          void confirm();
        },
      });
      return;
    }
    const stepMap: Record<string, number> = { ArrowRight: 0.25, ArrowUp: 0.25, ArrowLeft: -0.25, ArrowDown: -0.25, Home: -1, End: 1 };
    if (!(e.key in stepMap)) return;
    e.preventDefault();
    const target = Math.max(0, Math.min(max, x.get() + stepMap[e.key] * max));
    if (target < max - 0.5 && Math.abs(target - x.get()) > 0.5) play("tick", 0.4);
    if (target >= max - 0.5) finish();
    else springTo(target);
  };
  const onKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === "Enter" || e.key === " ") && holding.current) {
      holding.current = false;
      if (x.get() < max - 0.5) springTo(0);
    }
  };

  const done = status === "success";
  const pending = status === "confirming";

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progressPct}
      aria-valuetext={done ? successLabel : pending ? pendingLabel : `${progressPct}%`}
      aria-disabled={disabled || undefined}
      aria-roledescription="slide to confirm"
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className={cn(
        "relative isolate inline-flex max-w-full shrink-0 select-none items-center overflow-hidden rounded-full outline-none",
        "bg-[#f0f0f3] shadow-[inset_0_1px_2px_rgba(0,0,0,.06)] dark:bg-[#2c2c2e] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,.4)]",
        "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]",
        !accent && "[--stc-accent:#0071e3] dark:[--stc-accent:#0a84ff]",
        disabled && "opacity-50",
        className,
      )}
      style={{ width: trackW, height: dims.h, "--stc-success": successColor, ...(accent ? { "--stc-accent": accent } : null) } as React.CSSProperties}
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 rounded-full bg-[var(--stc-accent)]"
        style={{ width: trailWidth, opacity: trailOpacity }}
      />
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        initial={false}
        animate={{ clipPath: done ? "inset(0 0% 0 0 round 999px)" : `inset(0 100% 0 0 round 999px)` }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 22 }}
        style={{ backgroundColor: successColor }}
      />

      <div
        className={cn("pointer-events-none absolute inset-0 flex items-center justify-center font-semibold tracking-[-0.01em]", dims.text)}
        style={{ paddingLeft: dims.knob + pad }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {done ? (
            <motion.span
              key="done"
              className="text-white"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 22 }}
              style={{ marginLeft: -(dims.knob + pad) / 2 }}
            >
              {successLabel}
            </motion.span>
          ) : pending ? (
            <motion.span key="pending" className="text-[#6e6e73] dark:text-[#a1a1a6]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {pendingLabel}
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.span
                className={cn(
                  "block bg-clip-text text-transparent",
                  "bg-[linear-gradient(100deg,#6e6e73_0%,#6e6e73_40%,#1d1d1f_50%,#6e6e73_60%,#6e6e73_100%)]",
                  "dark:bg-[linear-gradient(100deg,#a1a1a6_0%,#a1a1a6_40%,#ffffff_50%,#a1a1a6_60%,#a1a1a6_100%)]",
                )}
                style={{ backgroundSize: "250% 100%", opacity: labelOpacity, x: labelX }}
                animate={reduced || dragging ? undefined : { backgroundPositionX: ["100%", "-150%"] }}
                transition={{ duration: 2.6, ease: "linear", repeat: Infinity, repeatDelay: 0.3 }}
              >
                {label}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        aria-hidden="true"
        onPointerDown={onPointerDown}
        className={cn("absolute z-10 touch-none", interactive ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
        style={{ left: pad, width: dims.knob, height: dims.knob, x: knobX }}
      >
        <motion.div
          className={cn(
            "grid size-full place-items-center rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.12),0_6px_14px_-4px_rgba(0,0,0,.28)] dark:bg-[#f5f5f7]",
            done ? "text-[var(--stc-success)]" : "text-[var(--stc-accent)]",
          )}
          style={{ scaleX, scaleY, originX }}
          animate={{ scale: dragging ? 0.94 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 26 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status}
              className="grid place-items-center"
              initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 22 }}
            >
              {done ? <Check size={dims.icon + 2} still={reduced} /> : pending ? <Spinner size={dims.icon} /> : <Arrow size={dims.icon} />}
            </motion.span>
          </AnimatePresence>
        </motion.div>
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
