"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TextAnimationFlippingWordsProps = {
  prefix?: string;
  words?: string[];
  suffix?: string;
  dotColor?: string;
  className?: string;
};

// ─── Timing constants ────────────────────────────────────────────────
const HOLD_MS    = 1200;   // how long to sit on each word
const STAGGER    = 0.028;  // seconds between adjacent letter animations
const EXIT_DUR   = 0.13;   // seconds per letter blur-out
const ENTER_DUR  = 0.17;   // seconds per letter blur-in

function exitDuration(word: string)  { return word.length * STAGGER * 1000 + EXIT_DUR  * 1000 + 60; }
function enterDuration(word: string) { return word.length * STAGGER * 1000 + ENTER_DUR * 1000 + 60; }

export function TextAnimationFlippingWords({
  prefix = "Built with",
  words = ["React", "TypeScript", "Tailwind", "Vite"],
  suffix,
  dotColor,
  className,
}: TextAnimationFlippingWordsProps) {
  const ws = React.useMemo(() => words.filter(Boolean), [words]);
  const longest = ws.reduce((a, b) => (b.length > a.length ? b : a), "");

  const reduceMotion = useReducedMotion();

  // ── State ──────────────────────────────────────────────────────────
  const [idx, setIdx] = React.useState(0);
  const [phase, setPhase] = React.useState<"showing" | "exiting" | "entering">("showing");
  // pill geometry relative to the word-container
  const [pillLeft,  setPillLeft]  = React.useState(0);
  const [pillWidth, setPillWidth] = React.useState(13);

  // ── Refs ───────────────────────────────────────────────────────────
  const containerRef = React.useRef<HTMLSpanElement>(null); // relative wrapper
  const textRef      = React.useRef<HTMLSpanElement>(null); // inline-flex letter wrapper (real width!)

  const wsRef    = React.useRef(ws);
  const idxRef   = React.useRef(idx);
  const phaseRef = React.useRef(phase);
  // keep the latest values for the timers; synced before the phase effects below run
  React.useLayoutEffect(() => {
    wsRef.current = ws;
    idxRef.current = idx;
    phaseRef.current = phase;
  });

  // ── Measure the rendered text (textRef is inline, gives real width) ─
  function snap() {
    const t = textRef.current; const c = containerRef.current;
    if (!t || !c) return;
    const tR = t.getBoundingClientRect();
    const cR = c.getBoundingClientRect();
    const left  = tR.left - cR.left;
    const width = tR.width;
    setPillLeft(left + width + 2);   // dot just after last letter
    setPillWidth(13);
  }

  // ── Phase loop via three effects ───────────────────────────────────

  // showing → exiting after HOLD
  React.useEffect(() => {
    if (phase !== "showing") return;
    snap(); // dot may need repositioning after word settled
    if (ws.length <= 1 || reduceMotion) return;
    const t = setTimeout(() => setPhase("exiting"), HOLD_MS);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  // exiting: expand pill, then switch word → entering
  React.useEffect(() => {
    if (phase !== "exiting") return;
    const word = wsRef.current[idxRef.current] ?? "";

    // expand pill leftward to wipe the word
    const t = textRef.current; const c = containerRef.current;
    if (t && c) {
      const tR = t.getBoundingClientRect();
      const cR = c.getBoundingClientRect();
      const left  = tR.left - cR.left;
      const width = tR.width;
      // right edge stays fixed, left sweeps left to cover word
      setPillLeft(left - 5);
      setPillWidth(width + 20);
    }

    const done = setTimeout(() => {
      setIdx((i) => (i + 1) % wsRef.current.length);
      setPhase("entering");
    }, exitDuration(word));

    return () => clearTimeout(done);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // entering: contract pill to dot, then → showing
  React.useEffect(() => {
    if (phase !== "entering") return;
    const word = wsRef.current[idxRef.current] ?? "";

    // Contract pill to dot at end of new word (after one frame so DOM has updated)
    const snapTimer = setTimeout(snap, 20);

    const done = setTimeout(() => setPhase("showing"), enterDuration(word));
    return () => { clearTimeout(snapTimer); clearTimeout(done); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  // ── Boot: initial dot position ─────────────────────────────────────
  React.useEffect(() => {
    const t = setTimeout(snap, 200);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived ────────────────────────────────────────────────────────
  const currentWord = ws[idx] ?? "";
  const isExiting   = phase === "exiting";
  const isEntering  = phase === "entering";
  const pillActive  = isExiting;   // pill is red + wide during exit only

  return (
    <h2
      className={cn(
        "flex flex-wrap items-baseline gap-x-[0.26em] font-semibold tracking-[-0.04em]",
        className,
      )}
    >
      {prefix && <span>{prefix}</span>}

      {/* ── Word container fixed to longest word width ── */}
      <span ref={containerRef} className="relative inline-block">

        {/* Ghost sizer — keeps layout stable */}
        <span aria-hidden className="invisible select-none whitespace-nowrap">
          {longest}
        </span>

        {/* Animated letters — absolute, left-aligned */}
        <span
          className="absolute left-0 top-0 bottom-0 flex items-baseline"
          aria-label={currentWord}
        >
          {/* textRef on the inline-flex so getBoundingClientRect gives real text width */}
          <span ref={textRef} className="inline-flex">
            {currentWord.split("").map((char, i) => (
              <motion.span
                key={`${idx}-${i}`}           // remount when word changes
                aria-hidden
                initial={
                  isEntering
                    ? { opacity: 0, y: 8, filter: "blur(12px)" }
                    : { opacity: 1, y: 0, filter: "blur(0px)" }
                }
                animate={
                  isExiting
                    ? { opacity: 0, y: -6, filter: "blur(10px)" }
                    : { opacity: 1, y: 0,  filter: "blur(0px)" }
                }
                transition={{
                  delay: i * STAGGER,
                  duration: isExiting ? EXIT_DUR : ENTER_DUR,
                  ease: "easeOut",
                }}
                className="inline-block"
                style={{ whiteSpace: char === " " ? "pre" : undefined }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        </span>

        {/* ── Pill / dot ── single element that morphs ── */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute bottom-[0.06em] z-10 rounded-full"
          animate={{
            left:            pillLeft,
            width:           pillWidth,
            backgroundColor: pillActive ? "#27272a" : (dotColor ?? "#3B82F6"),
            height:          13,
          }}
          transition={{
            left:            { duration: pillActive ? 0.46 : 0.3,  ease: [0.4, 0, 0.2, 1] },
            width:           { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
            backgroundColor: { duration: 0.2 },
          }}
        />
      </span>

      {suffix && <span>{suffix}</span>}
    </h2>
  );
}

export default TextAnimationFlippingWords;
