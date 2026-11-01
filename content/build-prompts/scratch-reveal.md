# Scratch Reveal

Add the "Scratch Reveal" component from Nexus UI to my project.

A reward scratch card: rub the silver foil and it wears through where you scratch, shedding dust that falls out of the card. Once enough is gone the rest lifts away with a burst of confetti and the code can be copied to the clipboard.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { ScratchReveal } from "@/components/scratch-reveal";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/scratch-reveal/index.ts ---

```ts
export { ScratchReveal } from "./scratch-reveal";
export type { ScratchRevealProps } from "./scratch-reveal";
```

--- components/scratch-reveal/scratch-reveal.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface ScratchRevealProps {
  /** The code under the foil; copied to the clipboard by the Copy button. */
  code?: string;
  /** Prize line above the code. */
  headline?: string;
  /** Small uppercase line above the headline. */
  eyebrow?: string;
  /** Colour of the eyebrow. */
  accent?: string;
  /** Share of the foil (0..1) that must be scratched off before the rest lifts away. */
  threshold?: number;
  /** Called once each time the foil comes off (scratched, revealed with the keyboard, or by autoplay). */
  onReveal?: () => void;
  /** Called with the code after it has been copied to the clipboard. */
  onCopy?: (code: string) => void;
  /** Extra classes for the outer wrapper (it is 320px wide and shrinks with `max-w-full`). */
  className?: string;
  /** Scratches the card in a zig-zag, reveals it and starts over, until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

/** Card size and brush width in px. The card is drawn at this size and scaled down to fit narrower parents. */
const W = 320;
const H = 190;
const BRUSH = 22;
/** Extra canvas height below the card so dust can fall out of it. */
const SPILL = 80;
const CONFETTI = ["#ff375f", "#ffd60a", "#30d158", "#0a84ff", "#bf5af2"];

type Fleck = { x: number; y: number; vx: number; vy: number; life: number };

const dprOf = () => Math.min(2, window.devicePixelRatio || 1);

/** Brushed silver foil with grain and a "SCRATCH HERE" label. */
function paintFoil(c: HTMLCanvasElement) {
  const dpr = dprOf();
  c.width = W * dpr;
  c.height = H * dpr;
  // The first getContext call fixes the options; scratching reads pixels back often.
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return;
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.globalCompositeOperation = "source-over";
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#d9dadf");
  g.addColorStop(0.35, "#f4f5f8");
  g.addColorStop(0.5, "#b9bbc3");
  g.addColorStop(0.7, "#eceef2");
  g.addColorStop(1, "#c4c6cd");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  x.globalAlpha = 0.08;
  x.fillStyle = "#000";
  for (let i = 0; i < 900; i++) x.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  x.globalAlpha = 1;
  x.fillStyle = "rgba(29,29,31,.5)";
  x.font = "600 13px -apple-system, BlinkMacSystemFont, sans-serif";
  x.textAlign = "center";
  x.fillText("SCRATCH HERE", W / 2, H / 2 + 4);
}

/**
 * Scratch card for a reward. Rub the foil with the pointer: it wears through
 * where you scratch and sheds flecks of silver dust. Once most of it is gone
 * the rest of the foil lifts away on its own and the code is ready to copy.
 */
export function ScratchReveal({
  code = "MOTION20",
  headline = "20% off Pro",
  eyebrow = "You won",
  accent = "#bf5af2",
  threshold = 0.55,
  onReveal,
  onCopy,
  className = "",
  autoplay = false,
  enableSound = true,
}: ScratchRevealProps) {
  const play = useSound(enableSound);
  const foil = useRef<HTMLCanvasElement>(null);
  const dust = useRef<HTMLCanvasElement>(null);
  const fit = useRef<HTMLDivElement>(null);
  const flecks = useRef<Fleck[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef(0);
  const doneRef = useRef(false);
  const revealRef = useRef(onReveal);
  const touched = useRef(false);
  const lastSwipe = useRef(0);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const [pct, setPct] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    revealRef.current = onReveal;
  }, [onReveal]);

  const reveal = useCallback(
    (byUser = false) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setDone(true);
      if (byUser) play("success");
      else play.auto("success");
      revealRef.current?.();
    },
    [play],
  );

  // A fresh foil is painted whenever the card is (re)covered.
  useEffect(() => {
    if (!done && foil.current) paintFoil(foil.current);
  }, [done]);

  // Scale the fixed-size card down when the parent is narrower than 320px.
  useEffect(() => {
    const el = fit.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setScale(Math.min(1, entry.contentRect.width / W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Dust: a separate canvas, taller than the card, with simple gravity and fade.
  useEffect(() => {
    const d = dust.current;
    const dx = d?.getContext("2d");
    if (!d || !dx) return;
    const dpr = dprOf();
    d.width = W * dpr;
    d.height = (H + SPILL) * dpr;
    dx.scale(dpr, dpr);
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      dx.clearRect(0, 0, W, H + SPILL);
      flecks.current = flecks.current.filter((f) => f.life > 0);
      for (const f of flecks.current) {
        f.vy += 0.25;
        f.x += f.vx;
        f.y += f.vy;
        f.life -= 0.02;
        dx.globalAlpha = Math.max(0, f.life);
        dx.fillStyle = "#a1a3ab";
        dx.fillRect(f.x, f.y, 2, 2);
      }
      dx.globalAlpha = 1;
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  const scratch = useCallback(
    (x: number, y: number, byUser = false) => {
      const c = foil.current;
      const ctx = c?.getContext("2d", { willReadFrequently: true });
      if (doneRef.current || !c || !ctx) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = BRUSH;
      const l = last.current ?? { x, y };
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      last.current = { x, y };
      const now = performance.now();
      // The demo scratches on a frame loop, so its rasp is spaced wider than a hand's.
      if (now - lastSwipe.current >= (byUser ? 120 : 350)) {
        lastSwipe.current = now;
        if (byUser) play("swipe", 0.25);
        else play.auto("swipe", 0.25);
      }
      for (let i = 0; i < 3; i++) {
        flecks.current.push({ x: x + (Math.random() - 0.5) * BRUSH, y: y + (Math.random() - 0.5) * 8, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 1.5, life: 1 });
      }
      // Every 12th stroke, sample every 16th pixel's alpha to estimate how much foil is left.
      if (++strokes.current % 12 === 0) {
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        let clear = 0;
        let total = 0;
        for (let i = 3; i < data.length; i += 4 * 16) {
          total++;
          if (data[i] < 40) clear++;
        }
        const p = clear / total;
        setPct(Math.round(p * 100));
        if (p > threshold) reveal(byUser);
      }
    },
    [threshold, reveal, play],
  );

  useEffect(() => {
    if (!autoplay) return;
    let raf = 0;
    let t = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (touched.current) {
        cancelAnimationFrame(raf);
        return;
      }
      t += 1;
      if (t < 220) {
        const k = t / 220;
        const x = 30 + ((Math.sin(k * Math.PI * 9) + 1) / 2) * (W - 60);
        const y = 25 + k * (H - 50);
        scratch(x, y);
      } else if (t > 380) {
        t = 0;
        last.current = null;
        strokes.current = 0;
        doneRef.current = false;
        setDone(false);
        setPct(0);
        setCopied("idle");
        if (foil.current) paintFoil(foil.current);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, scratch]);

  /** Pointer position in card coordinates (works at any scale). */
  const pos = (e: RPointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const copy = async () => {
    touched.current = true;
    play("tap");
    try {
      await navigator.clipboard.writeText(code);
      setCopied("copied");
      onCopy?.(code);
    } catch {
      // Clipboard can be blocked (permissions, insecure context, sandboxed iframe).
      setCopied("failed");
    }
  };

  return (
    <div
      className={`flex flex-col items-center gap-3 ${className}`.trim()}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div ref={fit} className="w-[320px] max-w-full" style={{ height: H * scale }}>
        <div className="relative overflow-visible" style={{ width: W, height: H, transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: "0 0" }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-[22px] text-center [background:radial-gradient(120%_100%_at_20%_0%,#fff3d6,transparent_60%),linear-gradient(135deg,#ffe7f0,#e8e4ff)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] dark:[background:radial-gradient(120%_100%_at_20%_0%,rgba(255,214,140,.16),transparent_60%),linear-gradient(135deg,#3a2433,#262140)]">
            <span className="text-[12px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
              {eyebrow}
            </span>
            <span className="text-[30px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{headline}</span>
            <button
              type="button"
              disabled={!done}
              onClick={copy}
              aria-label={copied === "copied" ? `Code ${code} copied` : `Copy code ${code}`}
              className="mt-1 flex items-center gap-2 rounded-full border border-dashed border-[#1d1d1f]/30 bg-white/70 px-4 py-2 text-[15px] font-semibold tracking-[0.12em] text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] disabled:opacity-100 dark:border-white/30 dark:bg-white/10 dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
              style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }}
            >
              {code}
              <span className="text-[11px] font-medium tracking-normal text-[#0071e3] dark:text-[#0a84ff]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                {copied === "copied" ? "Copied" : copied === "failed" ? "Couldn't copy" : "Copy"}
              </span>
            </button>
          </div>
          <AnimatePresence>
            {!done && (
              <motion.canvas
                key="foil"
                ref={foil}
                tabIndex={0}
                role="button"
                aria-label="Scratch card foil. Scratch it off, or press Enter to reveal the code."
                className="absolute inset-0 h-full w-full cursor-crosshair touch-none rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
                exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)", transition: { duration: 0.6 } }}
                onPointerDown={(e) => {
                  touched.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  last.current = null;
                  const p = pos(e);
                  scratch(p.x, p.y, true);
                }}
                onPointerMove={(e) => {
                  if (e.buttons || e.pointerType === "touch") {
                    const p = pos(e);
                    scratch(p.x, p.y, true);
                  } else last.current = null;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    touched.current = true;
                    reveal(true);
                  }
                }}
              />
            )}
          </AnimatePresence>
          {done &&
            Array.from({ length: 14 }, (_, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className="pointer-events-none absolute h-2 w-2 rounded-[2px]"
                style={{ left: W / 2, top: H / 2, background: CONFETTI[i % CONFETTI.length] }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: Math.cos(i) * (120 + (i % 3) * 30), y: Math.sin(i) * 80 - 30, opacity: 0, rotate: 180 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            ))}
          <canvas ref={dust} className="pointer-events-none absolute left-0 top-0" style={{ width: W, height: H + SPILL }} aria-hidden="true" />
        </div>
      </div>
      <span className="text-[13px] tabular-nums text-[#86868b] dark:text-[#98989d]">
        {done ? "Revealed. Tap the code to copy it." : `Scratch the foil · ${pct}%`}
      </span>
      <span role="status" className="sr-only">
        {done ? `Revealed: ${code}` : ""}
      </span>
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
