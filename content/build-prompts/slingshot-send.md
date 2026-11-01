# Slingshot Send

Add the "Slingshot Send" component from Nexus UI to my project.

A chat composer whose send button is a slingshot: pull the stone back to stretch the bands and let go, and your message flies along an arc and lands in the thread with a squash. Enter in the field, or Enter or Space on the focused stone, still sends it.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { SlingshotSend } from "@/components/slingshot-send";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/slingshot-send/index.ts ---

```ts
export { SlingshotSend } from "./slingshot-send";
export type { SlingshotSendProps, SlingshotMessage } from "./slingshot-send";
```

--- components/slingshot-send/slingshot-send.tsx ---

```tsx
"use client";
import { useEffect, useEffectEvent, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface SlingshotMessage {
  id: number;
  /** True for messages sent by you (right-hand blue bubbles). */
  me: boolean;
  text: string;
  /** Used while a message is still in flight: the bubble is laid out but invisible. */
  hidden?: boolean;
}

export interface SlingshotSendProps {
  /** Name shown in the thread header; its first letter is used for the avatar. */
  name?: string;
  /**
   * Called with the trimmed text when a message is fired. This is the only output of the
   * component: nothing is ever sent over the network.
   */
  onSend?: (text: string) => void;
  /** Adds a canned reply from the other person a moment after each message lands. */
  autoReply?: boolean;
  /** Types, pulls back and fires messages by itself until someone touches the component. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

type Point = { x: number; y: number };
type Flight = { text: string; from: Point; to: Point & { w: number; h: number }; power: number; id: number };

const START: SlingshotMessage[] = [
  { id: 1, me: false, text: "Are we still on for tonight?" },
  { id: 2, me: true, text: "Yes! Where do you want to go?" },
  { id: 3, me: false, text: "That ramen place on 5th?" },
];
const REPLIES = ["Perfect.", "Haha okay", "On my way", "Love that"];
const AUTOPLAY_LINES = ["See you at 7?", "I'll book a table", "Bring the umbrella"];
const STEPS = 12;

/**
 * A send button you fire. Pull the blue stone back in the slingshot, the bands
 * stretch, and let go: your message flies out along an arc and lands in the
 * thread with a squash. A short tug just twangs back. Return still sends it
 * normally, and Enter or Space on the focused stone fires it too.
 */
export function SlingshotSend({ name = "Maya", onSend, autoReply = true, autoplay = false, enableSound = true }: SlingshotSendProps) {
  const play = useSound(enableSound);
  const [msgs, setMsgs] = useState<SlingshotMessage[]>(START);
  const [draft, setDraft] = useState("See you at 7?");
  const draftRef = useRef("See you at 7?");
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loaded, setLoaded] = useState(true);
  const reduced = useReducedMotion();
  const reducedRef = useRef(false);
  const onSendRef = useRef(onSend);
  const autoReplyRef = useRef(autoReply);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const stone = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const touched = useRef(false);
  const visible = useRef(true);
  const nextId = useRef(10);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    reducedRef.current = !!reduced;
    onSendRef.current = onSend;
    autoReplyRef.current = autoReply;
  });

  // bands from the prong tips to the stone, driven straight from the motion values
  const bandLeftX = useTransform(x, (v) => 32 + v - 9);
  const bandRightX = useTransform(x, (v) => 32 + v + 9);
  const bandY = useTransform(y, (v) => 22 + v);
  const stretch = useTransform([x, y] as MotionValue<number>[], ([a, b]: number[]) => Math.min(1, Math.hypot(a, b) / 70));
  const bandOpacity = useTransform(stretch, (s) => 0.35 + s * 0.4);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const writeDraft = (v: string) => {
    draftRef.current = v;
    setDraft(v);
  };

  const land = (id: number) => {
    setMsgs((m) => m.map((msg) => (msg.id === id ? { ...msg, hidden: false } : msg)));
    setFlight(null);
    later(() => setLoaded(true), 250);
    if (autoReplyRef.current) {
      later(() => setMsgs((m) => [...m, { id: nextId.current++, me: false, text: REPLIES[id % REPLIES.length] }]), 1100);
    }
  };

  const fire = (power: number, byUser = false) => {
    const text = draftRef.current.trim();
    const rootEl = root.current;
    const stoneEl = stone.current;
    const listEl = list.current;
    if (!text || !rootEl || !stoneEl || !listEl) return;
    if (byUser) play("whoosh");
    else play.auto("whoosh");
    const rr = rootEl.getBoundingClientRect();
    const sr = stoneEl.getBoundingClientRect();
    const from = { x: sr.left - rr.left + sr.width / 2, y: sr.top - rr.top + sr.height / 2 };
    const id = nextId.current++;
    const skipFlight = reducedRef.current;
    flushSync(() => {
      setMsgs((m) => [...m, { id, me: true, text, hidden: !skipFlight }]);
      draftRef.current = "";
      setDraft("");
      setLoaded(false);
    });
    onSendRef.current?.(text);
    listEl.scrollTop = listEl.scrollHeight;
    if (skipFlight) {
      land(id);
      return;
    }
    // the invisible landing spot now exists: measure it and launch
    const el = listEl.querySelector<HTMLElement>(`[data-id="${id}"]`);
    if (!el) {
      land(id);
      return;
    }
    const er = el.getBoundingClientRect();
    setFlight({ text, from, to: { x: er.left - rr.left, y: er.top - rr.top, w: er.width, h: er.height }, power, id });
  };

  const release = (byUser = false) => {
    const d = Math.hypot(x.get(), y.get());
    if (d > 26 && draftRef.current.trim()) fire(Math.min(1, d / 70), byUser);
    const spring = { type: "spring" as const, stiffness: 700, damping: d > 26 ? 12 : 9 };
    animate(x, 0, spring);
    animate(y, 0, spring);
  };

  const pull = async (dx: number, dy: number) => {
    await Promise.all([animate(x, dx, { duration: 0.5 }), animate(y, dy, { duration: 0.5 })]);
  };

  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [msgs.length]);

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const autoLift = useEffectEvent(() => play.auto("lift"));
  const autoRelease = useEffectEvent(() => release());

  useEffect(() => {
    if (!autoplay || reduced) return;
    let k = 0;
    let cancelled = false;
    const id = setInterval(async () => {
      if (touched.current) return clearInterval(id);
      if (!visible.current || document.hidden) return;
      const line = AUTOPLAY_LINES[k++ % AUTOPLAY_LINES.length];
      writeDraft(line);
      autoLift();
      await pull(-18, 52);
      if (touched.current || cancelled) return;
      autoRelease();
      if (k % 3 === 0) setMsgs(START);
    }, 3200);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    touched.current = true;
    fire(0.6, true);
  };

  const keyFire = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    touched.current = true;
    if (!draftRef.current.trim()) return;
    play("lift");
    void pull(-12, 46).then(() => {
      release(true);
      input.current?.focus();
    });
  };

  // flight path: a quadratic curve whose first leg follows the launch direction
  const path = flight
    ? (() => {
        const tx = flight.to.x + flight.to.w / 2;
        const ty = flight.to.y + flight.to.h / 2;
        const cx = flight.from.x - 60 - flight.power * 60;
        const cy = Math.min(flight.from.y, ty) - 90 - flight.power * 90;
        return Array.from({ length: STEPS + 1 }, (_, i) => {
          const t = i / STEPS;
          return {
            x: (1 - t) ** 2 * flight.from.x + 2 * (1 - t) * t * cx + t * t * tx,
            y: (1 - t) ** 2 * flight.from.y + 2 * (1 - t) * t * cy + t * t * ty,
          };
        });
      })()
    : null;

  const blue = "bg-[#0071e3] dark:bg-[#0a84ff]";

  return (
    <div
      ref={root}
      className="relative flex h-[500px] w-[360px] max-w-full flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]"
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center gap-3 border-b border-black/5 px-5 py-3.5 dark:border-white/10">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff9f0a] text-[14px] font-semibold text-white" aria-hidden="true">
          {name.slice(0, 1).toUpperCase()}
        </span>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{name}</span>
          <span className="text-[12px] text-[#30d158]">Online</span>
        </div>
      </div>
      <div ref={list} role="log" aria-label={`Conversation with ${name}`} aria-live="polite" className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
        {msgs.map((m) => (
          <motion.div
            key={m.id}
            data-id={m.id}
            layout="position"
            initial={m.me ? false : { opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: m.hidden ? 0 : 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`max-w-[75%] rounded-[18px] px-3.5 py-2 text-[15px] leading-[1.35] ${
              m.me ? `self-end rounded-br-[6px] ${blue} text-white` : "self-start rounded-bl-[6px] bg-[#f0f0f3] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
            }`}
          >
            {m.text}
          </motion.div>
        ))}
      </div>

      <form onSubmit={submit} className="relative flex items-end gap-3 border-t border-black/5 px-4 pb-5 pt-3 dark:border-white/10">
        <input
          ref={input}
          value={draft}
          onChange={(e) => writeDraft(e.target.value)}
          placeholder="Message"
          aria-label="Message"
          className="h-11 min-w-0 flex-1 rounded-full bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:placeholder:text-[#8e8e93] dark:focus-visible:ring-[#0a84ff]"
        />
        {/* the slingshot */}
        <div className="relative h-[70px] w-[64px] flex-none">
          <svg className="pointer-events-none absolute inset-0 overflow-visible" width="64" height="70" aria-hidden="true">
            <path d="M32 70 L32 46 M32 46 Q18 40 14 18 M32 46 Q46 40 50 18" stroke="#8e8e93" strokeWidth="6" strokeLinecap="round" fill="none" />
            <motion.line x1="14" y1="18" x2={bandLeftX} y2={bandY} strokeWidth="2.5" strokeLinecap="round" className="stroke-black dark:stroke-white" style={{ opacity: bandOpacity }} />
            <motion.line x1="50" y1="18" x2={bandRightX} y2={bandY} strokeWidth="2.5" strokeLinecap="round" className="stroke-black dark:stroke-white" style={{ opacity: bandOpacity }} />
          </svg>
          <AnimatePresence>
            {loaded && (
              <motion.div
                ref={stone}
                key="stone"
                role="button"
                tabIndex={0}
                aria-label="Send message. Drag back and release, or press Enter or Space."
                aria-disabled={!draft.trim()}
                onKeyDown={keyFire}
                drag
                dragMomentum={false}
                dragElastic={0.6}
                dragConstraints={{ left: -50, right: 50, top: -10, bottom: 70 }}
                onDragStart={() => {
                  touched.current = true;
                  play("lift");
                }}
                onDragEnd={() => release(true)}
                style={{ x, y }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, transition: { duration: 0.05 } }}
                className={`absolute left-[14px] top-[4px] flex h-9 w-9 cursor-grab touch-none items-center justify-center rounded-full ${blue} shadow-[0_6px_14px_-6px_rgba(0,113,227,.8)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:cursor-grabbing dark:focus-visible:ring-[#2997ff] dark:focus-visible:ring-offset-[#1c1c1e]`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span className="pointer-events-none absolute -top-1 right-4 text-[11px] text-[#86868b] dark:text-[#8e8e93]">{draft.trim() ? "Pull back and let go" : ""}</span>
      </form>

      {flight && path && (
        <motion.div
          key={flight.id}
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 top-0 z-10 max-w-[75%] origin-center rounded-[18px] rounded-br-[6px] ${blue} px-3.5 py-2 text-[15px] leading-[1.35] text-white shadow-[0_14px_30px_-12px_rgba(0,113,227,.7)]`}
          style={{ width: flight.to.w }}
          initial={{ x: flight.from.x - flight.to.w / 2, y: flight.from.y - flight.to.h / 2, scale: 0.3, rotate: -30 }}
          animate={{
            x: path.map((p) => p.x - flight.to.w / 2),
            y: path.map((p) => p.y - flight.to.h / 2),
            scale: path.map((_, i) => (i === STEPS ? 1 : 0.4 + (i / STEPS) * 0.7)),
            rotate: path.map((_, i) => -30 + (i / STEPS) * 30),
            scaleY: path.map((_, i) => (i === STEPS ? 0.82 : 1)),
          }}
          transition={{ duration: 0.75 - flight.power * 0.25, ease: [0.3, 0.1, 0.45, 1] }}
          onAnimationComplete={() => land(flight.id)}
        >
          {flight.text}
        </motion.div>
      )}
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
