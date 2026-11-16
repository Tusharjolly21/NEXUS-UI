"use client";

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/immutability, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type ThinkingStep = {
  /** what it's doing, while it does it */
  doing: string;
  /** what it did, once done */
  did: string;
  kind: "read" | "search" | "compare" | "write";
  /** for a search: the sources it found, shown as little chips */
  sources?: string[];
  /** seconds this step takes in the demo */
  secs: number;
};
export type AgentThinkingProps = {
  prompt?: string;
  steps?: ThinkingStep[];
  answer?: string;
  /** Soft sounds: a tick as each step finishes. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const I = {
  read: "m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 51.31L188.69 80H160ZM200 216H56V40h88v48a8 8 0 0 0 8 8h48zm-32-80a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8m0 32a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8",
  search:
    "M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24m87.62 96h-39.83c-1.79-36.51-15.85-62.33-27.38-77.6a88.19 88.19 0 0 1 67.22 77.6ZM96.23 136h63.54c-2.31 41.61-22.23 67.11-31.77 77c-9.55-9.9-29.46-35.4-31.77-77m0-16c2.31-41.61 22.23-67.11 31.77-77c9.55 9.93 29.46 35.43 31.77 77Zm11.36-77.6C96.06 57.67 82 83.49 80.21 120H40.37a88.19 88.19 0 0 1 67.22-77.6M40.37 136h39.84c1.82 36.51 15.85 62.33 27.38 77.6A88.19 88.19 0 0 1 40.37 136m108 77.6c11.53-15.27 25.56-41.09 27.38-77.6h39.84a88.19 88.19 0 0 1-67.18 77.6Z",
  compare:
    "M32 64a8 8 0 0 1 8-8h176a8 8 0 0 1 0 16H40a8 8 0 0 1-8-8m8 72h72a8 8 0 0 0 0-16H40a8 8 0 0 0 0 16m88 48H40a8 8 0 0 0 0 16h88a8 8 0 0 0 0-16m109.66 13.66a8 8 0 0 1-11.32 0L206 177.36A40 40 0 1 1 217.36 166l20.3 20.3a8 8 0 0 1 0 11.36M184 168a24 24 0 1 0-24-24a24 24 0 0 0 24 24",
  write:
    "m227.32 73.37l-44.69-44.68a16 16 0 0 0-22.63 0L36.69 152A15.86 15.86 0 0 0 32 163.31V208a16 16 0 0 0 16 16h168a8 8 0 0 0 0-16H115.32l112-112a16 16 0 0 0 0-22.63M92.69 208H48v-44.69l88-88L180.69 120ZM192 108.69L147.32 64l24-24L216 84.69Z",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  caret:
    "m213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32",
  again:
    "M240 56v48a8 8 0 0 1-8 8h-48a8 8 0 0 1 0-16h27.4l-26.59-24.36l-.25-.24a80 80 0 1 0-1.67 114.78a8 8 0 0 1 11 11.63A95.44 95.44 0 0 1 128 224h-1.32a96 96 0 1 1 69.07-164L224 85.8V56a8 8 0 1 1 16 0",
  stop: "M216 56v144a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h144a16 16 0 0 1 16 16",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const DEFAULT_STEPS: ThinkingStep[] = [
  {
    doing: "Reading the current pricing page",
    did: "Read the pricing page",
    kind: "read",
    secs: 1.6,
  },
  {
    doing: "Searching for pricing page patterns",
    did: "Searched 4 sources",
    kind: "search",
    sources: ["stripe.com", "linear.app", "vercel.com", "notion.so"],
    secs: 2.4,
  },
  {
    doing: "Comparing three hero layouts",
    did: "Compared three layouts",
    kind: "compare",
    secs: 1.8,
  },
  {
    doing: "Drafting a tighter headline",
    did: "Drafted the copy",
    kind: "write",
    secs: 1.4,
  },
];
const DEFAULT_ANSWER =
  "Lead with the outcome, not the plan names: “Ship faster, pay for what you use.” Put the monthly and yearly switch right under it, and give the middle plan a quiet glow so the eye lands there first. Cut the hero copy from 42 words to 14.";

/**
 * What an AI agent shows while it works on a reply.
 *
 * A small living orb (soft colours turning slowly inside a glass bead) sits by a label that shimmers, "Thinking",
 * with the seconds counting beside it. Under it the steps arrive one at a time: each with its own icon, its words
 * shimmering while it runs, a spinner that turns into a tick when it's done, and for a web search, the sources
 * dropping in as little chips. When it's finished the steps fold away into a single line, "Thought for 7s", which you
 * can open again, and the answer writes itself in, a few words at a time, each one unblurring as it lands. Stop it
 * part way, or ask it to go again.
 *   <AgentThinking prompt="Tighten the pricing hero" steps={steps} answer={text} />
 */
export default function AgentThinking({
  prompt = "Redesign the pricing page hero and tighten the copy.",
  steps = DEFAULT_STEPS,
  answer = DEFAULT_ANSWER,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: AgentThinkingProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  // which step is running (steps.length once all are done), when it started, and how much of the answer is out
  const [at, setAt] = useState(-1);
  const [t0, setT0] = useState(0);
  const [now, setNow] = useState(0);
  const [took, setTook] = useState(0);
  const [words, setWords] = useState(0);
  const [open, setOpen] = useState(true);
  const [stopped, setStopped] = useState(false);
  const run = useRef(0);
  const tokens = useMemo(() => answer.split(/(\s+)/).filter((x) => x.length), [answer]);
  const thinking = at >= 0 && at < steps.length && !stopped;
  const writing = at >= steps.length && words < tokens.length && !stopped;

  const start = () => {
    const id = ++run.current;
    setAt(0);
    setWords(0);
    setOpen(true);
    setStopped(false);
    const s = performance.now();
    setT0(s);
    setNow(s);
    sfx.note(660, { dur: 0.25, gain: 0.02, bell: 0.6 });
    let k = 0;
    const next = () => {
      if (run.current !== id) return;
      window.setTimeout(
        () => {
          if (run.current !== id) return;
          k++;
          sfx.tick({ freq: 1700 + k * 120, gain: 0.025 });
          setAt(k);
          if (k < steps.length) next();
          else {
            setTook((performance.now() - s) / 1000);
            // the steps fold away and the answer begins
            window.setTimeout(() => run.current === id && setOpen(false), reduce ? 0 : 450);
            let w = 0;
            const write = () => {
              if (run.current !== id) return;
              w += 1 + Math.floor(Math.random() * 3);
              setWords(Math.min(w, tokens.length));
              if (w < tokens.length) window.setTimeout(write, reduce ? 0 : 55 + Math.random() * 60);
            };
            window.setTimeout(write, reduce ? 0 : 650);
          }
        },
        reduce ? 300 : steps[k].secs * 1000,
      );
    };
    next();
  };
  const stop = () => {
    run.current++;
    setStopped(true);
    setTook((performance.now() - t0) / 1000);
    sfx.note(330, { dur: 0.15, gain: 0.03, bell: 0 });
  };
  useEffect(() => {
    if (!thinking) return;
    let raf = 0;
    const loop = () => {
      setNow(performance.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [thinking]);
  useEffect(() => {
    // it answers on its own only when it demos itself; otherwise it waits to be asked
    if (autoplay && inView && at < 0) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  useEffect(() => () => void run.current++, []);
  // autoplay: it thinks, answers, and some time later is asked again
  useEffect(() => {
    if (!autoplay || !inView) return;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      if (!thinking && !writing) start();
    }, 4200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, thinking, writing]);

  const secs = thinking ? (now - t0) / 1000 : took;
  const done = at >= steps.length || stopped;
  return (
    <div
      ref={rootRef}
      onPointerDown={() => {
        touched.current = true;
        unlockAudio();
      }}
      className={`w-full max-w-[460px] rounded-[28px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.04),0_14px_30px_-14px_rgba(0,0,0,.18),0_40px_70px_-44px_rgba(0,0,0,.35)] ${className}`}
    >
      {/* the question */}
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-[20px] rounded-br-[6px] bg-[#f2f2f7] px-4 py-2.5 text-[14px] leading-[1.45]">
          {prompt}
        </div>
      </div>

      {/* the agent */}
      <div className="mt-4 flex items-start gap-3">
        <Orb active={thinking || writing} reduce={reduce} />
        <div className="min-w-0 flex-1 pt-[8px]">
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              if (done) setOpen((o) => !o);
            }}
            aria-expanded={open}
            className="group flex items-center gap-2 rounded-md text-[14px] outline-none focus-visible:shadow-[0_0_0_2px_#0071e3]"
          >
            {thinking ? (
              <Shimmer text="Thinking" reduce={reduce} />
            ) : (
              <span className="font-medium text-[#6e6e73]">
                {stopped ? "Stopped" : "Thought"} for {Math.max(1, Math.round(took))}s
              </span>
            )}
            <span className="tabular-nums text-[12px] text-[#a1a1a6]">{thinking ? `${secs.toFixed(1)}s` : ""}</span>
            {done && (
              <motion.span
                className="text-[#a1a1a6]"
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Ico d={I.caret} size={13} />
              </motion.span>
            )}
          </button>

          {/* the steps */}
          <AnimatePresence initial={false}>
            {open && at >= 0 && (
              <motion.ol
                key="steps"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 32,
                  opacity: { duration: 0.2 },
                }}
                className="relative mt-2 overflow-hidden"
              >
                {/* the thread that joins the steps */}
                <span aria-hidden="true" className="absolute bottom-3 left-[9px] top-3 w-px bg-black/[.08]" />
                {steps.slice(0, Math.min(at + 1, steps.length)).map((s, k) => {
                  const live = k === at && !stopped;
                  return (
                    <motion.li
                      key={k}
                      className="relative flex gap-3 py-1.5"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        filter: { duration: 0.25 },
                      }}
                    >
                      <span className="relative z-[1] grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full bg-white">
                        <AnimatePresence mode="popLayout" initial={false}>
                          {live ? (
                            <motion.span
                              key="spin"
                              className="block h-[13px] w-[13px] rounded-full border-[1.6px] border-[#d1d1d6] border-t-[#0071e3]"
                              animate={reduce ? undefined : { rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.8,
                                ease: "linear",
                              }}
                              exit={{ scale: 0.4, opacity: 0 }}
                            />
                          ) : (
                            <motion.span
                              key="ok"
                              className="grid h-[17px] w-[17px] place-items-center rounded-full bg-[#30d158] text-white"
                              initial={{ scale: 0.3 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 600,
                                damping: 18,
                              }}
                            >
                              <Ico d={I.check} size={10} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[13.5px]">
                          <span className={live ? "text-[#1d1d1f]" : "text-[#86868b]"}>
                            <Ico d={I[s.kind]} size={14} />
                          </span>
                          {live ? (
                            <Shimmer text={s.doing} reduce={reduce} small />
                          ) : (
                            <span className="truncate text-[#6e6e73]">{s.did}</span>
                          )}
                        </div>
                        {s.sources && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {s.sources.map((src, j) => (
                              <motion.span
                                key={src}
                                className="flex items-center gap-1.5 rounded-full bg-[#f2f2f7] py-[3px] pl-1 pr-2 text-[11.5px] text-[#6e6e73]"
                                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: 4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{
                                  delay: reduce ? 0 : 0.35 + j * 0.28,
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 24,
                                }}
                              >
                                <span
                                  className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold text-white"
                                  style={{
                                    background: ["#635bff", "#5e6ad2", "#111111", "#ff6b35"][j % 4],
                                  }}
                                >
                                  {src[0].toUpperCase()}
                                </span>
                                {src}
                              </motion.span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ol>
            )}
          </AnimatePresence>

          {/* the answer, word by word */}
          {at >= steps.length && (
            <p className="mt-3 text-[15px] leading-[1.55]" aria-live="polite">
              {tokens.slice(0, words).map((w, k) => (
                <motion.span
                  key={k}
                  initial={reduce ? false : { opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.35 }}
                >
                  {w}
                </motion.span>
              ))}
              {writing && (
                <motion.span
                  aria-hidden="true"
                  className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] rounded-full bg-[#0071e3]"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                />
              )}
            </p>
          )}

          <div className="mt-3 flex gap-2">
            {thinking || writing ? (
              <button
                type="button"
                onClick={stop}
                className="flex items-center gap-1.5 rounded-full bg-[#f2f2f7] px-3 py-1.5 text-[13px] font-medium outline-none transition hover:bg-[#e8e8ed] focus-visible:shadow-[0_0_0_2px_#0071e3]"
              >
                <Ico d={I.stop} size={11} />
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  touched.current = true;
                  unlockAudio();
                  start();
                }}
                className="flex items-center gap-1.5 rounded-full bg-[#f2f2f7] px-3 py-1.5 text-[13px] font-medium outline-none transition hover:bg-[#e8e8ed] focus-visible:shadow-[0_0_0_2px_#0071e3]"
              >
                <Ico d={I.again} size={13} />
                {at < 0 ? "Ask" : "Ask again"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** text with a band of light passing along it */
function Shimmer({ text, reduce, small }: { text: string; reduce: boolean; small?: boolean }) {
  return (
    <motion.span
      className={`truncate bg-clip-text font-medium text-transparent ${small ? "" : "text-[14px]"}`}
      style={{
        backgroundImage: "linear-gradient(90deg, #8e8e93 0%, #8e8e93 35%, #1d1d1f 50%, #8e8e93 65%, #8e8e93 100%)",
        backgroundSize: "250% 100%",
        WebkitBackgroundClip: "text",
      }}
      animate={reduce ? undefined : { backgroundPosition: ["120% 0", "-20% 0"] }}
      transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
    >
      {text}
    </motion.span>
  );
}

/**
 * the agent's core: a sphere of points turning inside a dark lens, with a tilted orbit and a spark running round it.
 * Idle, it turns slowly and dims. Thinking, it wakes: it turns faster, waves run through the points, a scan line
 * sweeps down it lighting the points it passes, and the spark leaves a trail.
 */
function Orb({ active, reduce }: { active: boolean; reduce: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const act = useRef(active);
  act.current = active;
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const S = 36;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    c.width = S * dpr;
    c.height = S * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // points spread evenly over a sphere (a Fibonacci lattice)
    const N = 130;
    const pts = Array.from({ length: N }, (_, i) => {
      const y = 1 - ((i + 0.5) / N) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = i * 2.39996323;
      return [Math.cos(a) * r, y, Math.sin(a) * r] as const;
    });
    const R = 10.4;
    const cx = S / 2;
    const cy = S / 2;
    const tilt = 0.42;
    let energy = act.current ? 1 : 0;
    let rot = 0.6;
    let t = 0;
    let last = performance.now();
    let raf = 0;
    let visible = true;
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce) {
        energy += ((act.current ? 1 : 0) - energy) * Math.min(1, dt * 2.6);
        rot += dt * (0.35 + energy * 1.5);
        t += dt;
      }
      ctx.clearRect(0, 0, S, S);
      ctx.globalCompositeOperation = "lighter";
      const scan = ((t * 0.55) % 1.4) - 0.2; // 0..1 top to bottom, with a pause off the ends
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      for (const [px, py, pz] of pts) {
        // a wave running round the sphere pushes points out when it's awake
        const wave = 1 + energy * 0.1 * Math.sin(py * 5 + Math.atan2(pz, px) * 3 - t * 5.5);
        let x = px * cr + pz * sr;
        let z = -px * sr + pz * cr;
        let y = py;
        const y2 = y * ct - z * st;
        z = y * st + z * ct;
        y = y2;
        x *= wave;
        y *= wave;
        const depth = (z + 1) / 2; // 0 back, 1 front
        const lit = Math.max(0, 1 - Math.abs((y + 1) / 2 - scan) * 14) * energy;
        const alpha = (0.05 + depth * depth * 0.8) * (0.55 + energy * 0.45) + lit * 0.35;
        const size = 0.28 + depth * 0.52 + lit * 0.25;
        // cyan at the front turning violet toward the back
        const r = Math.round(110 + (1 - depth) * 70 + lit * 100);
        const g = Math.round(225 - (1 - depth) * 140 + lit * 30);
        const b = 255;
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, alpha).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(cx + x * R, cy + y * R, size, 0, Math.PI * 2);
        ctx.fill();
      }
      // the orbit, tilted, and a spark running round it with a trail
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.5);
      ctx.strokeStyle = `rgba(140,200,255,${(0.1 + energy * 0.22).toFixed(3)})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(0, 0, 15.6, 5.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      const sa = t * (1.2 + energy * 2.2);
      for (let k = 0; k < 9; k++) {
        const a = sa - k * 0.12;
        const front = Math.sin(a) > 0; // behind the sphere it dims
        const al = (1 - k / 9) * (0.25 + energy * 0.75) * (front ? 1 : 0.35);
        ctx.fillStyle = `rgba(200,235,255,${al.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 15.6, Math.sin(a) * 5.2, k === 0 ? 1.15 : 0.8 * (1 - k / 12), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalCompositeOperation = "source-over";
      if (!reduce && visible) raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    });
    io.observe(c);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduce]);
  return (
    <div className="relative h-9 w-9 shrink-0" aria-hidden="true">
      {/* a cold glow behind the lens, only while it works */}
      <motion.div
        className="absolute inset-[-5px] rounded-full blur-[8px]"
        style={{
          background: "radial-gradient(circle, rgba(80,170,255,.7), rgba(140,90,255,.35) 55%, transparent 75%)",
        }}
        animate={{ opacity: active ? 0.75 : 0 }}
        transition={{ duration: 0.6 }}
      />
      <div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{
          background: "radial-gradient(circle at 50% 38%, #1b2233 0%, #0b0e16 58%, #05060a 100%)",
          boxShadow:
            "inset 0 0 0 1px rgba(150,190,255,.14), inset 0 -6px 10px -6px rgba(90,140,255,.35), 0 1px 2px rgba(0,0,0,.25), 0 6px 14px -8px rgba(30,50,120,.55)",
        }}
      >
        <canvas ref={ref} className="absolute inset-0 h-full w-full" />
        {/* the lens: a faint reflection across the top */}
        <span
          className="absolute inset-x-[18%] top-[6%] h-[30%] rounded-full"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,0))",
          }}
        />
      </div>
    </div>
  );
}
