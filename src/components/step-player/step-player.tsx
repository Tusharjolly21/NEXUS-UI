"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface StepPlayerStep {
  /** Step title. */
  t: string;
  /** One-line body under the title. */
  b: string;
}

export interface StepPlayerProps {
  /** Dot, bar fill and "Step n of m" colour. */
  accent?: string;
  /** Steps to play through, in order. */
  steps?: StepPlayerStep[];
  /** Seconds each step plays before moving on. */
  stepDuration?: number;
  /** Starts playing on mount. Set to false to start paused (the play button still works). */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

export const DEFAULT_STEPS: StepPlayerStep[] = [
  { t: "Connect your calendar", b: "We only read busy times, never the details." },
  { t: "Pick your working hours", b: "Meetings outside them need your say-so." },
  { t: "Share your link", b: "People choose a slot that suits you both." },
  { t: "Get a summary each morning", b: "Your day, in one short message at 8am." },
];

/**
 * Onboarding player. The current step's dot stretches into a bar that fills
 * while it plays; when it's full the bar eases over to the next dot and a
 * small wave runs through the ones ahead. Play, pause or tap a dot to jump.
 */
export function StepPlayer({ accent = "#0071e3", steps = DEFAULT_STEPS, stepDuration = 3.2, autoplay = true, enableSound = true }: StepPlayerProps) {
  const play = useSound(enableSound);
  const soundRef = useRef(play);
  // True from the moment the visitor presses play until the run reaches the end: those advances answer the visitor; the rest are the demo playing itself.
  const heard = useRef(false);
  const [rawI, setI] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [wave, setWave] = useState(0);
  const prog = useMotionValue(0);
  const width = useTransform(prog, (p) => `${p * 100}%`);
  const playRef = useRef(playing);
  const count = steps.length;
  const i = Math.min(rawI, Math.max(0, count - 1));

  useEffect(() => {
    playRef.current = playing;
  }, [playing]);
  useEffect(() => {
    soundRef.current = play;
  }, [play]);

  useEffect(() => {
    if (count === 0) return;
    prog.set(0);
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (playRef.current) prog.set(Math.min(1, prog.get() + dt / stepDuration));
      if (prog.get() >= 1) {
        const atEnd = i >= count - 1;
        if (heard.current) {
          soundRef.current(atEnd ? "done" : "step");
          if (atEnd) heard.current = false;
        } else {
          soundRef.current.auto(atEnd ? "done" : "step");
        }
        setI((n) => (n + 1) % count);
        setWave((w) => w + 1);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [i, wave, prog, count, stepDuration]);

  if (count === 0) return null;
  const step = steps[i];

  return (
    <div className="flex w-[320px] flex-col gap-6 rounded-[26px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]">
      <div className="relative h-[64px] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={i}
            initial={{ y: 24, opacity: 0, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -24, opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-[12px] font-semibold tabular-nums" style={{ color: accent }}>
              Step {i + 1} of {count}
            </div>
            <div className="mt-0.5 text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{step.t}</div>
            <div className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{step.b}</div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 rounded-full bg-[#f0f0f3] px-2.5 py-2.5 dark:bg-[#2c2c2e]" role="tablist" aria-label="Steps">
          {steps.map((s, k) => (
            <motion.button
              key={k}
              type="button"
              role="tab"
              aria-selected={k === i}
              aria-label={s.t}
              onClick={() => {
                if (k !== i) play(k === count - 1 ? "done" : "step");
                setI(k);
                prog.set(0);
              }}
              className={`relative h-2 overflow-hidden rounded-full outline-none transition-[background-color] duration-300 focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff] ${
                k === i ? "bg-[#d2d2d7] dark:bg-[#48484a]" : "bg-[#c7c7cc] dark:bg-[#3a3a3c]"
              }`}
              style={{ backgroundColor: k < i ? accent : undefined }}
              initial={false}
              // The last keyframe alternates by a hair so each advance re-runs the wave.
              animate={{ width: k === i ? 52 : 8, y: k > i ? [0, -5, (wave % 2) * 0.001] : 0 }}
              transition={{ width: { type: "spring", stiffness: 300, damping: 26 }, y: { duration: 0.42, delay: Math.max(0, k - i) * 0.07 } }}
            >
              {k === i && <motion.span className="absolute inset-y-0 left-0 rounded-full" style={{ width, background: accent }} />}
            </motion.button>
          ))}
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const next = !playing;
            play(next ? "on" : "off");
            heard.current = next;
            setPlaying(next);
          }}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d1d1f] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <motion.path
              fill="currentColor"
              initial={false}
              animate={{ d: playing ? "M6 5h4v14H6zM14 5h4v14h-4z" : "M7 5l12 7-12 7z" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
