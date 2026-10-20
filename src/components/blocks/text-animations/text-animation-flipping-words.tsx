"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export type TextAnimationFlippingWordsProps = {
  prefix?: string;
  words?: string[];
  suffix?: string;
  /** Colour of the dot that rides at the end of the word. Defaults to the accent blue. */
  dotColor?: string;
  /** How the rotating word is coloured: action blue, the spectrum gradient, or plain ink. */
  accent?: "blue" | "spectrum" | "none";
  /** Milliseconds each word holds before the next one rolls in. */
  holdMs?: number;
  className?: string;
};

const SPECTRUM = "linear-gradient(90deg, #0090f7, #ba62fc, #f2416b, #f55600)";
const LETTER_STAGGER = 0.022;
const SPRING = { type: "spring" as const, stiffness: 420, damping: 32 };
const DOT_SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

const WORD: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: LETTER_STAGGER } },
  exit: { transition: { staggerChildren: LETTER_STAGGER * 0.6 } },
};

const LETTER: Variants = {
  hidden: { opacity: 0, y: "0.45em", filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: SPRING },
  exit: { opacity: 0, y: "-0.45em", filter: "blur(8px)", transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } },
};

const LETTER_REDUCED: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export function TextAnimationFlippingWords({
  prefix = "Built with",
  words = ["React", "TypeScript", "Tailwind", "Vite"],
  suffix,
  dotColor,
  accent = "blue",
  holdMs = 2200,
  className,
}: TextAnimationFlippingWordsProps) {
  const ws = React.useMemo(() => words.filter(Boolean), [words]);
  const longest = ws.reduce((a, b) => (b.length > a.length ? b : a), "");
  const reduceMotion = useReducedMotion();
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    if (ws.length <= 1 || reduceMotion) return;
    const t = window.setInterval(() => setIdx((i) => (i + 1) % ws.length), holdMs);
    return () => window.clearInterval(t);
  }, [holdMs, reduceMotion, ws.length]);

  const index = idx % Math.max(ws.length, 1);
  const currentWord = ws[index] ?? "";
  const chars = Array.from(currentWord);
  const letter = reduceMotion ? LETTER_REDUCED : LETTER;

  const letterStyle = (i: number): React.CSSProperties | undefined => {
    if (accent !== "spectrum") return undefined;
    // one gradient across the whole word, sliced per letter so each glyph shows its own stretch
    const span = Math.max(chars.length - 1, 1);
    return {
      backgroundImage: SPECTRUM,
      backgroundSize: `${chars.length * 100}% 100%`,
      backgroundPosition: `${(i / span) * 100}% 0`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    };
  };

  return (
    <h2
      className={cn(
        "flex flex-wrap items-baseline gap-x-[0.26em] font-semibold leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7]",
        className,
      )}
    >
      {prefix ? <span>{prefix}</span> : null}

      {/* Word slot: sized by the longest word so the line never reflows */}
      <span className="relative inline-block">
        <span aria-hidden className="invisible select-none whitespace-nowrap pr-[0.3em]">
          {longest}
        </span>
        <span className="sr-only">{currentWord}</span>

        <span aria-hidden className="absolute inset-y-0 left-0 flex items-baseline">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${index}-${currentWord}`}
              variants={WORD}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "inline-flex whitespace-pre",
                accent === "blue" && "text-[#0071e3] dark:text-[#2997ff]",
              )}
            >
              {chars.map((char, i) => (
                <motion.span key={i} variants={letter} className="inline-block" style={letterStyle(i)}>
                  {char === " " ? " " : char}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>

          {/* The dot rides the end of the word and springs to its new place on every swap */}
          <motion.span
            layout={!reduceMotion}
            transition={DOT_SPRING}
            className={cn(
              "ml-[0.06em] inline-block size-[0.16em] shrink-0 self-baseline rounded-full",
              !dotColor && (accent === "spectrum" ? "bg-[#f55600]" : "bg-[#0071e3] dark:bg-[#2997ff]"),
            )}
            style={dotColor ? { backgroundColor: dotColor } : undefined}
          />
        </span>
      </span>

      {suffix ? <span>{suffix}</span> : null}
    </h2>
  );
}

export default TextAnimationFlippingWords;
