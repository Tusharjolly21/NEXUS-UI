# Toast Stack

Add the "Toast Stack" component from Nexus UI to my project.

Notifications that rest in a tidy stack: a new toast drops onto the pile squashed and springs into shape, and hover or focus fans the stack into a list. Fling a toast sideways and it tilts and skids off; with a duration set, the front toast counts down along its bottom edge and waits while the stack is open. Also includes Undo Toast, where an archived row shrinks into the toast, a ring counts down around Undo, and undo drops the row back in place. Also includes Promise Toast, a pill that follows a deploy step by step with progress filling behind the words and lands on a live link or an error with a way to the logs.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { ToastStack } from "@/components/toast-stack/toast-stack";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/toast-stack/toast-stack.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type PanInfo,
} from "framer-motion";
import { useSound, type SoundName } from "@/lib/ui-sounds";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  /** Optional action button, e.g. "Retry" or "Undo". */
  action?: { label: string };
};

export type ToastStackProps = {
  /** Toasts in the order they arrived; the last one sits at the front. */
  toasts: ToastItem[];
  /** Called when a toast is swiped away, closed, times out, or is dismissed with Escape. */
  onDismiss: (id: string) => void;
  /** Called when a toast's action button is pressed. */
  onAction?: (toast: ToastItem) => void;
  /** Which edge the stack grows from. */
  position?: "top" | "bottom";
  /** Fan the stack out on hover/focus, or keep it fanned out. */
  expand?: "hover" | "always";
  /** How many toasts are drawn at once. */
  max?: number;
  /** Width of each toast, in px. It shrinks to fit narrow containers. */
  width?: number;
  /** Dismiss the front toast after this many ms (paused while the stack is open). 0 keeps toasts until closed. */
  duration?: number;
  /** Fans the stack open and swipes the front toast away every few seconds until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
};

const H = 64;
const GAP = 8;
const PEEK = 12;
const SWIPE_DISTANCE = 90;
const SWIPE_VELOCITY = 600;
const LAND = { type: "spring" as const, stiffness: 420, damping: 22, mass: 0.9 };
const FAN = { type: "spring" as const, stiffness: 360, damping: 30 };

const TONE: Record<ToastType, string> = {
  success: "#30d158",
  error: "#ff3b30",
  info: "#0a84ff",
  warning: "#ff9f0a",
};

function Icon({ type }: { type: ToastType }) {
  const glyph: Record<ToastType, ReactNode> = {
    success: <path d="M6.2 10.3 8.8 12.8 13.8 7.4" />,
    error: <path d="M7.5 7.5 12.5 12.5M12.5 7.5 7.5 12.5" />,
    info: <path d="M10 9.2V13.6M10 6.6V6.7" />,
    warning: <path d="M10 6.2V10.8M10 13.5V13.6" />,
  };
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <circle cx="10" cy="10" r="9" fill={TONE[type]} />
      <g fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {glyph[type]}
      </g>
    </svg>
  );
}

const ARRIVAL: Record<ToastType, SoundName> = { success: "success", error: "error", info: "ping", warning: "ping" };

/**
 * Small state helper: `push` adds a toast at the front and returns its id. Pass `{ sound: true }` as the
 * second argument when the toast answers something the user did; it then plays a ping (a rising tone for
 * success, a bump for error). Toasts pushed without it stay silent.
 */
export function useToastStack(initial: ToastItem[] = [], options: { enableSound?: boolean } = {}) {
  const [toasts, setToasts] = useState<ToastItem[]>(initial);
  const counter = useRef(0);
  const play = useSound(options.enableSound ?? true);
  const push = useCallback(
    (toast: Omit<ToastItem, "id"> & { id?: string }, opts?: { sound?: boolean }) => {
      counter.current += 1;
      const id = toast.id ?? `toast-${counter.current}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((list) => [...list.filter((t) => t.id !== id), { ...toast, id }]);
      if (opts?.sound) play(ARRIVAL[toast.type ?? "info"]);
      return id;
    },
    [play],
  );
  const dismiss = useCallback((id: string) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const clear = useCallback(() => setToasts([]), []);
  return { toasts, push, dismiss, clear };
}

function Toast({
  toast,
  i,
  expanded,
  sign,
  width,
  max,
  reduce,
  bottom,
  duration,
  autoSwipe,
  enableSound,
  onDismiss,
  onAction,
}: {
  toast: ToastItem;
  i: number;
  expanded: boolean;
  sign: number;
  width: number;
  max: number;
  reduce: boolean;
  bottom: boolean;
  duration: number;
  autoSwipe: number;
  enableSound: boolean;
  onDismiss: (dir: number) => void;
  onAction?: (toast: ToastItem) => void;
}) {
  const type = toast.type ?? "info";
  const play = useSound(enableSound);
  const front = i === 0;
  const x = useMotionValue(0);
  const tilt = useTransform(x, [-220, 0, 220], [-7, 0, 7]);
  const fade = useTransform(x, [-260, -80, 0, 80, 260], [0.2, 1, 1, 1, 0.2]);
  const life = useMotionValue(1);
  const lifeRun = useRef<AnimationPlaybackControls | undefined>(undefined);
  const y = sign * i * (expanded ? H + GAP : PEEK);
  const scale = expanded ? 1 : 1 - i * 0.05;
  const draggable = !reduce && (expanded || front);
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  });

  // Auto-dismiss: only the front toast counts down, and it waits while the stack is open.
  useEffect(() => {
    if (!duration || !front || expanded) return;
    const left = life.get() * duration;
    lifeRun.current = animate(life, 0, {
      duration: left / 1000,
      ease: "linear",
      onComplete: () => dismissRef.current(0),
    });
    return () => lifeRun.current?.stop();
  }, [duration, front, expanded, life]);

  // Autoplay swipe: fling the front toast off to the right.
  const seen = useRef(autoSwipe);
  useEffect(() => {
    if (autoSwipe === seen.current) return;
    seen.current = autoSwipe;
    if (!front) return;
    animate(x, [0, 26, 0], { duration: 0.35 });
    const t = window.setTimeout(() => {
      play.auto("swipe");
      dismissRef.current(1);
    }, 380);
    return () => window.clearTimeout(t);
  }, [autoSwipe, front, x, play]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY) {
      play("swipe");
      onDismiss(Math.sign(info.offset.x || info.velocity.x) || 1);
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  };

  return (
    <motion.li
      layout={false}
      role={type === "error" ? "alert" : "status"}
      tabIndex={0}
      aria-label={`${toast.title}${toast.description ? `. ${toast.description}` : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          play("swipe", 0.6);
          onDismiss(0);
        }
      }}
      variants={{
        exit: (dirs: Record<string, number>) => {
          const dir = dirs?.[toast.id] ?? 0;
          return reduce
            ? { opacity: 0, transition: { duration: 0.15 } }
            : dir
              ? { x: dir * (width + 80), opacity: 0, rotate: dir * 9, transition: { type: "spring", stiffness: 260, damping: 30 } }
              : { opacity: 0, scale: 0.9, y: y - sign * 10, transition: { duration: 0.18 } };
        },
      }}
      // Arrives squashed, as if it dropped onto the stack, then springs into shape.
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -sign * 34, scaleX: 1.05, scaleY: 0.86 }}
      animate={{ opacity: !expanded && i > 2 ? 0 : 1, y, scaleX: scale, scaleY: scale }}
      exit="exit"
      transition={reduce ? { duration: 0 } : front ? LAND : FAN}
      className={`absolute inset-x-0 outline-none ${bottom ? "bottom-0 origin-bottom" : "top-0 origin-top"} rounded-[18px] focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f7] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black`}
      style={{ height: H, zIndex: max - i }}
    >
      <motion.div
        drag={draggable ? "x" : false}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        style={{ x, rotate: tilt, opacity: fade, touchAction: "pan-y" }}
        className={`relative flex h-full select-none items-center gap-3 overflow-hidden rounded-[18px] bg-white px-3.5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_14px_32px_-20px_rgba(0,0,0,.4)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_14px_32px_-20px_rgba(0,0,0,.9)] ${
          draggable ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        <motion.div
          className="flex min-w-0 flex-1 items-center gap-3"
          animate={{ opacity: expanded || front ? 1 : 0 }}
          transition={{ duration: 0.18 }}
        >
          <Icon type={type} />
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-[14px] font-semibold leading-tight tracking-[-0.01em]">{toast.title}</p>
            {toast.description ? <p className="m-0 mt-0.5 truncate text-[13px] leading-tight text-[#6e6e73] dark:text-[#a1a1a6]">{toast.description}</p> : null}
          </div>
          {toast.action ? (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                play("tap");
                onAction?.(toast);
              }}
              className="h-7 shrink-0 rounded-full bg-[#f0f0f3] px-3 text-[13px] font-medium text-[#1d1d1f] outline-none transition-colors hover:bg-[#e6e6ea] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:hover:bg-[#48484a] dark:focus-visible:ring-[#0a84ff]"
            >
              {toast.action.label}
            </button>
          ) : null}
          <button
            type="button"
            aria-label={`Dismiss ${toast.title}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              play("swipe", 0.6);
              onDismiss(0);
            }}
            className="grid size-6 shrink-0 place-items-center rounded-full text-[#86868b] outline-none transition-colors hover:bg-[#f0f0f3] hover:text-[#1d1d1f] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#a1a1a6] dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M1.5 1.5 8.5 8.5M8.5 1.5 1.5 8.5" />
            </svg>
          </button>
        </motion.div>
        {duration > 0 && front ? (
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[2px] origin-left"
            style={{ scaleX: life, background: TONE[type], opacity: 0.7 }}
          />
        ) : null}
      </motion.div>
    </motion.li>
  );
}

/**
 * Notifications that rest in a tidy stack. A new toast drops onto the pile
 * squashed and springs into shape; hover or focus fans the stack into a list;
 * fling a toast sideways and it tilts and skids off. Escape dismisses the
 * focused toast.
 */
export function ToastStack({
  toasts,
  onDismiss,
  onAction,
  position = "bottom",
  expand = "hover",
  max = 3,
  width = 340,
  duration = 0,
  autoplay = false,
  enableSound = true,
  className = "",
}: ToastStackProps) {
  const reduce = useReducedMotion() === true;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [swipe, setSwipe] = useState(0);
  const [exitDirs, setExitDirs] = useState<Record<string, number>>({});
  const touched = useRef(false);
  const expanded = expand === "always" || hovered || focused || demoOpen;
  const sign = position === "bottom" ? -1 : 1;

  const visible = [...toasts].reverse().slice(0, Math.max(1, max));
  const n = visible.length;
  const height = n === 0 ? 0 : expanded ? n * H + (n - 1) * GAP : H + (n - 1) * PEEK;

  const dismiss = (id: string, dir = 0) => {
    setExitDirs((d) => ({ ...d, [id]: dir }));
    onDismiss(id);
  };

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        setDemoOpen(false);
        return;
      }
      const beat = k++ % 3;
      if (beat === 0) setDemoOpen(true);
      if (beat === 1) setDemoOpen(false);
      if (beat === 2) setSwipe((s) => s + 1);
    }, 1500);
    return () => window.clearInterval(t);
  }, [autoplay]);

  const touch = () => {
    if (touched.current) return;
    touched.current = true;
    setDemoOpen(false);
  };

  return (
    <section
      aria-label="Notifications"
      className={`relative max-w-full ${className}`}
      style={{ width }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={touch}
      onFocus={() => {
        touch();
        setFocused(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <motion.ol
        aria-live="polite"
        className="relative m-0 list-none p-0"
        initial={false}
        animate={{ height }}
        transition={reduce ? { duration: 0 } : FAN}
      >
        <AnimatePresence initial={false} custom={exitDirs}>
          {visible.map((toast, i) => (
            <Toast
              key={toast.id}
              toast={toast}
              i={i}
              expanded={expanded}
              sign={sign}
              width={width}
              max={max}
              reduce={reduce}
              bottom={position === "bottom"}
              duration={duration}
              autoSwipe={swipe}
              enableSound={enableSound}
              onDismiss={(dir) => dismiss(toast.id, dir)}
              onAction={onAction}
            />
          ))}
        </AnimatePresence>
      </motion.ol>
    </section>
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

# Undo Toast

Add the "Undo Toast" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { UndoToast } from "@/components/toast-stack/undo-toast";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/toast-stack/undo-toast.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface UndoToastMail {
  id: number;
  from: string;
  subject: string;
  time: string;
  /** Avatar colour. */
  hue: string;
}

export interface UndoToastProps {
  /** The rows in the list. Defaults to a small demo inbox of four messages. */
  mails?: UndoToastMail[];
  /** How long the toast waits for an Undo, in ms. Hovering or focusing the toast pauses the countdown. */
  holdMs?: number;
  /** Called when a row is archived. */
  onArchive?: (mail: UndoToastMail) => void;
  /** Called with the archived rows when Undo is pressed. */
  onUndo?: (mails: UndoToastMail[]) => void;
  /** Archives a row and undoes it on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

const INBOX: UndoToastMail[] = [
  { id: 1, from: "Maya Chen", subject: "Q3 roadmap, final draft", time: "9:41", hue: "#ff9f0a" },
  { id: 2, from: "Stripe", subject: "Your payout is on the way", time: "9:12", hue: "#5e5ce6" },
  { id: 3, from: "Leo Park", subject: "Pricing page feedback", time: "Yesterday", hue: "#0a84ff" },
  { id: 4, from: "Linear", subject: "3 issues assigned to you", time: "Yesterday", hue: "#30d158" },
];
const HOLD = 5000;
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

type Ghost = { mail: UndoToastMail; x: number; y: number; w: number; h: number; tx: number; ty: number; tw: number };

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
 * Archive with a real undo. The row you archive lifts out of the list and
 * shrinks down into the toast, so you can see where it went. A ring around
 * Undo counts down; press it and the row drops back into its old place with
 * a brief highlight. Archive several in a row and the toast counts them up.
 */
export function UndoToast({ mails = INBOX, holdMs = HOLD, onArchive, onUndo, autoplay = false, enableSound = true, className = "" }: UndoToastProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [list, setList] = useState(mails);
  const [batch, setBatch] = useState<UndoToastMail[]>([]);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [toastKey, setToastKey] = useState(0);
  const [restored, setRestored] = useState<number[]>([]);
  const [hover, setHover] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const rows = useRef(new Map<number, HTMLLIElement>());
  const timer = useRef<number | undefined>(undefined);
  const restoreTimer = useRef<number | undefined>(undefined);
  const touched = useRef(false);
  const paused = hover || focusIn;
  const active = useDemoActive(box, autoplay && !reduce);

  const archive = (m: UndoToastMail) => {
    const el = rows.current.get(m.id);
    const b = box.current;
    if (el && b && !reduce) {
      const r = el.getBoundingClientRect();
      const c = b.getBoundingClientRect();
      const tw = Math.min(300, c.width - 24);
      setGhost({ mail: m, x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height, tx: c.width / 2 - tw / 2, ty: c.height - 72, tw });
    }
    setBatch((bt) => [...bt, m]);
    setList((l) => l.filter((x) => x.id !== m.id));
    setToastKey((k) => k + 1);
    onArchive?.(m);
  };
  const undo = () => {
    if (!batch.length) return;
    // Put them back in the order they were archived, at their old positions.
    const back = new Set(batch.map((m) => m.id));
    setList((l) => mails.filter((x) => back.has(x.id) || l.some((y) => y.id === x.id)));
    setRestored(batch.map((m) => m.id));
    onUndo?.(batch);
    setBatch([]);
    window.clearTimeout(restoreTimer.current);
    restoreTimer.current = window.setTimeout(() => setRestored([]), 900);
  };

  useEffect(() => () => window.clearTimeout(restoreTimer.current), []);

  // The toast times out unless you hover or focus it.
  useEffect(() => {
    if (!batch.length || paused) return;
    timer.current = window.setTimeout(() => setBatch([]), holdMs);
    return () => window.clearTimeout(timer.current);
  }, [batch.length, toastKey, paused, holdMs]);

  // The demo reads the latest list and handlers through a ref.
  const latest = useRef({ archive, undo, list });
  useEffect(() => {
    latest.current = { archive, undo, list };
  });

  // Demo: archive a row, then undo it.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    let alive = true;
    let archived = false;
    const run = () => {
      if (!alive || touched.current) return;
      ids.push(
        window.setTimeout(() => {
          if (touched.current) return;
          const m = latest.current.list[1];
          if (m) {
            archived = true;
            play.auto("ping");
            latest.current.archive(m);
          }
        }, 1400),
      );
      ids.push(
        window.setTimeout(() => {
          if (touched.current) return;
          if (archived) play.auto("drop");
          archived = false;
          latest.current.undo();
        }, 3600),
      );
      ids.push(window.setTimeout(run, 6200));
    };
    run();
    return () => {
      alive = false;
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, [autoplay, reduce, active, play]);

  const count = batch.length;
  const last = batch[batch.length - 1];
  const summary = count === 0 ? "" : count > 1 ? `${count} conversations archived` : `Archived ${last?.subject ?? ""}`;
  const pop = reduce ? { duration: 0.15 } : { type: "spring" as const, stiffness: 420, damping: 30, delay: ghost ? 0.3 : 0 };

  return (
    <div
      ref={box}
      className={`relative w-[400px] max-w-full overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">Inbox</h3>
        <button
          type="button"
          onClick={() => {
            touched.current = true;
            setList(mails);
            setBatch([]);
          }}
          className={`rounded text-[13px] font-medium text-[#0071e3] hover:underline dark:text-[#0a84ff] ${FOCUS}`}
        >
          Reset
        </button>
      </div>
      <ul className="m-0 min-h-[300px] list-none px-2 pb-24 pt-1">
        <AnimatePresence initial={false}>
          {list.map((m) => (
            <motion.li
              key={m.id}
              ref={(el) => {
                if (el) rows.current.set(m.id, el);
                else rows.current.delete(m.id);
              }}
              layout={!reduce}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, transition: { duration: reduce ? 0.12 : 0.25, ease: [0.4, 0, 0.2, 1] } }}
              transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 380, damping: 34 }}
              className="group relative overflow-hidden rounded-[14px]"
            >
              {/* the highlight a restored row flashes */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[#0071e3]/[.08] dark:bg-[#0a84ff]/[.16]"
                initial={false}
                animate={{ opacity: restored.includes(m.id) ? 1 : 0 }}
                transition={{ duration: 0.6 }}
              />
              <div className="relative flex items-center gap-3 px-3 py-2.5">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[14px] font-semibold text-white" style={{ background: m.hue }}>
                  {m.from[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between gap-2 text-[14px]">
                    <span className="truncate font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{m.from}</span>
                    <span className="flex-none text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{m.time}</span>
                  </span>
                  <span className="block truncate text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{m.subject}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    touched.current = true;
                    play("ping");
                    archive(m);
                  }}
                  aria-label={`Archive ${m.subject}`}
                  className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-[#6e6e73] opacity-60 transition hover:bg-[#f5f5f7] hover:text-[#1d1d1f] focus-visible:opacity-100 group-hover:opacity-100 dark:text-[#a1a1a6] dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7] ${FOCUS}`}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="5" rx="1.5" />
                    <path d="M5 9v9a2 2 0 002 2h10a2 2 0 002-2V9M10 13h4" />
                  </svg>
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {!list.length && <li className="py-16 text-center text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">All caught up</li>}
      </ul>

      {/* the archived row, flying down into the toast */}
      <AnimatePresence>
        {ghost && (
          <motion.div
            key={`${ghost.mail.id}-${toastKey}`}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-20 flex items-center gap-3 overflow-hidden bg-white px-3 shadow-[0_12px_30px_-10px_rgba(0,0,0,.35),0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#2c2c2e] dark:shadow-[0_12px_30px_-10px_rgba(0,0,0,.8),0_0_0_1px_rgba(255,255,255,.08)]"
            initial={{ x: ghost.x, y: ghost.y, width: ghost.w, height: ghost.h, borderRadius: 14, opacity: 1 }}
            animate={{ x: ghost.tx, y: ghost.ty, width: ghost.tw, height: 52, borderRadius: 26, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.3, 0, 0.2, 1], opacity: { duration: 0.2, delay: 0.32 } }}
            onAnimationComplete={() => setGhost(null)}
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[14px] font-semibold text-white" style={{ background: ghost.mail.hue }}>
              {ghost.mail.from[0]}
            </span>
            <span className="truncate text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{ghost.mail.from}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only" role="status" aria-live="polite">
        {summary}
      </span>

      {/* the toast */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center px-3">
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              key="toast"
              layout={!reduce}
              role="group"
              aria-label="Archive undo"
              className="pointer-events-auto flex h-[52px] max-w-full items-center gap-3 rounded-full bg-[#1d1d1f] pl-5 pr-1.5 text-white shadow-[0_18px_40px_-14px_rgba(0,0,0,.6)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_18px_40px_-14px_rgba(0,0,0,.9)]"
              initial={reduce ? { opacity: 0 } : { y: 30, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : { y: 30, opacity: 0, scale: 0.95, transition: { duration: 0.22 } }}
              transition={pop}
              onPointerEnter={() => setHover(true)}
              onPointerLeave={() => setHover(false)}
              onFocus={() => setFocusIn(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusIn(false);
              }}
            >
              <motion.span layout={!reduce} aria-hidden="true" className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[14px]">
                <span className="relative inline-flex h-[1.3em] overflow-hidden tabular-nums">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={count} initial={reduce ? false : { y: "100%" }} animate={{ y: 0 }} exit={reduce ? { opacity: 0 } : { y: "-100%" }} transition={{ type: "spring", stiffness: 500, damping: 34 }}>
                      {count > 1 ? count : ""}
                    </motion.span>
                  </AnimatePresence>
                </span>
                {count > 1 ? (
                  "conversations archived"
                ) : (
                  <>
                    Archived <span className="max-w-[84px] truncate text-white/60 min-[420px]:max-w-[120px]">{last?.subject}</span>
                  </>
                )}
              </motion.span>
              <motion.button
                layout={!reduce}
                type="button"
                onClick={() => {
                  touched.current = true;
                  play("drop");
                  undo();
                }}
                className="relative flex h-10 flex-none items-center gap-2 rounded-full bg-white/10 pl-2 pr-4 text-[14px] font-semibold hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="2" />
                  <motion.circle
                    key={`${toastKey}${paused ? "h" : ""}`}
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 1 }}
                    animate={{ pathLength: paused ? 1 : 0 }}
                    transition={{ duration: paused ? 0.2 : holdMs / 1000, ease: "linear" }}
                  />
                </svg>
                Undo
              </motion.button>
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

# Promise Toast

Add the "Promise Toast" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { PromiseToast } from "@/components/toast-stack/promise-toast";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/toast-stack/promise-toast.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface PromiseToastProps {
  /** Called when "Visit" is pressed on the success toast. Nothing navigates on its own. */
  onVisit?: () => void;
  /** Called when "View logs" is pressed on the failure toast. */
  onViewLogs?: () => void;
  /** Runs a good deploy, then one with a bug, on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the wrapper. */
  className?: string;
}

type Step = { label: string; to: number; ms: number };
const STEPS: Step[] = [
  { label: "Installing dependencies", to: 0.22, ms: 900 },
  { label: "Building 48 pages", to: 0.64, ms: 1500 },
  { label: "Uploading to the edge", to: 0.92, ms: 1000 },
];
type Run = { id: number; fail: boolean; step: number; progress: number; state: "running" | "ok" | "fail" };

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const FOCUS_ON_DARK = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

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

function Icon({ state }: { state: Run["state"] }) {
  return (
    <span className="relative flex h-6 w-6 flex-none items-center justify-center" aria-hidden="true">
      <AnimatePresence mode="popLayout" initial={false}>
        {state === "running" && (
          <motion.svg key="spin" width="22" height="22" viewBox="0 0 24 24" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1, rotate: 360 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ rotate: { duration: 0.9, repeat: Infinity, ease: "linear" } }}>
            <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2.5" />
            <path d="M12 3a9 9 0 019 9" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </motion.svg>
        )}
        {state === "ok" && (
          <motion.svg key="ok" width="22" height="22" viewBox="0 0 24 24" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
            <circle cx="12" cy="12" r="11" fill="#30d158" />
            <motion.path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.12, duration: 0.3 }} />
          </motion.svg>
        )}
        {state === "fail" && (
          <motion.svg key="no" width="22" height="22" viewBox="0 0 24 24" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
            <circle cx="12" cy="12" r="11" fill="#ff453a" />
            <motion.path d="M8.5 8.5l7 7M15.5 8.5l-7 7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.12, duration: 0.3 }} />
          </motion.svg>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * A toast that follows a promise from start to finish instead of popping up
 * at the end. The pill shows each step as it happens with its own progress
 * filling behind the text, resizes smoothly as the wording changes, and lands
 * on success with the live link and actions, or on failure with the error
 * count and a way to the logs.
 */
export function PromiseToast({ onVisit, onViewLogs, autoplay = false, enableSound = true, className = "" }: PromiseToastProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [run, setRun] = useState<Run | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const touched = useRef(false);
  const nextFail = useRef(false);
  const runId = useRef(0);
  const active = useDemoActive(root, autoplay && !reduce);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clear, []);

  // `audible` is true for runs the user started; the autoplay loop answers through `play.auto`.
  const start = (fail: boolean, audible = false) => {
    clear();
    runId.current += 1;
    const id = runId.current;
    setRun({ id, fail, step: 0, progress: 0.04, state: "running" });
    let t = 120;
    STEPS.forEach((s, i) => {
      if (fail && i === 2) return;
      timers.current.push(window.setTimeout(() => setRun((r) => (r && r.id === id ? { ...r, step: i, progress: s.to } : r)), t));
      t += s.ms;
    });
    timers.current.push(
      window.setTimeout(() => {
        setRun((r) => (r && r.id === id ? { ...r, progress: fail ? r.progress : 1, state: fail ? "fail" : "ok" } : r));
        if (audible) play(fail ? "error" : "success");
        else play.auto(fail ? "error" : "success");
      }, t),
    );
    timers.current.push(window.setTimeout(() => setRun((r) => (r && r.id === id ? null : r)), t + 4200));
  };

  const startRef = useRef(start);
  useEffect(() => {
    startRef.current = start;
  });

  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const go = () => {
      if (touched.current) return;
      play.auto("ping");
      startRef.current(nextFail.current);
      nextFail.current = !nextFail.current;
    };
    const first = window.setTimeout(go, 700);
    const id = window.setInterval(go, 8200);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [autoplay, reduce, active, play]);

  const label = !run ? "" : run.state === "ok" ? "Deployed to production" : run.state === "fail" ? "Build failed with 2 errors" : STEPS[run.step].label;
  const fill = run?.state === "fail" ? "rgba(255,69,58,.28)" : run?.state === "ok" ? "rgba(48,209,88,.24)" : "rgba(255,255,255,.12)";
  const settle = reduce ? { duration: 0.15 } : { type: "spring" as const, stiffness: 380, damping: 30, x: { duration: 0.4 } };

  return (
    <div
      ref={root}
      className={`flex w-[420px] max-w-full flex-col items-center gap-6 ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="relative flex h-[200px] w-full items-end justify-center overflow-hidden rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.3)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]">
        <span className="absolute left-5 top-4 text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">nexus-ui / marketing-site</span>
        <span className="sr-only" role="status" aria-live="polite">
          {label}
        </span>
        <AnimatePresence>
          {run && (
            <motion.div
              key={run.id}
              layout={!reduce}
              role="group"
              aria-label="Deploy progress"
              className="relative max-w-full overflow-hidden bg-[#1d1d1f] text-white shadow-[0_20px_40px_-16px_rgba(0,0,0,.55)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_20px_40px_-16px_rgba(0,0,0,.9)]"
              style={{ borderRadius: 26 }}
              initial={reduce ? { opacity: 0 } : { y: 40, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1, x: run.state === "fail" && !reduce ? [0, -8, 7, -4, 0] : 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : { y: 24, opacity: 0, scale: 0.95, filter: "blur(4px)", transition: { duration: 0.25 } }}
              transition={settle}
            >
              {/* progress lives behind the words */}
              <motion.span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-full origin-left"
                style={{ background: fill }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: run.state === "running" ? run.progress : 1, opacity: run.state === "running" ? 1 : [1, 1, 0.5] }}
                transition={{ scaleX: reduce ? { duration: 0.15 } : { type: "spring", stiffness: 60, damping: 20 }, opacity: { duration: 1.2 } }}
              />
              <motion.div layout={reduce ? false : "position"} className="relative flex items-center gap-3 py-3 pl-3.5 pr-5">
                <Icon state={run.state} />
                <span className="relative block h-[20px] min-w-0 overflow-hidden" aria-hidden="true">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={label}
                      className="block whitespace-nowrap text-[14.5px] font-medium leading-[20px]"
                      initial={reduce ? { opacity: 0 } : { y: 16, opacity: 0, filter: "blur(4px)" }}
                      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                      exit={reduce ? { opacity: 0 } : { y: -16, opacity: 0, filter: "blur(4px)" }}
                      transition={{ type: "spring", stiffness: 420, damping: 34, filter: { duration: 0.2 } }}
                    >
                      {label}
                    </motion.span>
                  </AnimatePresence>
                </span>
                {run.state === "running" && (
                  <motion.span layout={!reduce} aria-hidden="true" className="ml-1 text-[13px] tabular-nums text-white/50">
                    {Math.round(run.progress * 100)}%
                  </motion.span>
                )}
              </motion.div>
              <AnimatePresence initial={false}>
                {run.state !== "running" && (
                  <motion.div layout={!reduce} className="relative flex items-center gap-2 px-3.5 pb-3" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }} exit={{ opacity: 0 }}>
                    {run.state === "ok" ? (
                      <>
                        <span className="mr-auto min-w-0 truncate rounded-full bg-white/10 px-3 py-1.5 font-mono text-[12px] text-white/80">marketing.nexus.app</span>
                        <button type="button" onClick={() => onVisit?.()} className={`h-8 flex-none rounded-full bg-white px-3.5 text-[13px] font-semibold text-[#1d1d1f] ${FOCUS_ON_DARK}`}>
                          Visit
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="mr-auto min-w-0 truncate font-mono text-[12px] text-[#ff9f9a]">pricing.tsx:42 · Unexpected token</span>
                        <button type="button" onClick={() => onViewLogs?.()} className={`h-8 flex-none rounded-full bg-white/10 px-3.5 text-[13px] font-semibold hover:bg-white/15 ${FOCUS_ON_DARK}`}>
                          View logs
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <motion.button
          type="button"
          whileTap={reduce ? undefined : { scale: 0.95 }}
          onClick={() => {
            touched.current = true;
            play("ping");
            start(false, true);
          }}
          className={`h-10 rounded-full bg-[#1d1d1f] px-5 text-[14px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f] ${FOCUS}`}
        >
          Deploy
        </motion.button>
        <motion.button
          type="button"
          whileTap={reduce ? undefined : { scale: 0.95 }}
          onClick={() => {
            touched.current = true;
            play("ping");
            start(true, true);
          }}
          className={`h-10 rounded-full bg-white px-5 text-[14px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] ${FOCUS}`}
        >
          Deploy with a bug
        </motion.button>
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
