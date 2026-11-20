# Money Goo

Add the "Money Goo" component from Nexus UI to my project.

A peer-to-peer payment you drag out of your avatar: a liquid neck stretches, thins and snaps, and dropping the amount on a friend pours it in while both balances roll. Also includes Send Money, a send-money flow: pick a friend, type an amount and slide their face along the track while the digits fly into their picture.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { MoneyGoo } from "@/components/money-goo/money-goo";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/money-goo/money-goo.tsx ---

```tsx
"use client";
import { useEffect, useId, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface MoneyGooPerson {
  name: string;
  initials: string;
  balance: number;
}

export interface MoneyGooProps {
  amount?: number;
  from?: MoneyGooPerson;
  to?: MoneyGooPerson;
  accent?: string;
  /** Sends money by itself on a loop until the user drags. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const W = 420;
const H = 240;
const A = { x: 80, y: 110 };
const B = { x: W - 80, y: 110 };
const SNAP = 58;

const DEFAULT_FROM: MoneyGooPerson = { name: "You", initials: "ME", balance: 248 };
const DEFAULT_TO: MoneyGooPerson = { name: "Maya", initials: "MK", balance: 112 };

/** One neck bead between the avatar and the blob, thinning with distance until it snaps. */
function useBead(x: MotionValue<number>, y: MotionValue<number>, dist: MotionValue<number>, t: number) {
  const bx = useTransform(() => A.x + (x.get() - A.x) * t);
  const by = useTransform(() => A.y + (y.get() - A.y) * t);
  const s = useTransform(dist, [0, 60, 150, 175], [1, 0.75, 0.32, 0]);
  return { bx, by, s };
}

/**
 * Drag the amount out of your avatar toward a friend. A gooey neck stretches
 * between the blob and your avatar, thins as you pull, and breaks free; drop it
 * on the friend and it pours in and both balances update.
 */
export function MoneyGoo({ amount = 40, from = DEFAULT_FROM, to = DEFAULT_TO, accent = "#0071e3", autoplay = false, enableSound = true }: MoneyGooProps) {
  const play = useSound(enableSound);
  const fid = "g" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const x = useMotionValue(A.x);
  const y = useMotionValue(A.y);
  const [balances, setBalances] = useState([from.balance, to.balance]);
  const [sent, setSent] = useState(0);
  const [holding, setHolding] = useState(false);
  const touched = useRef(false);
  const dragging = useRef(false);
  const stage = useRef<HTMLDivElement>(null);

  const dist = useTransform(() => Math.hypot(x.get() - A.x, y.get() - A.y));
  const b1 = useBead(x, y, dist, 0.25);
  const b2 = useBead(x, y, dist, 0.5);
  const b3 = useBead(x, y, dist, 0.75);
  const blobScale = useTransform(dist, [0, 30, 200], [0.6, 1, 0.92]);

  const playRef = useRef(play);
  useEffect(() => {
    playRef.current = play;
  }, [play]);

  const send = (byUser = false) => {
    if (byUser) play("paid");
    setBalances(([a, b]) => [a - amount, b + amount]);
    setSent((s) => s + 1);
  };

  const release = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setHolding(false);
    const near = Math.hypot(x.get() - B.x, y.get() - B.y) < SNAP + 30;
    if (near) {
      animate(x, B.x, { type: "spring", stiffness: 300, damping: 22 });
      animate(y, B.y, { type: "spring", stiffness: 300, damping: 22 }).then(() => {
        send(true);
        x.set(A.x);
        y.set(A.y);
      });
    } else {
      animate(x, A.x, { type: "spring", stiffness: 260, damping: 16 });
      animate(y, A.y, { type: "spring", stiffness: 260, damping: 16 });
    }
  };

  useEffect(() => {
    if (!autoplay) return;
    const run = async () => {
      if (touched.current) return;
      await animate(x, [A.x, A.x + 60, A.x + 150, B.x - 40, B.x], { duration: 1.6, ease: "easeInOut" });
      if (touched.current) return;
      playRef.current.auto("paid");
      send();
      x.set(A.x);
      y.set(A.y);
    };
    const yLoop = () => {
      if (!touched.current) animate(y, [A.y, A.y - 40, A.y - 30, A.y], { duration: 1.6, ease: "easeInOut" });
    };
    const go = () => {
      yLoop();
      run();
    };
    const a = setTimeout(go, 900);
    const t = setInterval(go, 4200);
    return () => {
      clearTimeout(a);
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const local = (e: RPointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    return { px: ((e.clientX - r.left) / r.width) * W, py: ((e.clientY - r.top) / r.height) * H };
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={stage}
        className="relative touch-none select-none"
        style={{ width: W, height: H, maxWidth: "100%" }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          const { px, py } = local(e);
          x.set(px);
          y.set(py);
        }}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id={fid}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
          </filter>
        </svg>
        {/* goo layer */}
        <div className="absolute inset-0" style={{ filter: `url(#${fid})` }} aria-hidden="true">
          <span className="absolute h-[72px] w-[72px] rounded-full" style={{ left: A.x - 36, top: A.y - 36, background: accent }} />
          {[b1, b2, b3].map((b, i) => (
            <motion.span key={i} className="absolute h-[34px] w-[34px] rounded-full" style={{ left: -17, top: -17, x: b.bx, y: b.by, scale: b.s, background: accent }} />
          ))}
          <motion.span className="absolute h-[54px] w-[54px] rounded-full" style={{ left: -27, top: -27, x, y, scale: blobScale, background: accent }} />
        </div>
        {/* avatars + labels */}
        {[
          { p: A, who: from, bal: balances[0] },
          { p: B, who: to, bal: balances[1] },
        ].map(({ p, who, bal }, i) => (
          <div key={who.name} className="pointer-events-none absolute flex flex-col items-center" style={{ left: p.x - 50, top: p.y - 36, width: 100 }}>
            <motion.span
              className={`flex h-[72px] w-[72px] items-center justify-center rounded-full text-[20px] font-semibold text-white ${i === 0 ? "bg-transparent" : "bg-[#1d1d1f] dark:bg-[#3a3a3c]"}`}
              animate={i === 1 && sent ? { scale: [1, 1.18, 1] } : {}}
              key={i === 1 ? sent : "a"}
              transition={{ duration: 0.45 }}
            >
              {i === 0 ? "" : who.initials}
            </motion.span>
            <span className="mt-3 text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{who.name}</span>
            <span className="relative h-5 overflow-hidden text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={bal} className="block" initial={{ y: i === 0 ? -16 : 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: i === 0 ? 16 : -16, opacity: 0 }}>
                  ${bal}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
        ))}
        {/* draggable amount (on top of goo) */}
        <motion.button
          type="button"
          aria-label={`Send $${amount} to ${to.name}. Drag onto ${to.name}, or press Enter.`}
          onPointerDown={(e) => {
            touched.current = true;
            dragging.current = true;
            setHolding(true);
            (e.currentTarget.parentElement as Element).setPointerCapture?.(e.pointerId);
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            touched.current = true;
            animate(x, B.x, { type: "spring", stiffness: 200, damping: 20 }).then(() => {
              send(true);
              x.set(A.x);
            });
          }}
          className="absolute flex h-[54px] w-[54px] cursor-grab items-center justify-center rounded-full text-[15px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:cursor-grabbing dark:ring-offset-black"
          style={{ left: -27, top: -27, x, y, ["--tw-ring-color" as string]: accent }}
          animate={{ scale: holding ? 1.1 : 1 }}
        >
          ${amount}
        </motion.button>
        {/* drop target ring */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full border-2 border-dashed"
          style={{ left: B.x - 46, top: B.y - 46, width: 92, height: 92, borderColor: accent }}
          animate={{ opacity: holding ? 1 : 0, scale: holding ? [1, 1.06, 1] : 0.9, rotate: holding ? 360 : 0 }}
          transition={{ opacity: { duration: 0.2 }, scale: { duration: 1, repeat: holding ? Infinity : 0 }, rotate: { duration: 6, repeat: Infinity, ease: "linear" } }}
        />
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Drag the amount onto {to.name}.</span>
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
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
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

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
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
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```

# Send Money

Add the "Send Money" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { SendMoney } from "@/components/money-goo/send-money";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/money-goo/send-money.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
/* eslint-disable @next/next/no-img-element -- the sample faces are small remote pictures with fixed sizes; swap in next/image where you use real photos */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import {
  type CSSProperties,
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type Payee = { id: string; name: string; avatar: string; tint?: string };
export type SendMoneyProps = {
  payees?: Payee[];
  balance?: number;
  currency?: string;
  onSend?: (payee: Payee, amount: number) => void;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const I = {
  back: "M216 36H68.53a20.09 20.09 0 0 0-17.15 9.71L5.71 121.83a12 12 0 0 0 0 12.34l45.67 76.12A20.09 20.09 0 0 0 68.53 220H216a20 20 0 0 0 20-20V56a20 20 0 0 0-20-20m-4 160H70.8L30 128l40.8-68H212Zm-108.49-52.49L119 128l-15.52-15.51a12 12 0 0 1 17-17L136 111l15.51-15.52a12 12 0 0 1 17 17L153 128l15.52 15.51a12 12 0 0 1-17 17L136 145l-15.51 15.52a12 12 0 0 1-17-17Z",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
};
const Ico = ({ d, size, style }: { d: string; size: number; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    style={{ display: "block", flex: "none", ...style }}
    aria-hidden="true"
  >
    <path fill="currentColor" d={d} />
  </svg>
);

const DEFAULT_PAYEES: Payee[] = [
  {
    id: "lena",
    name: "Lena",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20red%20hair/Light/3D/woman_red_hair_3d_light.png",
    tint: "#ffe3d6",
  },
  {
    id: "kofi",
    name: "Kofi",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man/Medium-Dark/3D/man_3d_medium-dark.png",
    tint: "#dbe9ff",
  },
  {
    id: "hana",
    name: "Hana",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20curly%20hair/Light/3D/woman_curly_hair_3d_light.png",
    tint: "#e8f6df",
  },
  {
    id: "mateo",
    name: "Mateo",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20beard/Medium-Light/3D/man_beard_3d_medium-light.png",
    tint: "#f1e4ff",
  },
  {
    id: "priya",
    name: "Priya",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20curly%20hair/Medium-Dark/3D/woman_curly_hair_3d_medium-dark.png",
    tint: "#fff2cc",
  },
];
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];
const KNOB = 48;

const money = (n: number, cur: string, cents = true) =>
  `${cur}${n.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })}`;

function Roll({ text, reduce, style }: { text: string; reduce: boolean; style?: CSSProperties }) {
  const chars = [...text];
  return (
    <span
      aria-label={text}
      style={{
        display: "inline-flex",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (!/\d/.test(ch))
          return (
            <span key={`s${key}${ch}`} aria-hidden="true">
              {ch}
            </span>
          );
        return (
          <span
            key={`d${key}`}
            aria-hidden="true"
            style={{
              position: "relative",
              display: "inline-block",
              height: "1.2em",
              overflow: "hidden",
              lineHeight: 1.2,
            }}
          >
            <motion.span
              initial={false}
              animate={{ y: `${-Number(ch) * 10}%` }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 160,
                      damping: 20,
                      mass: 0.6 + (key % 3) * 0.15,
                    }
              }
              style={{ display: "flex", flexDirection: "column" }}
            >
              {"0123456789".split("").map((d) => (
                <span key={d} style={{ height: "1.2em" }}>
                  {d}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * Send money to a friend. Pick who it's for, type the amount on the keypad (each digit rises into place and the
 * thousands separator slides in as the number grows), then slide their face along the track to send. When it lets
 * go, the amount itself flies: every digit lifts off in turn and arcs up into their picture, which swells to catch
 * each one, while your balance rolls down by the same amount and the track turns into a green Sent. Try to send more
 * than you have and the number shakes and turns red. Typing works from the keyboard too, and the slider takes Enter.
 */
export default function SendMoney({
  payees = DEFAULT_PAYEES,
  balance: balance0 = 4820.5,
  currency = "$",
  onSend,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: SendMoneyProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [who, setWho] = useState(0);
  const [amt, setAmt] = useState("120");
  const amtRef = useRef(amt);
  amtRef.current = amt;
  const [balance, setBalance] = useState(balance0);
  const [phase, setPhase] = useState<"edit" | "flying" | "sent">("edit");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [flyers, setFlyers] = useState<
    {
      k: string;
      ch: string;
      x: number;
      y: number;
      tx: number;
      ty: number;
      d: number;
      size: number;
    }[]
  >([]);
  const [catchN, setCatchN] = useState(0);
  const [shakeK, setShakeK] = useState(0);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const amountEl = useRef<HTMLDivElement>(null);
  const faces = useRef<(HTMLButtonElement | null)[]>([]);
  const track = useRef<HTMLDivElement>(null);
  const kx = useMotionValue(0);
  const value = Number(amt || "0");
  const over = value > balance;
  const p = payees[who];

  const formatted = value.toLocaleString("en-US");
  const press = (k: string) => {
    if (phaseRef.current !== "edit") return;
    const cur = amtRef.current;
    if (k === "del") {
      if (!cur) return;
      setAmt(cur.slice(0, -1));
      sfx.tick({ freq: 1500, gain: 0.03 });
      return;
    }
    if (cur.length >= 5 || (cur === "" && k === "0")) {
      setShakeK((n) => n + 1);
      sfx.note(220, { dur: 0.12, gain: 0.03, type: "triangle" });
      return;
    }
    const next = cur + k;
    setAmt(next);
    if (Number(next) > balance) {
      setShakeK((n) => n + 1);
      sfx.note(233, { dur: 0.18, gain: 0.035, type: "triangle" });
    } else sfx.note(740 + Number(k) * 38, { dur: 0.09, gain: 0.025, bell: 0.2 });
  };

  // the slider
  const maxX = () => (track.current ? track.current.clientWidth - KNOB - 8 : 260);
  const drag = useRef<{ x0: number; k0: number } | null>(null);
  const textFade = useTransform(kx, (v) => Math.max(0, 1 - v / 120));
  const fillW = useTransform(kx, (v) => v + KNOB + 8);
  const canSend = value > 0 && !over && phase === "edit";
  const knobDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    if (!canSend) {
      setShakeK((n) => n + 1);
      sfx.note(220, { dur: 0.12, gain: 0.03, type: "triangle" });
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    kx.stop();
    drag.current = { x0: e.clientX, k0: kx.get() };
    sfx.tick({ freq: 1800, gain: 0.03 });
  };
  const lastNotch = useRef(0);
  const knobMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const m = maxX();
    const raw = d.k0 + e.clientX - d.x0;
    const band = (o: number) => Math.sign(o) * (1 - 1 / (Math.abs(o) / 50 + 1)) * 50;
    kx.set(raw < 0 ? band(raw) : raw > m ? m + band(raw - m) : raw);
    // faint clicks as it travels
    const notch = Math.floor((Math.max(0, Math.min(m, raw)) / m) * 8);
    if (notch !== lastNotch.current) {
      lastNotch.current = notch;
      sfx.tick({ freq: 2200 + notch * 160, gain: 0.012 });
    }
  };
  const knobUp = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    if (kx.get() > maxX() * 0.82) send();
    else animate(kx, 0, { type: "spring", stiffness: 420, damping: 22 });
  };

  const send = () => {
    if (!canSend) return;
    const m = maxX();
    animate(kx, m, { type: "spring", stiffness: 500, damping: 34 });
    setPhase("flying");
    const c = card.current;
    const a = amountEl.current;
    const f = faces.current[who];
    const sent = value;
    const done = () => {
      setBalance((b) => Math.round((b - sent) * 100) / 100);
      setPhase("sent");
      onSend?.(p, sent);
      sfx.note(784, { dur: 0.25, gain: 0.04, bell: 0.5 });
      sfx.note(1175, { at: 0.1, dur: 0.45, gain: 0.04, bell: 0.6 });
    };
    if (!c || !a || !f || reduce) {
      done();
      return;
    }
    const cb = c.getBoundingClientRect();
    const fb = f.getBoundingClientRect();
    const tx = fb.left - cb.left + fb.width / 2;
    const ty = fb.top - cb.top + fb.height / 2;
    const spans = [...a.querySelectorAll("[data-glyph]")] as HTMLElement[];
    const fl = spans.map((s, i) => {
      const r = s.getBoundingClientRect();
      return {
        k: `${Date.now()}-${i}`,
        ch: s.textContent ?? "",
        x: r.left - cb.left,
        y: r.top - cb.top,
        tx,
        ty,
        d: i * 0.07,
        size: parseFloat(getComputedStyle(s).fontSize),
      };
    });
    setFlyers(fl);
    sfx.whoosh(800, 3000, { dur: 0.6, gain: 0.04 });
    fl.forEach((_, i) => {
      window.setTimeout(
        () => {
          setCatchN((n) => n + 1);
          sfx.note(880 + i * 120, { dur: 0.12, gain: 0.03, bell: 0.4 });
        },
        (0.62 + i * 0.07) * 1000,
      );
    });
    window.setTimeout(
      () => {
        setFlyers([]);
        done();
      },
      (0.7 + fl.length * 0.07) * 1000,
    );
  };
  const again = () => {
    setPhase("edit");
    setAmt("");
    animate(kx, 0, { type: "spring", stiffness: 300, damping: 26 });
  };

  // keyboard: digits, Backspace, Enter
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (/^[0-9]$/.test(e.key)) {
      touched.current = true;
      press(e.key);
    } else if (e.key === "Backspace") {
      touched.current = true;
      press("del");
    }
  };

  // autoplay: choose someone, type an amount, slide to send, start again
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const pos = (el: Element | null | undefined) => {
      const c = card.current;
      if (!c || !el) return [0, 0] as const;
      const r = el.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      return [r.left - cb.left + r.width / 2, r.top - cb.top + r.height / 2] as const;
    };
    const go = async (el: Element | null | undefined, ms = 480) => {
      const [x, y] = pos(el);
      setGhost(true);
      await Promise.all([
        animate(gx, x, { duration: ms / 1000, ease: [0.4, 0, 0.2, 1] }),
        animate(gy, y, { duration: ms / 1000, ease: [0.4, 0, 0.2, 1] }),
      ]);
    };
    const tap = async () => {
      setGhostDown(true);
      await wait(100);
      setGhostDown(false);
    };
    const key = (k: string) => card.current?.querySelector(`[data-key="${k}"]`);
    const run = async () => {
      await wait(1200);
      let n = 0;
      while (ok()) {
        const pick = [1, 3, 0, 4][n % 4];
        await go(faces.current[pick]);
        await tap();
        setWho(pick);
        sfx.tick({ freq: 2400, gain: 0.03 });
        await wait(500);
        if (amtRef.current) {
          for (let i = amtRef.current.length; i > 0 && ok(); i--) {
            await go(key("del"), 260);
            await tap();
            press("del");
          }
        }
        for (const d of ["250", "85", "1200", "40"][n % 4]) {
          if (!ok()) return;
          await go(key(d), 330);
          await tap();
          press(d);
          await wait(140);
        }
        await wait(500);
        if (!ok()) return;
        // slide the face along
        const t = track.current;
        if (!t) return;
        const [kxp, kyp] = pos(t.querySelector("[data-knob]"));
        await Promise.all([animate(gx, kxp, { duration: 0.5 }), animate(gy, kyp, { duration: 0.5 })]);
        setGhostDown(true);
        const m = maxX();
        await animate(0, 1, {
          duration: 0.9,
          ease: [0.5, 0, 0.3, 1],
          onUpdate: (k) => {
            kx.set(m * 0.95 * k);
            gx.set(kxp + m * 0.95 * k);
          },
        });
        setGhostDown(false);
        send();
        setGhost(false);
        await wait(3600);
        if (!ok()) return;
        await go(card.current?.querySelector("[data-again]"));
        await tap();
        again();
        await wait(900);
        n++;
      }
    };
    run().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const glyphs = useMemo(() => [...formatted], [formatted]);
  const flying = phase === "flying";

  return (
    <div
      className={`relative w-full max-w-[380px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        ref={card}
        tabIndex={-1}
        onKeyDown={onKey}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          borderRadius: 32,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -34px rgba(0,0,0,0.35)",
          padding: "20px 20px 18px",
          outline: "none",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              flex: 1,
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Send money
          </div>
          <div style={{ fontSize: 12.5, color: "#86868b" }}>
            Balance{" "}
            <Roll text={money(balance, currency)} reduce={reduce} style={{ fontWeight: 650, color: "#1d1d1f" }} />
          </div>
        </div>

        {/* who */}
        <div role="radiogroup" aria-label="Send to" style={{ display: "flex", margin: "16px -4px 0" }}>
          {payees.map((q, i) => {
            const on = i === who;
            return (
              <button
                key={q.id}
                ref={(b) => void (faces.current[i] = b)}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={phase !== "edit"}
                onClick={() => {
                  touched.current = true;
                  setWho(i);
                  sfx.tick({ freq: 2400, gain: 0.03 });
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  border: 0,
                  background: "transparent",
                  padding: "4px 0 2px",
                  borderRadius: 14,
                  cursor: phase === "edit" ? "pointer" : "default",
                }}
              >
                <motion.span
                  animate={{ scale: on ? 1 : 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                  style={{
                    position: "relative",
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    background: q.tint ?? "#f2f2f5",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {/* each arriving digit lands with a ripple */}
                  {on && catchN > 0 && (
                    <motion.span
                      key={catchN}
                      initial={{ scale: 0.9, opacity: 0.7 }}
                      animate={{ scale: 1.55, opacity: 0 }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 24,
                        boxShadow: "0 0 0 3px #0071e3",
                      }}
                    />
                  )}
                  <img
                    src={q.avatar}
                    alt=""
                    width={36}
                    height={36}
                    draggable={false}
                    style={{ width: 36, height: 36 }}
                  />
                  {on && (
                    <motion.span
                      layoutId="send-ring"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 34,
                      }}
                      style={{
                        position: "absolute",
                        inset: -4,
                        borderRadius: 28,
                        boxShadow: "0 0 0 2px #0071e3",
                      }}
                    />
                  )}
                </motion.span>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: on ? 650 : 500,
                    color: on ? "#1d1d1f" : "#86868b",
                  }}
                >
                  {q.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* the amount */}
        <motion.div
          key={shakeK}
          animate={shakeK ? { x: [0, -10, 9, -6, 4, 0] } : undefined}
          transition={{ duration: 0.38 }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            height: 84,
            margin: "20px 0 0",
          }}
        >
          <div
            ref={amountEl}
            aria-live="polite"
            aria-label={`${currency}${formatted}`}
            style={{
              display: "flex",
              alignItems: "flex-start",
              color: over ? "#ff3b30" : value ? "#1d1d1f" : "#c7c7cc",
              transition: "color 0.25s",
            }}
          >
            <span
              style={{
                fontSize: 34,
                fontWeight: 600,
                marginTop: 9,
                marginRight: 3,
                color: over ? "#ff3b30" : "#86868b",
              }}
            >
              {currency}
            </span>
            <AnimatePresence initial={false} mode="popLayout">
              {glyphs.map((ch, i) => (
                <motion.span
                  key={`${glyphs.length - i}-${ch === "," ? "c" : "d"}`}
                  data-glyph
                  layout="position"
                  initial={reduce ? false : { y: 26, opacity: 0, filter: "blur(6px)", scale: 0.85 }}
                  animate={{
                    y: 0,
                    opacity: flying ? 0 : 1,
                    filter: "blur(0px)",
                    scale: 1,
                  }}
                  exit={{
                    y: -22,
                    opacity: 0,
                    filter: "blur(4px)",
                    transition: { duration: 0.16 },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 520,
                    damping: 30,
                    opacity: { duration: flying ? 0.05 : 0.2 },
                    filter: { duration: 0.2 },
                  }}
                  style={{
                    display: "inline-block",
                    fontSize: 64,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            height: 18,
            color: over ? "#ff3b30" : "#86868b",
            transition: "color 0.25s",
          }}
        >
          {over
            ? `That's more than your ${money(balance, currency)}`
            : phase === "sent"
              ? `Sent to ${p.name}`
              : `To ${p.name}, arrives instantly`}
        </div>

        {/* keypad */}
        <div
          role="group"
          aria-label="Amount keypad"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 4,
            margin: "14px 0 14px",
          }}
        >
          {KEYS.map((k) =>
            k ? (
              <motion.button
                key={k}
                type="button"
                data-key={k}
                aria-label={k === "del" ? "Delete" : k}
                disabled={phase !== "edit"}
                whileTap={{ scale: 0.9, backgroundColor: "#ececf0" }}
                onClick={() => {
                  touched.current = true;
                  press(k);
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                style={{
                  height: 50,
                  border: 0,
                  borderRadius: 16,
                  background: "transparent",
                  fontSize: 24,
                  fontWeight: 500,
                  color: "#1d1d1f",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {k === "del" ? <Ico d={I.back} size={22} /> : k}
              </motion.button>
            ) : (
              <span key="blank" />
            ),
          )}
        </div>

        {/* slide to send */}
        <div
          ref={track}
          style={{
            position: "relative",
            height: 58,
            borderRadius: 29,
            background: "#f2f2f5",
            overflow: "hidden",
          }}
        >
          <motion.div
            aria-hidden="true"
            animate={{
              backgroundColor: phase === "sent" ? "#30d158" : "#0071e3",
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: fillW,
              borderRadius: 29,
              opacity: canSend || phase !== "edit" ? 1 : 0.25,
            }}
          />
          <AnimatePresence mode="wait" initial={false}>
            {phase === "sent" ? (
              <motion.button
                key="sent"
                data-again
                type="button"
                onClick={() => {
                  touched.current = true;
                  again();
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{
                  position: "absolute",
                  inset: 0,
                  border: 0,
                  background: "transparent",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 15.5,
                  fontWeight: 650,
                  cursor: "pointer",
                  zIndex: 2,
                }}
              >
                <motion.span
                  initial={{ scale: 0, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 16,
                    delay: 0.1,
                  }}
                  style={{ display: "grid" }}
                >
                  <Ico d={I.check} size={18} />
                </motion.span>
                Sent {money(Number(amt || 0), currency, false)} to {p.name}
              </motion.button>
            ) : (
              <motion.div
                key="label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: KNOB,
                  pointerEvents: "none",
                }}
              >
                <motion.span
                  style={{
                    opacity: textFade,
                    fontSize: 15,
                    fontWeight: 600,
                    color: canSend ? "transparent" : "#a1a1a6",
                    backgroundImage: canSend
                      ? "linear-gradient(90deg, #6e6e73 0%, #6e6e73 40%, #ffffff 50%, #6e6e73 60%, #6e6e73 100%)"
                      : undefined,
                    backgroundSize: "250% 100%",
                    WebkitBackgroundClip: canSend ? "text" : undefined,
                    backgroundClip: canSend ? "text" : undefined,
                    animation: canSend && !reduce ? "sendmoney-sheen 2.4s linear infinite" : undefined,
                  }}
                >
                  {canSend
                    ? `Slide to send ${money(value, currency, false)}`
                    : over
                      ? "Not enough in your balance"
                      : "Type an amount"}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
          {phase !== "sent" && (
            <motion.div
              data-knob
              role="slider"
              tabIndex={0}
              aria-label={`Slide to send ${money(value, currency, false)} to ${p.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
              onPointerDown={knobDown}
              onPointerMove={knobMove}
              onPointerUp={knobUp}
              onPointerCancel={knobUp}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "ArrowRight") {
                  e.preventDefault();
                  touched.current = true;
                  send();
                }
              }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{
                position: "absolute",
                left: 4,
                top: 5,
                width: KNOB,
                height: KNOB,
                borderRadius: KNOB / 2,
                x: kx,
                background: p.tint ?? "#fff",
                boxShadow: "0 0 0 2px #fff, 0 6px 14px -6px rgba(0,0,0,0.4)",
                display: "grid",
                placeItems: "center",
                cursor: canSend ? "grab" : "not-allowed",
                touchAction: "none",
                zIndex: 3,
              }}
            >
              <img
                src={p.avatar}
                alt=""
                width={34}
                height={34}
                draggable={false}
                style={{ width: 34, height: 34, pointerEvents: "none" }}
              />
            </motion.div>
          )}
        </div>
        <style>
          {"@keyframes sendmoney-sheen { from { background-position: 125% 0 } to { background-position: -125% 0 } }"}
        </style>

        {/* the amount on its way */}
        {flyers.map((f) => (
          <motion.span
            key={f.k}
            aria-hidden="true"
            initial={{ x: f.x, y: f.y, scale: 1, opacity: 1 }}
            animate={{
              x: [f.x, (f.x + f.tx) / 2 + (f.x - f.tx) * 0.15, f.tx - f.size * 0.18],
              y: [f.y, Math.min(f.y, f.ty) - 70, f.ty - f.size * 0.6],
              scale: [1, 0.8, 0.12],
              opacity: [1, 1, 0],
            }}
            transition={{
              x: {
                duration: 0.62,
                delay: f.d,
                times: [0, 0.45, 1],
                ease: "easeInOut",
              },
              y: {
                duration: 0.62,
                delay: f.d,
                times: [0, 0.45, 1],
                ease: ["easeOut", "easeIn"],
              },
              scale: {
                duration: 0.62,
                delay: f.d,
                times: [0, 0.45, 1],
                ease: "easeIn",
              },
              opacity: {
                duration: 0.62,
                delay: f.d,
                times: [0, 0.85, 1],
                ease: "linear",
              },
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              fontSize: f.size,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "#0071e3",
              pointerEvents: "none",
              zIndex: 6,
              originX: 0.5,
              originY: 0.5,
            }}
          >
            {f.ch}
          </motion.span>
        ))}

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -13,
              top: -13,
              x: gx,
              y: gy,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: "rgba(29,29,31,0.18)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.85), 0 6px 14px -4px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
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
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
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

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
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
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
