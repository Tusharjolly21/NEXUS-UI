Add the "Forge AI Command Bar" component from Nexus UI to my project.

A command bar for an AI copilot: pick Ask, Edit or Build, type a prompt or tap a suggestion and send it. The bar grows a panel where the prompt lands as a heading and each step ticks off while a light runs round the edge; Cmd/Ctrl+K focuses it and Esc stops a run.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` and `@/lib/typing-sound` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
6. The look assumes the Inter font through Tailwind's `font-sans`. If the project uses another font, leave that as it is.
7. Use it like this: `import { AiCommandBar, ForgeAiCommandBar } from "@/components/forge-ai-command-bar";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/forge-ai-command-bar/forge-ai-command-bar.tsx ---

```tsx
"use client";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useTypedText } from "@/lib/typing-sound";
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export type AiCommandMode = "ask" | "edit" | "build";

export interface AiCommandBarProps {
  /** Placeholder while the field is empty. */
  placeholder?: string;
  /** One-tap prompts shown under the field while it is empty. */
  suggestions?: string[];
  /** Mode the switcher starts on. */
  defaultMode?: AiCommandMode;
  /** Called with the prompt and the selected mode when the user sends it. */
  onSubmit?: (prompt: string, mode: AiCommandMode) => void;
  /** Builds the progress steps shown while the copilot works. Defaults to four generic steps. */
  steps?: (prompt: string, mode: AiCommandMode) => string[];
  /** Key that focuses the bar together with Cmd (Mac) or Ctrl. Pass an empty string to turn the shortcut off. */
  hotkey?: string;
  /** Types and runs the suggestions in turn until someone touches the bar. */
  autoplay?: boolean;
  /** Extra classes for the root. */
  className?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const MODES: { id: AiCommandMode; label: string }[] = [
  { id: "ask", label: "Ask" },
  { id: "edit", label: "Edit" },
  { id: "build", label: "Build" },
];

const DEFAULT_SUGGESTIONS = ["Add a pricing table", "Make the hero animate in", "Switch the app to dark mode"];

const VERB: Record<AiCommandMode, string> = { ask: "Answering", edit: "Editing", build: "Building" };

const defaultSteps = (prompt: string, mode: AiCommandMode) => [
  "Reading the project",
  `${VERB[mode]}: ${prompt.length > 34 ? `${prompt.slice(0, 32).trimEnd()}...` : prompt}`,
  mode === "ask" ? "Checking 12 sources" : "Writing 3 files",
  "Done in 1.8s",
];

const SPRING = { type: "spring" as const, stiffness: 420, damping: 32 };
/** Low damping on the panel so it overshoots a touch as it grows: the signature move. */
const PANEL = { type: "spring" as const, stiffness: 260, damping: 20 };
const STEP_MS = 650;

type Phase = "idle" | "thinking" | "done";

function Spark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M10 1.5l1.9 5.2a2 2 0 0 0 1.2 1.2l5.2 1.9-5.2 1.9a2 2 0 0 0-1.2 1.2L10 18.1l-1.9-5.2a2 2 0 0 0-1.2-1.2L1.7 9.8l5.2-1.9a2 2 0 0 0 1.2-1.2L10 1.5z" fill="currentColor" />
    </svg>
  );
}

/**
 * A command bar for an AI copilot. Pick Ask, Edit or Build, type or tap a
 * suggestion and send: the bar grows a panel above the field where the prompt
 * lands as a heading and each step ticks off in turn, while a light runs round
 * the edge. Cmd/Ctrl+K focuses it, Esc stops a run.
 */
export function AiCommandBar({
  placeholder = "Describe what you need...",
  suggestions = DEFAULT_SUGGESTIONS,
  defaultMode = "build",
  onSubmit,
  steps = defaultSteps,
  hotkey = "k",
  autoplay = false,
  className = "",
  enableSound = true,
}: AiCommandBarProps) {
  const play = useSound(enableSound);
  const id = useId().replace(/:/g, "");
  const still = useReducedMotion() === true;
  const [mode, setMode] = useState<AiCommandMode>(defaultMode);
  const [value, setValue] = useState("");
  useTypedText(value, enableSound);
  const [phase, setPhase] = useState<Phase>("idle");
  const [query, setQuery] = useState("");
  const [list, setList] = useState<string[]>([]);
  const [shown, setShown] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const timers = useRef<number[]>([]);
  const playRef = useRef(play);
  useEffect(() => {
    playRef.current = play;
  });
  const angle = useMotionValue(0);
  const ring = useMotionTemplate`conic-gradient(from ${angle}deg, #0071e3, #bf5af2, #ff9f0a, #30d158, #0071e3)`;

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    const pending = timers;
    return () => pending.current.forEach((t) => window.clearTimeout(t));
  }, []);

  // The light round the edge only spins while the copilot is working.
  useEffect(() => {
    if (phase !== "thinking" || still) return;
    const run = animate(angle, [angle.get(), angle.get() + 360], { duration: 1.6, ease: "linear", repeat: Infinity });
    return () => run.stop();
  }, [phase, still, angle]);

  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === hotkey.toLowerCase()) {
        e.preventDefault();
        touched.current = true;
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  const run = (prompt: string, m: AiCommandMode, after?: () => void) => {
    const text = prompt.trim();
    if (!text) return;
    clear();
    const next = steps(text, m);
    setQuery(text);
    setList(next);
    setShown(0);
    setValue("");
    setPhase("thinking");
    next.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setShown(i + 1);
          if (i === next.length - 1) {
            setPhase("done");
            after?.();
          }
        }, (i + 1) * STEP_MS),
      );
    });
  };

  const stop = () => {
    clear();
    setPhase("idle");
    setList([]);
    setShown(0);
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    touched.current = true;
    if (phase === "thinking") {
      stop();
      return;
    }
    if (!value.trim()) return;
    play("whoosh");
    onSubmit?.(value.trim(), mode);
    run(value, mode);
  };

  const key = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (phase !== "idle") stop();
      else setValue("");
    }
  };

  // Autoplay: type a suggestion, send it, let the steps run, reset, move on.
  const tips = suggestions.join("\u0000");
  useEffect(() => {
    const list = tips ? tips.split("\u0000") : [];
    if (!autoplay || list.length === 0) return;
    const local: number[] = [];
    let k = 0;
    let lastMode = defaultMode;
    const later = (f: () => void, ms: number) => local.push(window.setTimeout(() => !touched.current && f(), ms));
    const cycle = () => {
      const text = list[k % list.length];
      const m = MODES[k % MODES.length].id;
      k++;
      if (m !== lastMode) playRef.current.auto("tick", 0.5);
      lastMode = m;
      setMode(m);
      for (let c = 1; c <= text.length; c++) later(() => setValue(text.slice(0, c)), 500 + c * 38);
      later(() => {
        playRef.current.auto("whoosh");
        run(text, m, () => {
          later(() => {
            setPhase("idle");
            setList([]);
            setShown(0);
            later(cycle, 700);
          }, 1800);
        });
      }, 500 + text.length * 38 + 450);
    };
    local.push(window.setTimeout(cycle, 600));
    return () => local.forEach((t) => window.clearTimeout(t));
    // `run` only touches stable setters and refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, tips]);

  const busy = phase === "thinking";
  const open = phase !== "idle";

  return (
    <div
      className={cn(`w-full max-w-[520px]`, className)}
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
    >
      <LayoutGroup id={id}>
        <motion.div layout transition={PANEL} className="relative rounded-[24px] p-[1.5px]" style={{ borderRadius: 24 }}>
          {/* Light that runs round the edge while working. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[24px]"
            style={{ backgroundImage: ring }}
            initial={false}
            animate={{ opacity: busy ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            layout
            transition={PANEL}
            className="relative overflow-hidden rounded-[22.5px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]"
            style={{ borderRadius: 22.5 }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {open && (
                <motion.div
                  key="panel"
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.16 } }}
                  transition={PANEL}
                  className="border-b border-black/[0.06] px-5 pb-4 pt-5 dark:border-white/[0.08]"
                  aria-live="polite"
                >
                  <motion.p layout="position" className="text-[17px] font-semibold leading-snug tracking-[-0.02em]">
                    {query}
                  </motion.p>
                  <ol className="mt-3 flex flex-col gap-2">
                    <AnimatePresence initial={false}>
                      {list.slice(0, Math.min(list.length, shown + 1)).map((s, i) => {
                        const doneStep = i < shown;
                        return (
                          <motion.li
                            key={`${query}-${i}`}
                            layout="position"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={SPRING}
                            className="flex items-center gap-2.5 text-[13px]"
                          >
                            <span className="relative grid h-[18px] w-[18px] shrink-0 place-items-center">
                              {doneStep ? (
                                <motion.svg
                                  viewBox="0 0 18 18"
                                  className="h-[18px] w-[18px]"
                                  initial={{ scale: 0.4 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 600, damping: 14 }}
                                  aria-hidden="true"
                                >
                                  <circle cx="9" cy="9" r="9" fill="#30d158" />
                                  <motion.path
                                    d="M5 9.4l2.6 2.5L13 6.4"
                                    fill="none"
                                    stroke="#fff"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: still ? 1 : 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.3, delay: 0.05 }}
                                  />
                                </motion.svg>
                              ) : (
                                <motion.span
                                  className="h-[14px] w-[14px] rounded-full border-2 border-[#0071e3]/25 border-t-[#0071e3] dark:border-[#0a84ff]/30 dark:border-t-[#0a84ff]"
                                  animate={still ? undefined : { rotate: 360 }}
                                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                />
                              )}
                            </span>
                            <span className={doneStep ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}>{s}</span>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form layout="position" onSubmit={submit} className="flex items-center gap-2 px-3 py-3 sm:px-4">
              <motion.span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f0f0f3] text-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#0a84ff]"
                animate={busy && !still ? { rotate: [0, 18, -12, 0], scale: [1, 1.12, 1] } : { rotate: 0, scale: 1 }}
                transition={busy ? { duration: 1.2, repeat: Infinity } : SPRING}
              >
                <Spark className="h-4 w-4" />
              </motion.span>
              <label htmlFor={`${id}-q`} className="sr-only">
                Prompt
              </label>
              <input
                ref={input}
                id={`${id}-q`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={key}
                placeholder={busy ? "Working on it..." : placeholder}
                disabled={busy}
                autoComplete="off"
                className="h-9 min-w-0 flex-1 bg-transparent text-[15px] tracking-[-0.01em] outline-none placeholder:text-[#86868b] disabled:cursor-wait dark:placeholder:text-[#8e8e93]"
              />
              {hotkey && !value && !busy && (
                <kbd className="hidden shrink-0 rounded-md bg-[#f0f0f3] px-1.5 py-0.5 font-sans text-[11px] text-[#6e6e73] sm:inline dark:bg-[#2c2c2e] dark:text-[#a1a1a6]">
                  Cmd {hotkey.toUpperCase()}
                </kbd>
              )}
              <motion.button
                type="submit"
                layout
                transition={SPRING}
                aria-label={busy ? "Stop" : "Send"}
                disabled={!busy && !value.trim()}
                whileTap={{ scale: 0.88 }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0071e3] text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 disabled:bg-[#e8e8ed] disabled:text-[#86868b] dark:bg-[#0a84ff] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e] dark:disabled:bg-[#2c2c2e] dark:disabled:text-[#8e8e93]"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {busy ? (
                    <motion.span
                      key="stop"
                      className="h-3 w-3 rounded-[3px] bg-current"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={SPRING}
                    />
                  ) : (
                    <motion.svg
                      key="send"
                      viewBox="0 0 16 16"
                      className="h-4 w-4"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -14, opacity: 0 }}
                      transition={SPRING}
                      aria-hidden="true"
                    >
                      <path d="M8 13V3.5M3.5 7.5L8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.form>

            <motion.div layout="position" className="flex flex-wrap items-center gap-2 px-3 pb-3 sm:px-4">
              <div role="radiogroup" aria-label="Mode" className="flex rounded-full bg-[#f0f0f3] p-0.5 dark:bg-[#2c2c2e]">
                {MODES.map((m) => {
                  const on = m.id === mode;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        touched.current = true;
                        if (m.id !== mode) play("tick", 0.5);
                        setMode(m.id);
                      }}
                      className="relative rounded-full px-3 py-1 text-[12px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
                    >
                      {on && (
                        <motion.span
                          layoutId={`${id}-mode`}
                          className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.12)] dark:bg-[#48484a]"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <span className={`relative ${on ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
              <AnimatePresence initial={false} mode="popLayout">
                {!value &&
                  phase === "idle" &&
                  suggestions.slice(0, 3).map((s, i) => (
                    <motion.button
                      key={s}
                      type="button"
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1, transition: { ...SPRING, delay: i * 0.04 } }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.12 } }}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        touched.current = true;
                        play("tap");
                        onSubmit?.(s, mode);
                        run(s, mode);
                      }}
                      className="max-w-full truncate rounded-full px-3 py-1 text-[12px] text-[#1d1d1f] shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)] outline-none hover:bg-[#f5f5f7] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#f5f5f7] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)] dark:hover:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]"
                    >
                      {s}
                    </motion.button>
                  ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </LayoutGroup>
      <p className="mt-3 text-center text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Type a prompt or tap a suggestion. Esc stops it.</p>
    </div>
  );
}

/** Alias that matches the catalog name. */
export const ForgeAiCommandBar = AiCommandBar;
```

--- components/forge-ai-command-bar/index.ts ---

```ts
export { AiCommandBar, ForgeAiCommandBar } from "./forge-ai-command-bar";
export type { AiCommandBarProps, AiCommandMode } from "./forge-ai-command-bar";
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
