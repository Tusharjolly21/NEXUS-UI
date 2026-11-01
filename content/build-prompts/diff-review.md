# Diff Review

Add the "Diff Review" component from Nexus UI to my project.

An inline review of AI edits to a paragraph, with removals struck through in red and additions typed in green. Accept all folds the old words away, Reject folds the new ones away, and clicking a single change takes just that one.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { DiffReview, DIFF_REVIEW_PARTS } from "@/components/diff-review";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/diff-review/diff-review.tsx ---

```tsx
"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

/** `same` text stays, `del` is struck out when the edit lands, `ins` is typed in. */
export type DiffKind = "same" | "del" | "ins";
/** One run of the paragraph. A `del` followed by an `ins` is one change (a replacement). */
export type DiffPart = [kind: DiffKind, text: string];

export interface DiffReviewProps {
  /** The paragraph as runs of unchanged, removed and added text. Defaults to a short hero-copy rewrite with four changes. */
  parts?: DiffPart[];
  /** Small label above the text box. */
  title?: string;
  /** Plays Improve writing, then Accept all, then Back to draft on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Width of the card in px. It never grows past its container. Default 520. */
  width?: number;
  /** Extra classes for the card. */
  className?: string;
}

export const DIFF_REVIEW_PARTS: DiffPart[] = [
  ["same", "Our app helps teams "],
  ["del", "to "],
  ["same", "manage "],
  ["del", "there"],
  ["ins", "their"],
  ["same", " projects"],
  ["del", " more better"],
  ["ins", " faster"],
  ["same", ". "],
  ["del", "It is very easy to use for everyone."],
  ["ins", "Anyone can pick it up in minutes."],
  ["same", " Try it free for 14 days."],
];

type Seg = { id: string; k: DiffKind; s: string; run: number };
type Phase = "draft" | "thinking" | "diff" | "accepted" | "rejected";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
// inside the clipped words the ring has to sit inside the box
const FOCUS_INSET = "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

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
 * Review AI edits the way you review a teammate's. Ask it to improve the
 * paragraph and a shimmer passes over the text, then the suggestion appears
 * inline: removals struck through in red, additions typed in green. Accept all
 * and the removed words fold away while the new ones settle into normal text;
 * Reject and the additions fold away instead. Click a single change to take
 * just that one.
 */
export function DiffReview({ parts = DIFF_REVIEW_PARTS, title = "Homepage · Hero copy", autoplay = false, enableSound = true, width = 520, className = "" }: DiffReviewProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<Phase>("draft");
  const [taken, setTaken] = useState<Set<number>>(() => new Set()); // changes accepted one at a time, by run
  const box = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const thinkTimer = useRef<number | undefined>(undefined);
  const active = useDemoActive(box, autoplay && !reduce);

  // split changed runs into words so each piece can fold away on its own
  const segs = useMemo<Seg[]>(
    () =>
      parts.flatMap(([k, s], ri): Seg[] =>
        k === "same" ? [{ id: `s${ri}`, k, s, run: ri }] : (s.match(/\s*\S+\s*/g) ?? []).map((w, wi) => ({ id: `${k}${ri}-${wi}`, k, s: w, run: ri })),
      ),
    [parts],
  );
  const pairRun = (run: number) => (parts[run]?.[0] === "ins" ? run - 1 : run);
  const total = useMemo(() => new Set(parts.flatMap(([k], ri) => (k === "same" ? [] : [parts[ri][0] === "ins" ? ri - 1 : ri]))).size, [parts]);
  const left = total - taken.size;

  const improve = () => {
    setTaken(new Set());
    setPhase("thinking");
    window.clearTimeout(thinkTimer.current);
    thinkTimer.current = window.setTimeout(() => setPhase((p) => (p === "thinking" ? "diff" : p)), reduce ? 350 : 1100);
  };
  useEffect(() => () => window.clearTimeout(thinkTimer.current), []);

  // The demo reads the latest handlers through a ref.
  const latest = useRef({ improve, play });
  useEffect(() => {
    latest.current = { improve, play };
  });

  // Demo: improve, accept everything, go back to the draft.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    let alive = true;
    const go = (fn: () => void, t: number) =>
      ids.push(
        window.setTimeout(() => {
          if (alive && !touched.current) fn();
        }, t),
      );
    const loop = () => {
      if (!alive || touched.current) return;
      go(() => latest.current.improve(), 900);
      go(() => {
        latest.current.play.auto("success", 0.5);
        setPhase("accepted");
      }, 4600);
      go(() => setPhase("draft"), 7800);
      ids.push(window.setTimeout(loop, 8200));
    };
    loop();
    return () => {
      alive = false;
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, [autoplay, reduce, active]);

  const visible = (k: DiffKind, run: number) => {
    if (k === "same") return true;
    if (phase === "draft" || phase === "thinking") return k === "del";
    if (phase === "accepted") return k === "ins";
    if (phase === "rejected") return k === "del";
    // reviewing: a change you've taken shows as final; others show both sides
    if (taken.has(pairRun(run))) return k === "ins";
    return true;
  };
  const marked = phase === "diff";

  // order of the changed words on screen, so they fold and type in a ripple
  const order = new Map<string, number>();
  for (const s of segs) if (s.k !== "same" && visible(s.k, s.run)) order.set(s.id, order.size);

  const label =
    phase === "diff"
      ? left > 0
        ? `${left} suggestion${left === 1 ? "" : "s"}`
        : "All changes taken"
      : phase === "accepted"
        ? "Edits applied"
        : phase === "rejected"
          ? "Kept original"
          : phase === "thinking"
            ? "Rewriting…"
            : "Draft";
  const dur = (n: number) => (reduce ? 0.12 : n);
  const btn = "h-9 rounded-full px-4 text-[13px] font-medium";

  return (
    <div
      ref={box}
      style={{ maxWidth: width }}
      className={`w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
      onFocusCapture={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{title}</span>
        <span role="status" aria-live="polite" className="text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={label} className="inline-block" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}>
              {label}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
      <div className="relative mt-3 min-h-[120px] overflow-hidden rounded-[16px] bg-[#fafafa] p-4 dark:bg-[#2c2c2e]">
        <LayoutGroup>
          <p className="m-0 text-[17px] leading-[1.75] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <AnimatePresence initial={false}>
              {segs.map((s) => {
                if (!visible(s.k, s.run)) return null;
                if (s.k === "same")
                  return (
                    <motion.span layout={reduce ? false : "position"} key={s.id}>
                      {s.s}
                    </motion.span>
                  );
                const del = s.k === "del";
                const show = marked && !taken.has(pairRun(s.run));
                const n = order.get(s.id) ?? 0;
                return (
                  <motion.span
                    key={s.id}
                    layout={reduce ? false : "position"}
                    className="relative inline-block overflow-hidden whitespace-pre align-bottom"
                    initial={del || reduce ? false : { width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0, transition: { duration: dur(0.32), delay: reduce ? 0 : n * 0.02, ease: [0.4, 0, 0.2, 1] } }}
                    transition={{ width: { duration: dur(0.3), delay: del || reduce ? 0 : n * 0.04 }, opacity: { duration: dur(0.2), delay: del || reduce ? 0 : n * 0.04 } }}
                  >
                    <button
                      type="button"
                      tabIndex={show ? 0 : -1}
                      onClick={() => {
                        if (!show) return;
                        touched.current = true;
                        play("tap", 0.4);
                        setTaken((t) => new Set(t).add(pairRun(s.run)));
                      }}
                      aria-label={show ? `Accept change: ${del ? "remove" : "add"} "${s.s.trim()}"` : undefined}
                      className={`rounded-[4px] transition-colors duration-300 ${FOCUS_INSET} ${show ? "cursor-pointer" : "cursor-text"} ${
                        show
                          ? del
                            ? "bg-[rgba(255,59,48,.12)] text-[#c4271b] dark:bg-[rgba(255,69,58,.2)] dark:text-[#ff8a80]"
                            : "bg-[rgba(52,199,89,.16)] text-[#16702f] dark:bg-[rgba(48,209,88,.18)] dark:text-[#6be28a]"
                          : "bg-transparent text-[#1d1d1f] dark:text-[#f5f5f7]"
                      }`}
                    >
                      {s.s}
                    </button>
                    {del && (
                      <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-0 right-0 top-1/2 h-[1.5px] origin-left bg-[#c4271b] dark:bg-[#ff8a80]"
                        initial={false}
                        animate={{ scaleX: show ? 1 : 0 }}
                        transition={{ duration: dur(0.3), delay: show && !reduce ? n * 0.03 : 0 }}
                      />
                    )}
                  </motion.span>
                );
              })}
            </AnimatePresence>
          </p>
        </LayoutGroup>
        <AnimatePresence>
          {phase === "thinking" && !reduce && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#0071e3]/10 to-transparent dark:via-[#0a84ff]/20"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </div>
      <div className="mt-4 flex min-h-9 items-center gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {phase === "diff" ? (
            <motion.div key="review" className="flex w-full flex-wrap items-center gap-2" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="mr-auto text-[12.5px] text-[#6e6e73] dark:text-[#a1a1a6]">Click a change to take just that one</span>
              <button
                type="button"
                onClick={() => {
                  touched.current = true;
                  play("off", 0.5);
                  setPhase("rejected");
                }}
                className={`${btn} bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c] ${FOCUS}`}
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => {
                  touched.current = true;
                  play("success", 0.5);
                  setPhase("accepted");
                }}
                className={`${btn} bg-[#1d1d1f] text-white hover:bg-black dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:hover:bg-white ${FOCUS}`}
              >
                Accept all
              </button>
            </motion.div>
          ) : (
            <motion.div key="idle" className="flex w-full items-center gap-2" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button
                type="button"
                disabled={phase === "thinking"}
                onClick={() => {
                  touched.current = true;
                  if (phase === "accepted" || phase === "rejected") setPhase("draft");
                  else improve();
                }}
                className={`${btn} flex items-center gap-1.5 bg-[#1d1d1f] text-white hover:bg-black disabled:opacity-50 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:hover:bg-white ${FOCUS}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" />
                </svg>
                {phase === "accepted" || phase === "rejected" ? "Back to draft" : "Improve writing"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

--- components/diff-review/index.ts ---

```ts
export { DiffReview, DIFF_REVIEW_PARTS } from "./diff-review";
export type { DiffReviewProps, DiffPart, DiffKind } from "./diff-review";
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
