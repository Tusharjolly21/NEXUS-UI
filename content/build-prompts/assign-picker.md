Add the "Assign Picker" component from Nexus UI to my project.

An assignee pill with a multi-select menu. Tick people and each avatar flies from its row into the pill, which grows to hold them and stacks them with a count past three; the label reads one name, two names or a number.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { AssignPicker, AssignFace } from "@/components/assign-picker";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/assign-picker/assign-picker.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface AssignPerson {
  id: string;
  name: string;
  role: string;
  /** Two colours for the avatar gradient (initials are drawn on top). */
  colors: [string, string];
}

export interface AssignPickerProps {
  /** People listed in the menu. */
  people?: AssignPerson[];
  /** Ids selected on first render. */
  defaultValue?: string[];
  /** Called with the selected ids, in the order they were picked. */
  onChange?: (ids: string[]) => void;
  /** Opens the menu, ticks four people, closes and clears, on a loop until the user clicks. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Lets several people be ticked. Turn it off and each pick replaces the last and closes the menu. */
  multiple?: boolean;
  /** How many faces the pill shows before the rest collapse into a +N count, 3 by default. Clamped to 1 to 5. */
  maxFaces?: number;
  /** Diameter in px of the faces in the pill, 28 by default. Clamped to 22 to 36. */
  faceSize?: number;
  /** How much the faces overshoot as they land in the pill, 1 is the default. Higher bounces more, lower settles flat. Clamped to 0.5 to 2. */
  bounce?: number;
}

const clamp = (v: number, lo: number, hi: number) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);

const PEOPLE: AssignPerson[] = [
  { id: "am", name: "Adam Marsh", role: "Design", colors: ["#ff6fd8", "#ff9f0a"] },
  { id: "pr", name: "Priya Raman", role: "Research", colors: ["#5ac8fa", "#5e5ce6"] },
  { id: "nw", name: "Nora Wilder", role: "Engineering", colors: ["#30d158", "#0b8f6a"] },
  { id: "mb", name: "Marco Bellini", role: "Product", colors: ["#ff375f", "#bf5af2"] },
  { id: "jk", name: "June Kato", role: "Marketing", colors: ["#ffd60a", "#ff9f0a"] },
];

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const first = (name: string) => name.split(" ")[0];

/** Gradient avatar with initials; no images are loaded. */
export function AssignFace({ person, size = 28 }: { person: AssignPerson; size?: number }) {
  return (
    <span
      className="flex flex-none items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white dark:border-[#1c1c1e]"
      style={{ width: size, height: size, background: `linear-gradient(140deg, ${person.colors[0]}, ${person.colors[1]})` }}
      aria-hidden="true"
    >
      {initials(person.name)}
    </span>
  );
}

/**
 * Assignee picker. Open the pill, tick people, and each face flies from its
 * row into the pill, which grows to hold them; past three they overlap into
 * a stack with a count. The label reads naturally: one name, two names, or
 * a number.
 */
export function AssignPicker({
  people = PEOPLE,
  defaultValue,
  onChange,
  autoplay = false,
  enableSound = true,
  multiple = true,
  maxFaces = 3,
  faceSize = 28,
  bounce = 1,
}: AssignPickerProps) {
  const play = useSound(enableSound);
  const faces = Math.round(clamp(maxFaces, 1, 5));
  const size = Math.round(clamp(faceSize, 22, 36));
  const damping = 22 / clamp(bounce, 0.5, 2);
  // Read when a person is ticked, so the options apply live.
  const opts = useRef({ multiple, faces, size });
  useEffect(() => {
    opts.current = { multiple, faces, size };
  }, [multiple, faces, size]);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<string[]>(() => defaultValue ?? []);
  const [flights, setFlights] = useState<Record<string, { x: number; y: number }>>({});
  const selRef = useRef<string[]>(defaultValue ?? []);
  const pill = useRef<HTMLButtonElement>(null);
  const rows = useRef(new Map<string, HTMLSpanElement | null>());
  const touched = useRef(false);
  const onChangeRef = useRef(onChange);

  const peopleRef = useRef(people);

  useEffect(() => {
    onChangeRef.current = onChange;
    peopleRef.current = people;
  }, [onChange, people]);

  const commit = useCallback((next: string[]) => {
    selRef.current = next;
    setSel(next);
    onChangeRef.current?.(next);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const cur = selRef.current;
      const el = rows.current.get(id);
      const p = pill.current;
      if (el && p && !cur.includes(id)) {
        // where the face starts, relative to the slot it will land in inside the pill
        const a = el.getBoundingClientRect();
        const b = p.getBoundingClientRect();
        const o = opts.current;
        const slot = o.multiple ? Math.min(cur.length, o.faces) : 0;
        const offset = { x: a.left - b.left - 10 - slot * (o.size - 10), y: a.top - b.top - 6 + (o.size - 28) / 2 };
        setFlights((f) => ({ ...f, [id]: offset }));
      }
      if (cur.includes(id)) commit(cur.filter((x) => x !== id));
      else commit(opts.current.multiple ? [...cur, id] : [id]);
    },
    [commit],
  );

  useEffect(() => {
    if (!autoplay) return;
    const pick = [1, 3, 0, 4].map((i) => peopleRef.current[i]?.id).filter((id): id is string => Boolean(id));
    const seq = [() => setOpen(true), ...pick.map((id) => () => {
        if (selRef.current.includes(id)) play.auto("tick", 0.4);
        else play.auto("pop", 0.5);
        toggle(id);
      }), () => setOpen(false), () => commit([])];
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      seq[k++ % seq.length]();
    }, 900);
    return () => clearInterval(t);
  }, [autoplay, toggle, commit, play]);

  const chosen = people.filter((p) => sel.includes(p.id)).sort((a, b) => sel.indexOf(a.id) - sel.indexOf(b.id));
  const label =
    chosen.length === 0
      ? "Assign"
      : chosen.length === 1
        ? first(chosen[0].name)
        : chosen.length === 2
          ? `${first(chosen[0].name)} and ${first(chosen[1].name)}`
          : `${chosen.length} people`;
  const shown = chosen.slice(0, faces);

  return (
    <div
      className="flex h-[330px] w-[300px] flex-col items-start"
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={(e) => {
        touched.current = true;
        if (e.key === "Escape" && open) {
          setOpen(false);
          pill.current?.focus();
        }
      }}
    >
      <motion.button
        ref={pill}
        layout
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={chosen.length ? `Assigned: ${chosen.map((p) => p.name).join(", ")}` : "Assign people"}
        onClick={() => setOpen((o) => !o)}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="relative flex h-11 items-center gap-2 rounded-full bg-white pl-2 pr-3.5 text-[14px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08),0_8px_20px_-12px_rgba(0,0,0,.3)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_8px_20px_-12px_rgba(0,0,0,.8)] dark:focus-visible:ring-[#2997ff]"
      >
        <motion.span layout className="flex items-center -space-x-2.5">
          <AnimatePresence initial={false} mode="popLayout">
            {shown.length === 0 && (
              <motion.span
                key="plus"
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{ width: size, height: size }}
                className="flex items-center justify-center rounded-full border-[1.5px] border-dashed border-[#a1a1a6] text-[#86868b] dark:border-[#636366] dark:text-[#8e8e93]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </motion.span>
            )}
            {shown.map((p, i) => {
              const f = flights[p.id];
              return (
                <motion.span
                  key={p.id}
                  layout
                  initial={f ? { x: f.x, y: f.y, scale: 1.15 } : { scale: 0 }}
                  animate={{ x: 0, y: 0, scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping }}
                  style={{ zIndex: 10 - i }}
                  className="relative"
                >
                  <AssignFace person={p} size={size} />
                </motion.span>
              );
            })}
            {chosen.length > faces && (
              <motion.span
                key="more"
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{ width: size, height: size }}
                className="relative flex items-center justify-center rounded-full border-2 border-white bg-[#1d1d1f] text-[10px] font-semibold text-white dark:border-[#1c1c1e] dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
              >
                +{chosen.length - faces}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
        <motion.span layout="position" className="whitespace-nowrap">
          {label}
        </motion.span>
        <motion.svg
          layout="position"
          animate={{ rotate: open ? 180 : 0 }}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-[#86868b] dark:text-[#8e8e93]"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.ul
            key="list"
            role="listbox"
            aria-multiselectable={multiple}
            aria-label="People"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{ transformOrigin: "top left" }}
            className="m-0 mt-2 w-[280px] list-none rounded-[20px] bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_40px_-24px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_40px_-24px_rgba(0,0,0,.8)]"
          >
            {people.map((p, i) => {
              const on = sel.includes(p.id);
              return (
                <motion.li key={p.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => {
                      if (on) play("tick", 0.4);
                      else play("pop", 0.5);
                      toggle(p.id);
                      if (!multiple) setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left outline-none hover:bg-[#f5f5f7] focus-visible:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] dark:focus-visible:bg-[#2c2c2e]"
                  >
                    <span
                      ref={(el) => {
                        rows.current.set(p.id, el);
                      }}
                      className="flex"
                    >
                      <AssignFace person={p} size={30} />
                    </span>
                    <span className="flex flex-1 flex-col">
                      <span className="text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{p.name}</span>
                      <span className="text-[12px] text-[#86868b] dark:text-[#8e8e93]">{p.role}</span>
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-[6px] transition-[background-color,box-shadow] duration-300 ${
                        on
                          ? "bg-[#1d1d1f] text-white shadow-[inset_0_0_0_1.5px_#1d1d1f] dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:shadow-[inset_0_0_0_1.5px_#f5f5f7]"
                          : "bg-white shadow-[inset_0_0_0_1.5px_#c7c7cc] dark:bg-[#1c1c1e] dark:shadow-[inset_0_0_0_1.5px_#48484a]"
                      }`}
                    >
                      {on && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
                        </svg>
                      )}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
```

--- components/assign-picker/index.ts ---

```ts
export { AssignPicker, AssignFace } from "./assign-picker";
export type { AssignPickerProps, AssignPerson } from "./assign-picker";
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
