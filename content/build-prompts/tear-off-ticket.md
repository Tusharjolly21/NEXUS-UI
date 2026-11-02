# Tear-off Ticket

Add the "Tear-off Ticket" component from Nexus UI to my project.

An event ticket whose stub you pull away along the perforation. Let go early and it snaps back; pull through and it hangs on the last tooth, swings, then drops. Also includes the Motion Kit Ticket CTA variant: an event call to action printed as a ticket, with a button that tears the stub for you.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { TearOffTicket } from "@/components/tear-off-ticket/tear-off-ticket";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/tear-off-ticket/tear-off-ticket.tsx ---

```tsx
"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface TearOffTicketProps {
  title?: string;
  venue?: string;
  date?: string;
  seat?: string;
  /** Tears itself and resets on a loop until the user grabs the stub. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const PULL = 150; // px of drag needed to tear through

/**
 * Pull the stub away from the ticket. The perforation gives way from the top
 * down (the stub pivots on its last tooth); release early and it snaps back,
 * pull far enough and it hangs for a beat, then drops.
 */
export function TearOffTicket({ title = "Light & Matter", venue = "Hall 3 · North Gallery", date = "Sat 14 Nov · 11:00", seat = "Row C · Seat 12", autoplay = false, enableSound = true }: TearOffTicketProps) {
  const play = useSound(enableSound);
  const p = useMotionValue(0); // 0..1 tear progress
  const rotate = useTransform(p, [0, 1], [0, 26]);
  const teethOpacity = useTransform(p, [0, 1], [1, 0.4]);
  const [torn, setTorn] = useState(false);
  const [gone, setGone] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const touched = useRef(false);
  const tearT = useRef<number | undefined>(undefined);

  const tear = () => {
    setTorn(true);
    animate(p, 1, { duration: 0.1 });
    tearT.current = window.setTimeout(() => setGone(true), 650);
  };

  const reset = () => {
    clearTimeout(tearT.current);
    setGone(false);
    setTorn(false);
    p.set(0);
  };

  const autoReset = useEffectEvent(() => reset());
  const autoTear = useEffectEvent(() => { play.auto("swipe"); tear(); });

  useEffect(() => {
    if (!autoplay) return;
    let wait: number | undefined;
    let ctl: ReturnType<typeof animate> | null = null;
    let alive = true;
    const stopped = () => !alive || touched.current;
    const run = () => {
      if (stopped()) return;
      autoReset();
      wait = window.setTimeout(() => {
        if (stopped()) return;
        ctl = animate(p, 0.55, { duration: 0.7, ease: "easeInOut" });
        ctl.then(() => {
          if (stopped()) return;
          ctl = animate(p, 0.2, { type: "spring", stiffness: 300, damping: 14 });
          ctl.then(() => {
            if (stopped()) return;
            ctl = animate(p, 1, { duration: 0.6, ease: "easeIn" });
            ctl.then(() => { if (!stopped()) autoTear(); });
          });
        });
      }, 900);
    };
    const first = window.setTimeout(run, 0);
    const t = setInterval(run, 5200);
    return () => {
      alive = false;
      clearTimeout(first);
      clearInterval(t);
      clearTimeout(wait);
      ctl?.stop();
    };
  }, [autoplay, p]);

  useEffect(() => () => clearTimeout(tearT.current), []);

  const teeth = Array.from({ length: 11 });

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative flex h-[180px] w-[420px] max-w-full select-none">
        {/* Main ticket */}
        <div className="relative flex h-full flex-1 overflow-hidden rounded-l-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-24px_rgba(0,0,0,.8)]">
          <div className="w-[118px] flex-none" style={{ background: "radial-gradient(90% 70% at 30% 25%, #ffd7b0, rgba(255,215,176,0) 60%), radial-gradient(80% 80% at 80% 90%, #a9c7ff, rgba(169,199,255,0) 60%), #efe7ff" }} />
          <div className="flex flex-1 flex-col justify-between p-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b] dark:text-[#8e8e93]">Exhibition</span>
              <span className="text-[19px] font-semibold leading-tight tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</span>
            </div>
            <div className="flex flex-col gap-0.5 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
              <span>{venue}</span>
              <span>{date}</span>
            </div>
          </div>
          {/* Perforation on the ticket side */}
          <span className="absolute inset-y-2 right-0 flex flex-col justify-between" aria-hidden="true">
            {teeth.map((_, i) => <span key={i} className="h-[6px] w-[3px] rounded-l-full bg-[#f5f5f7] dark:bg-black" />)}
          </span>
        </div>

        {/* Stub */}
        <AnimatePresence>
          {!gone && (
            <motion.div
              key="stub"
              role="button"
              tabIndex={0}
              aria-label={torn ? "Stub torn off" : "Tear off the stub. Drag it right or press Enter."}
              onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !torn) { e.preventDefault(); touched.current = true; play("swipe"); tear(); } }}
              onPointerDown={(e) => {
                if (torn) return;
                touched.current = true;
                (e.currentTarget as Element).setPointerCapture(e.pointerId);
                start.current = { x: e.clientX, y: e.clientY };
              }}
              onPointerMove={(e) => {
                if (!start.current || torn) return;
                const pull = Math.max(0, e.clientX - start.current.x) + Math.max(0, e.clientY - start.current.y) * 0.6;
                const v = Math.min(1, pull / PULL);
                p.set(v);
                if (v >= 1) { start.current = null; play("swipe"); tear(); }
              }}
              onPointerUp={() => {
                if (!start.current) return;
                start.current = null;
                if (!torn) animate(p, 0, { type: "spring", stiffness: 420, damping: 16 });
              }}
              initial={{ opacity: 0, x: 40 }}
              animate={torn ? { rotate: [26, 64, 44, 56, 50] } : { opacity: 1, x: 0 }}
              exit={{ y: 420, rotate: 110, opacity: 0, transition: { duration: 0.9, ease: [0.55, 0, 1, 0.45] } }}
              transition={torn ? { duration: 0.65, ease: "easeOut" } : { type: "spring", stiffness: 300, damping: 26 }}
              style={{ rotate: torn ? undefined : rotate, originX: 0, originY: 1 }}
              className="relative flex h-full w-[118px] flex-none cursor-grab touch-none flex-col items-center justify-center gap-2 rounded-r-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.4)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-24px_rgba(0,0,0,.8)] dark:focus-visible:ring-[#0a84ff]"
            >
              <motion.span className="absolute inset-y-2 left-0 flex flex-col justify-between" style={{ opacity: teethOpacity }} aria-hidden="true">
                {teeth.map((_, i) => <span key={i} className="h-[6px] w-[3px] rounded-r-full bg-[#f5f5f7] dark:bg-black" />)}
              </motion.span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b] dark:text-[#8e8e93]">Admit one</span>
              <span className="grid grid-cols-5 gap-[2px]" aria-hidden="true">
                {Array.from({ length: 25 }, (_, i) => (
                  <span
                    key={i}
                    className={`h-[7px] w-[7px] rounded-[1px] ${(i * 7) % 3 === 0 || i % 6 === 0 ? "bg-[#1d1d1f] dark:bg-[#f5f5f7]" : "bg-[#e8e8ed] dark:bg-[#3a3a3c]"}`}
                  />
                ))}
              </span>
              <span className="text-[11px] font-medium tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{seat}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex h-9 items-center">
        <AnimatePresence mode="wait">
          {gone ? (
            <motion.button key="reset" type="button" onClick={() => { touched.current = true; play("tap"); reset(); }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:outline-[#0a84ff]">
              New ticket
            </motion.button>
          ) : (
            <motion.span key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">
              Pull the stub to the right.
            </motion.span>
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

# Ticket CTA

Add the "Ticket CTA" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. The look assumes the Inter font through Tailwind's `font-sans`. If the project uses another font, leave that as it is.
7. Use it like this: `import { TicketCta } from "@/components/tear-off-ticket/ticket-cta";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/tear-off-ticket/ticket-cta.tsx ---

```tsx
"use client";
import { useEffect, useEffectEvent, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

/** What is printed on the ticket and its stub. */
export interface TicketCtaEvent {
  /** Event name, set large on the ticket. */
  title: string;
  /** Who is putting it on, under the title. */
  host: string;
  /** Day, as printed. Keep it short: "Sat 14 Nov". */
  date: string;
  /** Start time, as printed: "19:00 UTC". */
  time: string;
  /** Start in iCalendar UTC form (20261114T190000Z). Used by the Add to calendar file. */
  start: string;
  /** End in iCalendar UTC form (20261114T203000Z). */
  end: string;
  /** Row letter on the stub. */
  row: string;
  /** Seat number on the stub. */
  seat: string;
  /** Serial number printed in the corner of the ticket. */
  serial: string;
  /** People already coming. Counts up by one when the stub is torn off. Leave out to hide the line. */
  going?: number;
}

export interface TicketCtaProps {
  /** Event details. Any field you leave out keeps its default. */
  event?: Partial<TicketCtaEvent>;
  /** Label of the primary button, which tears the stub for people who cannot or would rather not drag. */
  ctaLabel?: string;
  /** Where the follow-up link goes once the stub has come away (a sign-up or checkout page, say). Without it the follow-up is Add to calendar. */
  href?: string;
  /** Label of the follow-up link that `href` produces. */
  doneLabel?: string;
  /** Called once when the stub comes away, by pull, key or button. Not called by autoplay. */
  onClaim?: () => void;
  /** Accent for the stamp, the print and the follow-up button in light mode. */
  accent?: string;
  /** The same, in dark mode. */
  accentDark?: string;
  /** Tugs at the stub now and then, tears it, resets and repeats, until the visitor touches the ticket. Off under reduced motion, and paused while the ticket is off screen. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
}

const EVENT: TicketCtaEvent = {
  title: "Open Studio Night",
  host: "With Pinegate Studio",
  date: "Sat 14 Nov",
  time: "19:00 UTC",
  start: "20261114T190000Z",
  end: "20261114T203000Z",
  row: "C",
  seat: "12",
  serial: "No. 004817",
  going: 1284,
};

// Framework7 Icons (MIT), via Iconify
const ICON_TICKET =
  "M49 12a4 4 0 0 1 4 4v4.45a3.2 3.2 0 0 1-1.767 2.86l-.183.085a5.001 5.001 0 0 0-.154 9.142l.2.088A3.08 3.08 0 0 1 53 35.469V40a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-4.263c0-1.302.725-2.489 1.869-3.087l.184-.09a5.001 5.001 0 0 0 .19-9.03l-.2-.095A3.46 3.46 0 0 1 3 20.28V16a4 4 0 0 1 4-4zm-.038 3.45H7.038a1 1 0 0 0-1 1v3.117A9.41 9.41 0 0 1 11.267 28a9.41 9.41 0 0 1-5.23 8.433v3.117a1 1 0 0 0 1 1h41.925a1 1 0 0 0 1-1v-3.117A9.41 9.41 0 0 1 44.733 28a9.41 9.41 0 0 1 5.23-8.433V16.45a1 1 0 0 0-1-1M39 33a3 3 0 1 1 0 6a3 3 0 0 1 0-6m0-8a3 3 0 1 1 0 6a3 3 0 0 1 0-6m0-8a3 3 0 1 1 0 6a3 3 0 0 1 0-6";
const ICON_ARROW_UP_RIGHT =
  "M44.02 36.215V14.207c0-1.336-.844-2.227-2.227-2.227l-22.008.047c-1.289 0-2.156.961-2.156 2.063c0 1.101.984 2.039 2.062 2.039h6.985l11.156-.422l-4.266 3.75l-20.93 20.977c-.421.422-.655.937-.655 1.43c0 1.1.984 2.156 2.132 2.156c.54 0 1.032-.211 1.453-.633L36.543 22.41l3.75-4.242l-.422 10.664v7.477c0 1.078.938 2.062 2.063 2.062c1.101 0 2.086-.914 2.086-2.156";

function Icon({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="currentColor" aria-hidden="true" className="shrink-0">
      <path d={d} />
    </svg>
  );
}

const H = 204; // ticket height in px; the tear geometry below is worked out in this space
const OVER = 5; // the stub's box overlaps the main part by this much, so their torn edges can interlock

// a seeded random, so the torn edge is the same on every render and both halves fit
const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const r1 = rng(11);
const EDGE = (() => {
  let o = 2.4;
  return Array.from({ length: 49 }, (_, i) => {
    o = Math.min(4.6, Math.max(0.4, o + (r1() - 0.5) * 2.6));
    return { y: (i / 48) * 100, o };
  });
})();
// the main part loses `o` from its right edge; the stub's left edge sits on the same line, so they mesh until pulled apart
const MAIN_CLIP = `polygon(0 0, ${EDGE.map((p) => `calc(100% - ${p.o.toFixed(2)}px) ${p.y}%`).join(", ")}, 0 100%)`;
const STUB_CLIP = `polygon(${EDGE.map((p) => `${(OVER - p.o).toFixed(2)}px ${p.y}%`).join(", ")}, 100% 100%, 100% 0)`;
// paper fibres that bridge the tear: how far up from the hinge each sits, and how far it stretches before it snaps
const r2 = rng(5);
const FIBRES = Array.from({ length: 30 }, () => ({ d: 8 + r2() * (H - 22), s: 2.5 + r2() * r2() * 16, k: (r2() - 0.5) * 4 }));
const HOLES = Array.from({ length: Math.floor((H - 34) / 8) }, (_, i) => 17 + i * 8 + 4);

const svg = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
// card stock: a fine grain, plus long faint fibres laid in one direction. Warm brown on the cream stock, warm white on the dark one.
const grain = (rgb: string, a: string) =>
  svg(`<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='a'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${rgb} 0 0 0 0 ${rgb} 0 0 0 0 ${rgb} 0 0 0 ${a}'/></filter><rect width='100%' height='100%' filter='url(#a)'/></svg>`);
const fibre = (r: string, g: string, b: string) =>
  svg(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='220'><filter id='b'><feTurbulence type='fractalNoise' baseFrequency='.03 .11' numOctaves='3' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 .7 -.36'/></filter><rect width='100%' height='100%' filter='url(#b)'/></svg>`);
const GRAIN = grain("0", ".5 -.24");
const GRAIN_D = grain("1", ".5 -.24");
const FIBRE = fibre(".45", ".4", ".34");
const FIBRE_D = fibre(".92", ".88", ".8");
// rubber-stamp ink never lands evenly
const INK = svg(`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='64'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='2' seed='9'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -5 3.5'/></filter><rect width='100%' height='100%' filter='url(#c)'/></svg>`);
// security print: interfering waves, the way real tickets are printed so they can't be copied cleanly. Used as a mask, so the accent colour (and the theme) can fill it.
const GUILLOCHE = (() => {
  let p = "";
  for (let k = 0; k < 16; k++) {
    let d = "";
    for (let x = 0; x <= 360; x += 3) {
      const y = 80 + Math.sin(x / 34 + k * 0.42) * (22 + k * 1.6) * Math.cos(x / 96 - k * 0.18);
      d += `${x ? "L" : "M"}${x} ${y.toFixed(1)}`;
    }
    p += `<path d='${d}'/>`;
  }
  return svg(`<svg xmlns='http://www.w3.org/2000/svg' width='360' height='160' fill='none' stroke='#000' stroke-width='.5'>${p}</svg>`);
})();

// a small code-like square, the same on every render
const QR = Array.from({ length: 81 }, (_, i) => {
  const x = i % 9;
  const y = Math.floor(i / 9);
  const finder = (fx: number, fy: number) => x >= fx && x < fx + 3 && y >= fy && y < fy + 3;
  if (finder(0, 0) || finder(6, 0) || finder(0, 6)) return !(x % 6 === 1 && y % 6 === 1);
  return (x * 7 + y * 13 + x * y) % 5 < 2;
});

// where a point `d` px up the stub's left edge has got to, once the stub has swung `a` degrees about the hinge
const swing = (d: number, a: number) => {
  const r = (a * Math.PI) / 180;
  return { x: d * Math.sin(r), y: H - d * Math.cos(r) };
};

/**
 * Every colour that has to change with the theme lives in these variables, on the root: the panel behind the ticket
 * (the holes show it), the card stock, the shadow tint and strength, the rim light and the paper fibres.
 */
const TOKENS = cn(
  "[--tc-bg:#f5f5f7] dark:[--tc-bg:#000]",
  "[--tc-paper:#fcfbf8] dark:[--tc-paper:#262522]",
  "[--tc-sh:30,25,20] dark:[--tc-sh:0,0,0]",
  "[--tc-sm:1] dark:[--tc-sm:2.6]",
  "[--tc-hl:.9] dark:[--tc-hl:.1]",
  "[--tc-shade:rgba(120,100,80,.06)] dark:[--tc-shade:rgba(0,0,0,.28)]",
  "[--tc-fo:rgba(60,50,40,.18)] dark:[--tc-fo:rgba(0,0,0,.55)]",
  "[--tc-fc:#fffdf9] dark:[--tc-fc:#bdb7ac]",
  "[--tc-press:0_1px_0_rgba(255,255,255,.85)] dark:[--tc-press:0_-1px_0_rgba(0,0,0,.6)]",
);
const PRESS = "[text-shadow:var(--tc-press)]";
const sh = (a: number) => `rgba(var(--tc-sh), calc(${a} * var(--tc-sm)))`;
const MAIN_SHADOW = `drop-shadow(0 .5px .5px ${sh(0.16)}) drop-shadow(0 10px 12px ${sh(0.07)}) drop-shadow(0 26px 30px ${sh(0.09)})`;

const LABEL = "text-[10px] font-semibold uppercase leading-none tracking-[0.12em] text-[#6e6e73] dark:text-[#a1a1a6]";

function Fibre({ d, s, k, angle }: { d: number; s: number; k: number; angle: MotionValue<number> }) {
  const path = useTransform(angle, (a) => {
    const p = swing(d, a);
    const y1 = H - d;
    const len = Math.hypot(p.x, p.y - y1);
    if (len < 0.7 || len > s) return "M0 0";
    return `M0 ${y1.toFixed(2)} Q${(p.x / 2 + k * (1 - len / s)).toFixed(2)} ${((y1 + p.y) / 2 + 0.8).toFixed(2)} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  });
  return (
    <>
      <motion.path d={path} style={{ stroke: "var(--tc-fo)" }} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <motion.path d={path} style={{ stroke: "var(--tc-fc)" }} strokeWidth={0.75} fill="none" strokeLinecap="round" />
    </>
  );
}

function Hole({ d, angle }: { d: number; angle: MotionValue<number> }) {
  // a perforation hole stays a hole until the tear reaches it
  const opacity = useTransform(angle, (a) => (2 * (H - d) * Math.sin((a * Math.PI) / 360) > 1.8 ? 0 : 1));
  return (
    <motion.span
      aria-hidden="true"
      className="absolute left-0 h-[3px] w-[3px] rounded-full bg-(--tc-bg) shadow-[inset_0_.5px_1px_rgba(0,0,0,.35)]"
      style={{ top: d - 1.5, x: "-50%", opacity }}
    />
  );
}

/** Paper layers shared by both halves: grain, fibres, a raking light and the pointer's sheen. */
function Stock({ sheen }: { sheen: MotionValue<string> }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply [background-image:var(--tc-fibre),var(--tc-grain)] dark:opacity-[.06] dark:mix-blend-normal dark:[background-image:var(--tc-fibre-d),var(--tc-grain-d)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,var(--tc-hl)) 0, rgba(255,255,255,0) 2px), linear-gradient(0deg, var(--tc-shade), transparent 30%)" }}
      />
      <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-soft-light dark:opacity-45" style={{ backgroundImage: sheen }} />
    </>
  );
}

const esc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");

/**
 * An event call to action printed as a ticket on card stock. Grab the stub and tear it away along the perforation: it
 * swings about the bottom of the line, the holes split one by one from the top and the paper fibres stretch across the
 * gap and snap. Let go early and it springs back with a wobble. Pull past the point of no return and it leaves with
 * the speed you gave it, fluttering as it falls, and the ticket is stamped. The primary button and the Enter or Space
 * key on the stub do the same without dragging.
 */
export function TicketCta({
  event,
  ctaLabel = "Claim my seat",
  href,
  doneLabel = "Continue",
  onClaim,
  accent = "#0071e3",
  accentDark = "#2997ff",
  autoplay = false,
  enableSound = true,
  className,
}: TicketCtaProps) {
  const ev: TicketCtaEvent = { ...EVENT, ...event };
  const play = useSound(enableSound);
  const reduce = useReducedMotion();
  const angle = useMotionValue(0);
  const fall = { x: useMotionValue(0), y: useMotionValue(0), r: useMotionValue(0), flip: useMotionValue(0), o: useMotionValue(1) };
  const rot = useTransform([angle, fall.r] as MotionValue<number>[], ([a, r]: number[]) => a + r);
  const kick = useMotionValue(0);
  const jolt = useMotionValue(0);
  // the whole ticket tilts toward the pointer, a light sliding across its surface
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [5, -5]), { stiffness: 170, damping: 22 });
  const ry = useSpring(useTransform(px, [0, 1], [-7, 7]), { stiffness: 170, damping: 22 });
  const sp = useSpring(px, { stiffness: 120, damping: 24 });
  const sheen = useTransform(sp, (p) => `linear-gradient(112deg, transparent ${p * 120 - 45}%, rgba(255,255,255,.95) ${p * 120 - 18}%, transparent ${p * 120 + 8}%)`);
  const foilPos = useTransform([sp, py] as MotionValue<number>[], ([a, b]: number[]) => `0 0, ${a * 100}% ${b * 100}%`);
  const crease = useTransform(angle, [0, 22], [0, 1]);
  const lift = useTransform([angle, fall.y] as MotionValue<number>[], ([a, y]: number[]) => {
    const l = Math.min(26, a * 0.7 + Math.max(0, -y) * 0.2 + (y > 0 ? 14 : 0));
    return `drop-shadow(0 .5px .5px ${sh(0.16)}) drop-shadow(0 ${(4 + l * 0.8).toFixed(1)}px ${(6 + l * 1.4).toFixed(1)}px ${sh(+(0.1 + l * 0.003).toFixed(3))})`;
  });

  const [claimed, setClaimed] = useState(false);
  const [byUser, setByUser] = useState(false);
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const main = useRef<HTMLDivElement>(null);
  const drag = useRef<{ hx: number; hy: number; th0: number; r0: number; s: { t: number; a: number; x: number; y: number }[] } | null>(null);
  const busy = useRef(false);
  const touched = useRef(false);
  const dead = useRef(false);
  const demoOwns = useRef(false);
  const wantFocus = useRef(false);
  const raf = useRef(0);
  const timers = useRef<number[]>([]);
  const inView = useInView(root, { amount: 0.3 });
  const going = ev.going === undefined ? undefined : ev.going + (claimed && byUser ? 1 : 0);

  useEffect(() => {
    dead.current = false;
    return () => {
      dead.current = true;
      cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // it leaves with whatever speed it was given, then gravity, air and a flutter take over
  const launch = (v: { vx: number; vy: number; vr: number }, by: "user" | "auto") => {
    if (dead.current) return;
    setClaimed(true);
    setByUser(by === "user");
    const sound = by === "user" ? play : play.auto;
    sound("swipe");
    later(() => sound("success"), 430);
    if (by === "user") onClaim?.();
    if (reduce) {
      // still state only: the stub fades out, no flight
      animate(fall.o, 0, { duration: 0.25 }).then(() => {
        if (!dead.current) setGone(true);
      });
      return;
    }
    animate(kick, 0, { type: "spring", stiffness: 420, damping: 11, velocity: -34 });
    later(() => animate(jolt, 0, { type: "spring", stiffness: 700, damping: 15, velocity: 110 }), 430);
    let x = 0;
    let y = 0;
    let r = 0;
    let t = 0;
    let last = performance.now();
    let { vx, vy, vr } = v;
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      t += dt;
      vy += 2500 * dt;
      vy *= 1 - 0.35 * dt;
      vx *= 1 - 0.9 * dt;
      vr *= 1 - 0.6 * dt;
      x += vx * dt;
      y += vy * dt;
      r += vr * dt;
      fall.x.set(x);
      fall.y.set(y);
      fall.r.set(r);
      fall.flip.set(Math.sin(t * 8) * 38 * Math.min(1, t * 2.4));
      const o = y > 200 ? Math.max(0, 1 - (y - 200) / 160) : 1;
      fall.o.set(o);
      if (o <= 0 || t > 2.6) {
        setGone(true);
        raf.current = 0;
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const claim = () => {
    if (busy.current || claimed) return;
    busy.current = true;
    touched.current = true;
    if (reduce) {
      launch({ vx: 0, vy: 0, vr: 0 }, "user");
      return;
    }
    animate(angle, 21, { duration: 0.34, ease: [0.5, 0, 0.3, 1] }).then(() => launch({ vx: 360, vy: -520, vr: 280 }, "user"));
  };

  const reset = () => {
    cancelAnimationFrame(raf.current);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    busy.current = false;
    demoOwns.current = false;
    setClaimed(false);
    setByUser(false);
    setGone(false);
    angle.set(0);
    fall.x.set(0);
    fall.r.set(0);
    fall.flip.set(0);
    if (reduce) {
      fall.y.set(0);
      fall.o.set(1);
      return;
    }
    fall.y.set(-40);
    fall.o.set(0);
    animate(fall.o, 1, { duration: 0.25 });
    animate(fall.y, 0, { type: "spring", stiffness: 340, damping: 20 });
  };

  // the demo: a couple of tugs so it is clear the stub comes away, then the tear, a beat, and the ticket back again
  const demoTug = useEffectEvent(() => {
    if (!busy.current) animate(angle, [0, 5.5, 0], { duration: 1.1, times: [0, 0.35, 1], ease: ["easeOut", [0.3, 1.6, 0.5, 1]] });
  });
  const demoTear = useEffectEvent(() => {
    if (!busy.current) animate(angle, 14, { duration: 0.55, ease: [0.5, 0, 0.3, 1] });
  });
  const demoLaunch = useEffectEvent(() => {
    if (busy.current) return;
    busy.current = true;
    demoOwns.current = true;
    launch({ vx: 420, vy: -520, vr: 300 }, "auto");
  });
  const demoReset = useEffectEvent(() => reset());
  const demoRestore = useEffectEvent(() => {
    // the ticket was left off screen mid-demo: put it back before the next round
    if (demoOwns.current) reset();
    else if (!busy.current) angle.set(0);
  });

  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    const ids: number[] = [];
    const at = (fn: () => void, ms: number) => {
      ids.push(window.setTimeout(() => {
        if (!touched.current) fn();
      }, ms));
    };
    const round = () => {
      at(demoTug, 1400);
      at(demoTug, 3400);
      at(demoTear, 5400);
      at(demoLaunch, 5950);
      at(demoReset, 10400);
      at(round, 11800);
    };
    at(demoRestore, 0);
    round();
    return () => ids.forEach(clearTimeout);
  }, [autoplay, reduce, inView]);

  const tilt = (e: RPointerEvent<HTMLDivElement>) => {
    if (reduce || drag.current || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    if (claimed || busy.current || !row.current || !main.current) return;
    touched.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    // measured from the page, not from the layout, so a scaled preview frame does not skew the hinge
    const hx = main.current.getBoundingClientRect().right;
    const hy = row.current.getBoundingClientRect().bottom;
    angle.stop();
    px.set(0.5);
    py.set(0.5);
    drag.current = { hx, hy, th0: Math.atan2(e.clientY - hy, e.clientX - hx), r0: Math.hypot(e.clientX - hx, e.clientY - hy), s: [] };
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g || claimed) return;
    let d = ((Math.atan2(e.clientY - g.hy, e.clientX - g.hx) - g.th0) * 180) / Math.PI;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    // swinging it open is what tears; pulling it straight away strains the paper a little too
    const raw = Math.max(0, d) + Math.max(0, Math.hypot(e.clientX - g.hx, e.clientY - g.hy) - g.r0) * 0.05;
    const a = raw < 7 ? raw : 7 + (raw - 7) * 0.4; // the deeper the tear, the harder it resists
    angle.set(a);
    g.s.push({ t: performance.now(), a, x: e.clientX, y: e.clientY });
    if (g.s.length > 6) g.s.shift();
    if (raw > 32) {
      drag.current = null;
      busy.current = true;
      const f = g.s[0];
      const l = g.s[g.s.length - 1];
      const dt = Math.max(0.016, (l.t - f.t) / 1000);
      const c = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
      launch(
        { vx: c(((l.x - f.x) / dt) * 0.6 + 140, -300, 1300), vy: c(((l.y - f.y) / dt) * 0.6 - 300, -1100, 500), vr: c(((l.a - f.a) / dt) * 1.4 + 120, -100, 900) },
        "user",
      );
    }
  };
  const up = () => {
    if (!drag.current) return;
    drag.current = null;
    if (!claimed) animate(angle, 0, { type: "spring", stiffness: 560, damping: 14 }); // paper snaps back with a little wobble
  };

  const ics = () => {
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ticket CTA//EN",
      "BEGIN:VEVENT",
      `UID:${ev.start}-${ev.serial.replace(/[^a-z0-9]/gi, "")}@ticket-cta`,
      `DTSTAMP:${ev.start}`,
      `DTSTART:${ev.start}`,
      `DTEND:${ev.end}`,
      `SUMMARY:${esc(ev.title)}`,
      `DESCRIPTION:${esc(`${ev.host}. Row ${ev.row}, seat ${ev.seat}.`)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    a.download = "ticket.ics";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  // a keyboard or switch user's focus follows the button they pressed to the one that replaces it
  const focusRef = (el: HTMLElement | null) => {
    if (el && wantFocus.current) {
      wantFocus.current = false;
      el.focus({ preventScroll: true });
    }
  };

  const notchMain = "radial-gradient(circle 9px at 100% 0, #0000 96%, #000 100%), radial-gradient(circle 9px at 100% 100%, #0000 96%, #000 100%)";
  const notchStub = `radial-gradient(circle 9px at ${OVER}px 0, #0000 96%, #000 100%), radial-gradient(circle 9px at ${OVER}px 100%, #0000 96%, #000 100%)`;
  const masked = (m: string): CSSProperties => ({ WebkitMaskImage: m, maskImage: m, WebkitMaskComposite: "source-in", maskComposite: "intersect" }) as CSSProperties;
  const vars = {
    "--tc-a": accent,
    "--tc-ad": accentDark,
    "--tc-grain": GRAIN,
    "--tc-grain-d": GRAIN_D,
    "--tc-fibre": FIBRE,
    "--tc-fibre-d": FIBRE_D,
  } as CSSProperties;

  const ring = "outline-hidden focus-visible:ring-2 focus-visible:ring-(--tc-a) focus-visible:ring-offset-2 focus-visible:ring-offset-(--tc-bg) dark:focus-visible:ring-(--tc-ad)";
  const pill = "inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-6 text-[15px] font-medium whitespace-nowrap transition-colors";

  return (
    <div
      ref={root}
      onPointerDownCapture={() => {
        touched.current = true;
      }}
      onKeyDownCapture={() => {
        touched.current = true;
      }}
      className={cn("@container relative w-full overflow-hidden rounded-[28px] bg-(--tc-bg) font-sans", TOKENS, className)}
      style={vars}
    >
      <div className="mx-auto flex w-full max-w-[540px] flex-col items-center gap-7 px-4 py-10 @md:px-8 @md:py-14">
        {/* the ticket */}
        <div
          className="group/ticket relative w-full max-w-[468px] select-none"
          style={{ perspective: 1100 }}
          onPointerMove={tilt}
          onPointerLeave={() => {
            px.set(0.5);
            py.set(0.5);
          }}
        >
          <motion.div ref={row} className="relative flex" style={{ height: H, rotateX: rx, rotateY: ry }}>
            {/* the main part */}
            <motion.div ref={main} className="relative min-w-0 flex-1" style={{ rotate: kick, y: jolt, transformOrigin: "0% 50%", filter: MAIN_SHADOW }}>
              <div
                className="relative flex h-full flex-col overflow-hidden rounded-l-[20px] bg-(--tc-paper) p-4 shadow-[inset_0_0_0_1px_rgba(60,50,40,.06)] @md:p-6 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
                style={{ clipPath: MAIN_CLIP, ...masked(notchMain) }}
              >
                {/* security print, filled with the accent */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-8 -right-16 h-[170px] w-[380px]"
                  style={{ WebkitMaskImage: "radial-gradient(60% 70% at 70% 45%, #000, transparent)", maskImage: "radial-gradient(60% 70% at 70% 45%, #000, transparent)" }}
                >
                  <span
                    className="absolute inset-0 bg-(--tc-a) opacity-[.17] dark:bg-(--tc-ad) dark:opacity-[.2]"
                    style={{ WebkitMaskImage: GUILLOCHE, maskImage: GUILLOCHE, WebkitMaskSize: "360px 160px", maskSize: "360px 160px" }}
                  />
                </span>
                <Stock sheen={sheen} />

                <div className="relative">
                  <p className={cn("m-0 flex items-center justify-between gap-2", LABEL, PRESS)}>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <Icon d={ICON_TICKET} size={14} />
                      Admit one
                    </span>
                    <span className="font-medium tracking-[0.06em] whitespace-nowrap tabular-nums normal-case">{ev.serial}</span>
                  </p>
                  <p className={cn("m-0 mt-3 line-clamp-2 text-[21px] leading-[1.12] font-semibold tracking-[-0.026em] text-balance text-[#1d1d1f] @md:text-[24px] dark:text-[#f5f5f7]", PRESS)}>{ev.title}</p>
                  <p className={cn("m-0 mt-1 truncate text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]", PRESS)}>{ev.host}</p>
                </div>

                {/* the stamp has a place of its own, between the heading and the details, so it never lands on type */}
                <div className="relative min-h-0 flex-1">
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <AnimatePresence>
                      {claimed && (
                        <motion.span
                          key="stamp"
                          aria-hidden="true"
                          className="block rounded-[8px] border-[2.5px] border-(--tc-a) px-2 py-0.5 text-[13px] leading-tight font-bold tracking-[0.05em] whitespace-nowrap text-(--tc-a) uppercase mix-blend-multiply dark:border-(--tc-ad) dark:text-(--tc-ad) dark:mix-blend-normal"
                          initial={{ opacity: 0, scale: 1.9, rotate: -18 }}
                          animate={{ opacity: 0.9, scale: 1, rotate: -8 }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          transition={{ type: "spring", stiffness: 650, damping: 24, delay: 0.38 }}
                          style={{ WebkitMaskImage: INK, maskImage: INK, WebkitMaskSize: "cover", maskSize: "cover" }}
                        >
                          {"You're in"}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <dl className="relative m-0 flex gap-x-4 border-t border-black/[.09] pt-3 @md:gap-x-6 dark:border-white/[.12]">
                  <div className="flex flex-col gap-1.5">
                    <dt className={LABEL}>Date</dt>
                    <dd className={cn("m-0 text-[13px] leading-none font-semibold whitespace-nowrap tabular-nums @md:text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]", PRESS)}>{ev.date}</dd>
                  </div>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <dt className={LABEL}>Time</dt>
                    <dd className={cn("m-0 text-[13px] leading-none font-semibold whitespace-nowrap tabular-nums @md:text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]", PRESS)}>{ev.time}</dd>
                  </div>
                </dl>
              </div>
            </motion.div>

            {/* the perforation: holes along the line, and the fibres that hold on as it tears */}
            <div className="relative z-[3] w-0">
              {!claimed && HOLES.map((d) => <Hole key={d} d={d} angle={angle} />)}
              {!claimed && (
                <svg aria-hidden="true" className="pointer-events-none absolute top-0 left-0 overflow-visible" width={1} height={H}>
                  {FIBRES.map((f, i) => (
                    <Fibre key={i} {...f} angle={angle} />
                  ))}
                </svg>
              )}
            </div>

            {/* the stub: hinged at the bottom of the perforation */}
            <motion.div
              role="button"
              tabIndex={claimed ? -1 : 0}
              aria-label={ev.title ? `Tear off the stub for ${ev.title}. Drag it away, or press Enter.` : "Tear off the stub. Drag it away, or press Enter."}
              aria-disabled={claimed || undefined}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !claimed) {
                  e.preventDefault();
                  wantFocus.current = true;
                  claim();
                }
              }}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              className={cn("group/stub relative z-[2] w-[104px] shrink-0 touch-none outline-hidden @md:w-[128px]", claimed ? "cursor-default" : "cursor-grab active:cursor-grabbing", gone && "invisible")}
              style={{ marginLeft: -OVER, rotate: rot, x: fall.x, y: fall.y, rotateX: fall.flip, opacity: fall.o, transformPerspective: 700, transformOrigin: `${OVER}px 100%`, filter: lift }}
            >
              <div
                className="relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden rounded-r-[20px] bg-(--tc-paper) py-3 pr-[25px] pl-[17px] shadow-[inset_0_0_0_1px_rgba(60,50,40,.06)] @md:pr-[27px] @md:pl-[19px] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
                style={{ clipPath: STUB_CLIP, ...masked(notchStub) }}
              >
                <Stock sheen={sheen} />
                {/* a strip of foil that shifts colour as the light moves */}
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-[10px] w-[7px]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(255,255,255,.5) 0 1px, transparent 1px 3px), linear-gradient(160deg, #e9e9ee, #ffd9ec 18%, #cfe6ff 34%, #d6ffe9 50%, #fff3c8 66%, #e6d8ff 82%, #e9e9ee)",
                    backgroundSize: "100% 100%, 400% 400%",
                    backgroundPosition: foilPos,
                    boxShadow: "inset 0 0 0 .5px rgba(0,0,0,.1)",
                  }}
                />
                {/* the paper creases at the hinge as it swings */}
                <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: crease, background: "linear-gradient(35deg, rgba(60,50,40,.16), transparent 38%)" }} />
                <span className="relative grid h-[48px] w-[48px] grid-cols-9 rounded-[6px] bg-[#f5f5f7] p-[4px] shadow-[0_0_0_1px_rgba(0,0,0,.1)] dark:bg-[#e8e8ed]" aria-hidden="true">
                  {QR.map((on, i) => (
                    <span key={i} className={on ? "bg-[#1d1d1f]" : undefined} />
                  ))}
                </span>
                <span className="relative grid w-full grid-cols-2 gap-x-1 text-center">
                  <span className={cn("flex flex-col gap-1.5", PRESS)}>
                    <span className={cn(LABEL, "text-[9.5px] tracking-[0.1em]")}>Row</span>
                    <span className="text-[19px] leading-none font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{ev.row}</span>
                  </span>
                  <span className={cn("flex flex-col gap-1.5", PRESS)}>
                    <span className={cn(LABEL, "text-[9.5px] tracking-[0.1em]")}>Seat</span>
                    <span className="text-[19px] leading-none font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{ev.seat}</span>
                  </span>
                </span>
                <span className={cn("relative text-center text-[11px] leading-tight font-medium text-[#6e6e73] transition-colors group-hover/ticket:text-[#1d1d1f] dark:text-[#a1a1a6] dark:group-hover/ticket:text-[#f5f5f7]", PRESS)}>Pull to tear</span>
              </div>
              {/* focus ring, drawn inside the stub because the torn edge clips anything outside it */}
              <span aria-hidden="true" className="pointer-events-none absolute inset-[3px] rounded-r-[17px] border-2 border-(--tc-a) opacity-0 group-focus-visible/stub:opacity-100 dark:border-(--tc-ad)" />
            </motion.div>
          </motion.div>
        </div>

        <div className="relative flex min-h-11 flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {claimed ? (
              <motion.div
                key="after"
                className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: reduce ? 0 : 0.6, type: "spring", stiffness: 300, damping: 26 } }}
                exit={{ opacity: 0 }}
              >
                {href ? (
                  <>
                    <motion.a
                      ref={focusRef}
                      href={href}
                      whileTap={{ scale: 0.96 }}
                      className={cn(pill, "bg-(--tc-a) text-white hover:brightness-110 dark:bg-(--tc-ad) dark:text-black", ring)}
                    >
                      {doneLabel}
                      <Icon d={ICON_ARROW_UP_RIGHT} size={13} />
                    </motion.a>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        play("tap");
                        ics();
                      }}
                      className={cn(pill, "text-[#1d1d1f] ring-1 ring-black/15 ring-inset hover:bg-black/5 dark:text-[#f5f5f7] dark:ring-white/25 dark:hover:bg-white/10", ring)}
                    >
                      Add to calendar
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    ref={focusRef}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      play("tap");
                      ics();
                    }}
                    className={cn(pill, "bg-(--tc-a) text-white hover:brightness-110 dark:bg-(--tc-ad) dark:text-black", ring)}
                  >
                    Add to calendar
                    <Icon d={ICON_ARROW_UP_RIGHT} size={13} />
                  </motion.button>
                )}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={(e) => {
                    touched.current = true;
                    wantFocus.current = e.detail === 0;
                    play("tap");
                    reset();
                  }}
                  className={cn("inline-flex h-11 items-center rounded-full px-4 text-[14px] text-[#6e6e73] transition-colors hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]", ring)}
                >
                  Give it back
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                key="claim"
                ref={focusRef}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  wantFocus.current = e.detail === 0;
                  claim();
                }}
                exit={{ opacity: 0 }}
                className={cn(pill, "bg-[#1d1d1f] text-white hover:bg-black dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:hover:bg-white", ring)}
              >
                {ctaLabel}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {going !== undefined && (
          <p className="relative m-0 text-center text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.b
                key={going}
                className="inline-block font-semibold text-[#1d1d1f] tabular-nums dark:text-[#f5f5f7]"
                initial={{ y: reduce ? 0 : 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: reduce ? 0 : -10, opacity: 0 }}
              >
                {going.toLocaleString("en-US")}
              </motion.b>
            </AnimatePresence>{" "}
            people are coming{claimed && byUser ? ", including you." : "."}
          </p>
        )}

        <p role="status" className="sr-only">
          {claimed && byUser ? "Stub torn off. Your seat is saved." : ""}
        </p>
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

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
