# Empty Team

Add the "Empty Team" component from Nexus UI to my project.

An empty team page with dotted seats beside yours and an invite field below. Type an email or tap a suggested teammate and the avatar lifts out of the field and lands in the next free seat, marked pending.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` and `@/lib/typing-sound` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
6. Use it like this: `import { EmptyTeam, EMPTY_TEAM_PEOPLE } from "@/components/empty-team";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/empty-team/empty-team.tsx ---

```tsx
"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useTypedText } from "@/lib/typing-sound";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface EmptyTeamProps {
  /** Total seats, including yours. */
  seats?: number;
  /** Teammates offered as one-tap chips under the field. Defaults to three people on `domain`. */
  suggestions?: string[];
  /** The domain shown in "From <domain>", also used for the default suggestions. */
  domain?: string;
  /** Placeholder of the email field. */
  placeholder?: string;
  /** Called with the email when an avatar lands in a seat. Not called by the autoplay demo. */
  onAdd?: (email: string) => void;
  /** Called with every pending email when "Send invites" is pressed. Not called by the autoplay demo. */
  onSend?: (emails: string[]) => void;
  /** Types an email, adds three people, sends the invites and starts over on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

/** The three demo teammates, as names before the @ sign. */
export const EMPTY_TEAM_PEOPLE = ["leo.park", "ana.lima", "kai"];

type Person = { email: string; hue: string };
type Fly = { p: Person; from: readonly [number, number]; to: readonly [number, number]; auto: boolean };

// Deeper shades of the system colours so white initials stay readable.
const HUES = ["#0071e3", "#8944ab", "#c93400", "#248a3d", "#d70015", "#5e5ce6"];
const hue = (s: string) => HUES[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];
const initials = (e: string) => {
  const n = e.split("@")[0].split(/[._-]/).filter(Boolean);
  return ((n[0]?.[0] ?? "") + (n[1]?.[0] ?? "")).toUpperCase() || "?";
};
const EMAIL = /^\S+@\S+\.\S+$/;
const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

/**
 * An empty team page that gets you to invite people. Seats wait as dotted
 * circles next to yours; type an email (or tap a suggested teammate from your
 * domain) and their avatar lifts out of the field and drops into the next
 * free seat, marked pending. The headline and button keep count, and a bad
 * or duplicate email shakes the field.
 */
export function EmptyTeam({
  seats = 6,
  suggestions: suggested,
  domain = "orbitly.com",
  placeholder = "name@company.com",
  onAdd,
  onSend,
  autoplay = false,
  enableSound = true,
  className,
}: EmptyTeamProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const suggestions = suggested ?? EMPTY_TEAM_PEOPLE.map((name) => `${name}@${domain}`);
  const [people, setPeople] = useState<Person[]>([]);
  const [value, setValue] = useState("");
  useTypedText(value, enableSound);
  const [fly, setFly] = useState<Fly | null>(null);
  const [sent, setSent] = useState(false);
  const [bad, setBad] = useState(false);
  const [note, setNote] = useState("");
  const card = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const seatEls = useRef<(HTMLDivElement | null)[]>([]);
  const touched = useRef(false);
  const badTimer = useRef<number | undefined>(undefined);
  const active = useDemoActive(card, autoplay && !reduce);

  useEffect(() => () => window.clearTimeout(badTimer.current), []);

  const land = (p: Person, auto: boolean) => {
    (auto ? play.auto : play)("drop", 0.55);
    setPeople((ps) => (ps.some((x) => x.email === p.email) ? ps : [...ps, p]));
    setFly(null);
    if (!auto) onAdd?.(p.email);
  };

  const add = (email: string, auto = false) => {
    if (fly) return;
    const e = email.trim().toLowerCase();
    const problem = !EMAIL.test(e) ? "Enter a valid email address" : people.some((p) => p.email === e) ? `${e} is already added` : people.length >= seats - 1 ? "All seats are taken" : "";
    if (problem) {
      (auto ? play.auto : play)("error", 0.3);
      setNote(problem);
      setBad(true);
      window.clearTimeout(badTimer.current);
      badTimer.current = window.setTimeout(() => setBad(false), 450);
      return;
    }
    const person: Person = { email: e, hue: hue(e) };
    setValue("");
    setSent(false);
    setNote("");
    const c = card.current?.getBoundingClientRect();
    const f = field.current?.getBoundingClientRect();
    const s = seatEls.current[people.length + 1]?.getBoundingClientRect();
    if (reduce || !c || !f || !s) {
      land(person, auto);
      return;
    }
    setFly({
      p: person,
      from: [f.left - c.left + 20, f.top - c.top + f.height / 2],
      to: [s.left - c.left + s.width / 2, s.top - c.top + s.height / 2],
      auto,
    });
  };
  const send = (auto = false) => {
    (auto ? play.auto : play)("tap", 0.5);
    setSent(true);
    if (!auto) onSend?.(people.map((p) => p.email));
  };
  const reset = () => {
    setPeople([]);
    setSent(false);
    setValue("");
    setFly(null);
    setNote("");
  };

  // The demo reads the latest handlers through a ref.
  const latest = useRef({ add, send, reset });
  useEffect(() => {
    latest.current = { add, send, reset };
  });

  // Demo: type an email, add it and two suggestions, send, start over.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    const at = (fn: () => void, ms: number) => ids.push(window.setTimeout(() => !touched.current && fn(), ms));
    const typed = `maya.chen@${domain}`;
    const loop = () => {
      if (touched.current) return;
      at(() => latest.current.reset(), 0);
      [...typed].forEach((_, i) => at(() => setValue(typed.slice(0, i + 1)), 900 + i * 55));
      at(() => latest.current.add(typed, true), 2300);
      if (suggestions[0]) at(() => latest.current.add(suggestions[0], true), 3400);
      if (suggestions[1]) at(() => latest.current.add(suggestions[1], true), 4300);
      at(() => latest.current.send(true), 5600);
      at(() => latest.current.reset(), 8200);
      ids.push(window.setTimeout(loop, 8600));
    };
    loop();
    return () => ids.forEach((id) => window.clearTimeout(id));
    // `suggestions` and `domain` only pick the demo's emails; the loop does not need to restart when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, active]);

  const n = people.length + (fly ? 1 : 0);
  const chips = suggestions.filter((s) => !people.some((p) => p.email === s) && fly?.p.email !== s);
  const heading = n === 0 ? "It's just you for now" : sent ? "Invites are on their way" : "Looking good";

  return (
    <div
      ref={card}
      className={cn(
        "relative w-[480px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]",
        className,
      )}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div role="list" aria-label="Team seats" className="flex justify-center gap-1.5 pt-2 sm:gap-3">
        {Array.from({ length: seats }, (_, i) => {
          const p = i === 0 ? { email: "you", hue: "" } : people[i - 1];
          return (
            <div
              key={i}
              role="listitem"
              aria-label={i === 0 ? "Seat 1: you" : p ? `Seat ${i + 1}: ${p.email}, ${sent ? "invite sent" : "pending"}` : `Seat ${i + 1}: empty`}
              ref={(el) => {
                seatEls.current[i] = el;
              }}
              className="relative flex aspect-square min-w-0 max-w-10 flex-1 items-center justify-center sm:max-w-14"
            >
              <span className="absolute inset-0 rounded-full border-2 border-dashed border-[#d2d2d7] dark:border-[#48484a]" />
              <AnimatePresence>
                {p && (
                  <motion.span
                    key={p.email}
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-0 flex items-center justify-center rounded-full text-[12px] font-semibold text-white ring-[3px] ring-white sm:text-[14px] dark:ring-[#1c1c1e]",
                      i === 0 && "bg-[#1d1d1f] dark:bg-[#f5f5f7] dark:text-[#1d1d1f]",
                    )}
                    style={i === 0 ? undefined : { background: p.hue }}
                    initial={i === 0 || reduce ? false : { scale: 0.6 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: reduce ? 1 : 0, opacity: 0 }}
                    transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 500, damping: 16 }}
                  >
                    {i === 0 ? "You" : initials(p.email)}
                  </motion.span>
                )}
              </AnimatePresence>
              {p && i > 0 && (
                <motion.span
                  aria-hidden="true"
                  className={cn(
                    "absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-1 py-[1px] text-[8.5px] font-semibold ring-2 ring-white sm:px-1.5 sm:text-[9.5px] dark:ring-[#1c1c1e]",
                    sent ? "bg-[#e9f9ee] text-[#1a7f37] dark:bg-[#12301b] dark:text-[#4ade80]" : "bg-[#fff4e5] text-[#b25e00] dark:bg-[#3a2a10] dark:text-[#ffb340]",
                  )}
                  initial={{ opacity: 0, y: reduce ? 0 : -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : 0.15 }}
                >
                  {sent ? "Sent" : "Pending"}
                </motion.span>
              )}
              {!p && (
                <span className="text-[18px] text-[#c7c7cc] dark:text-[#58585a]" aria-hidden="true">
                  +
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.h3
            key={heading}
            className="m-0 text-[19px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]"
            initial={{ opacity: 0, y: reduce ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -6 }}
          >
            {heading}
          </motion.h3>
        </AnimatePresence>
        <p className="m-0 mt-1 text-[13.5px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]" aria-live="polite">
          {n === 0 ? "Teams that invite in the first week stick around." : `${n + 1} of ${seats} seats filled`}
        </p>
      </div>

      <motion.div
        ref={field}
        className="mt-5 flex h-12 items-center gap-2 rounded-[14px] bg-[#f5f5f7] pl-4 pr-1.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#0071e3] dark:bg-[#2c2c2e] dark:focus-within:outline-[#0a84ff]"
        animate={{ x: bad && !reduce ? [0, -8, 7, -4, 0] : 0 }}
        transition={{ duration: 0.35 }}
      >
        <input
          value={value}
          onChange={(e) => {
            touched.current = true;
            setValue(e.target.value);
          }}
          onFocus={() => {
            touched.current = true;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              touched.current = true;
              add(value);
            }
          }}
          type="email"
          placeholder={placeholder}
          aria-label="Teammate's email"
          aria-invalid={bad || undefined}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#6e6e73] dark:text-[#f5f5f7] dark:placeholder:text-[#a1a1a6]"
        />
        <button
          type="button"
          onClick={() => {
            touched.current = true;
            add(value);
          }}
          className={cn("h-9 rounded-[10px] bg-white px-3.5 text-[13px] font-semibold text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:shadow-none", FOCUS)}
        >
          Add
        </button>
      </motion.div>
      <span className="sr-only" role="status" aria-live="polite">
        {note}
      </span>
      <div className="mt-3 flex min-h-[30px] flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">From {domain}</span>
        <AnimatePresence initial={false}>
          {chips.map((s) => (
            <motion.button
              key={s}
              layout={!reduce}
              type="button"
              onClick={() => {
                touched.current = true;
                add(s);
              }}
              className={cn("flex h-[30px] items-center gap-1.5 rounded-full bg-white pl-1 pr-2.5 text-[12.5px] text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] hover:bg-[#fafafa] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] dark:hover:bg-[#3a3a3c]", FOCUS)}
              initial={{ opacity: 0, scale: reduce ? 1 : 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
              aria-label={`Add ${s}`}
            >
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[9.5px] font-semibold text-white" style={{ background: hue(s) }} aria-hidden="true">
                {initials(s)}
              </span>
              {s.split("@")[0].split(".")[0].replace(/^./, (c) => c.toUpperCase())}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <button
        type="button"
        disabled={n === 0 || sent}
        onClick={() => {
          touched.current = true;
          send();
        }}
        className={cn("mt-4 h-11 w-full rounded-full bg-[#0071e3] text-[15px] font-medium text-white transition-opacity disabled:opacity-40", FOCUS)}
      >
        {sent ? "Invites sent" : n === 0 ? "Send invites" : `Send ${n} invite${n > 1 ? "s" : ""}`}
      </button>

      {/* the avatar in flight from the field to its seat */}
      {fly && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-20 flex h-12 w-12 items-center justify-center rounded-full text-[14px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(0,0,0,.4)]"
          style={{ background: fly.p.hue }}
          initial={{ x: fly.from[0] - 24, y: fly.from[1] - 24, scale: 0.5 }}
          animate={{
            x: [fly.from[0] - 24, (fly.from[0] + fly.to[0]) / 2 - 24, fly.to[0] - 24],
            y: [fly.from[1] - 24, Math.min(fly.from[1], fly.to[1]) - 60, fly.to[1] - 24],
            scale: [0.5, 1.1, 1],
          }}
          transition={{ duration: 0.6, ease: [0.3, 0, 0.2, 1] }}
          onAnimationComplete={() => land(fly.p, fly.auto)}
        >
          {initials(fly.p.email)}
        </motion.span>
      )}
    </div>
  );
}
```

--- components/empty-team/index.ts ---

```ts
export { EmptyTeam, EMPTY_TEAM_PEOPLE } from "./empty-team";
export type { EmptyTeamProps } from "./empty-team";
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

--- lib/typing-sound.ts ---

```ts
import * as React from "react";
import { getSoundsEnabled, setSoundsEnabled, useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

/**
 * Typing sound. One recorded key click per character, played in the same frame the character
 * appears, for every component that types by itself (typewriters, terminals, chat answers). The
 * clicks come from one OGG sprite (public/sounds/sound.ogg) and its timing map
 * (public/sounds/sprite-config.json); without them a short synthesised click plays instead.
 *
 *   const typing = useTypingSound();
 *   typing.type(char);       // a character landed
 *   typing.backspace();      // a character was removed
 *
 * It follows the site-wide sound switch and has a switch of its own (useTypingSoundEnabled), both
 * remembered in this browser. Self-playing demos stay silent until the visitor has used the page once,
 * and inside <AutoplaySound allow={false}>.
 */

const STORE_KEY = "ui-typing-sound";
let chosen: boolean | null = null; // the visitor's saved or runtime choice; typing is on until they say otherwise
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

/** The typing switch on its own (true until the visitor turns it off). The site-wide sound switch is separate. */
export function getTypingSoundChoice(): boolean {
  load();
  return chosen ?? true;
}

/** Whether typing is audible right now: the typing switch and the site-wide sound switch are both on. */
export function getTypingSoundEnabled(): boolean {
  return getSoundsEnabled() && getTypingSoundChoice();
}

/** Turn the typing sound on or off. The choice is remembered in this browser unless `persist` is false. */
export function setTypingSoundChoice(on: boolean, persist = true) {
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
 * The typing switch as React state: `[on, setOn]`. `on` is what the visitor hears (typing choice and
 * the site-wide switch both on). Turning it on also turns the site-wide sound on, because a typing
 * switch that stays silent is no switch; turning it off only silences typing.
 */
export function useTypingSoundEnabled(): [boolean, (on: boolean) => void] {
  const choice = React.useSyncExternalStore(subscribe, getTypingSoundChoice, () => false);
  const [master] = useSoundsEnabled();
  const set = React.useCallback((on: boolean) => {
    if (on) setSoundsEnabled(true);
    setTypingSoundChoice(on);
  }, []);
  return [choice && master, set];
}

// ── The recording ───────────────────────────────────────────────────

/** The key-click sprite and its timing map ({ defines: { keyCode: [offset ms, length ms] } }). */
export const TYPING_SPRITE_URL = "/sounds/sound.ogg";
export const TYPING_SPRITE_CONFIG_URL = "/sounds/sprite-config.json";

type AudioCtor = typeof AudioContext;
let context: AudioContext | null = null;
let sprite: { buffer: AudioBuffer; defines: Record<string, [number, number]> } | null = null;
let loading: Promise<void> | null = null;
let failed = false;

function audioCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext ?? null;
}

function liveContext(): AudioContext | null {
  const Ctor = audioCtor();
  if (!Ctor) return null;
  try {
    if (!context || context.state === "closed") context = new Ctor({ latencyHint: "interactive" });
    if (context.state === "suspended") void context.resume().catch(() => {});
    return context;
  } catch {
    return null;
  }
}

/**
 * Downloads and decodes the clicks so the first character is in time. It needs no user gesture
 * (it decodes offline) and does nothing twice. The hooks call it once typing is audible.
 */
export function primeTypingSound(): Promise<void> {
  if (typeof window === "undefined" || sprite || failed) return Promise.resolve();
  if (!loading) {
    loading = (async () => {
      try {
        const [audio, cfg] = await Promise.all([fetch(TYPING_SPRITE_URL), fetch(TYPING_SPRITE_CONFIG_URL)]);
        if (!audio.ok || !cfg.ok) throw new Error("typing sprite missing");
        const defines = ((await cfg.json()) as { defines?: Record<string, [number, number]> }).defines;
        if (!defines) throw new Error("typing sprite config has no defines");
        const Offline = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
        if (!Offline) throw new Error("no offline audio");
        const buffer = await new Offline(2, 1, 44100).decodeAudioData(await audio.arrayBuffer());
        sprite = { buffer, defines };
      } catch {
        failed = true; // the synthesised click covers it
      }
    })();
  }
  return loading;
}

/** The slice for a character: its own key, else the letter in capitals, else the space bar. */
function sliceFor(defines: Record<string, [number, number]>, char: string, kind: "key" | "enter" | "backspace"): [number, number] | null {
  if (kind === "enter") return defines["13"] ?? defines["10"] ?? null;
  if (kind === "backspace") return defines["8"] ?? defines["32"] ?? null;
  const code = char.charCodeAt(0);
  return defines[String(code)] ?? (code >= 97 && code <= 122 ? defines[String(code - 32)] : undefined) ?? defines["32"] ?? defines["65"] ?? null;
}

function synthClick(ctx: AudioContext, volume: number, heavy: boolean) {
  const t = ctx.currentTime;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume * 0.3, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (heavy ? 0.08 : 0.04));
  g.connect(ctx.destination);
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(heavy ? 165 : 245 + Math.random() * 60, t);
  o.connect(g);
  o.start(t);
  o.stop(t + (heavy ? 0.08 : 0.04));
}

function playClick(char: string, kind: "key" | "enter" | "backspace", volume: number) {
  const ctx = liveContext();
  if (!ctx || ctx.state !== "running") return false; // never queue clicks that would burst out later
  try {
    const slice = sprite ? sliceFor(sprite.defines, char, kind) : null;
    if (sprite && slice && slice[0] / 1000 < sprite.buffer.duration) {
      const node = ctx.createBufferSource();
      node.buffer = sprite.buffer;
      // A hair of pitch variation so fast typing does not sound like a loop.
      node.playbackRate.value = 0.98 + Math.random() * 0.04;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      node.connect(gain);
      gain.connect(ctx.destination);
      node.start(0, slice[0] / 1000, Math.min(slice[1] / 1000, sprite.buffer.duration - slice[0] / 1000));
    } else {
      synthClick(ctx, volume, kind !== "key");
    }
    return true;
  } catch {
    return false;
  }
}

// ── Playing ─────────────────────────────────────────────────────────

let lastAt = -1e9;

function userHasActed() {
  if (typeof navigator === "undefined") return false;
  const a = (navigator as unknown as { userActivation?: { hasBeenActive: boolean } }).userActivation;
  // Browsers without the API only let audio start after a gesture anyway.
  return a ? a.hasBeenActive : true;
}

/**
 * Plays the key click for a typed character (a "\n" is the Enter key). Set `auto: false` for a key
 * the visitor pressed; a component typing on its own (the default) stays silent until the visitor has
 * used the page once. Returns whether a click was started.
 */
export function playTypingSound(char: string, opts: { auto?: boolean; volume?: number; backspace?: boolean } = {}): boolean {
  if (typeof window === "undefined" || !getTypingSoundEnabled()) return false;
  if (document.hidden) return false;
  if (opts.auto !== false && !userHasActed()) return false;
  // A run of characters landing in one frame (streamed text) is one click, not a buzz.
  const now = performance.now();
  if (now - lastAt < 24) return false;
  lastAt = now;
  void primeTypingSound();
  const kind = opts.backspace ? "backspace" : char === "\n" ? "enter" : "key";
  return playClick(char, kind, opts.volume ?? 0.45);
}

export type TypingSound = {
  /** A character landed. */
  type: (char: string) => void;
  /** A character was removed. */
  backspace: () => void;
};

/**
 * For a component that types by itself. `enabled` is the component's own `sound` option. The sound
 * follows the typing switch and the site-wide sound switch, and stays silent where autoplay sound
 * is not allowed (a grid of previews).
 */
export function useTypingSound(enabled = true): TypingSound {
  const allowed = useAutoplaySoundAllowed();
  const [on] = useTypingSoundEnabled();
  const live = React.useRef(false);
  React.useEffect(() => {
    live.current = enabled && allowed && on;
    // Download and decode the clicks once typing is audible, so the first character is in time.
    if (live.current) {
      void primeTypingSound();
      // Build the audio context now (a page that has been used allows it), so the first character is heard.
      if (userHasActed()) liveContext();
    }
  }, [enabled, allowed, on]);
  return React.useMemo<TypingSound>(
    () => ({
      type: (char) => {
        if (live.current) playTypingSound(char);
      },
      backspace: () => {
        if (live.current) playTypingSound("", { backspace: true });
      },
    }),
    [],
  );
}

/**
 * The simplest way to give a typing animation its sound: pass the text that is on screen right now.
 * A click plays each time it grows by a character, a Backspace each time it shrinks, and nothing when
 * the whole line is swapped or first appears.
 *
 *   useTypedText(visibleText, enableSound);
 */
export function useTypedText(text: string, enabled = true) {
  const typing = useTypingSound(enabled);
  const prev = React.useRef(text);
  React.useEffect(() => {
    const before = prev.current;
    prev.current = text;
    if (text === before) return;
    if (text.length > before.length && text.startsWith(before)) typing.type(text[text.length - 1] ?? "");
    else if (text.length < before.length && before.startsWith(text)) typing.backspace();
  }, [text, typing]);
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
