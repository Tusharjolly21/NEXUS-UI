"use client";

import * as React from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls } from "framer-motion";
import { cn } from "@/lib/utils";

type TypewriterTag = "h1" | "h2" | "p" | "span" | "div";
type TypewriterText = string | string[];
type Phase = "typing" | "pausing" | "deleting" | "done";

export type TypewriterEffectProps = {
  /** One phrase, or a list of phrases typed one after another. */
  text: TypewriterText;
  /** Milliseconds per typed character. Each keystroke gets a little human jitter. */
  typingSpeed?: number;
  /** Milliseconds per deleted character. 0 skips deleting and swaps straight to the next phrase. */
  deletingSpeed?: number;
  /** Milliseconds before the first character. */
  delay?: number;
  /** Milliseconds to hold a finished phrase before moving on. */
  pauseDuration?: number;
  /** Start again from the first phrase after the last one. */
  loop?: boolean;
  /** Shows the caret. */
  showCursor?: boolean;
  /** Classes for the caret (it uses the text colour by default). */
  cursorClassName?: string;
  className?: string;
  /** Element used as the root. */
  as?: TypewriterTag;
  /** Called each time the last phrase finishes. */
  onComplete?: () => void;
  /** Loops through the phrases until someone clicks or taps the text, then stops after the current one. */
  autoplay?: boolean;
};

/** Deterministic per-keystroke jitter (no Math.random), so the rhythm feels typed rather than metronomic. */
const jitter = (k: number) => 0.7 + ((Math.sin(k * 12.9898) * 43758.5453) % 1 + 1) % 1 * 0.6;

/**
 * A typewriter with a physical caret. Each new character drops in and settles on a spring, the
 * caret stretches on every keystroke and squashes on every delete, and it only blinks while it
 * waits. Phrases can be typed once, rotated, or looped.
 */
export function TypewriterEffect(props: TypewriterEffectProps) {
  const list = Array.isArray(props.text) ? props.text : [props.text];
  const clean = list.filter((t) => typeof t === "string" && t.length > 0);
  const phrases = clean.length ? clean : [""];
  // Re-keying on content (not identity) means a parent re-render with a new array literal does not reset typing.
  return <Typer key={phrases.join("\u0000")} {...props} phrases={phrases} />;
}

function Typer({
  phrases,
  text,
  typingSpeed = 65,
  deletingSpeed = 42,
  delay = 0,
  pauseDuration = 1200,
  loop = false,
  showCursor = true,
  cursorClassName,
  className,
  as = "span",
  onComplete,
  autoplay = false,
}: TypewriterEffectProps & { phrases: string[] }) {
  const still = useReducedMotion() === true;
  const Tag = as;
  const [state, setState] = React.useState<{ i: number; n: number; phase: Phase }>({ i: 0, n: 0, phase: "typing" });
  const touched = React.useRef(false);
  const keys = React.useRef(0);
  const done = React.useRef(onComplete);
  React.useEffect(() => {
    done.current = onComplete;
  }, [onComplete]);

  const { i, n, phase } = state;
  const current = phrases[i] ?? "";

  React.useEffect(() => {
    if (still || phase === "done") return;
    const last = i === phrases.length - 1;
    let wait: number;
    let next: () => void;
    if (phase === "typing") {
      if (n < current.length) {
        wait = n === 0 && i === 0 ? Math.max(0, delay) : Math.max(10, typingSpeed) * jitter(keys.current++);
        next = () => setState({ i, n: n + 1, phase });
      } else {
        wait = 0;
        next = () => setState({ i, n, phase: "pausing" });
      }
    } else if (phase === "pausing") {
      wait = Math.max(0, pauseDuration);
      next = () => {
        if (last) done.current?.();
        if (last && !(loop || (autoplay && !touched.current))) setState({ i, n, phase: "done" });
        else if (deletingSpeed > 0) setState({ i, n, phase: "deleting" });
        else setState({ i: last ? 0 : i + 1, n: 0, phase: "typing" });
      };
    } else {
      if (n > 0) {
        wait = Math.max(10, deletingSpeed);
        next = () => setState({ i, n: n - 1, phase });
      } else {
        wait = 0;
        next = () => setState({ i: last ? 0 : i + 1, n: 0, phase: "typing" });
      }
    }
    const t = window.setTimeout(next, wait);
    return () => window.clearTimeout(t);
  }, [still, phase, i, n, current.length, phrases.length, loop, autoplay, delay, typingSpeed, deletingSpeed, pauseDuration]);

  // Caret squash and stretch: every keystroke kicks a spring with velocity; deletes kick it the other way.
  const kick = useMotionValue(0);
  const prevN = React.useRef(0);
  const run = React.useRef<AnimationPlaybackControls | undefined>(undefined);
  React.useEffect(() => {
    const dir = Math.sign(n - prevN.current);
    prevN.current = n;
    if (!dir || still) return;
    run.current?.stop();
    run.current = animate(kick, 0, { type: "spring", stiffness: 700, damping: 18, velocity: dir * 14 });
  }, [n, kick, still]);
  React.useEffect(() => () => run.current?.stop(), []);
  const scaleY = useTransform(kick, (k) => 1 + k * 0.5);
  const scaleX = useTransform(kick, (k) => Math.max(0.4, 1 - k * 0.5));

  const shown = still ? (phrases[phrases.length - 1] ?? "") : current.slice(0, n);
  const idle = still || phase === "pausing" || phase === "done";
  const parts = shown.split(/(\s+)/);
  const starts = parts.map((_, k) => parts.slice(0, k).reduce((sum, p) => sum + p.length, 0));

  return (
    <Tag
      className={cn("relative inline-block whitespace-pre-wrap", className)}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <span className="sr-only">{Array.isArray(text) ? text.join(" ") : text}</span>
      <span aria-hidden="true">
        {parts.map((w, wi) => {
          const start = starts[wi] ?? 0;
          if (!w) return null;
          if (/^\s+$/.test(w)) return <React.Fragment key={`s${wi}`}>{w}</React.Fragment>;
          return (
            <span key={`w${start}`} className="inline-block whitespace-nowrap">
              {Array.from(w).map((ch, ci) =>
                still ? (
                  <span key={ci}>{ch}</span>
                ) : (
                  <motion.span
                    key={`${i}-${start + ci}`}
                    className="inline-block"
                    initial={{ y: "-0.32em", scaleY: 1.18, opacity: 0 }}
                    animate={{ y: "0em", scaleY: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 900, damping: 26, opacity: { duration: 0.08 } }}
                    style={{ originY: 1 }}
                  >
                    {ch}
                  </motion.span>
                ),
              )}
            </span>
          );
        })}
        {showCursor ? (
          <motion.span
            className={cn("ml-[0.06em] inline-block h-[1.02em] w-[0.08em] min-w-[2px] rounded-full bg-current align-[-0.14em]", cursorClassName)}
            style={{ scaleX, scaleY, originY: 1 }}
            animate={idle && !still ? { opacity: [1, 1, 0, 0, 1] } : { opacity: 1 }}
            transition={idle && !still ? { duration: 1.05, times: [0, 0.45, 0.5, 0.95, 1], repeat: Infinity } : { duration: 0.05 }}
          />
        ) : null}
      </span>
    </Tag>
  );
}
