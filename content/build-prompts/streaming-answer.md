# Streaming Answer

Add the "Streaming Answer" component from Nexus UI to my project.

An AI answer card that shows its thinking steps ticking off, folds them into a one-line summary, slides in sources and streams the answer word by word. Citation chips pop in where they belong and light up the source they came from when you point at them.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { StreamingAnswer, STREAMING_ANSWER_QUESTION, STREAMING_ANSWER_STEPS, STREAMING_ANSWER_SOURCES } from "@/components/streaming-answer";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/streaming-answer/index.ts ---

```ts
export {
  StreamingAnswer,
  STREAMING_ANSWER_QUESTION,
  STREAMING_ANSWER_STEPS,
  STREAMING_ANSWER_SOURCES,
  STREAMING_ANSWER_TEXT,
} from "./streaming-answer";
export type { StreamingAnswerProps, StreamingAnswerSource } from "./streaming-answer";
```

--- components/streaming-answer/streaming-answer.tsx ---

```tsx
"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound, type SoundName } from "@/lib/ui-sounds";

export interface StreamingAnswerSource {
  /** The number a citation chip in the answer points at, starting at 1. */
  n: number;
  title: string;
  /** Where it lives, shown above the title (for example "Analytics"). */
  where: string;
  /** Accent colour of the card ring, the number badge and the lit citation chip. */
  c: string;
  /** Text colour on top of `c`. Defaults to white. */
  ink?: string;
  /** Optional link. Without one the card is a focus target only. */
  href?: string;
}

export interface StreamingAnswerProps {
  /** The user's message, shown in the bubble above the answer. */
  question?: string;
  /** Thinking steps, ticked off one by one before the answer streams. */
  steps?: string[];
  /** The sources that slide in once thinking is done. Up to three fit the grid. */
  sources?: StreamingAnswerSource[];
  /** The answer. Write `{1}`, `{2}` ... straight after a word to put a citation chip there. */
  answer?: string;
  /** What the folded thinking line says, in seconds: "Thought for 4s". */
  thoughtSeconds?: number;
  /** Plays the whole run again every 13 seconds until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Width of the card in px. It never grows past its container. Default 520. */
  width?: number;
  /** Extra classes for the card. */
  className?: string;
}

export const STREAMING_ANSWER_QUESTION = "Why are people dropping off during onboarding?";
export const STREAMING_ANSWER_STEPS = ["Searching 3 sources", "Reading Onboarding funnel, Q3", "Comparing with last quarter"];
export const STREAMING_ANSWER_SOURCES: StreamingAnswerSource[] = [
  { n: 1, title: "Onboarding funnel, Q3", where: "Analytics", c: "#0a84ff" },
  { n: 2, title: "Support tickets: setup", where: "Helpdesk", c: "#ff9f0a", ink: "#1d1d1f" },
  { n: 3, title: "Interview notes, Oct", where: "Docs", c: "#30d158", ink: "#1d1d1f" },
];
export const STREAMING_ANSWER_TEXT =
  "Most people leave at the workspace step, not at sign-up. 41% of new accounts stop when asked to invite teammates {1}, and the top setup ticket is about not knowing who to invite yet {2}. Interviews say the same: people want to try it alone first {3}. Making the invite step skippable should recover most of that drop.";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const GAP = 800; // between thinking steps
const LEAD = 700; // before the first step ticks
const RUN_EVERY = 13000; // autoplay loop

type RunMode = "mount" | "user" | "auto";

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
 * An AI answer that shows its work without making you wait on a spinner. The
 * thinking steps tick off one by one and then fold into a single "Thought for
 * 4s" line you can reopen. Sources slide in, the answer streams word by word
 * with citation chips popping in where they belong, and pointing at (or
 * focusing) a chip lights up the source it came from. Regenerate plays the
 * run again. Under reduced motion the answer arrives whole after a short beat.
 */
export function StreamingAnswer({
  question = STREAMING_ANSWER_QUESTION,
  steps = STREAMING_ANSWER_STEPS,
  sources = STREAMING_ANSWER_SOURCES,
  answer = STREAMING_ANSWER_TEXT,
  thoughtSeconds = 4,
  autoplay = false,
  enableSound = true,
  width = 520,
  className = "",
}: StreamingAnswerProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0); // steps finished
  const [thinking, setThinking] = useState(true);
  const [openThoughts, setOpenThoughts] = useState(false);
  const [shown, setShown] = useState(0); // words visible
  const [hot, setHot] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const mode = useRef<RunMode>(autoplay ? "auto" : "mount");
  const active = useDemoActive(box, autoplay && !reduce);
  // an autoplaying card waits until it is on screen; a plain one just streams once
  const live = !autoplay || reduce || active;

  const tokens = useMemo(() => answer.split(/(\s+)/).filter((t) => t.trim()), [answer]);

  // The timers read the latest sound player without restarting the run.
  const sound = (name: SoundName, vol: number) => {
    if (mode.current === "user") play(name, vol);
    else if (mode.current === "auto") play.auto(name, vol);
  };
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  });

  useEffect(() => {
    if (!live) return;
    const ids: number[] = [];
    const at = (fn: () => void, t: number) => ids.push(window.setTimeout(fn, t));
    const finish = () => {
      setStep(steps.length);
      setThinking(false);
      setShown(tokens.length);
      soundRef.current("done", 0.5);
    };
    // start from the top (also how a run resumes after the card was off screen)
    at(() => {
      setStep(0);
      setThinking(true);
      setShown(0);
      setOpenThoughts(false);
    }, 0);
    if (reduce) {
      at(finish, 450);
    } else {
      steps.forEach((_, i) =>
        at(() => {
          setStep(i + 1);
          soundRef.current("tick", 0.35);
        }, LEAD + i * GAP),
      );
      const start = LEAD + steps.length * GAP + 200;
      at(() => setThinking(false), start);
      tokens.forEach((_, i) =>
        at(
          () => {
            setShown(i + 1);
            if (i === tokens.length - 1) soundRef.current("done", 0.5);
          },
          start + 400 + i * 55 + (i > 0 && tokens[i - 1].endsWith(".") ? 180 : 0) + Math.floor(i / 12) * 60,
        ),
      );
    }
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [run, live, reduce, steps, tokens]);

  // Autoplay: run it again every 13 seconds until someone touches the card.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const id = window.setInterval(() => {
      if (touched.current) return;
      mode.current = "auto";
      setRun((r) => r + 1);
    }, RUN_EVERY);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, active]);

  const done = !thinking && shown >= tokens.length;
  const spring = reduce ? { duration: 0.15 } : { type: "spring" as const, stiffness: 300, damping: 32 };

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
      <div className="ml-auto w-fit max-w-[85%] rounded-[18px] bg-[#f5f5f7] px-4 py-2.5 text-[14.5px] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]">{question}</div>

      {/* thinking: live steps, then a one-line summary you can reopen */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            if (!thinking) setOpenThoughts((o) => !o);
          }}
          aria-expanded={thinking || openThoughts}
          className={`flex items-center gap-2 rounded-full text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6] ${FOCUS}`}
        >
          {thinking ? (
            <span className="relative overflow-hidden">
              Thinking
              {!reduce && (
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-[#1c1c1e]/90"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
              )}
            </span>
          ) : (
            <motion.span className="flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Thought for {thoughtSeconds}s
              <motion.svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                animate={{ rotate: openThoughts ? 90 : 0 }}
                transition={reduce ? { duration: 0 } : undefined}
                aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </motion.svg>
            </motion.span>
          )}
        </button>
        <AnimatePresence initial={false}>
          {(thinking || openThoughts) && (
            <motion.ul
              className="m-0 mt-2 list-none overflow-hidden border-l-2 border-[#ececf0] p-0 pl-3 dark:border-[#3a3a3c]"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={spring}
            >
              {steps.map((s, i) =>
                i <= step ? (
                  <motion.li
                    key={s}
                    className="flex items-center gap-2 py-1 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]"
                    initial={reduce ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="relative flex h-3.5 w-3.5 items-center justify-center" aria-hidden="true">
                      {i < step ? (
                        <svg width="14" height="14" viewBox="0 0 24 24">
                          <motion.path
                            d="M5 12.5l4.5 4.5L19 7.5"
                            fill="none"
                            className="stroke-[#34c759] dark:stroke-[#30d158]"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={reduce ? false : { pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                          />
                        </svg>
                      ) : (
                        <motion.span
                          className="h-3 w-3 rounded-full border-2 border-[#c7c7cc] border-t-[#0071e3] dark:border-[#48484a] dark:border-t-[#0a84ff]"
                          animate={reduce ? undefined : { rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </span>
                    <span className="sr-only">{i < step ? "Done: " : "In progress: "}</span>
                    {s}
                  </motion.li>
                ) : null,
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* sources */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {sources.map((s, i) => (
          <motion.a
            key={s.n}
            href={s.href ?? "#"}
            onClick={(e) => {
              if (!s.href) e.preventDefault();
            }}
            onPointerEnter={() => setHot(s.n)}
            onPointerLeave={() => setHot(null)}
            onFocus={() => setHot(s.n)}
            onBlur={() => setHot(null)}
            className={`min-w-0 rounded-[14px] bg-[#f5f5f7] p-2.5 no-underline dark:bg-[#2c2c2e] ${FOCUS}`}
            initial={false}
            animate={{
              opacity: thinking ? 0 : 1,
              y: thinking && !reduce ? 10 : 0,
              scale: hot === s.n && !reduce ? 1.04 : 1,
              boxShadow: hot === s.n ? `0 0 0 2px ${s.c}` : "0 0 0 0px rgba(0,0,0,0)",
            }}
            transition={
              reduce
                ? { duration: 0.15 }
                : { delay: thinking ? 0 : hot === null ? 0.1 + i * 0.08 : 0, type: "spring", stiffness: 400, damping: 28 }
            }
            inert={thinking}
          >
            <span className="flex items-center gap-1.5 text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">
              <span className="flex h-4 w-4 items-center justify-center rounded-[4px] text-[9px] font-bold" style={{ background: s.c, color: s.ink ?? "#fff" }}>
                {s.n}
              </span>
              {s.where}
            </span>
            <span className="mt-1 block truncate text-[12.5px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{s.title}</span>
          </motion.a>
        ))}
      </div>

      {/* the streamed answer */}
      <p className="m-0 mt-4 min-h-[110px] text-[15.5px] leading-[1.6] text-[#1d1d1f] dark:text-[#f5f5f7]" aria-busy={!done}>
        {tokens.slice(0, shown).map((t, i) => {
          const cite = t.match(/^\{(\d)\}(.*)$/);
          if (cite) {
            const n = +cite[1];
            const s = sources.find((x) => x.n === n);
            if (!s) return <span key={i}>{cite[2]} </span>;
            const lit = hot === n;
            return (
              <span key={i}>
                <motion.button
                  type="button"
                  onPointerEnter={() => setHot(n)}
                  onPointerLeave={() => setHot(null)}
                  onFocus={() => setHot(n)}
                  onBlur={() => setHot(null)}
                  aria-label={`Source ${n}: ${s.title}`}
                  className={`relative -top-[1px] mx-[1px] inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] px-1 align-middle text-[10.5px] font-bold ${lit ? "" : "bg-[#ececf0] text-[#6e6e73] dark:bg-[#3a3a3c] dark:text-[#a1a1a6]"} ${FOCUS}`}
                  style={lit ? { background: s.c, color: s.ink ?? "#fff" } : undefined}
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 18 }}
                >
                  {n}
                </motion.button>
                {cite[2]}{" "}
              </span>
            );
          }
          return (
            <motion.span key={i} initial={reduce ? false : { opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.3 }}>
              {t}{" "}
            </motion.span>
          );
        })}
        {!thinking && !done && (
          <motion.span
            aria-hidden="true"
            className="inline-block h-[1em] w-[7px] translate-y-[2px] rounded-[2px] bg-[#1d1d1f] dark:bg-[#f5f5f7]"
            animate={reduce ? undefined : { opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </p>
      <span className="sr-only" role="status" aria-live="polite">
        {done ? "Answer ready" : ""}
      </span>

      <AnimatePresence>
        {done && (
          <motion.div
            className="mt-3 flex items-center gap-1"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {[
              { l: "Copy", d: "M8 8h10v12H8zM6 16H4V4h12v2" },
              { l: "Good answer", d: "M7 11v9H4v-9zM7 11l4-8a2 2 0 012 2v4h5a2 2 0 012 2.3l-1.2 7A2 2 0 0116.8 20H7" },
            ].map((b) => (
              <button
                key={b.l}
                type="button"
                aria-label={b.l}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[#6e6e73] hover:bg-[#f5f5f7] dark:text-[#a1a1a6] dark:hover:bg-[#2c2c2e] ${FOCUS}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={b.d} />
                </svg>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                touched.current = true;
                mode.current = "user";
                setRun((r) => r + 1);
              }}
              className={`ml-1 flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium text-[#6e6e73] hover:bg-[#f5f5f7] dark:text-[#a1a1a6] dark:hover:bg-[#2c2c2e] ${FOCUS}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" />
              </svg>
              Regenerate
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
