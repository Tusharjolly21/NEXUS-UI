# Domino Select

Add the "Domino Select" component from Nexus UI to my project.

A mail list with a select-all box that topples the rows like dominoes: each row tips onto the next in a chain, then springs back up ticked. Unticking runs the chain from the bottom, and single rows toggle with a small nod.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { DominoSelect } from "@/components/domino-select";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/domino-select/domino-select.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useEffectEvent, useRef, useState, type CSSProperties } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

type AnimationControls = ReturnType<typeof useAnimationControls>;

export interface DominoMessage {
  /** Sender name; its first letter is drawn in the avatar. */
  from: string;
  subject: string;
  time: string;
  /** Avatar colour (any CSS colour). */
  color: string;
}

export interface DominoSelectProps {
  /** The rows to list. Changing the number of rows resets the selection. */
  messages?: DominoMessage[];
  /** Called with the indexes of the ticked rows whenever the selection changes (once per row during a chain). */
  onSelectionChange?: (selected: number[]) => void;
  /** Ticks and unticks the master box by itself until someone interacts. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Shows only the first this-many rows. Leave it out to show them all. Changing the number resets the selection. */
  rows?: number;
  /** Seconds between one row tipping and the next, 0.075 is the default. Smaller is a rattle, larger is a slow, deliberate fall. */
  stagger?: number;
  /** How far each row tips before it springs back, 1 is the default. Below 1 is a polite nod, above 1 is a full topple. */
  lean?: number;
  /** The colour of ticked boxes and selected rows (any CSS colour). Defaults to the blue of the rest of the library. */
  accent?: string;
}

const MAIL: DominoMessage[] = [
  { from: "Linear", subject: "3 issues assigned to you", time: "9:41", color: "#5e5ce6" },
  { from: "Stripe", subject: "Payout of $4,210 is on its way", time: "9:12", color: "#635bff" },
  { from: "Maya Chen", subject: "Re: launch checklist", time: "8:57", color: "#ff9f0a" },
  { from: "GitHub", subject: "[nexus-ui] PR #482 merged", time: "8:30", color: "#1d1d1f" },
  { from: "Figma", subject: "Jun commented on Pricing v3", time: "Yesterday", color: "#ff375f" },
  { from: "Vercel", subject: "Deployment ready: nexus-ui.com", time: "Yesterday", color: "#000000" },
  { from: "Dodo", subject: "Your payout settings were updated", time: "Mon", color: "#30d158" },
];
const GAP = 0.075; // seconds between each domino
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo));

const BOX_OFF = "bg-white shadow-[inset_0_0_0_1.5px_#c7c7cc] dark:bg-[#1c1c1e] dark:shadow-[inset_0_0_0_1.5px_#636366]";
const BOX_ON = "bg-[color:var(--ds-accent,#0071e3)] dark:bg-[color:var(--ds-accent,#0a84ff)]";
const FOCUS = "focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#2997ff]";

function Box({ on }: { on: boolean }) {
  return (
    <span className={`flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[7px] transition-colors duration-150 ${on ? BOX_ON : BOX_OFF}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={false} animate={{ pathLength: on ? 1 : 0 }} transition={{ duration: 0.22 }} />
      </svg>
    </span>
  );
}

function Row({
  i,
  n,
  m,
  on,
  register,
  onToggle,
}: {
  i: number;
  n: number;
  m: DominoMessage;
  on: boolean;
  register: (i: number, c: AnimationControls | null) => void;
  onToggle: () => void;
}) {
  const controls = useAnimationControls();
  useEffect(() => {
    register(i, controls);
    return () => register(i, null);
  }, [i, controls, register]);
  return (
    <motion.li animate={controls} className="relative" style={{ originY: 1 }}>
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        aria-label={`${m.from}: ${m.subject}`}
        onClick={onToggle}
        className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left outline-none transition-colors ${FOCUS} ${
          on ? "bg-[color:var(--ds-tint,#eef5ff)] dark:bg-[color:var(--ds-tint-dark,rgba(10,132,255,.2))]" : "bg-white dark:bg-[#2c2c2e]"
        } shadow-[0_0_0_1px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]`}
        style={{ zIndex: n - i }}
      >
        <Box on={on} />
        <span
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[13px] font-semibold text-white dark:shadow-[0_0_0_1px_rgba(255,255,255,.16)]"
          style={{ background: m.color }}
          aria-hidden="true"
        >
          {m.from[0]}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{m.from}</span>
            <span className="flex-none text-[12px] text-[#86868b] dark:text-[#8e8e93]">{m.time}</span>
          </span>
          <span className="truncate text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{m.subject}</span>
        </span>
      </button>
    </motion.li>
  );
}

/**
 * Select all, as a row of dominoes. Tick the master box and each email tips
 * forward onto the next one in a chain, then the whole list springs back up
 * with every box ticked. Untick and the chain runs the other way, from the
 * bottom up. Single rows still toggle on their own with a small nod.
 */
export function DominoSelect({ messages = MAIL, onSelectionChange, autoplay = false, enableSound = true, rows, stagger = GAP, lean = 1, accent }: DominoSelectProps) {
  const shown = rows === undefined ? messages : messages.slice(0, Math.round(clamp(rows, 1, messages.length || 1)));
  return <DominoList key={shown.length} messages={shown} onSelectionChange={onSelectionChange} autoplay={autoplay} enableSound={enableSound} stagger={clamp(stagger, 0.02, 0.3)} lean={clamp(lean, 0.3, 1.4)} accent={accent} />;
}

function DominoList({ messages, onSelectionChange, autoplay, enableSound, stagger, lean, accent }: Required<Pick<DominoSelectProps, "messages" | "autoplay" | "enableSound" | "stagger" | "lean">> & Pick<DominoSelectProps, "onSelectionChange" | "accent">) {
  const play = useSound(enableSound);
  const n = messages.length;
  const [on, setOn] = useState<boolean[]>(() => messages.map(() => false));
  const reduced = useReducedMotion();
  const reducedRef = useRef(false);
  const ctrls = useRef<(AnimationControls | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const touched = useRef(false);
  const visible = useRef(true);
  const alive = useRef(true);
  const timers = useRef<number[]>([]);
  const firstReport = useRef(true);
  const onChangeRef = useRef(onSelectionChange);
  const feel = useRef({ stagger, lean });
  const all = n > 0 && on.every(Boolean);
  const some = on.some(Boolean);
  const count = on.filter(Boolean).length;

  const register = useCallback((i: number, c: AnimationControls | null) => {
    ctrls.current[i] = c;
  }, []);

  useEffect(() => {
    reducedRef.current = !!reduced;
    onChangeRef.current = onSelectionChange;
    feel.current = { stagger, lean };
  });

  useEffect(() => {
    alive.current = true;
    const pending = timers.current;
    return () => {
      alive.current = false;
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    if (firstReport.current) {
      firstReport.current = false;
      return;
    }
    onChangeRef.current?.(on.flatMap((v, i) => (v ? [i] : [])));
  }, [on]);

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const chain = async (select: boolean, byUser = false) => {
    if (busy.current) return;
    if (byUser) play("knock", 0.8);
    else play.auto("knock", 0.8);
    if (reducedRef.current) {
      setOn(messages.map(() => select));
      return;
    }
    busy.current = true;
    const { stagger: gap, lean: tip } = feel.current;
    const order = [...Array(n).keys()];
    if (!select) order.reverse();
    await Promise.all(
      order.map((idx, k) => {
        const last = k === n - 1;
        const fall = (select ? (last ? -84 : -58) : last ? 84 : 58) * tip;
        const delay = k * gap;
        // flip each box at the moment its row stands back up
        timers.current.push(
          window.setTimeout(() => {
            setOn((o) => o.map((v, j) => (j === idx ? select : v)));
            if (byUser) play("tick", 0.4);
            else play.auto("tick", 0.4);
          }, (delay + 0.55 + (n - k) * 0.03) * 1000),
        );
        const c = ctrls.current[idx];
        if (!c) return Promise.resolve();
        return c.start({
          rotateX: [0, fall, fall, 0],
          originY: select ? "100%" : "0%",
          transition: { rotateX: { duration: 0.95 + (n - k) * 0.03, delay, times: [0, 0.28, 0.5, 1], ease: ["easeIn", "linear", [0.2, 1.4, 0.4, 1]] } },
        });
      }),
    );
    busy.current = false;
  };

  const one = (i: number) => {
    touched.current = true;
    if (busy.current) return;
    play("knock", 0.5);
    setOn((o) => o.map((v, j) => (j === i ? !v : v)));
    if (!reducedRef.current) void ctrls.current[i]?.start({ rotateX: [0, -14, 0], originY: "100%", transition: { duration: 0.35 } });
  };

  const autoChain = useEffectEvent((select: boolean) => void chain(select));

  useEffect(() => {
    if (!autoplay || reduced) return;
    let s = false;
    const id = setInterval(() => {
      if (touched.current) return clearInterval(id);
      if (!visible.current || document.hidden || !alive.current) return;
      s = !s;
      autoChain(s);
    }, 2600);
    return () => clearInterval(id);
  }, [autoplay, reduced]);

  const tint = accent ? ({ "--ds-accent": accent, "--ds-tint": `color-mix(in srgb, ${accent} 10%, white)`, "--ds-tint-dark": `color-mix(in srgb, ${accent} 20%, transparent)` } as CSSProperties) : undefined;
  return (
    <div
      ref={root}
      style={tint}
      className="w-[380px] max-w-full rounded-[26px] bg-[#f5f5f7] p-3 shadow-[0_0_0_1px_rgba(0,0,0,.04)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between px-2 pb-3 pt-1">
        <button
          type="button"
          role="checkbox"
          aria-checked={all ? true : some ? "mixed" : false}
          onClick={() => {
            touched.current = true;
            void chain(!all, true);
          }}
          className={`flex items-center gap-2.5 rounded-[10px] px-1 py-1 text-[14px] font-semibold text-[#1d1d1f] outline-none dark:text-[#f5f5f7] ${FOCUS}`}
        >
          <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-[7px] ${all || some ? BOX_ON : BOX_OFF}`}>
            {all ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            ) : some ? (
              <span className="h-[3px] w-[10px] rounded-full bg-white" />
            ) : null}
          </span>
          Select all
        </button>
        <span className="text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]" aria-live="polite">
          {count ? `${count} selected` : `${n} messages`}
        </span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0" aria-label="Messages" style={{ perspective: 700, transformStyle: "preserve-3d" }}>
        {messages.map((m, i) => (
          <Row key={`${m.from}-${i}`} i={i} n={n} m={m} on={on[i]} register={register} onToggle={() => one(i)} />
        ))}
      </ul>
      <motion.div className="flex items-center justify-between overflow-hidden px-2" initial={false} animate={{ height: some ? 48 : 0, opacity: some ? 1 : 0 }} inert={!some}>
        <span className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Do something with them</span>
        <span className="flex gap-1.5">
          {["Archive", "Mark read"].map((a) => (
            <button
              key={a}
              type="button"
              className={`h-8 rounded-full bg-white px-3 text-[12px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] ${FOCUS}`}
            >
              {a}
            </button>
          ))}
        </span>
      </motion.div>
    </div>
  );
}
```

--- components/domino-select/index.ts ---

```ts
export { DominoSelect } from "./domino-select";
export type { DominoSelectProps, DominoMessage } from "./domino-select";
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
