# Animated Icons

Add the "Animated Icons" component from Nexus UI to my project.

Eight toggle icons with their own small stories: menu to close, play morphing into pause, a heart that bursts, a bell that rings, sun turning to moon, a bookmark that fills, sound muting and a lock that springs open.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { AnimatedIcons, MenuIcon, PlayIcon, HeartIcon } from "@/components/animated-icons";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/animated-icons/animated-icons.tsx ---

```tsx
"use client";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound, type SoundName } from "@/lib/ui-sounds";

const S = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Playback speed shared by every icon: 1 is the designed pace, 2 is twice as fast. Kept between 0.25 and 4. */
type Speed = { speed?: number };
const pace = (speed = 1) => Math.min(4, Math.max(0.25, Number.isFinite(speed) ? speed : 1));
/** A spring that is `speed` times quicker (stiffness grows with the square so the wobble keeps its shape). */
const springAt = (stiffness: number, damping: number, speed = 1) => {
  const p = pace(speed);
  return { type: "spring", stiffness: stiffness * p * p, damping: damping * p } as const;
};
/** A timed transition (seconds) that plays `speed` times quicker, delay included. */
const timed = (duration: number, speed = 1, delay?: number) => {
  const p = pace(speed);
  return delay === undefined ? { duration: duration / p } : { duration: duration / p, delay: delay / p };
};

export function MenuIcon({ on, speed, size = 26 }: { on: boolean; size?: number } & Speed) {
  const spring = springAt(420, 24, speed);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...S} aria-hidden="true">
      <motion.line x1="4" x2="20" y1="7" y2="7" animate={on ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} transition={spring} />
      <motion.line x1="4" x2="20" y1="12" y2="12" animate={{ opacity: on ? 0 : 1, scaleX: on ? 0 : 1 }} transition={timed(0.15, speed)} />
      <motion.line x1="4" x2="20" y1="17" y2="17" animate={on ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }} transition={spring} />
    </svg>
  );
}

export function PlayIcon({ on, speed, size = 26 }: { on: boolean; size?: number } & Speed) {
  const play = "M7 5 L12.5 8.4 L12.5 15.6 L7 19 Z M12.5 8.4 L18.5 12 L18.5 12 L12.5 15.6 Z";
  const pause = "M6.5 5 L10 5 L10 19 L6.5 19 Z M14 5 L17.5 5 L17.5 19 L14 19 Z";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <motion.path initial={false} animate={{ d: on ? pause : play }} transition={springAt(300, 26, speed)} />
    </svg>
  );
}

const COLORS = ["#ff375f", "#ff9f0a", "#ffd60a", "#30d158", "#0a84ff", "#bf5af2"];

/** Small seeded generator so each burst looks different but renders the same on server and client. */
function seeded(seed: number) {
  let t = seed * 2654435761;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function HeartIcon({ on, burst, speed, size = 26 }: { on: boolean; burst: number; size?: number } & Speed) {
  // A fresh burst every time, so no two likes look the same.
  const parts = useMemo(() => {
    if (!burst) return [];
    const rand = seeded(burst);
    const n = 9 + Math.floor(rand() * 5);
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + rand() * 0.6;
      const d = 22 + rand() * 16;
      return { x: Math.cos(a) * d, y: Math.sin(a) * d, c: COLORS[Math.floor(rand() * COLORS.length)], s: 3 + rand() * 4, r: rand() > 0.5 };
    });
  }, [burst]);
  return (
    <span className="relative flex items-center justify-center">
      <AnimatePresence>
        {on &&
          parts.map((p, i) => (
            <motion.span
              key={`${burst}-${i}`}
              className="pointer-events-none absolute"
              style={{ width: p.s, height: p.s, background: p.c, borderRadius: p.r ? 999 : 1.5 }}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ x: p.x, y: p.y, scale: 0, opacity: 1, rotate: p.r ? 0 : 180 }}
              exit={{ opacity: 0 }}
              transition={{ ...timed(0.7, speed), ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
      </AnimatePresence>
      <motion.svg key={burst} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" animate={on && burst ? { scale: [1, 0.7, 1.25, 1] } : { scale: 1 }} transition={timed(0.45, speed)}>
        <motion.path
          d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={false}
          animate={{ fill: on ? "#ff375f" : "rgba(255,55,95,0)", stroke: on ? "#ff375f" : "currentColor" }}
          transition={timed(0.2, speed)}
        />
      </motion.svg>
    </span>
  );
}

export function BellIcon({ on, speed, size = 26 }: { on: boolean; size?: number } & Speed) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...S} aria-hidden="true">
      <motion.g style={{ originX: "50%", originY: "10%" }} animate={on ? { rotate: [0, -20, 16, -11, 7, -3, 0] } : { rotate: 0 }} transition={timed(0.75, speed)}>
        <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
        <path d="M10 20.5a2 2 0 0 0 4 0" />
      </motion.g>
      <motion.path d="M3 3l18 18" initial={false} animate={{ pathLength: on ? 0 : 1, opacity: on ? 0 : 1 }} transition={timed(0.3, speed)} />
      <motion.circle cx="18" cy="5.5" r="3" fill="#ff3b30" stroke="none" initial={false} animate={{ scale: on ? 1 : 0 }} transition={{ ...springAt(600, 14, speed), delay: (on ? 0.2 : 0) / pace(speed) }} />
    </svg>
  );
}

export function ThemeIcon({ on, speed, size = 26 }: { on: boolean; size?: number } & Speed) {
  const spring = springAt(420, 24, speed);
  const id = `theme-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...S} aria-hidden="true">
      <mask id={id}>
        <rect x="0" y="0" width="24" height="24" fill="white" stroke="none" />
        <motion.circle r="7" fill="black" stroke="none" initial={false} animate={on ? { cx: 17, cy: 7 } : { cx: 30, cy: -6 }} transition={spring} />
      </mask>
      <motion.circle cx="12" cy="12" fill="currentColor" stroke="none" mask={`url(#${id})`} initial={false} animate={{ r: on ? 8.5 : 4.5 }} transition={spring} />
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={{ rotate: on ? 90 : 0, scale: on ? 0 : 1, opacity: on ? 0 : 1 }} transition={spring}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${a} 12 12)`} />
        ))}
      </motion.g>
    </svg>
  );
}

export function BookmarkIcon({ on, speed, size = 26 }: { on: boolean; size?: number } & Speed) {
  const id = `save-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const d = "M6 4h12v17l-6-4-6 4z";
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" {...S} aria-hidden="true" animate={on ? { y: [0, -4, 0] } : { y: 0 }} transition={timed(0.35, speed)}>
      <clipPath id={id}>
        <motion.rect x="0" width="24" height="24" initial={false} animate={{ y: on ? 0 : 24 }} transition={springAt(260, 24, speed)} />
      </clipPath>
      <path d={d} />
      <path d={d} fill="#0a84ff" stroke="#0a84ff" clipPath={`url(#${id})`} />
    </motion.svg>
  );
}

export function VolumeIcon({ on, speed, size = 26 }: { on: boolean; size?: number } & Speed) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...S} aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <motion.path d="M15.5 9.2a4 4 0 0 1 0 5.6" initial={false} animate={{ pathLength: on ? 0 : 1, opacity: on ? 0 : 1 }} transition={timed(0.2, speed, on ? 0.12 : 0)} />
      <motion.path d="M18 6.8a7.5 7.5 0 0 1 0 10.4" initial={false} animate={{ pathLength: on ? 0 : 1, opacity: on ? 0 : 1 }} transition={timed(0.2, speed, on ? 0 : 0.12)} />
      <motion.path d="M16 9.5l5 5M21 9.5l-5 5" initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={timed(0.25, speed, on ? 0.2 : 0)} />
    </svg>
  );
}

export function LockIcon({ on, speed, size = 26 }: { on: boolean; size?: number } & Speed) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...S} aria-hidden="true">
      <motion.path initial={false} animate={{ d: on ? "M8 11 V5.5 A4 4 0 0 1 16 5.5 V6.5" : "M8 11 V8 A4 4 0 0 1 16 8 V11" }} transition={springAt(380, 18, speed)} />
      <motion.rect x="5" y="11" width="14" height="9.5" rx="2.5" initial={false} animate={{ fill: on ? "rgba(52,199,89,1)" : "rgba(52,199,89,0)", stroke: on ? "#34c759" : "currentColor" }} />
    </svg>
  );
}

type Key = "menu" | "play" | "like" | "bell" | "theme" | "save" | "mute" | "lock";
const LIST: { key: Key; label: [string, string] }[] = [
  { key: "menu", label: ["Menu", "Close"] },
  { key: "play", label: ["Play", "Pause"] },
  { key: "like", label: ["Like", "Liked"] },
  { key: "bell", label: ["Alerts off", "Alerts on"] },
  { key: "theme", label: ["Light", "Dark"] },
  { key: "save", label: ["Save", "Saved"] },
  { key: "mute", label: ["Sound", "Muted"] },
  { key: "lock", label: ["Locked", "Unlocked"] },
];

/** Which sound each icon plays when it turns on and when it turns off. */
const CUES: Record<Key, [on: [SoundName, number], off: [SoundName, number]]> = {
  menu: [["on", 1], ["off", 1]],
  play: [["tap", 1], ["tap", 0.8]],
  like: [["pop", 1], ["tick", 0.5]],
  bell: [["ping", 0.8], ["off", 0.8]],
  theme: [["off", 1], ["on", 1]],
  save: [["tick", 0.8], ["tick", 0.4]],
  mute: [["tick", 0.6], ["tick", 0.6]],
  lock: [["off", 1], ["on", 1]],
};

const clampTo = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));

export function AnimatedIcons({ autoplay = false, enableSound = true, iconSize = 26, tileSize = 72, tileRadius = 20, speed = 1 }: {
  autoplay?: boolean;
  /** Size of each icon in pixels. Kept between 14 and 48 (and never bigger than the tile). */
  iconSize?: number;
  /** Width and height of each button tile in pixels. Kept between 48 and 96. */
  tileSize?: number;
  /** Corner radius of the tiles in pixels. Kept between 0 and half the tile, which makes a circle. */
  tileRadius?: number;
  /** How fast the icon animations play: 1 is the designed pace, 2 is twice as fast. Kept between 0.25 and 4. */
  speed?: number;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}) {
  const play = useSound(enableSound);
  const playRef = useRef(play);
  const [state, setState] = useState<Record<Key, boolean>>({ menu: false, play: false, like: false, bell: false, theme: false, save: false, mute: false, lock: false });
  const [burst, setBurst] = useState(0);
  const touched = useRef(false);

  const toggle = (k: Key) => {
    setState((s) => {
      if (k === "like" && !s.like) setBurst((b) => b + 1);
      return { ...s, [k]: !s[k] };
    });
  };

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    // The demo is the only thing toggling until a visitor touches it, so it can track each icon itself.
    const was: Partial<Record<Key, boolean>> = {};
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      const key = LIST[k++ % LIST.length].key;
      const wasOn = was[key] ?? false;
      was[key] = !wasOn;
      const [name, volume] = CUES[key][wasOn ? 1 : 0];
      playRef.current.auto(name, volume);
      toggle(key);
    }, 700);
    return () => clearInterval(t);
  }, [autoplay]);

  const tile = clampTo(tileSize, 48, 96);
  const glyph = clampTo(iconSize, 14, Math.min(48, tile));
  const radius = clampTo(tileRadius, 0, tile / 2);

  const icon = (k: Key): ReactNode => {
    const on = state[k];
    const p = { on, speed, size: glyph };
    switch (k) {
      case "menu": return <MenuIcon {...p} />;
      case "play": return <PlayIcon {...p} />;
      case "like": return <HeartIcon {...p} burst={burst} />;
      case "bell": return <BellIcon {...p} />;
      case "theme": return <ThemeIcon {...p} />;
      case "save": return <BookmarkIcon {...p} />;
      case "mute": return <VolumeIcon {...p} />;
      case "lock": return <LockIcon {...p} />;
    }
  };

  return (
    <div className="grid grid-cols-4 gap-3" onPointerDown={() => (touched.current = true)}>
      {LIST.map(({ key, label }) => (
        <div key={key} className="flex flex-col items-center gap-2">
          <motion.button
            type="button"
            aria-pressed={state[key]}
            aria-label={label[0]}
            onClick={() => {
              const [name, volume] = CUES[key][state[key] ? 1 : 0];
              play(name, volume);
              toggle(key);
            }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.88 }}
            style={{ width: tile, height: tile, borderRadius: radius }}
            className="flex items-center justify-center bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_8px_20px_-12px_rgba(0,0,0,.3)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
          >
            {icon(key)}
          </motion.button>
          <span className="relative h-4 w-[80px] overflow-hidden text-center text-[12px] text-[#86868b] dark:text-[#98989d]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={String(state[key])} className="absolute inset-x-0" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={springAt(500, 32, speed)}>
                {label[state[key] ? 1 : 0]}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      ))}
    </div>
  );
}
```

--- components/animated-icons/index.ts ---

```ts
export { AnimatedIcons, MenuIcon, PlayIcon, HeartIcon, BellIcon, ThemeIcon, BookmarkIcon, VolumeIcon, LockIcon } from "./animated-icons";
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
