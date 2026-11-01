Add the "Dynamic Island" component from Nexus UI to my project.

A black pill that grows into whatever is happening: a running timer, the song that is playing or an incoming call. Each change stretches it, the width shooting out first and the height catching up on a looser spring, and tapping it opens live controls.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { DynamicIsland } from "@/components/dynamic-island";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/dynamic-island/dynamic-island.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type Transition } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export type IslandState = "idle" | "timer" | "music" | "call";

export type DynamicIslandProps = {
  /** Controlled activity. */
  state?: IslandState;
  /** Starting activity when uncontrolled. */
  defaultState?: IslandState;
  /** Called whenever the island asks to change activity (stop, decline, a cycle step). */
  onStateChange?: (state: IslandState) => void;
  /** Length of the timer, in seconds. It really ticks. */
  timerSeconds?: number;
  /** Accent colour for the timer and the music bars. */
  accent?: string;
  /** Uncontrolled only: step through `states` every this many ms. 0 stays put. */
  cycle?: number;
  /** Activities visited by `cycle` and autoplay. */
  states?: IslandState[];
  /** Track shown in the music activity. */
  track?: { title: string; artist: string };
  /** Name shown in the call activity. */
  caller?: string;
  /** Morphs through the activities and opens each one, until someone touches it. Uncontrolled only. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
};

const SIZE: Record<IslandState, { compact: [number, number]; open: [number, number] }> = {
  idle: { compact: [126, 37], open: [126, 37] },
  timer: { compact: [214, 37], open: [352, 88] },
  music: { compact: [214, 37], open: [352, 164] },
  call: { compact: [236, 37], open: [352, 88] },
};

/** Width leads, height follows a beat later on a looser spring: that lag is what makes it stretch. */
const W_SPRING: Transition = { type: "spring", stiffness: 420, damping: 30, mass: 0.9 };
const H_SPRING: Transition = { type: "spring", stiffness: 260, damping: 19, mass: 0.9, delay: 0.04 };

function format(total: number) {
  const s = Math.max(0, Math.ceil(total));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

/** Counts down from `seconds` while running; loops back to the start at 0:00 so a demo never stalls. */
function useCountdown(seconds: number, active: boolean) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(true);
  const [prevSeconds, setPrevSeconds] = useState(seconds);
  const leftRef = useRef(seconds);

  if (seconds !== prevSeconds) {
    setPrevSeconds(seconds);
    setLeft(seconds);
    setRunning(true);
  }

  useEffect(() => {
    leftRef.current = left;
  }, [left]);

  useEffect(() => {
    if (!active || !running) return;
    const end = performance.now() + leftRef.current * 1000;
    const id = window.setInterval(() => {
      const next = (end - performance.now()) / 1000;
      setLeft(next <= 0 ? seconds : next);
    }, 250);
    return () => window.clearInterval(id);
  }, [active, running, seconds]);

  return { left, running, toggle: () => setRunning((r) => !r), reset: () => setLeft(seconds) };
}

const I = {
  timer: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="9" r="5.5" />
      <path d="M8 6.5V9l1.6 1.2M6.5 1.5h3" />
    </svg>
  ),
  play: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path d="M5 3.4v11.2c0 .8.9 1.3 1.6.9l8.6-5.6a1.1 1.1 0 0 0 0-1.8L6.6 2.5C5.9 2.1 5 2.6 5 3.4Z" />
    </svg>
  ),
  pause: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <rect x="3.5" y="2.5" width="4" height="13" rx="1.2" />
      <rect x="10.5" y="2.5" width="4" height="13" rx="1.2" />
    </svg>
  ),
  stop: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect x="1.5" y="1.5" width="11" height="11" rx="2.4" />
    </svg>
  ),
  back: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 10.9 17 15.4c.6.4 1.4 0 1.4-.8V5.4c0-.8-.8-1.2-1.4-.8L10 9.1V5.4c0-.8-.8-1.2-1.4-.8L1.8 9.1a1.1 1.1 0 0 0 0 1.8l6.8 4.5c.6.4 1.4 0 1.4-.8Z" />
    </svg>
  ),
  next: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 9.1 3 4.6c-.6-.4-1.4 0-1.4.8v9.2c0 .8.8 1.2 1.4.8l7-4.5v3.7c0 .8.8 1.2 1.4.8l6.8-4.5a1.1 1.1 0 0 0 0-1.8l-6.8-4.5c-.6-.4-1.4 0-1.4.8Z" />
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path d="M5.2 1.6 6.8 4.9c.3.6.1 1.3-.4 1.7l-1.2.9a9.6 9.6 0 0 0 5.3 5.3l.9-1.2c.4-.5 1.1-.7 1.7-.4l3.3 1.6c.6.3.9 1 .7 1.7l-.5 1.6c-.3.9-1.1 1.4-2 1.3C7.4 17 1 10.6.6 3.4c-.1-.9.4-1.7 1.3-2l1.6-.5c.7-.2 1.4.1 1.7.7Z" />
    </svg>
  ),
};

function Bars({ color, playing }: { color: string; playing: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="flex h-4 items-center gap-[3px]" aria-hidden="true">
      {[0.55, 1, 0.7, 0.9, 0.5].map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: color, height: "100%", originY: 0.5 }}
          animate={playing && !reduce ? { scaleY: [h * 0.4, h, h * 0.55, h * 0.9, h * 0.4] } : { scaleY: h * 0.5 }}
          transition={{ duration: 0.9 + i * 0.13, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function RoundButton({ label, onClick, className = "", style, children }: { label: string; onClick: () => void; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.86 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`grid size-11 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${className}`}
      style={style}
    >
      {children}
    </motion.button>
  );
}

const ART = "bg-[conic-gradient(from_200deg,#ff9f0a,#ff375f,#bf5af2,#0a84ff,#ff9f0a)]";

/**
 * A black pill that grows into whatever is happening: a running timer, the
 * song that is playing, an incoming call. Every change stretches it: the
 * width shoots out first and the height catches up on a looser spring, so the
 * pill squashes and bulges into its new shape. Tap it to open live controls;
 * tap again or press Escape to tuck it away.
 */
export function DynamicIsland({
  state: controlled,
  defaultState = "timer",
  onStateChange,
  timerSeconds = 300,
  accent = "#ff9f0a",
  cycle = 0,
  states = ["timer", "music", "call"],
  track = { title: "Midnight Drive", artist: "Harbor Lights" },
  caller = "Ava Lin",
  autoplay = false,
  enableSound = true,
  className = "",
}: DynamicIslandProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() === true;
  const [inner, setInner] = useState<IslandState>(defaultState);
  const state = controlled ?? inner;
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const touched = useRef(false);
  const timer = useCountdown(timerSeconds, state === "timer");
  const squash = useMotionValue(1);

  const setState = useCallback(
    (next: IslandState) => {
      if (controlled === undefined) setInner(next);
      onStateChange?.(next);
    },
    [controlled, onStateChange],
  );

  // Collapse whenever the activity changes.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    setOpen(false);
  }

  const isOpen = open && state !== "idle";
  // A quick vertical squash on every morph; the spring lets it bounce back past 1.
  useEffect(() => {
    if (reduce) return;
    const a = animate(squash, [0.86, 1], { type: "spring", stiffness: 520, damping: 14 });
    return () => a.stop();
  }, [state, isOpen, squash, reduce]);

  // Optional self-running demo (paused while open).
  const statesKey = states.join(",");
  useEffect(() => {
    if (!cycle || controlled !== undefined || open) return;
    const list = statesKey.split(",") as IslandState[];
    const id = window.setTimeout(() => {
      const i = list.indexOf(state);
      setInner(list[(i + 1) % list.length] ?? list[0]);
    }, cycle);
    return () => window.clearTimeout(id);
  }, [cycle, controlled, open, state, statesKey]);

  // Autoplay: morph to the next activity, open it, close it, repeat.
  useEffect(() => {
    if (!autoplay || controlled !== undefined) return;
    const list = statesKey.split(",") as IslandState[];
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      const beat = k++ % 3;
      if (beat === 0) {
        play.auto("pop", 0.7);
        setOpen(true);
      }
      if (beat === 1) {
        play.auto("pop", 0.4);
        setOpen(false);
      }
      if (beat === 2)
        setInner((s) => {
          const i = list.indexOf(s);
          return list[(i + 1) % list.length] ?? list[0];
        });
    }, 1700);
    return () => window.clearInterval(t);
  }, [autoplay, controlled, statesKey, play]);

  // Tap outside or Escape tucks it away.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        play("pop", 0.4);
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        play("pop", 0.4);
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, play]);

  const [w, h] = isOpen ? SIZE[state].open : SIZE[state].compact;
  const fade = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(6px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { delay: reduce ? 0 : 0.1, type: "spring" as const, stiffness: 320, damping: 26 } },
    exit: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, filter: "blur(6px)", transition: { duration: 0.12 } },
  };

  const label =
    state === "timer"
      ? `Timer, ${format(timer.left)} left`
      : state === "music"
        ? `Now playing ${track.title} by ${track.artist}`
        : state === "call"
          ? `Incoming call from ${caller}`
          : "Dynamic island";
  const initials = caller
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex max-w-full justify-center ${className}`}
      style={{ minWidth: Math.min(w, 352) }}
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
    >
      <motion.div
        role="group"
        aria-label={label}
        className="relative max-w-full overflow-hidden bg-black text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,.55)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.12),0_14px_30px_-12px_rgba(0,0,0,.9)]"
        initial={false}
        animate={{ width: w, height: h, borderRadius: isOpen ? 44 : 22 }}
        transition={reduce ? { duration: 0 } : { width: W_SPRING, height: H_SPRING, borderRadius: H_SPRING }}
        style={{ scaleY: squash, originY: 0 }}
        whileHover={state !== "idle" && !isOpen && !reduce ? { scale: 1.04 } : undefined}
        onClick={() => {
          if (!isOpen) return;
          play("pop", 0.4);
          setOpen(false);
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!isOpen && state !== "idle" ? (
            <motion.button
              key={`c-${state}`}
              type="button"
              aria-expanded={false}
              aria-label={`${label}. Open controls`}
              onClick={(e) => {
                e.stopPropagation();
                play("pop", 0.7);
                setOpen(true);
              }}
              className="absolute inset-0 flex items-center justify-between rounded-[inherit] px-3.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
              {...fade}
            >
              {state === "timer" ? (
                <>
                  <span className="grid size-6 place-items-center rounded-full" style={{ background: `${accent}2e`, color: accent }}>
                    {I.timer}
                  </span>
                  <span className="text-[15px] font-semibold tabular-nums tracking-[-0.02em]" style={{ color: accent }}>
                    {format(timer.left)}
                  </span>
                </>
              ) : state === "music" ? (
                <>
                  <span className={`size-6 rounded-[7px] ${ART}`} />
                  <Bars color={accent} playing={playing} />
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-full bg-[#30d158]/20 text-[#30d158] [&_svg]:size-3.5">{I.phone}</span>
                    <span className="text-[13px] font-medium">{caller}</span>
                  </span>
                  <Bars color="#30d158" playing />
                </>
              )}
            </motion.button>
          ) : null}

          {isOpen && state === "timer" ? (
            <motion.div key="o-timer" className="absolute inset-0 flex items-center justify-between px-5" {...fade}>
              <div className="flex items-center gap-2.5">
                <RoundButton label={timer.running ? "Pause timer" : "Resume timer"} onClick={timer.toggle} style={{ background: `${accent}38`, color: accent }}>
                  {timer.running ? I.pause : I.play}
                </RoundButton>
                <RoundButton
                  label="Stop timer"
                  onClick={() => {
                    play("whoosh", 0.6);
                    timer.reset();
                    setOpen(false);
                    setState("idle");
                  }}
                  className="bg-white/15 text-white"
                >
                  {I.stop}
                </RoundButton>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-medium" style={{ color: accent }}>
                  Timer
                </span>
                <span className="text-[38px] font-light leading-none tabular-nums tracking-[-0.03em]" style={{ color: accent }}>
                  {format(timer.left)}
                </span>
              </div>
            </motion.div>
          ) : null}

          {isOpen && state === "music" ? (
            <motion.div key="o-music" className="absolute inset-0 flex flex-col justify-between p-5" {...fade}>
              <div className="flex items-center gap-3.5">
                <span className={`size-14 shrink-0 rounded-[14px] shadow-[0_6px_18px_-6px_rgba(255,55,95,.7)] ${ART}`} />
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-[15px] font-semibold tracking-[-0.01em]">{track.title}</p>
                  <p className="m-0 truncate text-[13px] text-white/60">{track.artist}</p>
                </div>
                <Bars color={accent} playing={playing} />
              </div>
              <div className="flex items-center gap-2.5 text-[11px] tabular-nums text-white/60">
                <span>1:12</span>
                <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full bg-white"
                    initial={{ width: "34%" }}
                    animate={{ width: playing && !reduce ? "62%" : "34%" }}
                    transition={{ duration: playing ? 40 : 0.2, ease: "linear" }}
                  />
                </span>
                <span>3:48</span>
              </div>
              <div className="-my-1 flex items-center justify-center gap-6">
                <RoundButton label="Previous track" onClick={() => undefined} className="size-9 text-white/80">
                  {I.back}
                </RoundButton>
                <RoundButton label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)} className="size-9 text-white [&_svg]:size-6">
                  {playing ? I.pause : I.play}
                </RoundButton>
                <RoundButton label="Next track" onClick={() => undefined} className="size-9 text-white/80">
                  {I.next}
                </RoundButton>
              </div>
            </motion.div>
          ) : null}

          {isOpen && state === "call" ? (
            <motion.div key="o-call" className="absolute inset-0 flex items-center justify-between gap-3 px-5" {...fade}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#0a84ff,#bf5af2)] text-[15px] font-semibold">{initials}</span>
                <div className="min-w-0">
                  <p className="m-0 text-[12px] text-white/60">mobile</p>
                  <p className="m-0 truncate text-[16px] font-semibold tracking-[-0.01em]">{caller}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <RoundButton label="Decline" onClick={() => {
                    play("whoosh", 0.6);
                    setState("idle");
                  }} className="bg-[#ff3b30] text-white [&_svg]:rotate-[135deg]">
                  {I.phone}
                </RoundButton>
                <RoundButton label="Accept" onClick={() => setOpen(false)} className="bg-[#30d158] text-white">
                  {I.phone}
                </RoundButton>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
```

--- components/dynamic-island/index.ts ---

```ts
export { DynamicIsland } from "./dynamic-island";
export type { DynamicIslandProps, IslandState } from "./dynamic-island";
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
