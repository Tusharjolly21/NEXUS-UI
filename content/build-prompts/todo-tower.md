# Todo Tower

Add the "Todo Tower" component from Nexus UI to my project.

A to-do list stacked like bricks. Tick a task or drag it out sideways and the pile drops into the gap with a bounce; any brick left hanging too far over the one below tips off the edge.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { TodoTower, TODO_TOWER_TASKS, TODO_TOWER_MORE } from "@/components/todo-tower";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/todo-tower/index.ts ---

```ts
export { TodoTower } from "./todo-tower";
export type { TodoTowerProps } from "./todo-tower";
export type { TodoTowerTask } from "./todo-tower";
export { TODO_TOWER_TASKS, TODO_TOWER_MORE } from "./todo-tower";
```

--- components/todo-tower/todo-tower.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useSound, type SoundName } from "@/lib/ui-sounds";

/** A starting task: its label and how far (px) it sits off-centre. */
export interface TodoTowerTask {
  text: string;
  x: number;
}

export interface TodoTowerProps {
  /** The starting pile, top to bottom. */
  tasks?: TodoTowerTask[];
  /** Labels the "Add a task" button drops onto the top of the pile, in turn. */
  moreTasks?: string[];
  /** How far (px) a brick may hang past the one beneath it before it tips off. */
  overhang?: number;
  /** Most bricks the pile holds; "Add a task" does nothing past this. */
  maxBricks?: number;
  /** Called with a task's label when it is ticked off. */
  onComplete?: (text: string) => void;
  /** Ticks tasks off and adds new ones by itself until someone touches the pile. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

interface Brick {
  id: number;
  text: string;
  x: number;
  /** Small random tilt the brick falls in with. */
  spin: number;
  done?: boolean;
  tip?: -1 | 1;
}
type Exit = "done" | "pulled-left" | "pulled-right" | "tip-left" | "tip-right";

export const TODO_TOWER_TASKS: TodoTowerTask[] = [
  { text: "Call the landlord", x: -18 },
  { text: "Pay the invoice", x: -4 },
  { text: "Export the icons", x: 10 },
  { text: "Book the flights", x: 26 },
  { text: "Renew the domain", x: 14 },
  { text: "Reply to Nadia", x: 0 },
];
export const TODO_TOWER_MORE = ["Water the plants", "Send the estimate", "Book the studio", "Back up the laptop"];

function exitFor(why: Exit | undefined) {
  if (why === "done") return { opacity: 0, scale: 0.8, y: -30, filter: "blur(6px)", transition: { duration: 0.35 } };
  if (why === "pulled-left") return { x: -420, opacity: 0, rotate: -8, transition: { duration: 0.4 } };
  if (why === "pulled-right") return { x: 420, opacity: 0, rotate: 8, transition: { duration: 0.4 } };
  const dir = why === "tip-left" ? -1 : 1;
  return { x: dir * 140, y: 420, rotate: dir * 80, opacity: 0, transition: { duration: 0.75, ease: [0.5, 0, 0.75, 0] as const } };
}

/**
 * A to-do list stacked like bricks. Tick one off or drag one out sideways and
 * everything above drops into the gap with a bounce; any brick now hanging too
 * far over the one beneath it tips over its edge and falls away. New tasks
 * drop onto the top of the pile.
 */
export function TodoTower({
  tasks = TODO_TOWER_TASKS,
  moreTasks = TODO_TOWER_MORE,
  overhang = 24,
  maxBricks = 8,
  onComplete,
  autoplay = false,
  enableSound = true,
}: TodoTowerProps) {
  const play = useSound(enableSound);
  const [bricks, setBricks] = useState<Brick[]>(() => tasks.map((b, i) => ({ ...b, id: i, spin: ((i * 37) % 10) - 5 })));
  const [exits, setExits] = useState<Record<number, Exit>>({});
  const list = useRef(bricks);
  const nextId = useRef(tasks.length);
  const more = useRef(0);
  const touched = useRef(false);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    list.current = bricks;
  }, [bricks]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((t) => window.clearTimeout(t));
      pending.clear();
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  };

  // After the pile drops, check each brick against the one under it (bottom up);
  // the first one hanging too far tips toward its overhang and falls off.
  const settle = () => {
    later(() => {
      const l = list.current;
      for (let i = l.length - 2; i >= 0; i--) {
        const d = l[i].x - l[i + 1].x;
        if (Math.abs(d) > overhang && !l[i].tip) {
          const dir: -1 | 1 = d > 0 ? 1 : -1;
          const id = l[i].id;
          setBricks((cur) => cur.map((b) => (b.id === id ? { ...b, tip: dir } : b)));
          later(() => remove(id, dir > 0 ? "tip-right" : "tip-left"), 520);
          return;
        }
      }
    }, 420);
  };

  const remove = (id: number, why: Exit) => {
    setExits((e) => ({ ...e, [id]: why }));
    setBricks((l) => l.filter((b) => b.id !== id));
    settle();
  };

  const check = (id: number) => {
    const brick = list.current.find((b) => b.id === id);
    if (!brick || brick.done) return;
    setBricks((l) => l.map((b) => (b.id === id ? { ...b, done: true } : b)));
    onComplete?.(brick.text);
    later(() => remove(id, "done"), 380);
  };

  const add = () => {
    if (moreTasks.length === 0) return;
    const text = moreTasks[more.current++ % moreTasks.length];
    const brick: Brick = { id: nextId.current++, text, x: Math.round((Math.random() - 0.5) * 30), spin: (Math.random() - 0.5) * 10 };
    setBricks((l) => (l.length >= maxBricks ? l : [brick, ...l]));
  };

  // The "Add a task" button: the brick lands on the pile a moment after it is dropped in.
  const addSounding = (say: (name: SoundName, volume?: number) => void) => {
    const room = moreTasks.length > 0 && list.current.length < maxBricks;
    add();
    if (room) later(() => say("drop", 0.8), 280);
  };
  const addByUser = () => addSounding(play);

  // Keep the latest handlers for the autoplay timer without restarting it.
  const actions = useRef<{ add: () => void; check: (id: number) => void }>({ add: () => {}, check: () => {} });
  useEffect(() => {
    actions.current = {
      add: () => addSounding(play.auto),
      check: (id) => {
        const brick = list.current.find((b) => b.id === id);
        if (brick && !brick.done) play.auto("tick");
        check(id);
      },
    };
  });

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) return window.clearInterval(t);
      const l = list.current;
      if (l.length <= 2 || k % 4 === 3) actions.current.add();
      else actions.current.check(l[Math.min(l.length - 2, 1 + (k % (l.length - 1)))].id);
      k++;
    }, 1900);
    return () => window.clearInterval(t);
  }, [autoplay]);

  return (
    <div
      className="flex flex-col items-center gap-4 [--tt-box-line:#c7c7cc] [--tt-box:#fff] dark:[--tt-box-line:#636366] dark:[--tt-box:#2c2c2e]"
      onPointerDown={() => (touched.current = true)}
      onKeyDown={() => (touched.current = true)}
    >
      <div className="relative flex h-[340px] w-[300px] flex-col items-center justify-end overflow-visible pb-1">
        <AnimatePresence initial={false} custom={exits}>
          {bricks.map((b) => (
            <motion.div
              key={b.id}
              layout="position"
              initial={{ y: -300, opacity: 0, rotate: b.spin }}
              animate={{ y: 0, opacity: 1, rotate: b.tip ? b.tip * 24 : 0, x: b.x + (b.tip ? b.tip * 18 : 0) }}
              variants={{ gone: (ex: Record<number, Exit>) => exitFor(ex?.[b.id]) }}
              exit="gone"
              transition={{ layout: { type: "spring", stiffness: 300, damping: 13 }, default: { type: "spring", stiffness: 260, damping: 16 } }}
              style={{ transformOrigin: b.tip ? (b.tip > 0 ? "0% 100%" : "100% 100%") : "50% 50%" }}
              className="relative flex-none"
            >
              <motion.div
                drag="x"
                dragSnapToOrigin
                dragElastic={0.6}
                onDragEnd={(_, info: PanInfo) => {
                  if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 700) {
                    play("swipe");
                    remove(b.id, info.offset.x > 0 ? "pulled-right" : "pulled-left");
                  }
                }}
                whileDrag={{ scale: 1.04, zIndex: 10, boxShadow: "0 18px 30px -14px rgba(0,0,0,.35)" }}
                className="relative flex h-[42px] w-[190px] cursor-grab items-center gap-2.5 rounded-[12px] bg-white px-3 shadow-[0_0_0_1px_rgba(0,0,0,.07),0_2px_4px_rgba(0,0,0,.04)] active:cursor-grabbing dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_2px_4px_rgba(0,0,0,.4)]"
              >
                <button
                  type="button"
                  aria-label={`Complete ${b.text}`}
                  aria-pressed={!!b.done}
                  onClick={() => {
                    if (!b.done) play("tick");
                    check(b.id);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] border-[1.5px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
                  style={{ borderColor: b.done ? "#30d158" : "var(--tt-box-line)", background: b.done ? "#30d158" : "var(--tt-box)" }}
                >
                  {b.done && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.25 }} />
                    </svg>
                  )}
                </button>
                <span className="relative truncate text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {b.text}
                  <motion.span
                    className="absolute left-0 top-1/2 h-[1.5px] bg-[#1d1d1f] dark:bg-[#f5f5f7]"
                    initial={false}
                    animate={{ width: b.done ? "100%" : "0%" }}
                    transition={{ duration: 0.25 }}
                  />
                </span>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="absolute bottom-0 h-[3px] w-[260px] translate-y-full rounded-full bg-[#d2d2d7] dark:bg-[#3a3a3c]" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={addByUser}
          className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
        >
          Add a task
        </motion.button>
        <span className="text-[12px] text-[#86868b] dark:text-[#8e8e93]">Tick one, or drag one out sideways.</span>
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
