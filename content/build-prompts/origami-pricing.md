# Origami Pricing

Add the "Origami Pricing" component from Nexus UI to my project.

A pricing card folded like a paper map. Tap it and it opens in two folds: the features panel swings out, then the quote and call-to-action drop down, with creases darkening mid-turn.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { OrigamiPricing } from "@/components/origami-pricing";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/origami-pricing/index.ts ---

```ts
export { OrigamiPricing } from "./origami-pricing";
export type { OrigamiPricingProps } from "./origami-pricing";
```

--- components/origami-pricing/origami-pricing.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface OrigamiPricingProps {
  /** Plan name on the cover. Its first letter becomes the logo tile. */
  planName?: string;
  /** Price on the cover, including the currency symbol. */
  price?: string;
  /** Small unit after the price. */
  period?: string;
  /** Lines in the features panel. */
  features?: string[];
  /** Customer quote on the lower-left panel. */
  quote?: string;
  /** Who said it. */
  author?: string;
  /** Label of the call-to-action button. */
  ctaLabel?: string;
  /** Small line under the button. */
  note?: string;
  /** Called when the button is pressed. The component never navigates or takes payment itself. */
  onCtaClick?: () => void;
  /** Line under the card. Pass an empty string to hide it. */
  caption?: string;
  /** Folds and unfolds by itself until someone taps the card. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const P = 170;
const DEFAULT_FEATURES = ["All components", "All templates", "Source + Figma", "Requests first"];

const edge = "shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]";

function Face({ children, back = false, shade, className = "" }: { children?: ReactNode; back?: boolean; shade: MotionValue<number>; className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: back ? "rotateY(180deg)" : undefined }}>
      {children}
      <motion.div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 to-black/5" style={{ opacity: shade }} />
    </div>
  );
}
const paperBack = `${edge} bg-[#f1efe8] bg-[repeating-linear-gradient(135deg,rgba(0,0,0,.025)_0_2px,transparent_2px_6px)] dark:bg-[#2a2a2c] dark:bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.03)_0_2px,transparent_2px_6px)]`;

/**
 * A pricing card folded like a paper map. Tap it and it opens in two folds:
 * the right panel swings out from behind with the features, then the bottom
 * half drops down with a customer quote and the button. Creases darken while
 * a panel is mid-turn, and folding it away runs the same moves backwards.
 */
export function OrigamiPricing({
  planName = "Nexus Pro",
  price = "$9",
  period = "/mo",
  features = DEFAULT_FEATURES,
  quote = "Paid for itself in the first week.",
  author = "Maya, Loop",
  ctaLabel = "Start free trial",
  note = "14 days · cancel anytime",
  onCtaClick,
  caption = "Two folds: out, then down.",
  autoplay = false,
  enableSound = true,
}: OrigamiPricingProps) {
  const play = useSound(enableSound);
  const a = useMotionValue(0), b = useMotionValue(0);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const touched = useRef(false);

  const rotTR = useTransform(a, (v) => `rotateY(${180 * (1 - v)}deg) translateZ(${(1 - v) * 1}px)`); // after a half turn, +z points away: tucks it behind
  const rotDown = useTransform(b, (v) => `rotateX(${-180 * (1 - v)}deg) translateZ(${(1 - v) * 2}px)`);
  // folded panels tuck behind the cover; hide them so their edges can't peek round its rounded corners
  const showA = useTransform(a, (v) => (v < 0.02 ? 0 : 1));
  const showB = useTransform(b, (v) => (v < 0.02 ? 0 : 1));
  const shadeA = useTransform(a, (v) => Math.sin(Math.PI * v) * 0.9 + (1 - v) * 0.3);
  const shadeB = useTransform(b, (v) => Math.sin(Math.PI * v) * 0.9 + (1 - v) * 0.3);
  const left = useTransform(a, (v) => (1 - v) * (P / 2));
  const top = useTransform(b, (v) => (1 - v) * (P / 2));
  const shadowW = useTransform(a, (v) => P * 0.9 + v * P);
  const shadowY = useTransform(b, (v) => P * 1.5 + v * (P / 2) + 8);

  const toggle = useCallback(async (byUser = false) => {
    if (busy.current) return;
    busy.current = true;
    const next = !open;
    if (byUser) play(next ? "whoosh" : "swipe", next ? 1 : 0.7);
    else play.auto(next ? "whoosh" : "swipe", next ? 1 : 0.7);
    setOpen(next);
    if (next) {
      await animate(a, 1, { type: "spring", stiffness: 120, damping: 15 });
      await animate(b, 1, { type: "spring", stiffness: 110, damping: 14 });
    } else {
      await animate(b, 0, { type: "spring", stiffness: 160, damping: 22 });
      await animate(a, 0, { type: "spring", stiffness: 160, damping: 22 });
    }
    busy.current = false;
  }, [open, a, b, play]);

  useEffect(() => {
    if (!autoplay) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let inView = true;
    const io = typeof IntersectionObserver === "undefined" || !root.current ? null : new IntersectionObserver(([e]) => { inView = e.isIntersecting; });
    if (io && root.current) io.observe(root.current);
    const id = setInterval(() => {
      if (touched.current) return clearInterval(id);
      if (!inView || document.hidden) return;
      void toggle();
    }, 2600);
    return () => { clearInterval(id); io?.disconnect(); };
  }, [autoplay, toggle]);

  return (
    <div ref={root} className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: P * 2, height: P * 2, perspective: 1100 }}>
        <motion.div className="absolute left-1/2 h-6 -translate-x-1/2 rounded-[50%] bg-black/20 blur-xl dark:bg-black/60" style={{ width: shadowW, top: shadowY }} />
        <motion.div className="absolute" style={{ left, top, width: P, height: P, transformStyle: "preserve-3d" }}>
          {/* top-left: the cover, always facing you */}
          <button
            type="button"
            onClick={() => { touched.current = true; void toggle(true); }}
            aria-expanded={open}
            aria-label={open ? `Fold the ${planName} plan card` : `Unfold the ${planName} plan card`}
            className={`absolute inset-0 flex flex-col justify-between rounded-tl-[18px] bg-white p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#1c1c1e] dark:focus-visible:ring-[#2997ff] ${edge}`}
            style={{ transform: "translateZ(2px)", borderBottomLeftRadius: open ? 0 : 18, borderTopRightRadius: open ? 0 : 18, borderBottomRightRadius: open ? 0 : 18 }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#1d1d1f] text-[13px] font-bold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">{planName.charAt(0).toUpperCase()}</span>
            <span>
              <span className="block text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{planName}</span>
              <span className="block text-[36px] font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">{price}<span className="text-[15px] font-medium tracking-normal text-[#86868b] dark:text-[#8e8e93]">{period}</span></span>
              <span className="mt-2 block text-[12px] font-medium text-[#0071e3] dark:text-[#2997ff]">{open ? "Fold it back" : "Tap to unfold"}</span>
            </span>
          </button>

          {/* right panel, hinged on the cover's right edge */}
          <motion.div aria-hidden={!open} className="absolute top-0" style={{ left: P, width: P, height: P, transformOrigin: "0 50%", transformStyle: "preserve-3d", transform: rotTR, opacity: showA }}>
            <Face shade={shadeA} className={`rounded-tr-[18px] bg-white p-5 dark:bg-[#1c1c1e] ${edge}`}>
              <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#86868b] dark:text-[#8e8e93]">Includes</span>
              <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
                {features.map((f) => <li key={f} className="flex items-center gap-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>{f}</li>)}
              </ul>
            </Face>
            <Face back shade={shadeA} className={paperBack} />
            {/* bottom-right, hinged under the right panel */}
            <motion.div className="absolute left-0" style={{ top: P, width: P, height: P, transformOrigin: "50% 0", transformStyle: "preserve-3d", transform: rotDown, opacity: showB }}>
              <Face shade={shadeB} className={`flex flex-col justify-end rounded-br-[18px] bg-[#1d1d1f] p-5 dark:bg-[#f5f5f7] ${edge}`}>
                <button
                  type="button"
                  disabled={!open}
                  onClick={() => { play("tap"); onCtaClick?.(); }}
                  className="h-10 w-full rounded-full bg-white text-[14px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#1d1d1f] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
                >
                  {ctaLabel}
                </button>
                <span className="mt-2 text-center text-[11px] text-white/60 dark:text-black/55">{note}</span>
              </Face>
              <Face back shade={shadeB} className={paperBack} />
            </motion.div>
          </motion.div>

          {/* bottom-left, hinged on the cover's bottom edge */}
          <motion.div aria-hidden={!open} className="absolute left-0" style={{ top: P, width: P, height: P, transformOrigin: "50% 0", transformStyle: "preserve-3d", transform: rotDown, opacity: showB }}>
            <Face shade={shadeB} className={`flex flex-col justify-between rounded-bl-[18px] bg-[#f5f5f7] p-5 dark:bg-[#2c2c2e] ${edge}`}>
              <span className="text-[15px] leading-[1.35] tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">“{quote}”</span>
              <span className="flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-gradient-to-br from-[#ff9f0a] to-[#ff375f]" /><span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{author}</span></span>
            </Face>
            <Face back shade={shadeB} className={paperBack} />
          </motion.div>
        </motion.div>
      </div>
      {caption ? <span className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">{caption}</span> : null}
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
