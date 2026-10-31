# Status Morph

Add the "Status Morph" component from Nexus UI to my project.

An iPhone-style status bar (signal, Wi-Fi, battery) that takes itself apart to connect. Tap it and the battery drains, amber then red, before its outline rounds itself into a ring around the Wi-Fi. The signal bars sink into dots, swing under the ring and slide into its gap, and the ring spins while the Wi-Fi arcs ripple outward. When it connects, the spin coasts to rest, the ring closes over the dots with a soft pulse and the arcs fill in one by one. Tap again and it all folds back into the bar, this time charging, with a bolt.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { StatusMorph } from "@/components/status-morph";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/status-morph/index.ts ---

```ts
import type { ComponentProps } from "react";
import { StatusMorph } from "./status-morph";

export { StatusMorph };
export type StatusMorphProps = ComponentProps<typeof StatusMorph>;
```

--- components/status-morph/status-morph.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

/**
 * Status Morph: an iPhone-style status bar (signal, Wi-Fi, battery) that takes itself apart to connect.
 * The battery drains and its outline rounds into a ring around the Wi-Fi, the signal bars sink into dots
 * that ride the ring's gap while it spins and the Wi-Fi arcs ripple outward, then the ring closes over the
 * dots and the arcs fill in. Tap again and it all folds back into the bar, this time charging.
 */

type Phase = "bar" | "search" | "settle" | "connected";

// Geometry in viewBox units (132 x 60). The ring and the Wi-Fi share the centre (CX, CY).
const CX = 66;
const CY = 30;
const R = 18;
const C = 2 * Math.PI * R;
const GAP = C * 0.3;
const BASE = 37;
const WIFI_RADII = [5, 10, 15];
const ARC_ANGLE = (46 * Math.PI) / 180;
const BAR_W = 3.6;
const BAR_HEIGHTS = [5, 8, 11, 14];
const BAR_X = (i: number) => 26.8 + i * 6;
const DOT = 3.4;
const DOT_ANGLES = [126, 102, 78, 54].map((a) => (a * Math.PI) / 180);
// The dots swing below the ring (clear of its stroke) on their way between the bar and the gap.
const DIP_Y = 51;
const BATTERY = { attrX: 84, attrY: 23, width: 28, height: 14, rx: 4.2 };
const FILL = { x: 86, y: 25, width: 24, height: 10 };
const LEVEL = 0.8;
// The bar is wider on the battery side, so it sits a little left to look centred; the ring sits dead centre.
const BAR_SHIFT = -5.15;

const arc = (r: number) => `M ${CX - r * Math.sin(ARC_ANGLE)} ${BASE - r * Math.cos(ARC_ANGLE)} A ${r} ${r} 0 0 1 ${CX + r * Math.sin(ARC_ANGLE)} ${BASE - r * Math.cos(ARC_ANGLE)}`;
const BOLT = "M99.4 24.4 L94.4 31 H97.8 L96.6 35.6 L101.6 29 H98.2 Z";

const THEMES = {
  light: { ink: "#1d1d1f", card: "#ffffff", muted: "#86868b", ring: "0 0 0 1px rgba(0,0,0,.05), 0 18px 40px -24px rgba(0,0,0,.35)" },
  dark: { ink: "#f5f5f7", card: "#1c1c1e", muted: "#98989d", ring: "0 0 0 1px rgba(255,255,255,.08), 0 18px 40px -24px rgba(0,0,0,.8)" },
} as const;
const GREEN = "#30d158";
const AMBER = "#ff9f0a";
const RED = "#ff3b30";

const pace = (speed = 1) => Math.min(4, Math.max(0.25, Number.isFinite(speed) ? speed : 1));

export function StatusMorph({
  autoplay = false,
  theme = "light",
  size = 260,
  speed = 1,
  network = "Nexus",
  enableSound = true,
}: {
  /** Connects and disconnects by itself until the visitor taps it. Pauses while off screen. */
  autoplay?: boolean;
  /** Light (graphite on white) or dark (white on graphite). */
  theme?: "light" | "dark";
  /** Width of the drawing in pixels. Kept between 160 and 480. */
  size?: number;
  /** How fast it plays: 1 is the designed pace, 2 is twice as fast. Kept between 0.25 and 4. */
  speed?: number;
  /** The network name shown under the icons while joining and once connected. */
  network?: string;
  /** Plays interface sounds on each step. They follow the site-wide sound switch. */
  enableSound?: boolean;
}) {
  const p = pace(speed);
  const t = (s: number) => s / p;
  const spring = (stiffness: number, damping: number, delay = 0) => ({ type: "spring" as const, stiffness: stiffness * p * p, damping: damping * p, delay: t(delay) });
  const colors = THEMES[theme] ?? THEMES.light;
  const width = Math.min(480, Math.max(160, Number.isFinite(size) ? size : 260));

  const reduce = useReducedMotion();
  const root = useRef<HTMLButtonElement>(null);
  const inView = useInView(root, { amount: 0.3 });
  const play = useSound(enableSound);
  const playRef = useRef(play);
  const touched = useRef(false);

  const [phase, setPhase] = useState<Phase>("bar");
  // After the first round trip the battery comes back charging (green, with a bolt).
  const [charging, setCharging] = useState(false);

  const spinner = useRef<SVGGElement>(null);
  const rot = useMotionValue(0);
  const gap = useMotionValue(0);
  const dash = useMotionValue(`${C / 2} 0 ${C / 2} 0`);

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  // Rotation and the ring's gap are driven by hand: the rotation has to spin forever, then coast to rest exactly
  // where the dots line up, and the dash pattern is written out from the gap so it always centres on the bottom.
  useEffect(() => {
    const unRot = rot.on("change", (v) => spinner.current?.setAttribute("transform", `rotate(${v} ${CX} ${CY})`));
    const unGap = gap.on("change", (g) => dash.set(`${(C - g) / 2} ${g} ${(C - g) / 2} 0`));
    return () => {
      unRot();
      unGap();
    };
  }, [rot, gap, dash]);

  const sound = (name: Parameters<typeof play>[0], volume?: number) => {
    if (touched.current) playRef.current(name, volume);
    else playRef.current.auto(name, volume);
  };

  // Imperative half of each phase: the spin, the gap, and the hand-off to the next phase.
  useEffect(() => {
    let live: ReturnType<typeof animate> | null = null;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (s: number, fn: () => void) => timers.push(setTimeout(() => !cancelled && fn(), t(s) * 1000));

    if (phase === "bar") {
      rot.set(0);
      gap.set(0);
    }

    if (phase === "search") {
      after(0.8, () => {
        live = animate(gap, GAP, { duration: t(0.35), ease: "easeOut" });
        if (reduce) return;
        // Ease into the spin for one turn, then hold a steady pace.
        live = animate(rot, 360, { duration: t(1.1), ease: "easeIn" });
        live.then(() => {
          if (cancelled) return;
          rot.set(0);
          live = animate(rot, 360, { duration: t(0.85), ease: "linear", repeat: Infinity });
        });
      });
      after(3.2, () => setPhase("settle"));
    }

    if (phase === "settle") {
      // The search effect's cleanup has just stopped the spin; the value keeps its velocity for the coast.
      const at = rot.get();
      // Coast forward to the next full turn (at least a third of one) so the gap ends up at the bottom.
      const target = Math.ceil((at + 120) / 360) * 360;
      if (reduce || at === 0) {
        rot.set(target % 360);
        after(0.1, () => setPhase("connected"));
      } else {
        live = animate(rot, target, { type: "spring", stiffness: 40 * p * p, damping: 11 * p, restDelta: 0.5 });
        live.then(() => {
          if (cancelled) return;
          rot.set(0);
          setPhase("connected");
        });
      }
    }

    if (phase === "connected") {
      live = animate(gap, 0, { duration: t(0.32), ease: [0.4, 0, 0.2, 1] });
      after(0.28, () => sound("done", 0.8));
    }

    return () => {
      cancelled = true;
      live?.stop();
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduce, p]);

  const go = () => {
    if (phase === "bar") {
      sound("tap", 0.8);
      setPhase("search");
    } else {
      sound(phase === "connected" ? "charge" : "off", 0.8);
      setCharging(true);
      setPhase("bar");
    }
  };

  // Autoplay: wait on the bar, connect, hold, let go. Only while on screen and until the first tap.
  useEffect(() => {
    if (!autoplay || touched.current || !inView) return;
    if (phase !== "bar" && phase !== "connected") return;
    const id = setTimeout(() => go(), t(phase === "bar" ? 1.6 : 2.4) * 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, phase, p]);

  const ring = phase !== "bar";
  const closed = phase === "connected";
  const searching = phase === "search" || phase === "settle";

  const label = phase === "bar" ? "Wi-Fi" : closed ? `Connected to ${network}` : `Joining ${network}…`;

  return (
    <motion.button
      ref={root}
      type="button"
      aria-label={phase === "bar" ? `Join ${network}` : `Disconnect from ${network}`}
      onPointerDown={() => (touched.current = true)}
      onClick={() => {
        touched.current = true;
        go();
      }}
      whileTap={{ scale: 0.97 }}
      transition={spring(500, 30)}
      style={{ background: colors.card, boxShadow: colors.ring, color: colors.ink, borderRadius: Math.round(width * 0.12) }}
      className="flex select-none flex-col items-center gap-1 px-6 pb-5 pt-4 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
    >
      <svg width={width} height={(width * 60) / 132} viewBox="0 0 132 60" fill="none" aria-hidden="true">
        <motion.g initial={false} animate={{ x: ring ? 0 : BAR_SHIFT }} transition={spring(170, 22, ring ? 0.35 : 0.1)}>
          {/* Battery fill: drains (going amber, then red) before the outline lets go, charges back green afterwards. */}
          <motion.rect
            x={FILL.x}
            y={FILL.y}
            height={FILL.height}
            rx={2.4}
            initial={false}
            animate={
              ring
                ? { width: 0, fill: [charging ? GREEN : colors.ink, AMBER, RED], opacity: [1, 1, 0] }
                : { width: FILL.width * LEVEL, fill: charging ? GREEN : colors.ink, opacity: 1 }
            }
            transition={ring ? { duration: t(0.4), ease: "easeIn", opacity: { duration: t(0.45), times: [0, 0.8, 1] } } : { duration: t(0.6), delay: t(0.55), ease: "easeOut", fill: { duration: 0, delay: t(0.55) } }}
          />
          <AnimatePresence>
            {charging && !ring && (
              <motion.path
                key="bolt"
                d={BOLT}
                fill={colors.card}
                stroke={colors.card}
                strokeWidth={0.9}
                strokeLinejoin="round"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: spring(520, 16, 1.0) }}
                exit={{ scale: 0, opacity: 0, transition: { duration: t(0.12) } }}
              />
            )}
          </AnimatePresence>
          <motion.rect
            x={113.4}
            y={27.6}
            width={2}
            height={4.8}
            rx={1}
            fill={colors.ink}
            initial={false}
            animate={{ opacity: ring ? 0 : 0.4, attrX: ring ? 110 : 113.4 }}
            transition={{ duration: t(0.2), delay: t(ring ? 0.2 : 0.75) }}
          />

          <g ref={spinner}>
            {/* The battery outline: a rounded rectangle that rounds itself into the ring, then opens a gap and spins. */}
            <motion.rect
              stroke={colors.ink}
              strokeLinecap="round"
              style={{ strokeDasharray: dash }}
              initial={false}
              animate={
                ring
                  ? { attrX: CX - R, attrY: CY - R, width: R * 2, height: R * 2, rx: R, strokeWidth: 3.2, strokeOpacity: 1 }
                  : { ...BATTERY, strokeWidth: 1.6, strokeOpacity: 0.4 }
              }
              transition={ring ? spring(170, 20, 0.35) : spring(190, 22, 0.15)}
            />
            {/* A pulse of the ring as it closes. */}
            <motion.circle
              cx={CX}
              cy={CY}
              r={R}
              stroke={colors.ink}
              initial={false}
              animate={closed ? { opacity: [0, 0.35, 0], strokeWidth: [3.2, 3.2, 12] } : { opacity: 0, strokeWidth: 3.2 }}
              transition={closed ? { duration: t(0.7), delay: t(0.3), ease: "easeOut" } : { duration: 0 }}
            />

            {/* Signal bars: they sink into dots, ride the ring's gap, and are swallowed when it closes. */}
            {BAR_HEIGHTS.map((h, i) => {
              const dx = CX + R * Math.cos(DOT_ANGLES[i]) - DOT / 2;
              const dy = CY + R * Math.sin(DOT_ANGLES[i]) - DOT / 2;
              const bx = BAR_X(i);
              const mid = (bx + dx) / 2;
              // Shrink to a dot where the bar stands, then swing under the ring and up into its gap (and the reverse).
              const out = { attrX: [bx, bx, mid, dx], attrY: [BASE - h, BASE - DOT, DIP_Y, dy], width: [BAR_W, DOT, DOT, DOT], height: [h, DOT, DOT, DOT], rx: [1.2, DOT / 2, DOT / 2, DOT / 2] };
              const back = { attrX: [dx, mid, bx, bx], attrY: [dy, DIP_Y, BASE - DOT, BASE - h], width: [DOT, DOT, DOT, BAR_W], height: [DOT, DOT, DOT, h], rx: [DOT / 2, DOT / 2, DOT / 2, 1.2] };
              return (
                <motion.rect
                  key={i}
                  fill={colors.ink}
                  initial={false}
                  animate={ring ? { ...out, scale: closed ? 0 : 1 } : { ...back, scale: 1 }}
                  transition={
                    closed
                      ? { scale: { duration: t(0.22), delay: t(0.05 + i * 0.04) } }
                      : ring
                        ? { duration: t(0.8), delay: t(0.2 + (3 - i) * 0.07), times: [0, 0.25, 0.65, 1], ease: "easeInOut" }
                        : { duration: t(0.75), delay: t(0.1 + i * 0.06), times: [0, 0.4, 0.75, 1], ease: "easeInOut", scale: { duration: t(0.2), delay: t(0.05) } }
                  }
                />
              );
            })}
            {/* While searching the dots breathe one after another, like a loading indicator. */}
            {searching && !reduce && (
              <g>
                {DOT_ANGLES.map((a, i) => (
                  <motion.circle
                    key={i}
                    cx={CX + R * Math.cos(a)}
                    cy={CY + R * Math.sin(a)}
                    r={DOT / 2 + 0.9}
                    fill={colors.ink}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.18, 0] }}
                    transition={{ duration: t(0.9), delay: t(1.1 + i * 0.12), repeat: Infinity, repeatDelay: t(0.25) }}
                  />
                ))}
              </g>
            )}
          </g>

          {/* Wi-Fi: steady on the bar, rippling outward while searching, filling in arc by arc once connected. */}
          <motion.g
            initial={false}
            animate={closed ? { scale: [1, 1.14, 1] } : { scale: 1 }}
            transition={closed ? { duration: t(0.5), delay: t(0.3), times: [0, 0.4, 1], ease: "easeOut" } : { duration: t(0.2) }}
          >
            <circle cx={CX} cy={BASE} r={2.3} fill={colors.ink} />
            {WIFI_RADII.map((r, i) => (
              <motion.path
                key={r}
                d={arc(r)}
                stroke={colors.ink}
                strokeWidth={3.2}
                strokeLinecap="round"
                initial={false}
                animate={
                  searching && !reduce
                    ? { opacity: [0.22, 1, 0.22] }
                    : closed
                      ? { opacity: [0.22, 1] }
                      : { opacity: 1 }
                }
                transition={
                  searching && !reduce
                    ? { duration: t(1.05), delay: t(0.8 + i * 0.17), repeat: Infinity, ease: "easeInOut" }
                    : closed
                      ? { duration: t(0.2), delay: t(0.32 + i * 0.1) }
                      : { duration: t(0.25) }
                }
              />
            ))}
          </motion.g>
        </motion.g>
      </svg>

      <span className="relative h-5 w-full overflow-hidden text-center text-[13px] font-medium" style={{ color: colors.muted }} aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={label}
            className="absolute inset-x-0"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={spring(500, 32)}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
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
